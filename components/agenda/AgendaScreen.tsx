"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { DateTime } from "luxon";
import { useState } from "react";
import { AgendaHeader } from "@/components/agenda/AgendaHeader";
import { DayView } from "@/components/agenda/DayView";
import { SubjectFilterSheet } from "@/components/agenda/SubjectFilterSheet";
import { useAgendaNavigation } from "@/components/agenda/useAgendaNavigation";
import { WeekAgenda } from "@/components/agenda/WeekAgenda";
import { WeekStrip } from "@/components/agenda/WeekStrip";
import { ErrorScreen } from "@/components/LoadingScreen";
import type { AgendaMode, AgendaSource } from "@/lib/agenda/types";
import { useAgendaData } from "@/lib/agenda/useAgendaData";
import { useNow } from "@/lib/agenda/useNow";
import { useSubjectFilters } from "@/lib/agenda/useSubjectFilters";

export type AgendaScreenProps = {
  selectedDate: DateTime;
  mode: AgendaMode;
  source: AgendaSource;
  title: string;
  onSelectedDateChange: (date: DateTime) => void;
  onModeChange: (mode: AgendaMode) => void;
};

export function AgendaScreen({
  selectedDate,
  mode,
  source,
  title,
  onSelectedDateChange,
  onModeChange,
}: AgendaScreenProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const now = useNow();
  const { direction, select, shiftDay, shiftWeek, goToday } =
    useAgendaNavigation({
      selectedDate,
      onSelectedDateChange,
    });
  const { days, weekSubjects, colorFor, isPending, error, refetch } =
    useAgendaData(selectedDate, now, source);
  const { hiddenSubjects, toggleSubject, resetFilters } = useSubjectFilters();

  if (error) {
    return (
      <ErrorScreen message={error.message} onRetryAction={() => refetch()} />
    );
  }

  const selectedDay = days.find((day) => day.date.hasSame(selectedDate, "day"));

  return (
    <div className="flex h-full min-h-0 flex-col gap-3">
      <AgendaHeader
        selectedDate={selectedDate}
        today={now}
        mode={mode}
        title={title}
        activeFilterCount={hiddenSubjects.length}
        onModeChange={onModeChange}
        onDateChange={select}
        onGoToday={() => goToday(now)}
        onOpenFilters={() => setIsFilterOpen(true)}
      />

      <WeekStrip
        days={days}
        selectedDate={selectedDate}
        today={now}
        direction={direction}
        colorFor={colorFor}
        onSelect={select}
        onShiftWeek={shiftWeek}
      />

      <AnimatePresence mode="popLayout" initial={false}>
        {mode === "day" ? (
          <motion.div
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
          </motion.div>
        ) : (
          <motion.div
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
              onSelectDay={(date) => {
                select(date);
                onModeChange("day");
              }}
              onShiftWeek={shiftWeek}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <SubjectFilterSheet
        open={isFilterOpen}
        onOpenChange={setIsFilterOpen}
        subjects={weekSubjects}
        hiddenSubjects={hiddenSubjects}
        colorFor={colorFor}
        onToggle={toggleSubject}
        onReset={resetFilters}
      />
    </div>
  );
}
