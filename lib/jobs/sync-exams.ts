import { eq } from "drizzle-orm";
import {
  cinecaProfessor,
  cinecaSubject,
  fetchCinecaEvents,
} from "@/lib/cineca";
import { getCurrentItalianDateTime } from "@/lib/date-utils";
import { db } from "@/lib/db";
import { ensureExamTables } from "@/lib/db/ensure-exam-tables";
import { courses } from "@/lib/db/schema";
import { normalizeExamKind } from "@/lib/exams/dto";
import {
  cancelMissingExams,
  type ExamInput,
  examId,
  upsertExams,
} from "@/lib/exams/upsert";

const PAST_DAYS = 30;
const FUTURE_MONTHS = 14;
const FETCH_DELAY_MS = 300;
const COURSE_SUFFIX_RE = /\s*-\s*Anno\s*\d+.*$/i;

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

function aulaOf(event: { aule?: Array<{ descrizione: string }> }) {
  const names = (event.aule ?? []).map((a) => a.descrizione).filter(Boolean);
  return names.length > 0 ? names.join(" | ") : null;
}

export async function syncExams() {
  await ensureExamTables();

  const approved = await db
    .select()
    .from(courses)
    .where(eq(courses.status, "approved"));

  const rangeStart = getCurrentItalianDateTime()
    .startOf("day")
    .minus({ days: PAST_DAYS });
  const rangeEnd = rangeStart.plus({ months: FUTURE_MONTHS }).endOf("day");

  const collected = new Map<string, ExamInput>();
  const okLinkIds: string[] = [];
  let errors = 0;

  for (const course of approved) {
    try {
      const events = await fetchCinecaEvents(
        course.linkId,
        rangeStart,
        rangeEnd,
      );
      if (events.length > 0) okLinkIds.push(course.linkId);

      for (const event of events) {
        if (event.tipoEvento?.descrizione !== "ESAMI") continue;
        const externalId = event.id ?? event.eventoId;
        if (!externalId) continue;

        const existing = collected.get(externalId);
        if (existing) {
          if (!existing.linkIds.includes(course.linkId)) {
            existing.linkIds.push(course.linkId);
          }
          continue;
        }

        collected.set(externalId, {
          source: "cineca",
          externalId,
          linkIds: [course.linkId],
          subject: cinecaSubject(event),
          courseName: course.name.replace(COURSE_SUFFIX_RE, "").trim() || null,
          startsAt: new Date(event.dataInizio),
          endsAt: event.dataFine ? new Date(event.dataFine) : null,
          kind: normalizeExamKind(event.tipoAttivita?.descrizione),
          aula: aulaOf(event),
          professor: cinecaProfessor(event),
          regOpensAt: null,
          regClosesAt: null,
          regConfirmed: false,
          canceled: false,
        });
      }
    } catch (error) {
      errors++;
      console.error(`Exam sync failed for ${course.linkId}:`, error);
    }
    await delay(FETCH_DELAY_MS);
  }

  const inputs = [...collected.values()];
  const upserted = await upsertExams("cineca", inputs);
  const canceled = await cancelMissingExams(
    "cineca",
    new Set(inputs.map((i) => examId("cineca", i.externalId))),
    okLinkIds,
    rangeStart.toJSDate(),
  );

  return { courses: approved.length, exams: upserted, canceled, errors };
}
