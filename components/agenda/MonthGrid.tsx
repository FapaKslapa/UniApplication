"use client";

import { AnimatePresence, m, type PanInfo } from "framer-motion";
import type { DateTime } from "luxon";
import { MonthDayCell } from "@/components/agenda/MonthDayCell";
import { MonthSkeleton } from "@/components/agenda/MonthSkeleton";
import { monthGridDays } from "@/lib/agenda/dates";
import { type DayExams, dayExamsOf } from "@/lib/agenda/exams";
import { slideVariants, springs } from "@/lib/motion";
import type { ParsedEvent } from "@/lib/orario-utils";

const WEEKDAY_LABELS = [
  { id: "mon", label: "L" },
  { id: "tue", label: "M" },
  { id: "wed", label: "M" },
  { id: "thu", label: "G" },
  { id: "fri", label: "V" },
  { id: "sat", label: "S" },
  { id: "sun", label: "D" },
];
const SWIPE_THRESHOLD = 50;

type MonthGridProps = {
  currentDate: DateTime;
  selectedDate: DateTime;
  today: DateTime;
  eventsByDate: Map<string, ParsedEvent[]>;
  isPending: boolean;
  examsByDay: Map<string, DayExams>;
  direction: number;
  colorFor: (materia: string) => string;
  onSelectDay: (date: DateTime) => void;
  onShiftMonth: (delta: -1 | 1) => void;
};

export function MonthGrid({
  currentDate,
  selectedDate,
  today,
  eventsByDate,
  isPending,
  examsByDay,
  direction,
  colorFor,
  onSelectDay,
  onShiftMonth,
}: MonthGridProps) {
  const days = monthGridDays(currentDate);
  const monthKey = currentDate.toFormat("yyyy-MM");

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x < -SWIPE_THRESHOLD) onShiftMonth(1);
    else if (info.offset.x > SWIPE_THRESHOLD) onShiftMonth(-1);
  };

  if (isPending) return <MonthSkeleton />;

  return (
    <div className="flex min-h-0 flex-1 flex-col rounded-xl bg-card p-3 elevation-1">
      <div className="grid shrink-0 grid-cols-7">
        {WEEKDAY_LABELS.map((weekday) => (
          <div key={weekday.id} className="py-2 text-center">
            <span className="text-xs font-semibold text-muted-foreground/60">
              {weekday.label}
            </span>
          </div>
        ))}
      </div>

      <div className="relative min-h-0 flex-1 overflow-x-hidden">
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <m.div
            key={monthKey}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={springs.smooth}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.15}
            onDragEnd={handleDragEnd}
            className="grid h-full w-full grid-cols-7 grid-rows-6 gap-1"
          >
            {days.map((date) => {
              const iso = date.toISODate();
              if (!iso) return null;
              return (
                <MonthDayCell
                  key={iso}
                  date={date}
                  events={eventsByDate.get(iso) ?? []}
                  examCount={dayExamsOf(examsByDay, date).exams.length}
                  isCurrentMonth={date.hasSame(currentDate, "month")}
                  isToday={date.hasSame(today, "day")}
                  isSelected={date.hasSame(selectedDate, "day")}
                  colorFor={colorFor}
                  onSelect={onSelectDay}
                />
              );
            })}
          </m.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
