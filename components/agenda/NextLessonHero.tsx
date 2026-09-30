"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, MapPin, User, Video } from "lucide-react";
import type { DateTime } from "luxon";
import { MarqueeText } from "@/components/agenda/MarqueeText";
import { Badge } from "@/components/ui/badge";
import { minutesOfDay } from "@/lib/agenda/dates";
import type { HeroPick } from "@/lib/agenda/lessons";
import {
  lessonProgress,
  minutesLeft,
  minutesUntil,
  parseLessonWindow,
} from "@/lib/agenda/lessons";
import { scaleInVariants, springs } from "@/lib/motion";
import type { ParsedEvent } from "@/lib/orario-utils";

const STATUS_LABEL: Record<string, { courses: string; professor: string }> = {
  current: { courses: "In corso", professor: "In lezione ora" },
  next: { courses: "Prossima", professor: "Prossima lezione" },
  first: { courses: "Prima lezione", professor: "Prima lezione" },
};

function formatCountdown(minutes: number): string {
  if (minutes < 60) return `tra ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest === 0 ? `tra ${hours} h` : `tra ${hours} h ${rest} min`;
}

type NextLessonHeroProps = {
  pick: HeroPick<ParsedEvent> | null;
  now: DateTime;
  colorFor: (materia: string) => string;
  isOverlapping: boolean;
  variant: "courses" | "professor";
};

export function NextLessonHero({
  pick,
  now,
  colorFor,
  isOverlapping,
  variant,
}: NextLessonHeroProps) {
  if (!pick) return null;

  if (pick.status === "finished") {
    return (
      <motion.div
        variants={scaleInVariants}
        initial="hidden"
        animate="visible"
        className="flex h-[140px] shrink-0 items-center justify-center rounded-xl bg-muted p-4 text-center elevation-1"
      >
        <p className="text-sm font-semibold text-muted-foreground">
          Lezioni finite per oggi
        </p>
      </motion.div>
    );
  }

  const lesson = pick.lesson;
  if (!lesson) return null;

  const color = colorFor(lesson.materia);
  const window = parseLessonWindow(lesson.time);
  const nowMinutes = minutesOfDay(now);
  const label =
    STATUS_LABEL[pick.status]?.[variant] ?? STATUS_LABEL.next[variant];

  return (
    <motion.div
      variants={scaleInVariants}
      initial="hidden"
      animate="visible"
      className="relative flex h-[140px] shrink-0 flex-col justify-between overflow-hidden rounded-xl p-4 elevation-2"
      style={{
        backgroundColor: `color-mix(in oklab, ${color} 14%, var(--card))`,
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <Badge className="gap-1.5">
            {pick.status === "current" && (
              <span className="size-1.5 rounded-full bg-current pulse-dot" />
            )}
            {label}
          </Badge>
          {isOverlapping && (
            <span className="inline-flex items-center gap-1 rounded-full bg-warning/15 px-2 py-0.5 text-xs font-semibold text-warning">
              <AlertTriangle className="size-3" strokeWidth={2.5} />
              Sovrapposizione
            </span>
          )}
        </div>
        <AnimatePresence mode="wait">
          {pick.status === "next" && window && (
            <motion.span
              key={minutesUntil(window, nowMinutes)}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={springs.gentle}
              className="text-sm font-semibold tabular-nums text-muted-foreground"
            >
              {formatCountdown(minutesUntil(window, nowMinutes))}
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      <div className="min-w-0">
        <p className="text-2xl font-bold tabular-nums leading-none">
          {lesson.time}
        </p>
        <div className="mt-1.5">
          <MarqueeText
            text={lesson.materia}
            className="text-base font-bold leading-tight"
          />
        </div>
      </div>

      <div className="flex items-end justify-between gap-3">
        <div className="min-w-0 space-y-0.5">
          {variant === "professor" ? (
            lesson.aula && (
              <div className="flex items-center gap-1.5 text-sm font-semibold">
                <MapPin className="size-3.5 shrink-0" />
                <span className="truncate">{lesson.aula}</span>
              </div>
            )
          ) : (
            <>
              {lesson.aula && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  {lesson.isVideo ? (
                    <Video className="size-3 shrink-0 text-blue-500" />
                  ) : (
                    <MapPin className="size-3 shrink-0" />
                  )}
                  <span className="truncate">{lesson.aula}</span>
                </div>
              )}
              {lesson.docente && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <User className="size-3 shrink-0" />
                  <span className="truncate">{lesson.docente}</span>
                </div>
              )}
            </>
          )}
        </div>

        {pick.status === "current" && window && (
          <div className="w-24 shrink-0 space-y-1 text-right">
            <p className="text-[10px] font-semibold text-muted-foreground">
              mancano {minutesLeft(window, nowMinutes)} min
            </p>
            <div className="h-1 overflow-hidden rounded-full bg-foreground/10">
              <motion.div
                className="h-full origin-left rounded-full"
                style={{ backgroundColor: color }}
                animate={{ scaleX: lessonProgress(window, nowMinutes) }}
                transition={springs.smooth}
              />
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
