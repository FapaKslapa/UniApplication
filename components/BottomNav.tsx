"use client";

import { motion } from "framer-motion";
import { CalendarDays, LayoutGrid, Settings } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";

interface BottomNavProps {
  activeView?: "week" | "month" | "stats" | "admin-courses";
  onViewChange?: (v: "week" | "month" | "stats" | "admin-courses") => void;
  onSettings?: () => void;
  activeSection?: "calendar" | "settings" | "admin";
}

const SPRING = { type: "spring", stiffness: 500, damping: 42 } as const;

export function BottomNav({
  activeView = "week",
  onViewChange,
  onSettings,
  activeSection = "calendar",
}: BottomNavProps) {
  const isAdmin = useAppStore((s) => s.isAdmin);

  const items: Array<{
    id: "week" | "month";
    label: string;
    Icon: React.FC<{ className?: string; strokeWidth?: number }>;
  }> = (
    [
      { id: "week", label: "Oggi" },
      { id: "month", label: "Mese" },
    ] as const
  ).map((x) => ({
    ...x,
    Icon: x.id === "week" ? LayoutGrid : CalendarDays,
  }));

  return (
    <nav
      className="md:hidden fixed z-30 left-4 right-4"
      style={{
        bottom: "calc(env(safe-area-inset-bottom) + 12px)",
      }}
    >
      <div
        className="flex items-stretch h-[58px] px-2 bg-white/88 dark:bg-zinc-950/92 backdrop-blur-2xl rounded-[22px] border border-zinc-200/60 dark:border-zinc-800/60"
        style={{
          boxShadow: "0 8px 32px rgba(0,0,0,0.10), 0 2px 8px rgba(0,0,0,0.06)",
        }}
      >
        {items.map((item) => {
          const isActive =
            activeSection === "calendar" && activeView === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onViewChange?.(item.id)}
              className="relative flex flex-col items-center justify-center gap-1 flex-1 rounded-[16px] mx-0.5 transition-all active:scale-90"
            >
              {isActive && (
                <motion.div
                  layoutId="nth-nav-fill"
                  className="absolute inset-y-2 inset-x-0 rounded-[14px] bg-zinc-900/6 dark:bg-white/8"
                  transition={SPRING}
                />
              )}
              {isActive && (
                <motion.div
                  layoutId="nth-nav-dot"
                  className="absolute top-2 left-1/2 -translate-x-1/2 rounded-full"
                  style={{
                    width: "18px",
                    height: "2px",
                    backgroundColor: "#FF2B2B",
                  }}
                  transition={SPRING}
                />
              )}
              <item.Icon
                className={cn(
                  "w-[18px] h-[18px] relative z-10 transition-colors",
                  isActive
                    ? "text-zinc-900 dark:text-white"
                    : "text-zinc-400 dark:text-zinc-500",
                )}
                strokeWidth={isActive ? 2.2 : 1.6}
              />
              <span
                className={cn(
                  "font-mono text-[8px] font-black tracking-[0.12em] uppercase relative z-10 transition-colors",
                  isActive
                    ? "text-zinc-900 dark:text-white"
                    : "text-zinc-400 dark:text-zinc-500",
                )}
              >
                {item.label}
              </span>
            </button>
          );
        })}

        {isAdmin &&
          (["stats", "admin-courses"] as const).map((id) => {
            const isActive = activeSection === "admin" && activeView === id;
            const label = id === "stats" ? "Stats" : "Admin";
            return (
              <button
                key={id}
                type="button"
                onClick={() => onViewChange?.(id)}
                className="relative flex flex-col items-center justify-center gap-1 flex-1 rounded-[16px] mx-0.5 transition-all active:scale-90"
              >
                {isActive && (
                  <motion.div
                    layoutId="nth-nav-fill"
                    className="absolute inset-y-2 inset-x-0 rounded-[14px] bg-zinc-900/6 dark:bg-white/8"
                    transition={SPRING}
                  />
                )}
                {isActive && (
                  <motion.div
                    layoutId="nth-nav-dot"
                    className="absolute top-2 left-1/2 -translate-x-1/2 rounded-full"
                    style={{
                      width: "18px",
                      height: "2px",
                      backgroundColor: "#FF2B2B",
                    }}
                    transition={SPRING}
                  />
                )}
                <span
                  className={cn(
                    "font-mono text-[8px] font-black tracking-[0.12em] uppercase relative z-10 transition-colors",
                    isActive
                      ? "text-zinc-900 dark:text-white"
                      : "text-zinc-400 dark:text-zinc-500",
                  )}
                >
                  {label}
                </span>
              </button>
            );
          })}

        <div className="w-px my-3 bg-zinc-200 dark:bg-zinc-800 shrink-0" />

        <button
          type="button"
          onClick={onSettings}
          className="relative flex flex-col items-center justify-center gap-1 w-[58px] rounded-[16px] mx-0.5 transition-all active:scale-90"
        >
          {activeSection === "settings" && (
            <motion.div
              layoutId="nth-nav-fill"
              className="absolute inset-y-2 inset-x-0 rounded-[14px] bg-zinc-900/6 dark:bg-white/8"
              transition={SPRING}
            />
          )}
          {activeSection === "settings" && (
            <motion.div
              layoutId="nth-nav-dot"
              className="absolute top-2 left-1/2 -translate-x-1/2 rounded-full"
              style={{
                width: "14px",
                height: "2px",
                backgroundColor: "#FF2B2B",
              }}
              transition={SPRING}
            />
          )}
          <Settings
            className={cn(
              "w-[18px] h-[18px] relative z-10 transition-colors",
              activeSection === "settings"
                ? "text-zinc-900 dark:text-white"
                : "text-zinc-400 dark:text-zinc-500",
            )}
            strokeWidth={activeSection === "settings" ? 2.2 : 1.6}
          />
        </button>
      </div>
    </nav>
  );
}
