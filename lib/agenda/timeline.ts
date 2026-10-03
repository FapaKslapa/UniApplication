import { examStartMinutes } from "@/lib/agenda/exams";
import { parseLessonWindow } from "@/lib/agenda/lessons";
import type { ExamDTO } from "@/lib/exams/dto";
import type { ParsedEvent } from "@/lib/orario-utils";

export type TimelineItem =
  | { type: "lesson"; event: ParsedEvent; index: number; start: number }
  | { type: "exam"; exam: ExamDTO; start: number };

export function interleaveTimeline(
  events: ParsedEvent[],
  exams: ExamDTO[],
): TimelineItem[] {
  const lessons: TimelineItem[] = events.map((event, index) => ({
    type: "lesson",
    event,
    index,
    start:
      parseLessonWindow(event.time)?.startMinutes ?? Number.MAX_SAFE_INTEGER,
  }));
  const examItems: TimelineItem[] = exams.map((exam) => ({
    type: "exam",
    exam,
    start: examStartMinutes(exam),
  }));
  return [...lessons, ...examItems].sort((a, b) => a.start - b.start);
}

export function isExamPast(exam: ExamDTO, nowMs: number): boolean {
  const end = exam.endsAt
    ? Date.parse(exam.endsAt)
    : Date.parse(exam.startsAt) + 60 * 60 * 1000;
  return nowMs >= end;
}
