import type { DateTime } from "luxon";
import type { MonthDay, MonthEvent } from "@/components/monthly-view/types";
import type { DaySchedule } from "@/lib/orario-utils";
import { parseEventTitle } from "@/lib/orario-utils";

export const SPRING_CONFIG = {
  type: "spring",
  stiffness: 350,
  damping: 35,
  mass: 1,
} as const;

export const monthVariants = {
  enter: (d: number) => ({ x: d > 0 ? 40 : -40, opacity: 0, scale: 0.98 }),
  center: { x: 0, opacity: 1, scale: 1 },
  exit: (d: number) => ({ x: d < 0 ? 40 : -40, opacity: 0, scale: 0.98 }),
};

export const WEEKDAY_LABELS = [
  { label: "L", id: "mon" },
  { label: "M", id: "tue" },
  { label: "M", id: "wed" },
  { label: "G", id: "thu" },
  { label: "V", id: "fri" },
  { label: "S", id: "sat" },
  { label: "D", id: "sun" },
];

const SWIPE_CONFIDENCE_THRESHOLD = 10000;
const TOTAL_CELLS = 42;

export function swipeStep(offset: number, velocity: number): -1 | 0 | 1 {
  const power = Math.abs(offset) * velocity;
  if (power < -SWIPE_CONFIDENCE_THRESHOLD) return 1;
  if (power > SWIPE_CONFIDENCE_THRESHOLD) return -1;
  return 0;
}

export function buildMonthDays(currentDate: DateTime): MonthDay[] {
  const startOfMonth = currentDate.startOf("month");
  const endOfMonth = currentDate.endOf("month");
  const firstDayOfWeek = startOfMonth.weekday;
  const days: MonthDay[] = [];

  for (let i = 1; i < firstDayOfWeek; i++) {
    days.push({
      date: startOfMonth.minus({ days: firstDayOfWeek - i }),
      isCurrentMonth: false,
    });
  }
  for (let i = 1; i <= (currentDate.daysInMonth ?? 0); i++) {
    days.push({
      date: startOfMonth.plus({ days: i - 1 }),
      isCurrentMonth: true,
    });
  }
  const remaining = TOTAL_CELLS - days.length;
  for (let i = 1; i <= remaining; i++) {
    days.push({ date: endOfMonth.plus({ days: i }), isCurrentMonth: false });
  }
  return days;
}

export function uniqueSubjects(events: MonthEvent[]): string[] {
  return Array.from(
    new Set(events.map((e) => parseEventTitle(e.title).materia)),
  );
}

export function buildDaySchedule(
  date: DateTime,
  events: MonthEvent[],
  materiaColorMap: Record<string, string>,
): DaySchedule {
  return {
    day: date.weekday - 1,
    dayOfMonth: date.day,
    date,
    events: events.map((e) => {
      const parsed = parseEventTitle(e.title);
      return {
        time: e.time,
        materia: parsed.materia,
        aula: e.location,
        docente: e.professor,
        tipo: parsed.tipo,
        isVideo: e.isVideo,
        fullDate: e.date ?? undefined,
      };
    }),
    materiaColorMap,
  };
}
