"use client";

import { AnimatePresence, motion, type PanInfo } from "framer-motion";
import type { DateTime } from "luxon";
import { Button } from "@/components/ui/button";
import { startOfWeek } from "@/lib/agenda/dates";
import { dayDotSubjects } from "@/lib/agenda/lessons";
import type { DayEntry } from "@/lib/agenda/types";
import { slideVariants, springs, staggerDelay } from "@/lib/motion";
import { cn } from "@/lib/utils";

const WEEKDAY_LETTERS = ["L", "M", "M", "G", "V", "S", "D"];
const SWIPE_THRESHOLD = 50;

type WeekStripProps = {
  days: DayEntry[];
  selectedDate: DateTime;
  today: DateTime;
  direction: number;
  colorFor: (materia: string) => string;
  onSelect: (date: DateTime) => void;
  onShiftWeek: (delta: -1 | 1) => void;
};

export function WeekStrip({
  days,
  selectedDate,
  today,
  direction,
  colorFor,
  onSelect,
  onShiftWeek,
}: WeekStripProps) {
  const weekKey = startOfWeek(selectedDate).toISODate();

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x < -SWIPE_THRESHOLD) onShiftWeek(1);
    else if (info.offset.x > SWIPE_THRESHOLD) onShiftWeek(-1);
  };

  return (
    <div className="relative overflow-x-hidden py-1">
      <AnimatePresence initial={false} custom={direction} mode="popLayout">
        <motion.div
          key={weekKey}
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
          className="grid grid-cols-7 gap-1"
        >
          {days.map((day, index) => {
            const isToday = day.date.hasSame(today, "day");
            const isSelected = day.date.hasSame(selectedDate, "day");
            const dotSubjects = dayDotSubjects(day.events);

            return (
              <Button
                key={day.date.toISODate()}
                variant="ghost"
                onClick={() => onSelect(day.date)}
                aria-current={isToday ? "date" : undefined}
                aria-label={`${day.date.setLocale("it").toFormat("cccc d MMMM")}, ${day.events.length} lezioni`}
                className={cn(
                  "relative h-16 min-w-11 flex-col items-center justify-center gap-1.5 rounded-md px-0",
                  isToday && !isSelected && "ring-1 ring-foreground/30",
                )}
              >
                {isSelected && (
                  <motion.span
                    layoutId="strip-selected"
                    transition={springs.snappy}
                    className="absolute inset-0 -z-10 rounded-md bg-foreground"
                  />
                )}
                <span
                  className={cn(
                    "text-[10px] font-semibold uppercase",
                    isSelected ? "text-background/70" : "text-muted-foreground",
                  )}
                >
                  {WEEKDAY_LETTERS[index]}
                </span>
                <span
                  className={cn(
                    "text-sm font-bold tabular-nums",
                    isSelected && "text-background",
                  )}
                >
                  {day.date.day}
                </span>
                <span className="flex h-1.5 items-center gap-0.5">
                  {dotSubjects.map((materia, dotIndex) => (
                    <motion.span
                      key={materia}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{
                        ...springs.gentle,
                        delay: staggerDelay(dotIndex),
                      }}
                      className="size-1 rounded-full"
                      style={{ backgroundColor: colorFor(materia) }}
                    />
                  ))}
                </span>
              </Button>
            );
          })}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
