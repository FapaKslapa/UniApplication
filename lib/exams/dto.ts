import type { DbExam } from "@/lib/db/schema";

export type ExamKind = "scritto" | "orale" | "scritto/orale";

export type ExamDTO = {
  id: string;
  subject: string;
  courseName: string | null;
  startsAt: string;
  endsAt: string | null;
  kind: ExamKind | null;
  aula: string | null;
  professor: string | null;
  regOpensAt: string | null;
  regClosesAt: string | null;
  regConfirmed: boolean;
  following: boolean;
};

const KINDS: readonly string[] = ["scritto", "orale", "scritto/orale"];

export function normalizeExamKind(raw: string | null | undefined) {
  const value = raw?.trim().toLowerCase();
  return value && KINDS.includes(value) ? (value as ExamKind) : null;
}

export function toExamDTO(row: DbExam, following: boolean): ExamDTO {
  return {
    id: row.id,
    subject: row.subject,
    courseName: row.courseName,
    startsAt: row.startsAt.toISOString(),
    endsAt: row.endsAt?.toISOString() ?? null,
    kind: normalizeExamKind(row.kind),
    aula: row.aula,
    professor: row.professor,
    regOpensAt: row.regOpensAt?.toISOString() ?? null,
    regClosesAt: row.regClosesAt?.toISOString() ?? null,
    regConfirmed: row.regConfirmed,
    following,
  };
}
