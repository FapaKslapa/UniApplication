"use client";

import { motion, type PanInfo, useReducedMotion } from "framer-motion";
import type { DateTime } from "luxon";
import { useEffect, useRef } from "react";
import { AgendaSkeleton } from "@/components/agenda/AgendaSkeleton";
import { WeekDaySection } from "@/components/agenda/WeekDaySection";
import { startOfWeek } from "@/lib/agenda/dates";
import type { DayEntry } from "@/lib/agenda/types";
import { springs } from "@/lib/motion";

const SWIPE_THRESHOLD = 50;

type WeekAgendaProps = {
  days: DayEntry[];
  selectedDate: DateTime;
  today: DateTime;
  isPending: boolean;
  colorFor: (materia: string) => string;
  onSelectDay: (date: DateTime) => void;
  onShiftWeek: (delta: -1 | 1) => void;
};

export function WeekAgenda({
  days,
  selectedDate,
  today,
  isPending,
  colorFor,
  onSelectDay,
  onShiftWeek,
}: WeekAgendaProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const iso = selectedDate.toISODate();
    const target = containerRef.current?.querySelector<HTMLElement>(
      `[data-day="${iso}"]`,
    );
    target?.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
      block: "start",
    });
  }, [selectedDate, reduceMotion]);

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x < -SWIPE_THRESHOLD) onShiftWeek(1);
    else if (info.offset.x > SWIPE_THRESHOLD) onShiftWeek(-1);
  };

  if (isPending) return <AgendaSkeleton />;

  return (
    <motion.div
      key={startOfWeek(selectedDate).toISODate()}
      ref={containerRef}
      drag="x"
      dragDirectionLock
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.15}
      onDragEnd={handleDragEnd}
      transition={springs.smooth}
      className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain"
    >
      {days.map((day) => (
        <div key={day.date.toISODate()} data-day={day.date.toISODate()}>
          <WeekDaySection
            date={day.date}
            events={day.events}
            isToday={day.date.hasSame(today, "day")}
            colorFor={colorFor}
            onSelectDay={onSelectDay}
          />
        </div>
      ))}
    </motion.div>
  );
}
