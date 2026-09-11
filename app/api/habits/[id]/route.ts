import { NextRequest, NextResponse } from "next/server";
import { updateHabitSchema } from "@/lib/validation";
import { updateHabit, deleteHabit, updateHabitCells } from "@/lib/models";
import { isDatabaseAvailable } from "@/lib/db";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const dbAvailable = await isDatabaseAvailable();

  if (!dbAvailable) {
    return NextResponse.json(
      { error: "База данных недоступна" },
      { status: 503 }
    );
  }

  const parsed = updateHabitSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Некорректные данные", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  try {
    const { id } = await params;
    const habit = await updateHabit(id, parsed.data);
    return NextResponse.json(habit);
  } catch {
    return NextResponse.json(
      { error: "Ошибка при обновлении привычки" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const dbAvailable = await isDatabaseAvailable();

  if (!dbAvailable) {
    return NextResponse.json(
      { error: "База данных недоступна" },
      { status: 503 }
    );
  }

  const body = await request.json();
  if (typeof body.cells !== "object" || body.cells === null) {
    return NextResponse.json(
      { error: "Некорректные данные: ожидается объект cells" },
      { status: 400 }
    );
  }

  try {
    const { id } = await params;
    const habit = await updateHabitCells(id, body.cells);
    return NextResponse.json(habit);
  } catch {
    return NextResponse.json(
      { error: "Ошибка при обновлении отметок" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const dbAvailable = await isDatabaseAvailable();

  if (!dbAvailable) {
    return NextResponse.json(
      { error: "База данных недоступна" },
      { status: 503 }
    );
  }

  try {
    const { id } = await params;
    await deleteHabit(id);
    return new NextResponse(null, { status: 204 });
  } catch {
    return NextResponse.json(
      { error: "Ошибка при удалении привычки" },
      { status: 500 }
    );
  }
}
