import type { DateTime } from "luxon";
import { Fragment } from "react";
import { LessonRow } from "@/components/agenda/LessonRow";
import { minutesOfDay } from "@/lib/agenda/dates";
import { formatGap } from "@/lib/agenda/format";
import { lessonState } from "@/lib/agenda/lessons";
import type { ParsedEvent } from "@/lib/orario-utils";

type DayTimelineProps = {
  events: ParsedEvent[];
  overlapping: boolean[];
  gaps?: (number | null)[];
  now: DateTime;
  isToday: boolean;
  colorFor: (materia: string) => string;
  showProfessor?: boolean;
};

export function DayTimeline({
  events,
  overlapping,
  gaps = [],
  now,
  isToday,
  colorFor,
  showProfessor = true,
}: DayTimelineProps) {
  const nowMinutes = minutesOfDay(now);

  return (
    <ul
      className="min-h-0 flex-1 space-y-1.5 overflow-y-auto overscroll-contain px-1 py-1"
      style={{ touchAction: "pan-y" }}
    >
      {events.map((event, index) => (
        <Fragment key={`${event.time}-${event.materia}`}>
          {gaps[index] != null && (
            <li className="num-display px-4 pt-1 text-[11px] font-medium text-muted-foreground">
              {formatGap(gaps[index])}
            </li>
          )}
          <LessonRow
            event={event}
            index={index}
            color={colorFor(event.materia)}
            overlapping={overlapping[index]}
            state={isToday ? lessonState(event.time, nowMinutes) : "upcoming"}
            showProfessor={showProfessor}
          />
        </Fragment>
      ))}
    </ul>
  );
}
