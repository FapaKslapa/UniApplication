import type { DateTime } from "luxon";
import { formatSubjectName } from "@/lib/agenda/subjectName";

export function dayAriaLabel(
  date: DateTime,
  events: { materia: string }[],
): string {
  const dateLabel = date.setLocale("it").toFormat("cccc d MMMM");
  if (events.length === 0) return `${dateLabel}, nessuna lezione`;
  const noun = events.length === 1 ? "lezione" : "lezioni";
  const subjects = Array.from(new Set(events.map((e) => e.materia)))
    .map(formatSubjectName)
    .join(", ");
  return `${dateLabel}, ${events.length} ${noun}: ${subjects}`;
}
