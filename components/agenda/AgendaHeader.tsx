"use client";

import { it } from "date-fns/locale";
import { SlidersHorizontal } from "lucide-react";
import type { DateTime } from "luxon";
import { useState } from "react";
import { ModeToggle } from "@/components/agenda/ModeToggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Drawer, DrawerContent, DrawerTitle } from "@/components/ui/drawer";
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
}: AgendaHeaderProps) {
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const isToday = selectedDate.hasSame(today, "day");
  const rangeStart = selectedDate.startOf("week").setLocale("it");
  const rangeEnd = selectedDate.endOf("week").setLocale("it");
  const rangeLabel =
    rangeStart.month === rangeEnd.month
      ? `${rangeStart.toFormat("d")} - ${rangeEnd.toFormat("d MMMM yyyy")}`
      : `${rangeStart.toFormat("d MMM")} - ${rangeEnd.toFormat("d MMM yyyy")}`;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <h1 className="min-w-0 truncate text-lg font-bold leading-none">
          {title}
        </h1>
        <Button
          variant="outline"
          size="icon"
          aria-label="Filtra materie"
          onClick={onOpenFilters}
          className="relative shrink-0 rounded-full elevation-1"
        >
          <SlidersHorizontal className="size-4" />
          {activeFilterCount > 0 && (
            <Badge className="absolute -top-1 -right-1 size-4 justify-center rounded-full p-0 text-[10px]">
              {activeFilterCount}
            </Badge>
          )}
        </Button>
      </div>

      <div className="flex min-w-0 items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <Drawer open={isPickerOpen} onOpenChange={setIsPickerOpen}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsPickerOpen(true)}
              className="h-auto min-h-0 min-w-0 justify-start px-0 py-0 text-sm font-medium text-muted-foreground hover:bg-transparent"
            >
              <span className="truncate">{rangeLabel}</span>
            </Button>
            <DrawerContent>
              <DrawerTitle className="px-4 pt-2">Vai alla data</DrawerTitle>
              <div className="flex justify-center pb-6">
                <Calendar
                  mode="single"
                  locale={it}
                  selected={selectedDate.toJSDate()}
                  onSelect={(date) => {
                    if (!date) return;
                    onDateChange(
                      selectedDate.set({
                        year: date.getFullYear(),
                        month: date.getMonth() + 1,
                        day: date.getDate(),
                      }),
                    );
                    setIsPickerOpen(false);
                  }}
                  className="font-mono"
                />
              </div>
            </DrawerContent>
          </Drawer>
          {!isToday && (
            <Button
              variant="secondary"
              size="sm"
              onClick={onGoToday}
              className="h-6 shrink-0 rounded-full px-2.5 text-xs"
            >
              Oggi
            </Button>
          )}
        </div>

        <ModeToggle mode={mode} onChange={onModeChange} />
      </div>
    </div>
  );
}
