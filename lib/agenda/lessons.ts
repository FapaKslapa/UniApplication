import { timeToMinutes } from "@/lib/date-utils";

export type LessonWindow = {
  startMinutes: number;
  endMinutes: number;
};

export type HeroStatus = "current" | "next" | "first" | "finished";

export type HeroPick<T> = {
  status: HeroStatus;
  lesson: T | null;
};

export type LessonState = "past" | "current" | "upcoming";

export function parseLessonWindow(time: string): LessonWindow | null {
  const [start, end] = time.split(" - ");
  if (!start || !end) return null;
  const startMinutes = timeToMinutes(start.trim());
  const endMinutes = timeToMinutes(end.trim());
  if (startMinutes === null || endMinutes === null) return null;
  if (endMinutes <= startMinutes) return null;
  return { startMinutes, endMinutes };
}

export function isCancelled(time: string): boolean {
  return time.toUpperCase().includes("ANNULLATO");
}

export function isVisibleLesson(
  lesson: { time: string; materia: string; isVideo?: boolean },
  hiddenSubjects: string[],
): boolean {
  if (hiddenSubjects.includes(lesson.materia)) return false;
  return lesson.isVideo === true || !isCancelled(lesson.time);
}

export function sortByStart<T extends { time: string }>(lessons: T[]): T[] {
  const startOf = (lesson: T) =>
    parseLessonWindow(lesson.time)?.startMinutes ?? Number.MAX_SAFE_INTEGER;
  return [...lessons].sort((a, b) => startOf(a) - startOf(b));
}

export function pickHeroLesson<T extends { time: string }>(
  lessons: T[],
  nowMinutes: number,
  isToday: boolean,
): HeroPick<T> | null {
  const sorted = sortByStart(lessons);
  if (sorted.length === 0) return null;
  if (!isToday) return { status: "first", lesson: sorted[0] };

  const entries = sorted.map((lesson) => ({
    lesson,
    window: parseLessonWindow(lesson.time),
  }));
  if (entries.every((entry) => entry.window === null)) {
    return { status: "first", lesson: sorted[0] };
  }

  const current = entries.find(
    ({ window }) =>
      window !== null &&
      nowMinutes >= window.startMinutes &&
      nowMinutes < window.endMinutes,
  );
  if (current) return { status: "current", lesson: current.lesson };

  const next = entries.find(
    ({ window }) => window !== null && window.startMinutes > nowMinutes,
  );
  if (next) return { status: "next", lesson: next.lesson };

  return { status: "finished", lesson: null };
}

export function lessonProgress(
  window: LessonWindow,
  nowMinutes: number,
): number {
  const span = window.endMinutes - window.startMinutes;
  const ratio = (nowMinutes - window.startMinutes) / span;
  return Math.min(1, Math.max(0, ratio));
}

export function minutesUntil(window: LessonWindow, nowMinutes: number): number {
  return Math.max(0, window.startMinutes - nowMinutes);
}

export function minutesLeft(window: LessonWindow, nowMinutes: number): number {
  return Math.max(0, window.endMinutes - nowMinutes);
}

export function overlapFlags(lessons: { time: string }[]): boolean[] {
  const windows = lessons.map((lesson) => parseLessonWindow(lesson.time));
  return windows.map((window, index) => {
    if (!window) return false;
    return windows.some(
      (other, otherIndex) =>
        otherIndex !== index &&
        other !== null &&
        window.startMinutes < other.endMinutes &&
        window.endMinutes > other.startMinutes,
    );
  });
}

export function lessonState(time: string, nowMinutes: number): LessonState {
  const window = parseLessonWindow(time);
  if (!window) return "upcoming";
  if (nowMinutes >= window.endMinutes) return "past";
  if (nowMinutes >= window.startMinutes) return "current";
  return "upcoming";
}

export function dayDotSubjects<T extends { materia: string }>(
  lessons: T[],
  max = 3,
): string[] {
  return Array.from(new Set(lessons.map((lesson) => lesson.materia))).slice(
    0,
    max,
  );
}
