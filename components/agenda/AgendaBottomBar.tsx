"use client";

import { ModeToggle } from "@/components/agenda/ModeToggle";
import { Button } from "@/components/ui/button";
import type { AgendaMode } from "@/lib/agenda/types";

type AgendaBottomBarProps = {
  mode: AgendaMode;
  isToday: boolean;
  onModeChange: (mode: AgendaMode) => void;
  onGoToday: () => void;
};

export function AgendaBottomBar({
  mode,
  isToday,
  onModeChange,
  onGoToday,
}: AgendaBottomBarProps) {
  return (
    <div className="flex shrink-0 items-center gap-2 pt-1">
      <div className="min-w-0 flex-1">
        <ModeToggle mode={mode} onChange={onModeChange} />
      </div>
      <Button
        variant="secondary"
        size="sm"
        onClick={onGoToday}
        disabled={isToday}
        className="h-[3.25rem] shrink-0 rounded-full px-5 text-sm font-semibold"
      >
        Oggi
      </Button>
    </div>
  );
}
