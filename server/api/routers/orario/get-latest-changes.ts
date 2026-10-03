import { inArray } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { courseSnapshots } from "@/lib/db/schema";
import { publicProcedure } from "@/server/api/trpc";

type TimetableChange = {
  type: "ADDED" | "CANCELED" | "MODIFIED";
  title: string;
  date: string;
  time: string;
  location: string;
  professor: string;
  diffs?: {
    time?: { old: string; new: string };
    location?: { old: string; new: string };
    professor?: { old: string; new: string };
  };
};

export const getLatestChanges = publicProcedure
  .input(
    z.object({
      linkIds: z.array(z.string()),
    }),
  )
  .query(async ({ input }) => {
    if (input.linkIds.length === 0) return null;

    const snapshots = await db.query.courseSnapshots.findMany({
      where: inArray(courseSnapshots.linkId, input.linkIds),
    });

    if (snapshots.length === 0) return null;

    const today = new Date().toISOString().split("T")[0];
    const snapshotsWithChanges = snapshots.filter((s) => s.lastChanges);
    const allChanges = snapshotsWithChanges.flatMap((s) => {
      try {
        const lastChanges = s.lastChanges;
        if (!lastChanges) return [];
        const parsed = JSON.parse(lastChanges) as TimetableChange[];
        return parsed.filter((c) => c.date >= today);
      } catch {
        return [];
      }
    });

    if (allChanges.length === 0) return null;

    const latestUpdate = Math.max(
      ...snapshotsWithChanges.map((s) => s.lastUpdated.getTime()),
    );

    return {
      changes: allChanges,
      updatedAt: latestUpdate,
    };
  });
