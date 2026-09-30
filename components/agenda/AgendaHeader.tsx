"use client";

import { CalendarDays, RefreshCw, SlidersHorizontal } from "lucide-react";
import type { DateTime } from "luxon";
import { useState } from "react";
import { DatePickerDrawer } from "@/components/agenda/DatePickerDrawer";
import { ModeToggle } from "@/components/agenda/ModeToggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { AgendaMode } from "@/lib/agenda/types";

type AgendaHeaderProps = {
  selectedDate: DateTime;
  today: DateTime;
  mode: AgendaMode;
  title: string;
  activeFilterCount: number;
  onModeChange: (mode: AgendaMode) => void;
  onDateChange: (date: DateTime) => void;
  onGoToday: () => void;
  onOpenFilters: () => void;
  onRefresh: () => void;
};

export function AgendaHeader({
  selectedDate,
  today,
  mode,
  title,
  activeFilterCount,
  onModeChange,
  onDateChange,
  onGoToday,
  onOpenFilters,
  onRefresh,
}: AgendaHeaderProps) {
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const isToday = selectedDate.hasSame(today, "day");
  const rangeStart = selectedDate.startOf("week").setLocale("it");
  const rangeEnd = selectedDate.endOf("week").setLocale("it");
  const rangeLabel =
    mode === "month"
      ? selectedDate.setLocale("it").toFormat("MMMM yyyy")
      : rangeStart.month === rangeEnd.month
        ? `${rangeStart.toFormat("d")} – ${rangeEnd.toFormat("d MMMM yyyy")}`
        : `${rangeStart.toFormat("d MMM")} – ${rangeEnd.toFormat("d MMM yyyy")}`;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <h1 className="min-w-0 truncate text-lg font-bold leading-none">
          {title}
        </h1>
        <div className="flex shrink-0 items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            aria-label="Aggiorna orario"
            onClick={onRefresh}
            className="rounded-full elevation-1"
          >
            <RefreshCw className="size-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            aria-label="Filtra materie"
            onClick={onOpenFilters}
            className="relative rounded-full elevation-1"
          >
            <SlidersHorizontal className="size-4" />
            {activeFilterCount > 0 && (
              <Badge className="absolute -top-1 -right-1 size-4 justify-center rounded-full p-0 text-[10px]">
                {activeFilterCount}
              </Badge>
            )}
          </Button>
        </div>
      </div>

      <div className="flex min-w-0 items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setIsPickerOpen(true)}
          className="h-8 min-w-0 flex-1 justify-start gap-1.5 rounded-full px-3"
        >
          <CalendarDays className="size-3.5 shrink-0" />
          <span className="truncate">{rangeLabel}</span>
        </Button>
        {!isToday && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onGoToday}
            className="h-8 shrink-0 rounded-full px-2.5 text-xs text-muted-foreground"
          >
            Oggi
          </Button>
        )}
      </div>

      <ModeToggle mode={mode} onChange={onModeChange} />

      <DatePickerDrawer
        open={isPickerOpen}
        onOpenChange={setIsPickerOpen}
        selectedDate={selectedDate}
        today={today}
        onDateChange={onDateChange}
        onGoToday={onGoToday}
      />
    </div>
  );
}
