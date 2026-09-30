import type { DateTime } from "luxon";
import type { ParsedEvent } from "@/lib/orario-utils";

export type AgendaMode = "day" | "week";

export type AgendaSource =
  | { kind: "courses" }
  | { kind: "professor"; name: string };

export type DayEntry = {
  date: DateTime;
  events: ParsedEvent[];
};
