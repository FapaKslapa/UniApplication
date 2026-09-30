import type { DateTime } from "luxon";
import { LessonRow } from "@/components/agenda/LessonRow";
import { minutesOfDay } from "@/lib/agenda/dates";
import { lessonState, overlapFlags } from "@/lib/agenda/lessons";
import type { ParsedEvent } from "@/lib/orario-utils";

type DayTimelineProps = {
  events: ParsedEvent[];
  now: DateTime;
  isToday: boolean;
  colorFor: (materia: string) => string;
  showProfessor?: boolean;
};

export function DayTimeline({
  events,
  now,
  isToday,
  colorFor,
  showProfessor = true,
}: DayTimelineProps) {
  const flags = overlapFlags(events);
  const nowMinutes = minutesOfDay(now);

  return (
    <ul className="min-h-0 flex-1 space-y-1.5 overflow-y-auto overscroll-contain pb-2">
      {events.map((event, index) => (
        <LessonRow
          key={`${event.time}-${event.materia}`}
          event={event}
          index={index}
          color={colorFor(event.materia)}
          overlapping={flags[index]}
          state={isToday ? lessonState(event.time, nowMinutes) : "upcoming"}
          showProfessor={showProfessor}
        />
      ))}
    </ul>
  );
}
