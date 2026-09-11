"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { createHabitSchema } from "@/lib/validation";

interface EditHabitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  habitId: string;
  initialTitle: string;
  initialDescription?: string;
  initialType: "discrete" | "numeric";
  initialGoal: number;
  onSave: (
    id: string,
    title: string,
    description: string | undefined,
    type: "discrete" | "numeric",
    goal: number
  ) => void;
}

export function EditHabitDialog({
  open,
  onOpenChange,
  habitId,
  initialTitle,
  initialDescription,
  initialType,
  initialGoal,
  onSave,
}: EditHabitDialogProps) {
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription ?? "");
  const [habitType, setHabitType] = useState<"discrete" | "numeric">(
    initialType
  );
  const [goal, setGoal] = useState(String(initialGoal));
  const [errors, setErrors] = useState<{
    title?: string;
    description?: string;
    goal?: string;
    type?: string;
  }>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const parsed = createHabitSchema.safeParse({
      title,
      description: description || undefined,
      type: habitType,
      goal: Number(goal),
    });

    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      setErrors({
        title: fieldErrors.title?.[0],
        description: fieldErrors.description?.[0],
        goal: fieldErrors.goal?.[0],
        type: fieldErrors.type?.[0],
      });
      return;
    }

    onSave(
      habitId,
      parsed.data.title,
      parsed.data.description,
      parsed.data.type,
      parsed.data.goal
    );
    toast.success("Привычка обновлена");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Редактировать привычку</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Тип привычки</label>
            <div className="flex gap-1 rounded-lg bg-muted p-1">
              <button
                type="button"
                onClick={() => setHabitType("discrete")}
                className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  habitType === "discrete"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Дискретная (Календарь)
              </button>
              <button
                type="button"
                onClick={() => setHabitType("numeric")}
                className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  habitType === "numeric"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Числовая (Счётчик)
              </button>
            </div>
            {errors.type && (
              <p className="text-sm text-destructive">{errors.type}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="edit-title" className="text-sm font-medium">
              Название
            </label>
            <Input
              id="edit-title"
              placeholder="Например: Читать каждый день"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              aria-invalid={!!errors.title}
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title}</p>
            )}
          </div>
          <div className="space-y-2">
            <label htmlFor="edit-description" className="text-sm font-medium">
              Описание / Примечание
            </label>
            <Input
              id="edit-description"
              placeholder="Необязательно"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              aria-invalid={!!errors.description}
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description}</p>
            )}
          </div>
          <div className="space-y-2">
            <label htmlFor="edit-goal" className="text-sm font-medium">
              Цель
            </label>
            <Input
              id="edit-goal"
              type="number"
              min={1}
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              aria-invalid={!!errors.goal}
            />
            {errors.goal && (
              <p className="text-sm text-destructive">{errors.goal}</p>
            )}
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Отмена
            </Button>
            <Button type="submit">Сохранить</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
