import { z } from "zod";
import { ensureExamTables } from "@/lib/db/ensure-exam-tables";
import { normalizeExamKind } from "@/lib/exams/dto";
import { type ExamInput, upsertExams } from "@/lib/exams/upsert";
import { isCronRequestAuthorized } from "@/server/cron-auth";

const optionalDate = z.iso.datetime({ offset: true }).nullish();
const optionalText = (max: number) => z.string().max(max).nullish();

const bodySchema = z.object({
  exams: z
    .array(
      z.object({
        externalId: z.string().min(1).max(128),
        linkIds: z.array(z.string().max(64)).max(40).optional(),
        subject: z.string().min(1).max(300),
        courseName: optionalText(300),
        startsAt: z.iso.datetime({ offset: true }),
        endsAt: optionalDate,
        kind: optionalText(40),
        aula: optionalText(200),
        professor: optionalText(200),
        regOpensAt: optionalDate,
        regClosesAt: optionalDate,
        regConfirmed: z.boolean().optional(),
        canceled: z.boolean().optional(),
      }),
    )
    .max(500),
});

const toDate = (value: string | null | undefined) =>
  value ? new Date(value) : null;

export async function POST(req: Request) {
  if (!(await isCronRequestAuthorized(req))) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ error: "Invalid body" }, { status: 400 });
  }

  const inputs: ExamInput[] = parsed.data.exams.map((exam) => {
    const regOpensAt = toDate(exam.regOpensAt);
    const regClosesAt = toDate(exam.regClosesAt);
    const linkIds = exam.linkIds ?? [];
    return {
      source: "esse3",
      externalId: exam.externalId,
      linkIds,
      subject: exam.subject,
      courseName: exam.courseName ?? null,
      startsAt: new Date(exam.startsAt),
      endsAt: toDate(exam.endsAt),
      kind: normalizeExamKind(exam.kind),
      aula: exam.aula ?? null,
      professor: exam.professor ?? null,
      regOpensAt,
      regClosesAt,
      regConfirmed:
        !!regOpensAt && !!regClosesAt && exam.regConfirmed !== false,
      canceled: exam.canceled ?? false,
    };
  });

  try {
    await ensureExamTables();
    const imported = await upsertExams("esse3", inputs);
    return Response.json({ ok: true, imported });
  } catch (error) {
    console.error("Exam import failed:", error);
    return Response.json({ error: "Import failed" }, { status: 500 });
  }
}
