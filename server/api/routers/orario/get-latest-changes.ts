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
    const perLink = snapshots.flatMap((snapshot) => {
      if (!snapshot.lastChanges) return [];
      try {
        const parsed = JSON.parse(snapshot.lastChanges) as TimetableChange[];
        const changes = parsed.filter((c) => c.date >= today);
        if (changes.length === 0) return [];
        return [
          {
            linkId: snapshot.linkId,
            updatedAt: snapshot.lastUpdated.getTime(),
            changes,
          },
        ];
      } catch {
        return [];
      }
    });

    if (perLink.length === 0) return null;

    return {
      changes: perLink.flatMap((entry) => entry.changes),
      updatedAt: Math.max(...perLink.map((entry) => entry.updatedAt)),
      perLink,
    };
  });
