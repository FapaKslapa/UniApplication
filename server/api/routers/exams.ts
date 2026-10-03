import { TRPCError } from "@trpc/server";
import {
  and,
  asc,
  count,
  eq,
  gte,
  inArray,
  lte,
  or,
  type SQL,
  sql,
} from "drizzle-orm";
import { z } from "zod";
import { getCurrentItalianDateTime } from "@/lib/date-utils";
import { db } from "@/lib/db";
import { ensureExamTables } from "@/lib/db/ensure-exam-tables";
import { examCalendars, examFollows, exams } from "@/lib/db/schema";
import { type ExamDTO, toExamDTO } from "@/lib/exams/dto";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { enforceRateLimit } from "@/server/rate-limit";

const MAX_FOLLOWS = 100;

const examIdInput = z.object({ examId: z.string().min(1).max(64) });

const escapeLike = (value: string) => value.replace(/[\\%_]/g, "\\$&");

async function followedIds(userId: string) {
  const rows = await db
    .select({ examId: examFollows.examId })
    .from(examFollows)
    .where(eq(examFollows.userId, userId));
  return new Set(rows.map((row) => row.examId));
}

export const examsRouter = createTRPCRouter({
  search: publicProcedure
    .input(
      z.object({
        query: z.string().max(100).optional(),
        cursor: z.number().int().min(0).optional(),
        limit: z.number().int().min(1).max(50).default(30),
      }),
    )
    .query(async ({ input, ctx }) => {
      await ensureExamTables();
      const offset = input.cursor ?? 0;
      const conditions: SQL[] = [
        gte(exams.startsAt, new Date()),
        eq(exams.canceled, false),
      ];
      const term = input.query?.trim();
      if (term) {
        const pattern = `%${escapeLike(term.toLowerCase())}%`;
        const match = or(
          sql`lower(${exams.subject}) like ${pattern} escape '\\'`,
          sql`lower(${exams.courseName}) like ${pattern} escape '\\'`,
        );
        if (match) conditions.push(match);
      }

      const rows = await db
        .select()
        .from(exams)
        .where(and(...conditions))
        .orderBy(asc(exams.startsAt), asc(exams.id))
        .limit(input.limit + 1)
        .offset(offset);

      const page = rows.slice(0, input.limit);
      const following = await followedIds(ctx.userId);
      const items: ExamDTO[] = page.map((row) =>
        toExamDTO(row, following.has(row.id)),
      );
      return {
        items,
        nextCursor: rows.length > input.limit ? offset + input.limit : null,
      };
    }),

  followed: publicProcedure.query(async ({ ctx }): Promise<ExamDTO[]> => {
    await ensureExamTables();
    const startOfToday = getCurrentItalianDateTime().startOf("day").toJSDate();
    const rows = await db
      .select({ exam: exams })
      .from(examFollows)
      .innerJoin(exams, eq(exams.id, examFollows.examId))
      .where(
        and(
          eq(examFollows.userId, ctx.userId),
          eq(exams.canceled, false),
          gte(exams.startsAt, startOfToday),
        ),
      )
      .orderBy(asc(exams.startsAt), asc(exams.id));
    return rows.map((row) => toExamDTO(row.exam, true));
  }),

  follow: publicProcedure
    .input(examIdInput)
    .mutation(async ({ input, ctx }) => {
      enforceRateLimit("exams.follow", ctx.headers, 60);
      await ensureExamTables();

      const exam = await db.query.exams.findFirst({
        where: eq(exams.id, input.examId),
        columns: { id: true },
      });
      if (!exam) return { success: false };

      const [owned] = await db
        .select({ total: count() })
        .from(examFollows)
        .where(eq(examFollows.userId, ctx.userId));
      const already = await db.query.examFollows.findFirst({
        where: and(
          eq(examFollows.userId, ctx.userId),
          eq(examFollows.examId, input.examId),
        ),
      });
      if (already) return { success: true };
      if ((owned?.total ?? 0) >= MAX_FOLLOWS) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Hai raggiunto il limite di esami seguiti.",
        });
      }

      await db
        .insert(examFollows)
        .values({ userId: ctx.userId, examId: input.examId })
        .onConflictDoNothing();
      return { success: true };
    }),

  unfollow: publicProcedure
    .input(examIdInput)
    .mutation(async ({ input, ctx }) => {
      enforceRateLimit("exams.unfollow", ctx.headers, 60);
      await ensureExamTables();
      await db
        .delete(examFollows)
        .where(
          and(
            eq(examFollows.userId, ctx.userId),
            eq(examFollows.examId, input.examId),
          ),
        );
      return { success: true };
    }),

  forAgenda: publicProcedure
    .input(
      z.object({
        linkIds: z.array(z.string().max(64)).max(40),
        from: z.iso.datetime({ offset: true }),
        to: z.iso.datetime({ offset: true }),
      }),
    )
    .query(async ({ input, ctx }): Promise<ExamDTO[]> => {
      await ensureExamTables();
      const from = new Date(input.from);
      const to = new Date(input.to);
      const following = await followedIds(ctx.userId);

      const sources: SQL[] = [];
      if (input.linkIds.length > 0) {
        sources.push(
          inArray(
            exams.id,
            db
              .select({ id: examCalendars.examId })
              .from(examCalendars)
              .where(inArray(examCalendars.linkId, input.linkIds)),
          ),
        );
      }
      if (following.size > 0) {
        sources.push(
          inArray(
            exams.id,
            db
              .select({ id: examFollows.examId })
              .from(examFollows)
              .where(eq(examFollows.userId, ctx.userId)),
          ),
        );
      }
      if (sources.length === 0) return [];

      const rows = await db
        .select()
        .from(exams)
        .where(
          and(
            gte(exams.startsAt, from),
            lte(exams.startsAt, to),
            eq(exams.canceled, false),
            or(...sources),
          ),
        )
        .orderBy(asc(exams.startsAt), asc(exams.id));
      return rows.map((row) => toExamDTO(row, following.has(row.id)));
    }),
});
