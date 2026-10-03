import { DateTime } from "luxon";
import type { ExamDTO } from "@/lib/exams/dto";

const ZONE = "Europe/Rome";

export type RegState = "upcoming" | "open" | "closed";

function toRome(iso: string) {
  return DateTime.fromISO(iso, { zone: ZONE }).setLocale("it");
}

export function formatExamDay(iso: string) {
  return toRome(iso).toFormat("ccc d LLL").replace(/\./g, "");
}

export function formatExamTime(iso: string) {
  return toRome(iso).toFormat("HH:mm");
}

function formatShortDate(iso: string) {
  return toRome(iso).toFormat("d LLL").replace(/\./g, "");
}

export function monthKey(iso: string) {
  return toRome(iso).toFormat("yyyy-MM");
}

export function monthLabel(iso: string) {
  const label = toRome(iso).toFormat("LLLL yyyy");
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function getRegState(exam: ExamDTO, now: DateTime): RegState | null {
  if (!exam.regOpensAt && !exam.regClosesAt) return null;
  const opens = exam.regOpensAt ? toRome(exam.regOpensAt) : null;
  const closes = exam.regClosesAt ? toRome(exam.regClosesAt) : null;
  if (opens && now < opens) return "upcoming";
  if (closes && now > closes) return "closed";
  return "open";
}

export const REG_STATE_LABEL: Record<RegState, string> = {
  upcoming: "Non ancora aperte",
  open: "Aperte",
  closed: "Chiuse",
};

export function regRangeText(exam: ExamDTO) {
  const { regOpensAt, regClosesAt } = exam;
  if (regOpensAt && regClosesAt) {
    return `Iscrizioni dal ${formatShortDate(regOpensAt)} al ${formatShortDate(regClosesAt)}`;
  }
  if (regOpensAt) return `Iscrizioni dal ${formatShortDate(regOpensAt)}`;
  if (regClosesAt) return `Iscrizioni fino al ${formatShortDate(regClosesAt)}`;
  return "";
}

export type Milestone = { key: string; text: string };

export function upcomingMilestones(exam: ExamDTO, now: DateTime): Milestone[] {
  const result: Milestone[] = [];
  if (exam.regOpensAt && toRome(exam.regOpensAt) > now) {
    result.push({
      key: "opens",
      text: `Iscrizioni aperte dal ${formatShortDate(exam.regOpensAt)}`,
    });
  }
  if (exam.regClosesAt && toRome(exam.regClosesAt) > now) {
    result.push({
      key: "closes",
      text: `Chiusura iscrizioni il ${formatShortDate(exam.regClosesAt)}`,
    });
  }
  return result;
}
