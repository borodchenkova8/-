"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { ChevronRight, Pencil, RefreshCw, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface HabitRowProps {
  title: string;
  description?: string;
  current: number;
  goal: number;
  isCompleted?: boolean;
  onClick: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onRepeat?: () => void;
}

const SWIPE_THRESHOLD = 60;
const MAX_SWIPE = 200;

export function HabitRow({
  title,
  description,
  current,
  goal,
  isCompleted = false,
  onClick,
  onEdit,
  onDelete,
  onRepeat,
}: HabitRowProps) {
  const [translateX, setTranslateX] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const startX = useRef(0);
  const currentTranslate = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const closeSwipe = useCallback(() => {
    setIsOpen(false);
    setTranslateX(0);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent | TouchEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        closeSwipe();
      }
    };
    document.addEventListener("mousedown", handler);
    document.addEventListener("touchstart", handler);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("touchstart", handler);
    };
  }, [isOpen, closeSwipe]);

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      startX.current = e.touches[0].clientX;
      currentTranslate.current = isOpen ? -MAX_SWIPE : 0;
      setIsSwiping(true);
    },
    [isOpen]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!isSwiping) return;
      const diff = e.touches[0].clientX - startX.current;
      let newTranslate = currentTranslate.current + diff;
      newTranslate = Math.min(0, Math.max(-MAX_SWIPE, newTranslate));
      setTranslateX(newTranslate);
    },
    [isSwiping]
  );

  const handleTouchEnd = useCallback(() => {
    setIsSwiping(false);
    if (translateX < -SWIPE_THRESHOLD) {
      setIsOpen(true);
      setTranslateX(-MAX_SWIPE);
    } else {
      setIsOpen(false);
      setTranslateX(0);
    }
  }, [translateX]);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button !== 0) return;
      startX.current = e.clientX;
      currentTranslate.current = isOpen ? -MAX_SWIPE : 0;
      setIsSwiping(true);
    },
    [isOpen]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isSwiping) return;
      const diff = e.clientX - startX.current;
      let newTranslate = currentTranslate.current + diff;
      newTranslate = Math.min(0, Math.max(-MAX_SWIPE, newTranslate));
      setTranslateX(newTranslate);
    },
    [isSwiping]
  );

  const handleMouseUp = useCallback(() => {
    if (!isSwiping) return;
    setIsSwiping(false);
    if (translateX < -SWIPE_THRESHOLD) {
      setIsOpen(true);
      setTranslateX(-MAX_SWIPE);
    } else {
      setIsOpen(false);
      setTranslateX(0);
    }
  }, [isSwiping, translateX]);

  const handleCardClick = () => {
    if (isOpen) {
      closeSwipe();
      return;
    }
    onClick();
  };

  return (
    <div ref={containerRef} className="relative overflow-hidden rounded-2xl">
      <div
        className={`absolute inset-y-0 right-0 flex items-center justify-end gap-2 pr-3 ${
          isCompleted ? "w-56" : "w-40"
        }`}
      >
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
            closeSwipe();
          }}
          className="flex h-3/4 w-16 flex-col items-center justify-center gap-1 rounded-xl bg-[#F0B2B2] text-[#3A4A75] shadow-sm transition-colors hover:bg-[#F0B2B2]/80"
          aria-label="Редактировать"
        >
          <Pencil className="h-4 w-4" />
          <span className="text-[10px] font-medium leading-none">Правка</span>
        </button>
        {isCompleted && onRepeat && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onRepeat();
              closeSwipe();
            }}
            className="flex h-3/4 w-16 flex-col items-center justify-center gap-1 rounded-xl bg-[#F0B2B2] text-[#3A4A75] shadow-sm transition-colors hover:bg-[#F0B2B2]/80"
            aria-label="Повторить"
          >
            <RefreshCw className="h-4 w-4" />
            <span className="text-[10px] font-medium leading-none">
              Повторить
            </span>
          </button>
        )}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="flex h-3/4 w-16 flex-col items-center justify-center gap-1 rounded-xl bg-destructive text-destructive-foreground shadow-sm transition-colors hover:opacity-90"
          aria-label="Удалить"
        >
          <Trash2 className="h-4 w-4" />
          <span className="text-[10px] font-medium leading-none">Удалить</span>
        </button>
      </div>

      <div
        className="relative z-10 cursor-pointer select-none bg-background transition-transform"
        style={{
          transform: `translateX(${translateX}px)`,
          transition: isSwiping ? "none" : "transform 0.3s ease-out",
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClick={handleCardClick}
      >
        <Card
          className="rounded-2xl p-6 shadow-sm"
          style={
            isCompleted
              ? { backgroundColor: "#E8ECF4", color: "#3A4A75" }
              : undefined
          }
        >
          <CardContent className="flex items-center justify-between p-0">
            <div className="min-w-0 flex-1">
              <h3 className="truncate text-lg font-semibold">{title}</h3>
              {description && (
                <p className="mt-0.5 truncate text-sm">{description}</p>
              )}
            </div>
            <span
              className={`mx-3 shrink-0 text-sm tabular-nums ${isCompleted ? "text-[#3A4A75]" : ""}`}
            >
              {isCompleted ? "Выполнено!" : `${current} / ${goal}`}
            </span>
            <ChevronRight className="h-5 w-5 shrink-0" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
