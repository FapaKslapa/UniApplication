import { and, desc, gte, inArray } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { changeLog } from "@/lib/db/schema";
import { publicProcedure } from "@/server/api/trpc";

const DAY_MS = 24 * 60 * 60 * 1000;
const MAX_ROWS = 100;

const diffSchema = z.object({ old: z.string(), new: z.string() });

const changeSchema = z.object({
  type: z.enum(["ADDED", "CANCELED", "MODIFIED"]),
  title: z.string(),
  date: z.string(),
  time: z.string(),
  location: z.string(),
  professor: z.string(),
  diffs: z
    .object({
      time: diffSchema.optional(),
      location: diffSchema.optional(),
      professor: diffSchema.optional(),
    })
    .optional(),
});

function parseChanges(raw: string) {
  try {
    const parsed = z.array(changeSchema).safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : [];
  } catch {
    return [];
  }
}

export const getChangeHistory = publicProcedure
  .input(
    z.object({
      linkIds: z.array(z.string()).max(50),
      days: z.number().int().min(1).max(60).default(14),
    }),
  )
  .query(async ({ input }) => {
    if (input.linkIds.length === 0) return [];

    const since = new Date(Date.now() - input.days * DAY_MS);

    const rows = await db
      .select()
      .from(changeLog)
      .where(
        and(
          inArray(changeLog.linkId, input.linkIds),
          gte(changeLog.detectedAt, since),
        ),
      )
      .orderBy(desc(changeLog.detectedAt))
      .limit(MAX_ROWS);

    return rows
      .map((row) => ({
        linkId: row.linkId,
        updatedAt: row.detectedAt.getTime(),
        changes: parseChanges(row.changes),
      }))
      .filter((entry) => entry.changes.length > 0);
  });
