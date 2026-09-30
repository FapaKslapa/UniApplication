"use client";

import { AnimatePresence, motion } from "framer-motion";
import { DateTime } from "luxon";
import { useState } from "react";
import { CompactDayCell } from "@/components/monthly-view/CompactDayCell";
import { MonthNav } from "@/components/monthly-view/MonthNav";
import { MonthViewMenu } from "@/components/monthly-view/MonthViewMenu";
import {
  SPRING_CONFIG,
  WEEKDAY_LABELS,
} from "@/components/monthly-view/monthGrid";
import { SelectedDayEvents } from "@/components/monthly-view/SelectedDayEvents";
import { SubjectFilterList } from "@/components/monthly-view/SubjectFilterList";
import { SwipeableMonth } from "@/components/monthly-view/SwipeableMonth";
import type { MonthLayoutProps } from "@/components/monthly-view/types";

export function MonthLandscape({
  currentDate,
  direction,
  days,
  eventsByDate,
  isFetching,
  isCurrentMonth,
  activeTab,
  onTabChange,
  materie,
  hiddenSubjects,
  colorFor,
  onToggleSubject,
  onPrevMonth,
  onNextMonth,
  onToday,
  onOpenDay,
}: MonthLayoutProps) {
  const [selectedDate, setSelectedDate] = useState<DateTime>(() =>
    DateTime.now().setLocale("it"),
  );
  const now = DateTime.now();
  const selectedEvents = eventsByDate.get(selectedDate.toISODate() ?? "") ?? [];

  const goToToday = () => {
    setSelectedDate(DateTime.now().setLocale("it"));
    onToday();
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={SPRING_CONFIG}
      className="relative flex h-full w-full overflow-hidden rounded-xl bg-card elevation-1"
    >
      <div className="flex w-[35%] min-w-[280px] max-w-[350px] flex-col bg-muted/30">
        <div className="flex items-center justify-between p-4">
          <span className="text-sm font-bold capitalize">
            {currentDate.toFormat("MMMM yyyy")}
          </span>
          <MonthNav
            isCurrentMonth={isCurrentMonth}
            onToday={goToToday}
            onPrev={onPrevMonth}
            onNext={onNextMonth}
          />
        </div>

        <div className="relative flex-1 overflow-hidden">
          <AnimatePresence initial={false} custom={direction} mode="popLayout">
            <SwipeableMonth
              key={currentDate.toFormat("yyyy-MM")}
              direction={direction}
              onPrev={onPrevMonth}
              onNext={onNextMonth}
              className="absolute inset-0 touch-pan-y overflow-y-auto p-3 custom-scrollbar"
            >
              <div className="grid grid-cols-7 gap-1">
                {WEEKDAY_LABELS.map((d) => (
                  <div
                    key={d.id}
                    className="py-1 text-center text-xs font-semibold text-muted-foreground/60"
                  >
                    {d.label}
                  </div>
                ))}
                {days.map((day) => {
                  const iso = day.date.toISODate();
                  if (!iso) return null;
                  return (
                    <CompactDayCell
                      key={iso}
                      day={day}
                      events={eventsByDate.get(iso) ?? []}
                      isSelected={selectedDate.hasSame(day.date, "day")}
                      isToday={day.date.hasSame(now, "day")}
                      colorFor={colorFor}
                      onSelect={setSelectedDate}
                    />
                  );
                })}
              </div>
            </SwipeableMonth>
          </AnimatePresence>
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="sticky top-0 z-20 flex items-center justify-between bg-card p-4">
          <MonthViewMenu activeTab={activeTab} onSelectTab={onTabChange} />
          {isFetching && (
            <div className="size-4 animate-spin rounded-full border-2 border-muted border-t-foreground" />
          )}
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {activeTab === "calendar" ? (
            <SelectedDayEvents
              date={selectedDate}
              events={selectedEvents}
              colorFor={colorFor}
              onOpen={() => onOpenDay(selectedDate, selectedEvents)}
            />
          ) : (
            <div className="h-full p-6">
              <SubjectFilterList
                materie={materie}
                hiddenSubjects={hiddenSubjects}
                colorFor={colorFor}
                onToggle={onToggleSubject}
              />
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
