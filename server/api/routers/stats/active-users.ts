import { sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { adminProcedure } from "@/server/api/trpc";
import { get, italyBoundaries, trend } from "./helpers";

export const getActiveUsers = adminProcedure.query(async () => {
  const {
    todayStart,
    yesterdayStart,
    weekStart,
    prevWeekStart,
    monthStart,
    prevMonthStart,
  } = italyBoundaries();

  const [dau, prevDau, wau, prevWau, mau, prevMau, total, newToday] =
    await Promise.all([
      db.all(
        sql`SELECT COUNT(*) as value FROM analytics_users WHERE last_seen >= ${todayStart}`,
      ),
      db.all(
        sql`SELECT COUNT(*) as value FROM analytics_users WHERE last_seen >= ${yesterdayStart} AND last_seen < ${todayStart}`,
      ),
      db.all(
        sql`SELECT COUNT(*) as value FROM analytics_users WHERE last_seen >= ${weekStart}`,
      ),
      db.all(
        sql`SELECT COUNT(*) as value FROM analytics_users WHERE last_seen >= ${prevWeekStart} AND last_seen < ${weekStart}`,
      ),
      db.all(
        sql`SELECT COUNT(*) as value FROM analytics_users WHERE last_seen >= ${monthStart}`,
      ),
      db.all(
        sql`SELECT COUNT(*) as value FROM analytics_users WHERE last_seen >= ${prevMonthStart} AND last_seen < ${monthStart}`,
      ),
      db.all(sql`SELECT COUNT(*) as value FROM analytics_users`),
      db.all(
        sql`SELECT COUNT(*) as value FROM analytics_users WHERE created_at >= ${todayStart}`,
      ),
    ]);

  const dauVal = get(dau);
  const wauVal = get(wau);
  const mauVal = get(mau);

  return {
    dau: dauVal,
    wau: wauVal,
    mau: mauVal,
    total: get(total),
    newToday: get(newToday),
    trendDau: trend(dauVal, get(prevDau)),
    trendWau: trend(wauVal, get(prevWau)),
    trendMau: trend(mauVal, get(prevMau)),
  };
});
