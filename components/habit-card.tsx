"use client";

import { useState } from "react";
import { Check, Plus, ChevronLeft, ChevronRight } from "lucide-react";

const MONTHS = [
  "Январь",
  "Февраль",
  "Март",
  "Апрель",
  "Май",
  "Июнь",
  "Июль",
  "Август",
  "Сентябрь",
  "Октябрь",
  "Ноябрь",
  "Декабрь",
];

const DAY_HEADERS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

const RADIUS = 52;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

type VisualScheme = "circular" | "linear";

interface HabitCardProps {
  title: string;
  description?: string;
  type: "discrete" | "numeric";
  goal: number;
  initialCells?: Record<string, boolean>;
  initialNumericValue?: number;
  onCellsChange?: (cells: Record<string, boolean>) => void;
  onNumericValueChange?: (value: number) => void;
}

function formatDateKey(year: number, month: number, day: number): string {
  const mm = String(month + 1).padStart(2, "0");
  const dd = String(day).padStart(2, "0");
  return `${year}-${mm}-${dd}`;
}

function getMondayOffset(day: number): number {
  return day === 0 ? 6 : day - 1;
}

export function HabitCard({
  title,
  description,
  type,
  goal,
  initialCells = {},
  initialNumericValue = 0,
  onCellsChange,
  onNumericValueChange,
}: HabitCardProps) {
  const [cells, setCells] = useState<Record<string, boolean>>(initialCells);
  const [numericValue, setNumericValue] = useState<number>(
    type === "numeric" ? initialNumericValue : 0
  );
  const [inputValue, setInputValue] = useState("");
  const [scheme, setScheme] = useState<VisualScheme>("circular");
  const [currentDate, setCurrentDate] = useState(new Date());

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  const today = new Date().toISOString().split("T")[0];

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOffset = getMondayOffset(
    new Date(currentYear, currentMonth, 1).getDay()
  );

  const prevMonth = () =>
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  const nextMonth = () =>
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));

  const isDiscrete = type === "discrete";
  const totalCount = isDiscrete ? Object.keys(cells).length : numericValue;
  const progress = goal > 0 ? totalCount / goal : 0;
  const percent = Math.min(Math.round(progress * 100), 100);
  const offset = CIRCUMFERENCE - progress * CIRCUMFERENCE;

  const toggleCell = (day: number) => {
    const dateKey = formatDateKey(currentYear, currentMonth, day);
    setCells((prev) => {
      const next = { ...prev };
      if (next[dateKey]) {
        delete next[dateKey];
      } else {
        next[dateKey] = true;
      }
      onCellsChange?.(next);
      return next;
    });
  };

  const updateNumericProgress = (value: number) => {
    const newValue = Math.max(0, value);
    setNumericValue(newValue);
    onNumericValueChange?.(newValue);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(inputValue, 10);
    if (!isNaN(val) && val >= 0) {
      updateNumericProgress(numericValue + val);
      setInputValue("");
    }
  };

  const quickAdd = (amount: number) => {
    updateNumericProgress(numericValue + amount);
  };

  const days = (() => {
    const result: (number | null)[] = [];
    for (let i = 0; i < firstDayOffset; i++) {
      result.push(null);
    }
    for (let d = 1; d <= daysInMonth; d++) {
      result.push(d);
    }
    return result;
  })();

  const isDayToday = (day: number) => {
    return today === formatDateKey(currentYear, currentMonth, day);
  };

  const isDayActive = (day: number) => {
    return cells[formatDateKey(currentYear, currentMonth, day)] === true;
  };

  return (
    <>
      <h3 className="text-lg font-semibold">{title}</h3>
      {description && <p className="mt-1 text-sm">{description}</p>}

      {isDiscrete ? (
        <div className="mt-4">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={prevMonth}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-[#F0B2B2] transition-colors hover:bg-muted"
              aria-label="Предыдущий месяц"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <span className="text-base font-semibold">
              {MONTHS[currentMonth]} {currentYear}
            </span>
            <button
              type="button"
              onClick={nextMonth}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-[#F0B2B2] transition-colors hover:bg-muted"
              aria-label="Следующий месяц"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          <div className="mt-6 grid grid-cols-7 text-center text-xs font-medium text-[rgba(240,178,178,0.6)]">
            {DAY_HEADERS.map((d) => (
              <div key={d} className="py-1">
                {d}
              </div>
            ))}
          </div>

          <div className="mt-2 grid grid-cols-7 gap-1">
            {days.map((day: number | null, idx: number) => {
              if (day === null) {
                return <div key={`empty-${idx}`} />;
              }
              const active = isDayActive(day);
              const isToday = isDayToday(day);
              const dateKey = formatDateKey(currentYear, currentMonth, day);

              let cellStyle = "bg-transparent text-[rgba(240,178,178,0.6)]";
              if (active) {
                cellStyle = "bg-[#F0B2B2] text-[#3A4A75]";
              } else if (isToday) {
                cellStyle = "border border-[#F0B2B2] text-white";
              }

              const ringStyle =
                active && isToday ? "ring-1 ring-[#F0B2B2] ring-offset-1" : "";

              return (
                <button
                  key={dateKey}
                  type="button"
                  onClick={() => toggleCell(day)}
                  className={`flex aspect-square items-center justify-center rounded-lg text-sm font-medium transition-colors ${cellStyle} ${ringStyle}`}
                  aria-label={`${day} ${MONTHS[currentMonth]}`}
                >
                  {active ? <Check className="h-4 w-4" /> : day}
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="mt-4 space-y-4">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="number"
              min={0}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Введите значение"
              className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
            <button
              type="submit"
              className="inline-flex h-10 items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-[#F0B2B2] px-4 py-2 text-sm font-medium text-[#3A4A75] transition-colors hover:bg-[#F0B2B2]/80"
            >
              <Plus className="h-4 w-4" />
              Обновить прогресс
            </button>
          </form>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => quickAdd(10)}
              className="inline-flex h-10 items-center justify-center rounded-lg border border-input bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent"
            >
              +10
            </button>
            <button
              type="button"
              onClick={() => quickAdd(50)}
              className="inline-flex h-10 items-center justify-center rounded-lg border border-input bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent"
            >
              +50
            </button>
          </div>
        </div>
      )}

      <div className="mt-3 space-y-2">
        <div className="text-center">
          <span className="text-2xl font-bold">
            {totalCount} / {goal}
          </span>
        </div>

        <div className="flex justify-center">
          {scheme === "circular" ? (
            <svg
              width="140"
              height="140"
              viewBox="0 0 140 140"
              className={percent === 100 ? "progress-pulse" : ""}
            >
              <circle
                cx="70"
                cy="70"
                r={RADIUS}
                fill="none"
                stroke="#EEF2F0"
                strokeWidth="6"
              />
              <circle
                cx="70"
                cy="70"
                r={RADIUS}
                fill="none"
                stroke="#F0B2B2"
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={CIRCUMFERENCE}
                strokeDashoffset={offset}
                transform="rotate(-90 70 70)"
                className="transition-all duration-300 ease-out"
              />
              <text
                x="70"
                y="64"
                textAnchor="middle"
                dominantBaseline="central"
                fill="#F0B2B2"
                fontSize="28"
                fontWeight="700"
              >
                {percent}%
              </text>
              <text
                x="70"
                y="82"
                textAnchor="middle"
                dominantBaseline="central"
                fill="#F0B2B2"
                fontSize="12"
              >
                выполнено
              </text>
            </svg>
          ) : (
            <div
              className={`w-full max-w-xs space-y-2 ${percent === 100 ? "progress-pulse" : ""}`}
            >
              <div className="h-3 w-full rounded-full bg-[#EEF2F0]">
                <div
                  className="h-full rounded-full bg-[#F0B2B2] transition-all duration-300 ease-out"
                  style={{ width: `${percent}%` }}
                />
              </div>
              <p className="text-sm">{percent}% выполнено</p>
            </div>
          )}
        </div>

        <div className="flex justify-center gap-2">
          <button
            type="button"
            onClick={() => setScheme("circular")}
            className="rounded-lg px-3 py-1 text-sm font-medium transition-colors"
            style={{
              backgroundColor: scheme === "circular" ? "#F0B2B2" : "#EEF2F0",
              color: scheme === "circular" ? "#3A4A75" : "#3A4A75",
            }}
          >
            Круг
          </button>
          <button
            type="button"
            onClick={() => setScheme("linear")}
            className="rounded-lg px-3 py-1 text-sm font-medium transition-colors"
            style={{
              backgroundColor: scheme === "linear" ? "#F0B2B2" : "#EEF2F0",
              color: scheme === "linear" ? "#3A4A75" : "#3A4A75",
            }}
          >
            Линия
          </button>
        </div>
      </div>
    </>
  );
}
