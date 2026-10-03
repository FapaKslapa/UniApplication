import { eq, inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import { type DbExam, examCalendars, exams } from "@/lib/db/schema";
import { defaultRegistrationWindow } from "@/lib/exams/windows";

export type ExamSource = "cineca" | "esse3";

export type ExamInput = {
  source: ExamSource;
  externalId: string;
  linkIds: string[];
  subject: string;
  courseName: string | null;
  startsAt: Date;
  endsAt: Date | null;
  kind: string | null;
  aula: string | null;
  professor: string | null;
  regOpensAt: Date | null;
  regClosesAt: Date | null;
  regConfirmed: boolean;
  canceled: boolean;
};

const CALENDAR_CHUNK = 40;

export const examId = (source: ExamSource, externalId: string) =>
  `${source}:${externalId}`;

function resolveWindow(input: ExamInput, existing: DbExam | undefined) {
  if (input.regConfirmed) {
    return {
      regOpensAt: input.regOpensAt,
      regClosesAt: input.regClosesAt,
      regConfirmed: true,
    };
  }
  if (existing?.regConfirmed) {
    return {
      regOpensAt: existing.regOpensAt,
      regClosesAt: existing.regClosesAt,
      regConfirmed: true,
    };
  }
  return { ...defaultRegistrationWindow(input.startsAt), regConfirmed: false };
}

async function loadExisting(source: ExamSource) {
  const rows = await db.select().from(exams).where(eq(exams.source, source));
  return new Map(rows.map((row) => [row.id, row]));
}

async function linkCalendars(pairs: Array<{ examId: string; linkId: string }>) {
  for (let i = 0; i < pairs.length; i += CALENDAR_CHUNK) {
    await db
      .insert(examCalendars)
      .values(pairs.slice(i, i + CALENDAR_CHUNK))
      .onConflictDoNothing();
  }
}

export async function upsertExams(source: ExamSource, inputs: ExamInput[]) {
  const existing = await loadExisting(source);
  const pairs: Array<{ examId: string; linkId: string }> = [];
  const now = new Date();

  for (const input of inputs) {
    const id = examId(source, input.externalId);
    const current = existing.get(id);
    const window = resolveWindow(input, current);
    const fields = {
      subject: input.subject,
      courseName: input.courseName,
      startsAt: input.startsAt,
      endsAt: input.endsAt,
      kind: input.kind,
      aula: input.aula,
      professor: input.professor,
      canceled: input.canceled,
      updatedAt: now,
      ...window,
    };

    if (current) {
      await db.update(exams).set(fields).where(eq(exams.id, id));
    } else {
      await db.insert(exams).values({
        id,
        source,
        externalId: input.externalId,
        linkId: input.linkIds[0] ?? "",
        ...fields,
      });
    }

    for (const linkId of input.linkIds) pairs.push({ examId: id, linkId });
  }

  await linkCalendars(pairs);
  return inputs.length;
}

export async function cancelMissingExams(
  source: ExamSource,
  seenIds: Set<string>,
  linkIds: string[],
  rangeStart: Date,
) {
  if (linkIds.length === 0) return 0;
  const candidates = new Set<string>();
  for (let i = 0; i < linkIds.length; i += 80) {
    const rows = await db
      .select({ id: exams.id, startsAt: exams.startsAt })
      .from(examCalendars)
      .innerJoin(exams, eq(exams.id, examCalendars.examId))
      .where(inArray(examCalendars.linkId, linkIds.slice(i, i + 80)));
    for (const row of rows) {
      if (row.startsAt >= rangeStart && row.id.startsWith(`${source}:`)) {
        candidates.add(row.id);
      }
    }
  }
  const missing = [...candidates].filter((id) => !seenIds.has(id));
  for (let i = 0; i < missing.length; i += 80) {
    await db
      .update(exams)
      .set({ canceled: true, updatedAt: new Date() })
      .where(inArray(exams.id, missing.slice(i, i + 80)));
  }
  return missing.length;
}
