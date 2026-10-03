import type { DateTime } from "luxon";
import { timeToMinutes } from "@/lib/date-utils";

export const dayNames = [
  "Lunedì",
  "Martedì",
  "Mercoledì",
  "Giovedì",
  "Venerdì",
  "Sabato",
  "Domenica",
];

export const findNextLesson = (
  lessons: { time: string; title: string }[],
  currentTime: DateTime,
  isToday: boolean,
) => {
  if (!isToday) return null;

  const now = currentTime.hour * 60 + currentTime.minute;

  const parsedLessons = lessons
    .map((lesson) => {
      const [start, end] = lesson.time.split(" - ");
      const startMinutes = timeToMinutes(start);
      const endMinutes = timeToMinutes(end);

      if (startMinutes === null || endMinutes === null) return null;

      return { ...lesson, startMinutes, endMinutes };
    })
    .filter((l): l is NonNullable<typeof l> => l !== null);

  const currentLesson = parsedLessons.find(
    (l) => now >= l.startMinutes && now <= l.endMinutes,
  );

  if (currentLesson) {
    return { lesson: currentLesson, status: "current" as const };
  }

  const nextLesson = parsedLessons
    .filter((l) => l.startMinutes > now)
    .sort((a, b) => a.startMinutes - b.startMinutes)[0];

  return nextLesson ? { lesson: nextLesson, status: "next" as const } : null;
};
