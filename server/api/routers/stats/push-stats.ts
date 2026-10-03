import { sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { adminProcedure } from "@/server/api/trpc";
import { get, toEpochSeconds } from "./helpers";

type PushCourseRow = { linkId: string; count: number };
type PushTrendRow = { date: string; count: number };

export const getPushStats = adminProcedure.query(async () => {
  const fromDate = toEpochSeconds(new Date(Date.now() - 30 * 86_400_000));

  const [total, topCourses, trend] = await Promise.all([
    db.all(sql`SELECT COUNT(*) as value FROM push_subscriptions`),
    db.all(sql`
      SELECT link_id as linkId, COUNT(*) as count
      FROM push_subscriptions
      GROUP BY link_id
      ORDER BY count DESC
      LIMIT 8
    `),
    db.all(sql`
      SELECT date(created_at / case when created_at > 9999999999 then 1000 else 1 end, 'unixepoch') as date, COUNT(*) as count
      FROM push_subscriptions
      WHERE created_at >= ${fromDate}
      GROUP BY date
      ORDER BY date ASC
    `),
  ]);

  return {
    total: get(total),
    topCourses: (topCourses as unknown as PushCourseRow[]).map((r) => ({
      linkId: r.linkId,
      count: Number(r.count),
    })),
    trend: (trend as unknown as PushTrendRow[]).map((r) => ({
      date: r.date,
      count: Number(r.count),
    })),
  };
});
