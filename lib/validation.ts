import { z } from "zod";

export const createHabitSchema = z.object({
  title: z.string().min(1, "Название обязательно").max(200),
  description: z.string().max(500).optional(),
  type: z.enum(["discrete", "numeric"]),
  goal: z
    .number()
    .int("Цель должна быть целым числом")
    .min(1, "Цель должна быть хотя бы 1"),
});

export type CreateHabitInput = z.infer<typeof createHabitSchema>;

export const updateHabitSchema = z.object({
  title: z.string().min(1, "Название обязательно").max(200),
  description: z.string().max(500).optional(),
  type: z.enum(["discrete", "numeric"]),
  goal: z
    .number()
    .int("Цель должна быть целым числом")
    .min(1, "Цель должна быть хотя бы 1"),
});

export type UpdateHabitInput = z.infer<typeof updateHabitSchema>;
