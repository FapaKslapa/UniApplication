"use client";

import { AnimatePresence, motion, type PanInfo } from "framer-motion";
import type { DateTime } from "luxon";
import { AgendaSkeleton } from "@/components/agenda/AgendaSkeleton";
import { DayTimeline } from "@/components/agenda/DayTimeline";
import { EmptyDay } from "@/components/agenda/EmptyDay";
import { NextLessonHero } from "@/components/agenda/NextLessonHero";
import { minutesOfDay } from "@/lib/agenda/dates";
import { overlapFlags, pickHeroLesson } from "@/lib/agenda/lessons";
import { slideVariants, springs } from "@/lib/motion";
import type { ParsedEvent } from "@/lib/orario-utils";

const SWIPE_THRESHOLD = 50;

export type DayViewProps = {
  date: DateTime;
  events: ParsedEvent[];
  now: DateTime;
  isToday: boolean;
  isPending: boolean;
  direction: number;
  colorFor: (materia: string) => string;
  variant: "courses" | "professor";
  onShiftDay: (delta: -1 | 1) => void;
};

export function DayView({
  date,
  events,
  now,
  isToday,
  isPending,
  direction,
  colorFor,
  variant,
  onShiftDay,
}: DayViewProps) {
  const pick = pickHeroLesson(events, minutesOfDay(now), isToday);
  const flags = overlapFlags(events);
  const heroIndex = pick?.lesson ? events.indexOf(pick.lesson) : -1;

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x < -SWIPE_THRESHOLD) onShiftDay(1);
    else if (info.offset.x > SWIPE_THRESHOLD) onShiftDay(-1);
  };

  return (
    <AnimatePresence initial={false} custom={direction} mode="popLayout">
      <motion.div
        key={date.toISODate()}
        custom={direction}
        variants={slideVariants}
        initial="enter"
        animate="center"
        exit="exit"
        transition={springs.smooth}
        drag="x"
        dragDirectionLock
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.15}
        onDragEnd={handleDragEnd}
        className="flex min-h-0 flex-1 flex-col gap-3"
      >
        {isPending ? (
          <AgendaSkeleton />
        ) : events.length === 0 ? (
          <EmptyDay />
        ) : (
          <>
            <NextLessonHero
              pick={pick}
              now={now}
              colorFor={colorFor}
              isOverlapping={heroIndex >= 0 ? flags[heroIndex] : false}
              variant={variant}
            />
            <DayTimeline
              events={events}
              now={now}
              isToday={isToday}
              colorFor={colorFor}
              showProfessor={variant === "courses"}
            />
          </>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
