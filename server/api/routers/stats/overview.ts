import { sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { adminProcedure } from "@/server/api/trpc";
import { get, italyBoundaries, toEpochSeconds, trend } from "./helpers";

export const getOverview = adminProcedure.query(async () => {
  const { todayStart } = italyBoundaries();
  const h24ago = toEpochSeconds(new Date(Date.now() - 86_400_000));
  const h48ago = toEpochSeconds(new Date(Date.now() - 172_800_000));
  const w2ago = toEpochSeconds(new Date(Date.now() - 1_209_600_000));
  const w1ago = toEpochSeconds(new Date(Date.now() - 604_800_000));

  const [
    total,
    last24h,
    prev24h,
    thisWeek,
    prevWeek,
    totalUnique,
    uniqueToday,
    totalClients,
    clientsToday,
  ] = await Promise.all([
    db.all(sql`SELECT COUNT(*) as value FROM visits`),
    db.all(
      sql`SELECT COUNT(*) as value FROM visits WHERE createdAt >= ${h24ago}`,
    ),
    db.all(
      sql`SELECT COUNT(*) as value FROM visits WHERE createdAt >= ${h48ago} AND createdAt < ${h24ago}`,
    ),
    db.all(
      sql`SELECT COUNT(*) as value FROM visits WHERE createdAt >= ${w1ago}`,
    ),
    db.all(
      sql`SELECT COUNT(*) as value FROM visits WHERE createdAt >= ${w2ago} AND createdAt < ${w1ago}`,
    ),
    db.all(sql`SELECT COUNT(DISTINCT ip) as value FROM visits`),
    db.all(
      sql`SELECT COUNT(DISTINCT ip) as value FROM visits WHERE createdAt >= ${todayStart}`,
    ),
    db.all(
      sql`SELECT COUNT(DISTINCT client_id) as value FROM visits WHERE client_id IS NOT NULL`,
    ),
    db.all(
      sql`SELECT COUNT(DISTINCT client_id) as value FROM visits WHERE client_id IS NOT NULL AND createdAt >= ${todayStart}`,
    ),
  ]);

  const l24 = get(last24h);
  const tw = get(thisWeek);

  return {
    totalVisits: get(total),
    last24h: l24,
    thisWeek: tw,
    totalUnique: get(totalUnique),
    uniqueToday: get(uniqueToday),
    totalClients: get(totalClients),
    clientsToday: get(clientsToday),
    trend24h: trend(l24, get(prev24h)),
    trendWeek: trend(tw, get(prevWeek)),
  };
});
