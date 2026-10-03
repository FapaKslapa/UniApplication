import { DateTime } from "luxon";

export const get = (r: unknown[]) =>
  Number((r[0] as { value?: unknown } | undefined)?.value ?? 0);

export const toEpochSeconds = (date: Date) => Math.floor(date.getTime() / 1000);

export const trend = (current: number, previous: number) =>
  previous > 0 ? ((current - previous) / previous) * 100 : null;

export function italyBoundaries() {
  const now = DateTime.now().setZone("Europe/Rome");
  return {
    todayStart: toEpochSeconds(now.startOf("day").toJSDate()),
    yesterdayStart: toEpochSeconds(
      now.minus({ days: 1 }).startOf("day").toJSDate(),
    ),
    weekStart: toEpochSeconds(now.minus({ days: 7 }).startOf("day").toJSDate()),
    prevWeekStart: toEpochSeconds(
      now.minus({ days: 14 }).startOf("day").toJSDate(),
    ),
    monthStart: toEpochSeconds(
      now.minus({ days: 30 }).startOf("day").toJSDate(),
    ),
    prevMonthStart: toEpochSeconds(
      now.minus({ days: 60 }).startOf("day").toJSDate(),
    ),
  };
}
