"use client";

import { useState, useEffect, useRef } from "react";
import {
  ArrowLeft,
  MoreVertical,
  Pencil,
  Trash2,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { HabitCard } from "@/components/habit-card";
import { HabitRow } from "@/components/habit-row";
import { AddHabitDialog } from "@/components/add-habit-dialog";
import { EditHabitDialog } from "@/components/edit-habit-dialog";
import { ConfirmDeleteDialog } from "@/components/confirm-delete-dialog";
import { TabBar } from "@/components/tab-bar";
import { ProfileScreen } from "@/components/profile-screen";
import { mockHabits } from "@/lib/mock-data";
import type { Habit } from "@/lib/models";
import {
  loadHabits,
  loadFromLocalStorage,
  saveHabits,
  clearOldDataOnce,
} from "@/lib/idb";

type Screen = "auth" | "list" | "detail";
type AuthMode = "login" | "register" | "recovery";

const SESSION_KEY = "habit_tracker_session";

interface SessionData {
  email: string;
}

interface LocalHabit {
  id: string;
  title: string;
  description?: string;
  type: "discrete" | "numeric";
  goal: number;
  cells: Record<string, boolean>;
  numericValue?: number;
}

const appName = "Трекер целей";

export function AppShell() {
  const [screen, setScreen] = useState<Screen>("auth");
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [habits, setHabits] = useState<LocalHabit[]>([]);
  const [selectedHabitId, setSelectedHabitId] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  const [editHabitId, setEditHabitId] = useState<string | null>(null);
  const [deleteHabitId, setDeleteHabitId] = useState<string | null>(null);
  const [detailMenuOpen, setDetailMenuOpen] = useState(false);
  const detailMenuRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<"goals" | "profile">("goals");
  const [consentOpen, setConsentOpen] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      if (raw) {
        const data: SessionData = JSON.parse(raw);
        if (data.email) {
          setEmail(data.email);
          setScreen("list");
        }
      }
    } catch {
      // ignore corrupt session
    }

    if (habits.length > 0) {
      setLoaded(true);
      return;
    }

    async function loadHabitsFromStorage() {
      clearOldDataOnce();
      const idbData = await loadHabits();
      if (idbData) {
        setHabits(idbData);
        setLoaded(true);
        return;
      }

      const lsData = loadFromLocalStorage();
      if (lsData) {
        setHabits(lsData);
        setLoaded(true);
        return;
      }

      try {
        const res = await fetch("/api/habits");
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setHabits(
            data.map((h: Habit) => ({
              id: h.id,
              title: h.title,
              description: h.description,
              type: h.type,
              goal: h.goal,
              cells: h.cells,
              numericValue: h.numericValue,
            }))
          );
        } else {
          setHabits(
            mockHabits.map((h) => ({
              id: h.id,
              title: h.title,
              description: h.description,
              type: h.type,
              goal: h.goal,
              cells: h.cells,
              numericValue: h.numericValue,
            }))
          );
        }
      } catch {
        setHabits(
          mockHabits.map((h) => ({
            id: h.id,
            title: h.title,
            description: h.description,
            type: h.type,
            goal: h.goal,
            cells: h.cells,
            numericValue: h.numericValue,
          }))
        );
      }
      setLoaded(true);
    }
    loadHabitsFromStorage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!detailMenuOpen) return;
    const handler = (e: MouseEvent) => {
      if (
        detailMenuRef.current &&
        !detailMenuRef.current.contains(e.target as Node)
      ) {
        setDetailMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [detailMenuOpen]);

  useEffect(() => {
    if (!loaded) return;
    saveHabits(habits);
  }, [habits, loaded]);

  const handleAddHabit = (
    title: string,
    description: string | undefined,
    type: "discrete" | "numeric",
    goal: number
  ) => {
    const newHabit: LocalHabit = {
      id: crypto.randomUUID(),
      title,
      description,
      type,
      goal,
      cells: {},
    };
    setHabits((prev) => [...prev, newHabit]);
  };

  const handleEditHabit = (
    id: string,
    title: string,
    description: string | undefined,
    type: "discrete" | "numeric",
    goal: number
  ) => {
    setHabits((prev) =>
      prev.map((h) =>
        h.id === id ? { ...h, title, description, type, goal } : h
      )
    );
    setEditHabitId(null);
  };

  const handleDeleteHabit = (id: string) => {
    setHabits((prev) => prev.filter((h) => h.id !== id));
    setDeleteHabitId(null);
    if (screen === "detail" && selectedHabitId === id) {
      setSelectedHabitId(null);
      setScreen("list");
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const session: SessionData = { email };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    setScreen("list");
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) return;
    const session: SessionData = { email };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    setScreen("list");
  };

  const handleRecovery = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthMode("login");
    setPassword("");
    setConfirmPassword("");
  };

  const handleSelectHabit = (id: string) => {
    setSelectedHabitId(id);
    setScreen("detail");
  };

  const handleBack = () => {
    setSelectedHabitId(null);
    setScreen("list");
  };

  const handleCellsChange = (id: string, cells: Record<string, boolean>) => {
    setHabits((prev) => prev.map((h) => (h.id === id ? { ...h, cells } : h)));
  };

  const handleNumericValueChange = (id: string, value: number) => {
    setHabits((prev) =>
      prev.map((h) => (h.id === id ? { ...h, numericValue: value } : h))
    );
  };

  const handleRepeatHabit = (id: string) => {
    setHabits((prev) =>
      prev.map((h) =>
        h.id === id ? { ...h, cells: {}, numericValue: undefined } : h
      )
    );
  };

  const handleTabChange = (tab: "goals" | "profile") => {
    if (tab === "goals") {
      setSelectedHabitId(null);
    }
    setActiveTab(tab);
  };

  const handleLogout = () => {
    localStorage.removeItem(SESSION_KEY);
    setActiveTab("goals");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setAuthMode("login");
    setSelectedHabitId(null);
    setScreen("auth");
  };

  const handleDeleteAccount = () => {
    localStorage.removeItem(SESSION_KEY);
    setHabits([]);
    setActiveTab("goals");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setAuthMode("login");
    setSelectedHabitId(null);
    setScreen("auth");
  };

  const selectedHabit = habits.find((h) => h.id === selectedHabitId);
  const editHabit = habits.find((h) => h.id === editHabitId);
  const deleteHabit = habits.find((h) => h.id === deleteHabitId);

  const sortedHabits = [...habits].sort((a, b) => {
    const aDone =
      (a.type === "numeric"
        ? (a.numericValue ?? 0)
        : Object.keys(a.cells).length) >= a.goal;
    const bDone =
      (b.type === "numeric"
        ? (b.numericValue ?? 0)
        : Object.keys(b.cells).length) >= b.goal;
    if (aDone && !bDone) return 1;
    if (!aDone && bDone) return -1;
    return 0;
  });

  let mainContent: React.ReactNode;

  if (screen === "detail" && selectedHabit) {
    mainContent = (
      <div className="min-h-screen bg-background px-4 py-8 pb-24">
        <div className="mx-auto max-w-lg space-y-6">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={handleBack}
              className="-ml-2 text-[#3A4A75]"
            >
              <ArrowLeft className="mr-1 h-4 w-4" />
              Назад
            </Button>
            <div ref={detailMenuRef} className="relative">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setDetailMenuOpen((prev) => !prev)}
                aria-label="Меню"
                className="text-[#3A4A75]"
              >
                <MoreVertical className="h-5 w-5" />
              </Button>
              {detailMenuOpen && (
                <div
                  className="absolute right-0 top-10 z-20 w-44 overflow-hidden rounded-lg border bg-popover p-1 shadow-lg animate-in fade-in slide-in-from-top-2 duration-200"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setDetailMenuOpen(false);
                      setEditHabitId(selectedHabit.id);
                    }}
                    className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-foreground hover:bg-muted"
                  >
                    <Pencil className="h-4 w-4" />
                    Редактировать
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setDetailMenuOpen(false);
                      setDeleteHabitId(selectedHabit.id);
                    }}
                    className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-destructive hover:bg-muted"
                  >
                    <Trash2 className="h-4 w-4" />
                    Удалить
                  </button>
                </div>
              )}
            </div>
          </div>
          <Card className="rounded-2xl p-6 shadow-sm">
            <CardContent className="p-0">
              <HabitCard
                title={selectedHabit.title}
                description={selectedHabit.description}
                type={selectedHabit.type}
                goal={selectedHabit.goal}
                initialCells={selectedHabit.cells}
                initialNumericValue={selectedHabit.numericValue}
                onCellsChange={(cells) =>
                  handleCellsChange(selectedHabit.id, cells)
                }
                onNumericValueChange={(value) =>
                  handleNumericValueChange(selectedHabit.id, value)
                }
              />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  } else if (screen === "list") {
    mainContent = (
      <div className="min-h-screen bg-background px-4 py-8 pb-24">
        <div className="mx-auto max-w-lg space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-[#3A4A75]">Мои цели</h1>
            <AddHabitDialog onAdd={handleAddHabit} />
          </div>
          {loaded &&
            sortedHabits.map((habit) => {
              const current =
                habit.type === "numeric"
                  ? (habit.numericValue ?? 0)
                  : Object.keys(habit.cells).length;
              return (
                <HabitRow
                  key={habit.id}
                  title={habit.title}
                  description={habit.description}
                  current={current}
                  goal={habit.goal}
                  isCompleted={current >= habit.goal}
                  onClick={() => handleSelectHabit(habit.id)}
                  onEdit={() => setEditHabitId(habit.id)}
                  onDelete={() => setDeleteHabitId(habit.id)}
                  onRepeat={() => handleRepeatHabit(habit.id)}
                />
              );
            })}
        </div>
      </div>
    );
  } else {
    mainContent = (
      <div className="w-full max-w-sm space-y-6 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#3A4A75]">
            {authMode === "login" && "Вход"}
            {authMode === "register" && "Регистрация"}
            {authMode === "recovery" && "Восстановление пароля"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {authMode === "login" && "Войдите, чтобы продолжить"}
            {authMode === "register" && "Создайте аккаунт"}
            {authMode === "recovery" && "Мы отправим вам ссылку для сброса"}
          </p>
        </div>

        {authMode === "login" && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Пароль
              </label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full">
              Войти
            </Button>
            <div className="flex flex-col items-center gap-2 text-sm">
              <button
                type="button"
                onClick={() => {
                  setAuthMode("register");
                  setConfirmPassword("");
                }}
                className="text-[#3A4A75] hover:underline"
              >
                Зарегистрироваться
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode("recovery");
                  setPassword("");
                }}
                className="text-[#3A4A75] hover:underline"
              >
                Забыли пароль?
              </button>
            </div>
          </form>
        )}

        {authMode === "register" && (
          <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="reg-email" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="reg-email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="reg-password" className="text-sm font-medium">
                Пароль
              </label>
              <Input
                id="reg-password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="reg-confirm" className="text-sm font-medium">
                Подтвердите пароль
              </label>
              <Input
                id="reg-confirm"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <Button
              type="button"
              onClick={() => setConsentOpen(true)}
              className="w-full"
            >
              Зарегистрироваться
            </Button>
            <div className="flex flex-col items-center gap-2 text-sm">
              <button
                type="button"
                onClick={() => {
                  setAuthMode("login");
                  setPassword("");
                  setConfirmPassword("");
                }}
                className="text-[#3A4A75] hover:underline"
              >
                Уже есть аккаунт? Войти
              </button>
            </div>
          </form>
        )}

        {authMode === "recovery" && (
          <form onSubmit={handleRecovery} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="recovery-email" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="recovery-email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full">
              Сбросить пароль
            </Button>
            <div className="flex flex-col items-center gap-2 text-sm">
              <button
                type="button"
                onClick={() => {
                  setAuthMode("login");
                  setPassword("");
                  setConfirmPassword("");
                }}
                className="text-[#3A4A75] hover:underline"
              >
                Вернуться ко входу
              </button>
            </div>
          </form>
        )}
      </div>
    );
  }

  const showBottomNav = screen !== "auth";

  return (
    <>
      {screen === "auth" ? (
        <div className="flex min-h-screen flex-col bg-background">
          <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
            <div className="container mx-auto px-4 h-14 flex items-center">
              <span className="text-lg font-semibold tracking-tight text-[#3A4A75]">
                {appName}
              </span>
            </div>
          </header>
          <div className="flex flex-1 items-center justify-center px-4">
            {mainContent}
          </div>
        </div>
      ) : activeTab === "profile" ? (
        <div key="profile" className="tab-fade-in">
          <ProfileScreen
            email={email || "user@example.com"}
            onLogout={handleLogout}
            onDeleteAccount={handleDeleteAccount}
          />
        </div>
      ) : (
        <div key="goals" className="tab-fade-in">
          {mainContent}
        </div>
      )}

      {editHabit && (
        <EditHabitDialog
          open={true}
          onOpenChange={(open) => {
            if (!open) setEditHabitId(null);
          }}
          habitId={editHabit.id}
          initialTitle={editHabit.title}
          initialDescription={editHabit.description}
          initialType={editHabit.type}
          initialGoal={editHabit.goal}
          onSave={handleEditHabit}
        />
      )}

      {deleteHabit && (
        <ConfirmDeleteDialog
          open={true}
          onOpenChange={(open) => {
            if (!open) setDeleteHabitId(null);
          }}
          habitTitle={deleteHabit.title}
          onConfirm={() => handleDeleteHabit(deleteHabit.id)}
        />
      )}

      <Dialog open={consentOpen} onOpenChange={setConsentOpen}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#F0B2B2]/20">
              <ShieldCheck className="h-6 w-6 text-[#F0B2B2]" />
            </div>
            <DialogTitle className="text-center">
              Согласие на обработку данных
            </DialogTitle>
            <DialogDescription className="text-center">
              Регистрируясь, вы даете согласие на обработку персональных данных
              в соответствии с{" "}
              <a
                href="/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#F0B2B2] hover:underline"
              >
                Политикой конфиденциальности
              </a>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-2">
            <Button variant="outline" onClick={() => setConsentOpen(false)}>
              Отмена
            </Button>
            <Button
              style={{ backgroundColor: "#F0B2B2", color: "#fff" }}
              onClick={() => {
                setConsentOpen(false);
                handleRegister({ preventDefault: () => {} } as React.FormEvent);
              }}
            >
              Согласен и зарегистрироваться
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {showBottomNav && (
        <TabBar activeTab={activeTab} onTabChange={handleTabChange} />
      )}
    </>
  );
}
