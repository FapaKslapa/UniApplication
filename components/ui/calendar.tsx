"use client";

import { AnimatePresence, m } from "framer-motion";
import * as React from "react";
import type { DayPicker } from "react-day-picker";
import { CalendarDays } from "@/components/ui/calendar-days";
import {
  CalendarHeader,
  type CalendarView,
} from "@/components/ui/calendar-header";
import { MonthGrid, YearGrid } from "@/components/ui/calendar-pickers";
import { springs } from "@/lib/motion";
import { cn } from "@/lib/utils";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

const monthIndex = (date: Date) => date.getFullYear() * 12 + date.getMonth();

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  month: monthProp,
  defaultMonth,
  onMonthChange,
  ...props
}: CalendarProps) {
  const [view, setView] = React.useState<CalendarView>("days");
  const [direction, setDirection] = React.useState(1);
  const [date, setDate] = React.useState<Date>(
    monthProp || defaultMonth || new Date(),
  );

  const moveTo = React.useCallback((next: Date) => {
    setDate((current) => {
      const diff = monthIndex(next) - monthIndex(current);
      if (diff !== 0) setDirection(diff > 0 ? 1 : -1);
      return next;
    });
  }, []);

  React.useEffect(() => {
    if (monthProp) moveTo(monthProp);
  }, [monthProp, moveTo]);

  const handleMonthChange = (next: Date) => {
    moveTo(next);
    onMonthChange?.(next);
  };

  const shift = (delta: number) => {
    const next = new Date(date);
    next.setDate(1);
    next.setMonth(next.getMonth() + delta);
    handleMonthChange(next);
  };

  const pickYear = (year: number) => {
    const next = new Date(date);
    next.setDate(1);
    next.setFullYear(year);
    setDate(next);
    setView("months");
  };

  const pickMonth = (index: number) => {
    const next = new Date(date);
    next.setDate(1);
    next.setMonth(index);
    handleMonthChange(next);
    setView("days");
  };

  return (
    <div className={cn("w-full bg-card p-3", className)}>
      <CalendarHeader
        view={view}
        date={date}
        onView={setView}
        onShift={shift}
      />
      <div className="relative h-[322px]">
        <AnimatePresence mode="wait" initial={false}>
          <m.div
            key={view}
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={springs.snappy}
            className="h-full"
          >
            {view === "days" && (
              <CalendarDays
                month={date}
                direction={direction}
                onShift={shift}
                onMonthChange={handleMonthChange}
                classNames={classNames}
                showOutsideDays={showOutsideDays}
                dayPickerProps={props as CalendarProps}
              />
            )}
            {view === "years" && <YearGrid date={date} onPick={pickYear} />}
            {view === "months" && <MonthGrid date={date} onPick={pickMonth} />}
          </m.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
