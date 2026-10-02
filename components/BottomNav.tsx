"use client";

import { m } from "framer-motion";
import { CalendarDays, Search, Settings, ShieldCheck } from "lucide-react";
import type React from "react";
import type { HomeView } from "@/components/home/types";
import { springs } from "@/lib/motion";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";

type BottomNavProps = {
  activeView?: HomeView;
  onViewChange?: (v: HomeView) => void;
  onSettings?: () => void;
  activeSection?: "calendar" | "settings" | "admin";
};

export function BottomNav({
  activeView = "week",
  onViewChange,
  onSettings,
  activeSection = "calendar",
}: BottomNavProps) {
  const isAdmin = useAppStore((state) => state.isAdmin);

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-30 px-4"
      style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
    >
      <div className="flex items-stretch bg-card rounded-full elevation-2">
        <NavBtn
          active={activeSection === "calendar" && activeView === "week"}
          onClick={() => onViewChange?.("week")}
          label="Agenda"
          icon={<CalendarDays className="size-[18px]" />}
        />

        <NavBtn
          active={activeSection === "calendar" && activeView === "docenti"}
          onClick={() => onViewChange?.("docenti")}
          label="Docenti"
          icon={<Search className="size-[18px]" />}
        />

        {isAdmin && (
          <NavBtn
            active={activeSection === "admin"}
            onClick={() => onViewChange?.("stats")}
            label="Admin"
            icon={<ShieldCheck className="size-[18px]" />}
          />
        )}

        <NavBtn
          active={activeSection === "settings"}
          onClick={() => onSettings?.()}
          label="Impost"
          icon={<Settings className="size-[18px]" />}
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
        "relative flex flex-col items-center justify-center gap-1 flex-1 py-3.5 min-h-11 transition-all active:scale-95",
        active ? "text-foreground" : "text-muted-foreground",
      )}
    >
      {active && (
        <m.div
          layoutId="nav-active"
          className="absolute inset-x-2 inset-y-1.5 bg-muted rounded-full"
          transition={springs.smooth}
        />
      )}
      <m.span
        animate={active ? { scale: [1, 1.15, 1] } : { scale: 1 }}
        transition={
          active
            ? { duration: 0.32, ease: "easeOut", times: [0, 0.5, 1] }
            : springs.snappy
        }
        className="relative z-10"
      >
        {icon}
      </m.span>
      <span className="relative z-10 text-[10px] font-semibold leading-none">
        {label}
      </span>
    </button>
  );
}
