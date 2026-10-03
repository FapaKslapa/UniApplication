"use client";

import { m } from "framer-motion";
import { Video } from "lucide-react";
import type { DateTime } from "luxon";
import { HeroFinished } from "@/components/agenda/HeroFinished";
import { HeroTimeStatus } from "@/components/agenda/HeroTimeStatus";
import { MarqueeText } from "@/components/agenda/MarqueeText";
import { OverlapMark } from "@/components/agenda/OverlapMark";
import { minutesOfDay } from "@/lib/agenda/dates";
import { formatMinutes } from "@/lib/agenda/format";
import type { HeroPick } from "@/lib/agenda/lessons";
import {
  lessonEnd,
  lessonProgress,
  lessonStart,
  minutesLeft,
  minutesUntil,
  parseLessonWindow,
} from "@/lib/agenda/lessons";
import type { NextUp } from "@/lib/agenda/nextUp";
import { formatSubjectName } from "@/lib/agenda/subjectName";
import { scaleInVariants, springs } from "@/lib/motion";
import type { ParsedEvent } from "@/lib/orario-utils";

type NextLessonHeroProps = {
  pick: HeroPick<ParsedEvent> | null;
  now: DateTime;
  colorFor: (materia: string) => string;
  isOverlapping: boolean;
  variant: "courses" | "professor";
  nextUp: NextUp | null;
};

export function NextLessonHero({
  pick,
  now,
  colorFor,
  isOverlapping,
  variant,
  nextUp,
}: NextLessonHeroProps) {
  if (!pick) return null;

  if (pick.status === "finished") {
    return <HeroFinished now={now} nextUp={nextUp} colorFor={colorFor} />;
  }

  const lesson = pick.lesson;
  if (!lesson) return null;

  const color = colorFor(lesson.materia);
  const window = parseLessonWindow(lesson.time);
  const nowMinutes = minutesOfDay(now);
  const end = lessonEnd(lesson.time);
  const isCurrent = pick.status === "current" && window !== null;
  const untilStart = window ? minutesUntil(window, nowMinutes) : 0;
  const left = window ? minutesLeft(window, nowMinutes) : 0;

  const timeRange = end
    ? `${lessonStart(lesson.time)} – ${end}`
    : lessonStart(lesson.time);

  const status = isCurrent
    ? `In corso · mancano ${formatMinutes(left)}`
    : pick.status === "next"
      ? `tra ${formatMinutes(untilStart)}`
      : "Prima lezione";
  const statusKey = isCurrent
    ? left
    : pick.status === "next"
      ? untilStart
      : pick.status;

  return (
    <m.div
      variants={scaleInVariants}
      initial="hidden"
      animate="visible"
      className="relative flex shrink-0 flex-col gap-5 overflow-hidden rounded-xl p-5 elevation-1"
      style={{
        backgroundColor: `color-mix(in oklab, ${color} 14%, var(--card))`,
      }}
    >
      {isOverlapping && <OverlapMark className="absolute right-4 top-4" />}

      <HeroTimeStatus
        timeRange={timeRange}
        status={status}
        statusKey={statusKey}
      />

      <div className="space-y-1">
        <div
          className="flex min-w-0 items-center gap-2"
          style={{
            color: `color-mix(in oklab, ${color} var(--hero-ink-mix), var(--foreground))`,
          }}
        >
          <MarqueeText
            text={formatSubjectName(lesson.materia)}
            className="text-2xl font-bold leading-tight tracking-tight"
          />
        </div>
        <div className="flex min-w-0 items-center gap-1.5 text-sm text-muted-foreground">
          {lesson.isVideo && (
            <Video
              className="size-3.5 shrink-0"
              aria-label="Lezione in video"
            />
          )}
          {lesson.aula && <span className="truncate">{lesson.aula}</span>}
          {variant === "courses" && lesson.docente && (
            <>
              {lesson.aula && <span aria-hidden>·</span>}
              <span className="truncate">{lesson.docente}</span>
            </>
          )}
        </div>
      </div>

      {isCurrent && window && (
        <div className="h-1 overflow-hidden rounded-full bg-foreground/10">
          <m.div
            className="h-full origin-left rounded-full bg-brand"
            animate={{ scaleX: lessonProgress(window, nowMinutes) }}
            transition={springs.smooth}
          />
        </div>
      )}
    </m.div>
  );
}
