"use client";

import { motion } from "framer-motion";
import { Calendar, LayoutGrid, Settings } from "lucide-react";
import type React from "react";
import { cn } from "@/lib/utils";

interface BottomNavProps {
  activeView?: "week" | "month";
  onViewChange?: (v: "week" | "month") => void;
  onSettings?: () => void;
  /** se "settings", evidenzia l'icona Impostazioni invece della vista */
  activeSection?: "calendar" | "settings";
}

export function BottomNav({
  activeView = "week",
  onViewChange,
  onSettings,
  activeSection = "calendar",
}: BottomNavProps) {
  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-30 px-4"
      style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
    >
      <div className="flex items-stretch bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.12)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.5)]">
        <NavBtn
          active={activeSection === "calendar" && activeView === "week"}
          onClick={() => onViewChange?.("week")}
          label="Settimana"
          icon={<LayoutGrid className="w-[18px] h-[18px]" />}
        />

        <NavBtn
          active={activeSection === "calendar" && activeView === "month"}
          onClick={() => onViewChange?.("month")}
          label="Mese"
          icon={<Calendar className="w-[18px] h-[18px]" />}
        />

        <NavBtn
          active={activeSection === "settings"}
          onClick={() => onSettings?.()}
          label="Impost."
          icon={<Settings className="w-[18px] h-[18px]" />}
        />
      </div>
    </nav>
  );
}

function NavBtn({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative flex flex-col items-center justify-center gap-1 flex-1 py-3.5 transition-all active:scale-95",
        active
          ? "text-zinc-900 dark:text-white"
          : "text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300",
      )}
    >
      {active && (
        <motion.div
          layoutId="nav-active"
          className="absolute inset-x-3 inset-y-2 bg-zinc-100 dark:bg-zinc-800 rounded-xl"
          transition={{ type: "spring", stiffness: 400, damping: 35 }}
        />
      )}
      <span className="relative z-10">{icon}</span>
      <span className="relative z-10 text-[9px] font-bold uppercase tracking-widest font-mono leading-none">
        {label}
      </span>
    </button>
  );
}
