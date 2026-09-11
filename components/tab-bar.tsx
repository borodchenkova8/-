"use client";

import { Target, User } from "lucide-react";

interface TabBarProps {
  activeTab: "goals" | "profile";
  onTabChange: (tab: "goals" | "profile") => void;
}

export function TabBar({ activeTab, onTabChange }: TabBarProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background">
      <div className="mx-auto flex max-w-lg items-center justify-around h-16">
        <button
          onClick={() => onTabChange("goals")}
          className={`flex flex-col items-center gap-1 text-xs font-medium transition-colors ${
            activeTab === "goals" ? "text-[#F0B2B2]" : "text-muted-foreground"
          }`}
        >
          <Target className="h-5 w-5" />
          <span>Цели</span>
        </button>
        <button
          onClick={() => onTabChange("profile")}
          className={`flex flex-col items-center gap-1 text-xs font-medium transition-colors ${
            activeTab === "profile" ? "text-[#F0B2B2]" : "text-muted-foreground"
          }`}
        >
          <User className="h-5 w-5" />
          <span>Профиль</span>
        </button>
      </div>
    </nav>
  );
}
