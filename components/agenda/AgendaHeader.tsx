"use client";

import { ChevronDown, RefreshCw, SlidersHorizontal } from "lucide-react";
import type { DateTime } from "luxon";
import { useState } from "react";
import { DatePickerDrawer } from "@/components/agenda/DatePickerDrawer";
import { dateHeadline } from "@/components/agenda/dateHeadline";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { AgendaMode } from "@/lib/agenda/types";

type AgendaHeaderProps = {
  selectedDate: DateTime;
  today: DateTime;
  mode: AgendaMode;
  title: string;
  activeFilterCount: number;
  secondaryTitle?: boolean;
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
  secondaryTitle = false,
  onDateChange,
  onGoToday,
  onOpenFilters,
  onRefresh,
}: AgendaHeaderProps) {
  const TitleTag = secondaryTitle ? "h2" : "h1";
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const headline = dateHeadline(selectedDate, mode);

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between gap-2">
        <TitleTag className="min-w-0 truncate text-sm font-semibold text-muted-foreground">
          {title}
        </TitleTag>
        <div className="flex shrink-0 items-center gap-1">
          {!selectedDate.hasSame(today, "day") && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onGoToday}
              className="hidden rounded-full xl:inline-flex"
            >
              Oggi
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            aria-label="Aggiorna orario"
            onClick={onRefresh}
            className="hidden rounded-full md:inline-flex"
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
              <Badge className="absolute -top-1 -right-1 size-5 justify-center rounded-full p-0 text-[11px]">
                {activeFilterCount}
              </Badge>
            )}
          </Button>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setIsPickerOpen(true)}
        aria-haspopup="dialog"
        className="-mx-1 flex min-h-11 min-w-0 items-center gap-2 rounded-md px-1 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <span className="truncate text-2xl font-bold leading-tight tracking-tight">
          {headline}
        </span>
        <ChevronDown className="size-5 shrink-0 text-muted-foreground" />
      </button>

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
