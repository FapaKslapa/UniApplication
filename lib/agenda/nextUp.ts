import type { DateTime } from "luxon";
import type { DayEntry } from "@/lib/agenda/types";
import type { ParsedEvent } from "@/lib/orario-utils";

export type NextUp = {
  date: DateTime;
  lesson: ParsedEvent;
};

export function nextLessonAfter(
  days: DayEntry[],
  date: DateTime,
): NextUp | null {
  const upcoming = days.find(
    (day) =>
      day.events.length > 0 && day.date.startOf("day") > date.startOf("day"),
  );
  if (!upcoming) return null;
  return { date: upcoming.date, lesson: upcoming.events[0] };
}
