"use client";

import { motion } from "framer-motion";
import type { AgendaMode } from "@/lib/agenda/types";
import { springs } from "@/lib/motion";
import { cn } from "@/lib/utils";

const MODES: { value: AgendaMode; label: string }[] = [
  { value: "day", label: "Giorno" },
  { value: "week", label: "Settimana" },
];

type ModeToggleProps = {
  mode: AgendaMode;
  onChange: (mode: AgendaMode) => void;
};

export function ModeToggle({ mode, onChange }: ModeToggleProps) {
  return (
    <div className="relative flex rounded-full bg-muted p-1">
      {MODES.map((item) => (
        <button
          key={item.value}
          type="button"
          onClick={() => onChange(item.value)}
          aria-pressed={mode === item.value}
          className={cn(
            "relative z-10 min-h-11 flex-1 rounded-full px-4 text-sm font-semibold transition-colors",
            mode === item.value ? "text-foreground" : "text-muted-foreground",
          )}
        >
          {mode === item.value && (
            <motion.span
              layoutId="mode-toggle"
              transition={springs.snappy}
              className="absolute inset-0 -z-10 rounded-full bg-card elevation-1"
            />
          )}
          {item.label}
        </button>
      ))}
    </div>
  );
}
