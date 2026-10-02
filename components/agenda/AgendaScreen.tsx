"use client";

import { AnimatePresence, m } from "framer-motion";
import type { DateTime } from "luxon";
import { useState } from "react";
import { AgendaHeader } from "@/components/agenda/AgendaHeader";
import { DayView } from "@/components/agenda/DayView";
import { MonthGrid } from "@/components/agenda/MonthGrid";
import { SubjectFilterSheet } from "@/components/agenda/SubjectFilterSheet";
import { useAgendaNavigation } from "@/components/agenda/useAgendaNavigation";
import { WeekAgenda } from "@/components/agenda/WeekAgenda";
import { WeekStrip } from "@/components/agenda/WeekStrip";
import { ErrorScreen } from "@/components/LoadingScreen";
import type { AgendaMode, AgendaSource } from "@/lib/agenda/types";
import { useAgendaData } from "@/lib/agenda/useAgendaData";
import { useMonthData } from "@/lib/agenda/useMonthData";
import { useNow } from "@/lib/agenda/useNow";
import { useSubjectFilters } from "@/lib/agenda/useSubjectFilters";
import { useMediaQuery } from "@/lib/useMediaQuery";

export type AgendaScreenProps = {
  selectedDate: DateTime;
  mode: AgendaMode;
  source: AgendaSource;
  title: string;
  onSelectedDateChange: (date: DateTime) => void;
  onModeChange: (mode: AgendaMode) => void;
  onRefresh: () => void;
};

export function AgendaScreen({
  selectedDate,
  mode,
  source,
  title,
  onSelectedDateChange,
  onModeChange,
  onRefresh,
}: AgendaScreenProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const now = useNow();
  const isLandscape = useMediaQuery("(min-width: 1280px)");
  const { direction, select, shiftDay, shiftWeek, shiftMonth, goToday } =
    useAgendaNavigation({ selectedDate, onSelectedDateChange });
  const { days, weekSubjects, colorFor, isPending, error, refetch } =
    useAgendaData(selectedDate, now, source);
  const month = useMonthData(
    selectedDate,
    source,
    mode === "month" || isLandscape,
  );
  const { hiddenSubjects, toggleSubject, resetFilters } = useSubjectFilters();

  if (error) {
    return (
      <ErrorScreen message={error.message} onRetryAction={() => refetch()} />
    );
  }

  const selectedDay = days.find((day) => day.date.hasSame(selectedDate, "day"));
  const openDay = (date: DateTime) => {
    select(date);
    onModeChange("day");
  };

  return (
    <div className="flex h-full min-h-0 flex-col gap-3">
      <AgendaHeader
        selectedDate={selectedDate}
        today={now}
        mode={mode}
        title={title}
        activeFilterCount={hiddenSubjects.length}
        hideModeToggle={isLandscape}
        onModeChange={onModeChange}
        onDateChange={select}
        onGoToday={() => goToday(now)}
        onOpenFilters={() => setIsFilterOpen(true)}
        onRefresh={onRefresh}
      />

      {!isLandscape && mode !== "month" && (
        <WeekStrip
          days={days}
          selectedDate={selectedDate}
          today={now}
          direction={direction}
          colorFor={colorFor}
          onSelect={select}
          onShiftWeek={shiftWeek}
        />
      )}

      {isLandscape ? (
        <div className="grid min-h-0 flex-1 grid-cols-3 gap-4">
          <div className="flex min-h-0 flex-col gap-2">
            <p className="shrink-0 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Oggi
            </p>
            <DayView
              date={selectedDate}
              events={selectedDay?.events ?? []}
              now={now}
              isToday={selectedDate.hasSame(now, "day")}
              isPending={isPending}
              direction={direction}
              colorFor={colorFor}
              variant={source.kind}
              onShiftDay={shiftDay}
            />
          </div>
          <div className="flex min-h-0 flex-col gap-2">
            <p className="shrink-0 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Settimana
            </p>
            <WeekAgenda
              days={days}
              selectedDate={selectedDate}
              today={now}
              isPending={isPending}
              colorFor={colorFor}
              onSelectDay={select}
              onShiftWeek={shiftWeek}
            />
          </div>
          <div className="flex min-h-0 flex-col gap-2">
            <p className="shrink-0 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Mese
            </p>
            <MonthGrid
              currentDate={selectedDate}
              selectedDate={selectedDate}
              today={now}
              eventsByDate={month.eventsByDate}
              isPending={month.isPending}
              direction={direction}
              colorFor={month.colorFor}
              onSelectDay={openDay}
              onShiftMonth={shiftMonth}
            />
          </div>
        </div>
      ) : (
        <AnimatePresence mode="popLayout" initial={false}>
          {mode === "day" && (
            <m.div
              key="day"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="flex min-h-0 flex-1 flex-col"
            >
              <DayView
                date={selectedDate}
                events={selectedDay?.events ?? []}
                now={now}
                isToday={selectedDate.hasSame(now, "day")}
                isPending={isPending}
                direction={direction}
                colorFor={colorFor}
                variant={source.kind}
                onShiftDay={shiftDay}
              />
            </m.div>
          )}

          {mode === "week" && (
            <m.div
              key="week"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="flex min-h-0 flex-1 flex-col"
            >
              <WeekAgenda
                days={days}
                selectedDate={selectedDate}
                today={now}
                isPending={isPending}
                colorFor={colorFor}
                onSelectDay={openDay}
                onShiftWeek={shiftWeek}
              />
            </m.div>
          )}

          {mode === "month" && (
            <m.div
              key="month"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="flex min-h-0 flex-1 flex-col"
            >
              <MonthGrid
                currentDate={selectedDate}
                selectedDate={selectedDate}
                today={now}
                eventsByDate={month.eventsByDate}
                isPending={month.isPending}
                direction={direction}
                colorFor={month.colorFor}
                onSelectDay={openDay}
                onShiftMonth={shiftMonth}
              />
            </m.div>
          )}
        </AnimatePresence>
      )}

      <SubjectFilterSheet
        open={isFilterOpen}
        onOpenChange={setIsFilterOpen}
        subjects={mode === "month" ? month.monthSubjects : weekSubjects}
        hiddenSubjects={hiddenSubjects}
        colorFor={mode === "month" ? month.colorFor : colorFor}
        onToggle={toggleSubject}
        onReset={resetFilters}
      />
    </div>
  );
}
