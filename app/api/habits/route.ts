import { NextRequest, NextResponse } from "next/server";
import { createHabitSchema } from "@/lib/validation";
import { getAllHabits, createHabit } from "@/lib/models";
import { mockHabits } from "@/lib/mock-data";
import { isDatabaseAvailable } from "@/lib/db";

export async function GET() {
  const dbAvailable = await isDatabaseAvailable();

  if (!dbAvailable) {
    return NextResponse.json(mockHabits);
  }

  try {
    const habits = await getAllHabits();
    if (habits.length === 0) {
      return NextResponse.json(mockHabits);
    }
    return NextResponse.json(habits);
  } catch {
    return NextResponse.json(mockHabits);
  }
}

export async function POST(request: NextRequest) {
  const dbAvailable = await isDatabaseAvailable();

  if (!dbAvailable) {
    return NextResponse.json(
      { error: "База данных недоступна" },
      { status: 503 }
    );
  }

  const parsed = createHabitSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Некорректные данные", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  try {
    const habit = await createHabit({
      title: parsed.data.title,
      description: parsed.data.description,
      type: parsed.data.type,
      goal: parsed.data.goal,
      cells: {},
    });
    return NextResponse.json(habit, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Ошибка при создании привычки" },
      { status: 500 }
    );
  }
}
