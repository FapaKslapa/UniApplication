"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Calendar as CalendarIcon } from "lucide-react";
import { DateTime } from "luxon";
import { MonthDayCell } from "@/components/monthly-view/MonthDayCell";
import { MonthNav } from "@/components/monthly-view/MonthNav";
import { MonthViewMenu } from "@/components/monthly-view/MonthViewMenu";
import {
  SPRING_CONFIG,
  WEEKDAY_LABELS,
} from "@/components/monthly-view/monthGrid";
import { SubjectFilterList } from "@/components/monthly-view/SubjectFilterList";
import { SwipeableMonth } from "@/components/monthly-view/SwipeableMonth";
import type { MonthLayoutProps } from "@/components/monthly-view/types";
import { Skeleton } from "@/components/ui/skeleton";

type MonthPortraitProps = MonthLayoutProps & {
  showTabs: boolean;
};

export function MonthPortrait({
  currentDate,
  direction,
  days,
  eventsByDate,
  eventCount,
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
  showTabs,
}: MonthPortraitProps) {
  const showCalendar = !showTabs || activeTab === "calendar";
  const showFilters = !showTabs || activeTab === "filters";
  const monthKey = currentDate.toFormat("yyyy-MM");
  const now = DateTime.now();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={SPRING_CONFIG}
      className="relative flex h-full w-full flex-col overflow-hidden rounded-xl bg-card elevation-1"
    >
      <div className="z-10 flex items-center justify-between bg-muted/40 px-6 py-4 lg:px-8 lg:py-6">
        <div className="flex min-w-0 flex-col">
          <h2 className="truncate text-xl font-bold capitalize leading-tight lg:text-2xl">
            {currentDate.toFormat("MMMM")}
          </h2>
          <span className="mt-1 text-xs font-semibold text-muted-foreground lg:mt-2">
            {currentDate.toFormat("yyyy")}
          </span>
        </div>
        <div className="flex items-center gap-2 lg:gap-4">
          {showTabs && (
            <MonthViewMenu activeTab={activeTab} onSelectTab={onTabChange} />
          )}
          {showCalendar && (
            <MonthNav
              isCurrentMonth={isCurrentMonth}
              onToday={onToday}
              onPrev={onPrevMonth}
              onNext={onNextMonth}
            />
          )}
        </div>
      </div>

      {showCalendar && (
        <div className="grid shrink-0 grid-cols-7 px-3 lg:px-5">
          {WEEKDAY_LABELS.map((d) => (
            <div key={d.id} className="py-2.5 text-center lg:py-4">
              <span className="text-xs font-semibold text-muted-foreground/60">
                {d.label}
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="relative flex flex-1 flex-col items-center overflow-hidden px-2 py-1.5 lg:px-6 lg:py-3">
        <div className="mx-auto flex h-full w-full max-w-4xl flex-col gap-1 lg:gap-4">
          {showCalendar && (
            <AnimatePresence mode="wait" custom={direction}>
              {isFetching && eventCount === 0 ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="grid w-full shrink-0 grid-cols-7 gap-1 lg:gap-3"
                >
                  {days.map((day) => (
                    <Skeleton
                      key={day.date.toISODate()}
                      className="min-h-[58px] rounded-md lg:min-h-[80px]"
                    />
                  ))}
                </motion.div>
              ) : (
                <SwipeableMonth
                  key={`grid-${monthKey}`}
                  direction={direction}
                  onPrev={onPrevMonth}
                  onNext={onNextMonth}
                  className="grid w-full shrink-0 touch-pan-y grid-cols-7 gap-1 lg:gap-3"
                >
                  {days.map((day) => {
                    const iso = day.date.toISODate();
                    if (!iso) return null;
                    return (
                      <MonthDayCell
                        key={iso}
                        day={day}
                        events={eventsByDate.get(iso) ?? []}
                        isToday={day.date.hasSame(now, "day")}
                        colorFor={colorFor}
                        onOpen={onOpenDay}
                      />
                    );
                  })}
                </SwipeableMonth>
              )}
            </AnimatePresence>
          )}

          {showFilters && (
            <SubjectFilterList
              materie={materie}
              hiddenSubjects={hiddenSubjects}
              colorFor={colorFor}
              onToggle={onToggleSubject}
            />
          )}
        </div>
      </div>

      <div className="flex shrink-0 items-center justify-between px-5 py-2.5 lg:px-8 lg:py-3">
        <div className="flex items-center gap-1.5">
          <CalendarIcon className="size-3 text-muted-foreground" />
          <span className="text-xs font-semibold text-muted-foreground">
            {eventCount} lezioni
          </span>
        </div>
        {isFetching && (
          <div className="size-3 animate-spin rounded-full border-2 border-muted border-t-foreground" />
        )}
      </div>
    </motion.div>
  );
}
