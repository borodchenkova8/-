import { docClient } from "./db";
import {
  GetCommand,
  PutCommand,
  DeleteCommand,
  QueryCommand,
  ScanCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import { TableName, IndexName } from "./schema";

export interface Service {
  id: string;
  name: string;
  description?: string;
  status: "active" | "inactive" | "deploying";
  url?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Habit {
  id: string;
  title: string;
  description?: string;
  type: "discrete" | "numeric";
  goal: number;
  cells: Record<string, boolean>;
  numericValue?: number;
  createdAt: string;
  updatedAt: string;
}

export async function getAllHabits(): Promise<Habit[]> {
  const result = await docClient.send(
    new ScanCommand({
      TableName: TableName.HABITS,
    })
  );
  return (result.Items as Habit[]) ?? [];
}

export async function createHabit(
  data: Omit<Habit, "id" | "createdAt" | "updatedAt">
): Promise<Habit> {
  const now = new Date().toISOString();
  const habit: Habit = {
    ...data,
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
  };

  await docClient.send(
    new PutCommand({
      TableName: TableName.HABITS,
      Item: habit,
    })
  );

  return habit;
}

export async function updateHabitCells(
  id: string,
  cells: Record<string, boolean>
): Promise<Habit> {
  const result = await docClient.send(
    new UpdateCommand({
      TableName: TableName.HABITS,
      Key: { id },
      UpdateExpression: "set cells = :cells, updatedAt = :updatedAt",
      ExpressionAttributeValues: {
        ":cells": cells,
        ":updatedAt": new Date().toISOString(),
      },
      ReturnValues: "ALL_NEW",
    })
  );

  return result.Attributes as Habit;
}

export async function updateHabit(
  id: string,
  data: {
    title: string;
    description?: string;
    type: "discrete" | "numeric";
    goal: number;
  }
): Promise<Habit> {
  const result = await docClient.send(
    new UpdateCommand({
      TableName: TableName.HABITS,
      Key: { id },
      UpdateExpression:
        "set title = :title, #desc = :desc, #type = :type, goal = :goal, updatedAt = :updatedAt",
      ExpressionAttributeNames: {
        "#desc": "description",
        "#type": "type",
      },
      ExpressionAttributeValues: {
        ":title": data.title,
        ":desc": data.description ?? "",
        ":type": data.type,
        ":goal": data.goal,
        ":updatedAt": new Date().toISOString(),
      },
      ReturnValues: "ALL_NEW",
    })
  );

  return result.Attributes as Habit;
}

export async function deleteHabit(id: string): Promise<void> {
  await docClient.send(
    new DeleteCommand({
      TableName: TableName.HABITS,
      Key: { id },
    })
  );
}

export async function getServiceById(id: string): Promise<Service | null> {
  const result = await docClient.send(
    new GetCommand({
      TableName: TableName.SERVICES,
      Key: { id },
    })
  );
  return (result.Item as Service) ?? null;
}

export async function getServicesByStatus(status: string): Promise<Service[]> {
  const result = await docClient.send(
    new QueryCommand({
      TableName: TableName.SERVICES,
      IndexName: IndexName.SERVICES_STATUS,
      KeyConditionExpression: "#status = :status",
      ExpressionAttributeNames: {
        "#status": "status",
      },
      ExpressionAttributeValues: {
        ":status": status,
      },
    })
  );
  return (result.Items as Service[]) ?? [];
}

export async function getAllServices(): Promise<Service[]> {
  const result = await docClient.send(
    new ScanCommand({
      TableName: TableName.SERVICES,
    })
  );
  return (result.Items as Service[]) ?? [];
}

export async function createService(
  data: Omit<Service, "createdAt" | "updatedAt">
): Promise<Service> {
  const now = new Date().toISOString();
  const service: Service = {
    ...data,
    createdAt: now,
    updatedAt: now,
  };

  await docClient.send(
    new PutCommand({
      TableName: TableName.SERVICES,
      Item: service,
    })
  );

  return service;
}

export async function updateService(
  id: string,
  data: Partial<Pick<Service, "name" | "description" | "status" | "url">>
): Promise<Service> {
  const updateExpr = [];
  const exprValues: Record<string, unknown> = {};
  const exprNames: Record<string, string> = {};

  if (data.name !== undefined) {
    updateExpr.push("#name = :name");
    exprValues[":name"] = data.name;
    exprNames["#name"] = "name";
  }

  if (data.description !== undefined) {
    updateExpr.push("#description = :description");
    exprValues[":description"] = data.description;
    exprNames["#description"] = "description";
  }

  if (data.status !== undefined) {
    updateExpr.push("#status = :status");
    exprValues[":status"] = data.status;
    exprNames["#status"] = "status";
  }

  if (data.url !== undefined) {
    updateExpr.push("#url = :url");
    exprValues[":url"] = data.url;
    exprNames["#url"] = "url";
  }

  updateExpr.push("updatedAt = :updatedAt");
  exprValues[":updatedAt"] = new Date().toISOString();

  const result = await docClient.send(
    new UpdateCommand({
      TableName: TableName.SERVICES,
      Key: { id },
      UpdateExpression: `set ${updateExpr.join(", ")}`,
      ExpressionAttributeValues: exprValues,
      ExpressionAttributeNames:
        Object.keys(exprNames).length > 0 ? exprNames : undefined,
      ReturnValues: "ALL_NEW",
    })
  );

  return result.Attributes as Service;
}

export async function deleteService(id: string): Promise<void> {
  await docClient.send(
    new DeleteCommand({
      TableName: TableName.SERVICES,
      Key: { id },
    })
  );
}
