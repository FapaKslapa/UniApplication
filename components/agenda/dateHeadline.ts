import type { DateTime } from "luxon";
import type { AgendaMode } from "@/lib/agenda/types";

function capitalize(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function dateHeadline(selectedDate: DateTime, mode: AgendaMode) {
  const date = selectedDate.setLocale("it");
  if (mode === "month") return capitalize(date.toFormat("LLLL yyyy"));
  if (mode === "day") return capitalize(date.toFormat("cccc d MMMM"));
  const start = date.startOf("week");
  const end = date.endOf("week");
  return start.month === end.month
    ? `${start.toFormat("d")} – ${end.toFormat("d MMMM")}`
    : `${start.toFormat("d MMM")} – ${end.toFormat("d MMM")}`;
}
