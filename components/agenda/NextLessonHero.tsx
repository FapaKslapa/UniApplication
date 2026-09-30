"use client";

import { AnimatePresence, m } from "framer-motion";
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

function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest === 0 ? `${hours} h` : `${hours} h ${rest} min`;
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
      <m.div
        variants={scaleInVariants}
        initial="hidden"
        animate="visible"
        className="flex h-24 shrink-0 items-center justify-center rounded-xl bg-muted p-4 text-center elevation-1"
      >
        <p className="text-sm font-semibold text-muted-foreground">
          Lezioni finite per oggi
        </p>
      </m.div>
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
    <m.div
      variants={scaleInVariants}
      initial="hidden"
      animate="visible"
      className="relative flex shrink-0 flex-col gap-3 overflow-hidden rounded-xl p-4 elevation-2"
      style={{
        backgroundColor: `color-mix(in oklab, ${color} 14%, var(--card))`,
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-2xl font-bold tabular-nums leading-none">
          {lesson.time}
        </p>
        <div className="flex shrink-0 items-center gap-1.5">
          {isOverlapping && (
            <span
              role="img"
              aria-label="Sovrapposizione oraria"
              className="inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-warning/15 text-warning"
            >
              <AlertTriangle className="size-3.5" strokeWidth={2.5} />
            </span>
          )}
          <Badge>{label}</Badge>
        </div>
      </div>

      <MarqueeText
        text={lesson.materia}
        className="text-base font-bold leading-tight"
      />

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

        <AnimatePresence mode="wait">
          {pick.status === "next" && window && (
            <m.span
              key={minutesUntil(window, nowMinutes)}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={springs.gentle}
              className="shrink-0 text-sm font-semibold tabular-nums text-muted-foreground"
            >
              tra {formatMinutes(minutesUntil(window, nowMinutes))}
            </m.span>
          )}
        </AnimatePresence>
      </div>

      {pick.status === "current" && window && (
        <div className="space-y-1">
          <div className="h-1 overflow-hidden rounded-full bg-foreground/10">
            <m.div
              className="h-full origin-left rounded-full"
              style={{ backgroundColor: color }}
              animate={{ scaleX: lessonProgress(window, nowMinutes) }}
              transition={springs.smooth}
            />
          </div>
          <p className="text-right text-[10px] font-semibold text-muted-foreground">
            mancano {formatMinutes(minutesLeft(window, nowMinutes))}
          </p>
        </div>
      )}
    </m.div>
  );
}
