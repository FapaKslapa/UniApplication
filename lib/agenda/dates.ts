import type { DateTime } from "luxon";
import { getDayOfWeek } from "@/lib/date-utils";

export const ROME_ZONE = "Europe/Rome";

export function startOfDay(date: DateTime): DateTime {
  return date.setZone(ROME_ZONE).startOf("day");
}

export function startOfWeek(date: DateTime): DateTime {
  const day = startOfDay(date);
  return day.minus({ days: getDayOfWeek(day) });
}

export function weekDays(date: DateTime): DateTime[] {
  const monday = startOfWeek(date);
  return Array.from({ length: 7 }, (_, index) => monday.plus({ days: index }));
}

export function shiftDays(date: DateTime, days: number): DateTime {
  return startOfDay(date).plus({ days });
}

export function shiftWeeks(date: DateTime, weeks: number): DateTime {
  return shiftDays(date, weeks * 7);
}

export function isSameDay(a: DateTime, b: DateTime): boolean {
  return startOfDay(a).toISODate() === startOfDay(b).toISODate();
}

export function weekOffsetDays(selected: DateTime, today: DateTime): number {
  const weeks = startOfWeek(selected).diff(startOfWeek(today), "weeks").weeks;
  return Math.round(weeks) * 7;
}

export function minutesOfDay(date: DateTime): number {
  const local = date.setZone(ROME_ZONE);
  return local.hour * 60 + local.minute;
}
