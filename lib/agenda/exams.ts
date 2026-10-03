import { DateTime } from "luxon";
import { ROME_ZONE } from "@/lib/agenda/dates";
import { formatSubjectName } from "@/lib/agenda/subjectName";
import type { ExamDTO } from "@/lib/exams/dto";

export type ExamMilestoneKind = "reg_open" | "reg_close";

export type ExamMilestone = {
  key: string;
  kind: ExamMilestoneKind;
  subject: string;
  regConfirmed: boolean;
};

export type DayExams = {
  exams: ExamDTO[];
  milestones: ExamMilestone[];
};

export const EMPTY_DAY_EXAMS: DayExams = { exams: [], milestones: [] };

export function romeDayKey(iso: string): string | null {
  return DateTime.fromISO(iso, { zone: "utc" }).setZone(ROME_ZONE).toISODate();
}

export function romeTime(iso: string): string {
  return DateTime.fromISO(iso, { zone: "utc" })
    .setZone(ROME_ZONE)
    .toFormat("HH:mm");
}

export function examTimeRange(exam: ExamDTO): string {
  const start = romeTime(exam.startsAt);
  return exam.endsAt ? `${start} - ${romeTime(exam.endsAt)}` : start;
}

export function examStartMinutes(exam: ExamDTO): number {
  const local = DateTime.fromISO(exam.startsAt, { zone: "utc" }).setZone(
    ROME_ZONE,
  );
  return local.hour * 60 + local.minute;
}

export function examEndMinutes(exam: ExamDTO): number {
  if (!exam.endsAt) return examStartMinutes(exam) + 60;
  const local = DateTime.fromISO(exam.endsAt, { zone: "utc" }).setZone(
    ROME_ZONE,
  );
  return local.hour * 60 + local.minute;
}

export function examKindLabel(kind: ExamDTO["kind"]): string {
  return kind ? `Esame · ${kind}` : "Esame";
}

export function milestoneLabel(milestone: ExamMilestone): string {
  const base =
    milestone.kind === "reg_open" ? "Iscrizioni aperte" : "Chiusura iscrizioni";
  const suffix = milestone.regConfirmed ? "" : " (previste)";
  return `${base}: ${formatSubjectName(milestone.subject)}${suffix}`;
}

export function dayExamsOf(
  byDay: Map<string, DayExams>,
  date: DateTime,
): DayExams {
  return byDay.get(date.toISODate() ?? "") ?? EMPTY_DAY_EXAMS;
}
