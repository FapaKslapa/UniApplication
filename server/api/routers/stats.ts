import { sql } from "drizzle-orm";
import { DateTime } from "luxon";
import UAParser from "ua-parser-js";
import { z } from "zod";
import { db } from "@/lib/db";
import { visits } from "@/lib/db/schema";
import {
  adminProcedure,
  createTRPCRouter,
  publicProcedure,
} from "@/server/api/trpc";

type DailyRow = { date: string; count: number; unique: number };
type HourlyRow = { hour: number; count: number };
type DeviceRow = { deviceType: string; count: number };
type OsRow = { os: string; count: number };
type PageRow = { path: string; count: number; unique: number };
type BrowserRow = { browser: string; count: number };
type CountRow = { value: number };
type PushCourseRow = { linkId: string; count: number };
type PushTrendRow = { date: string; count: number };

// ─── Rate limiting in-memory (per IP, finestra 60s) ─────────────────────────
const visitRateLimit = new Map<
  string,
  { count: number; windowStart: number }
>();
const RATE_WINDOW_MS = 60_000;
const RATE_MAX = 8;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = visitRateLimit.get(ip);
  if (!entry || now - entry.windowStart > RATE_WINDOW_MS) {
    visitRateLimit.set(ip, { count: 1, windowStart: now });
    return false;
  }
  if (entry.count >= RATE_MAX) return true;
  entry.count++;
  return false;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
const get = (r: [CountRow[], unknown]) => Number(r[0][0]?.value ?? 0);

function italyBoundaries() {
  const now = DateTime.now().setZone("Europe/Rome");
  return {
    todayStart: now.startOf("day").toJSDate(),
    yesterdayStart: now.minus({ days: 1 }).startOf("day").toJSDate(),
    weekStart: now.minus({ days: 7 }).startOf("day").toJSDate(),
    prevWeekStart: now.minus({ days: 14 }).startOf("day").toJSDate(),
    monthStart: now.minus({ days: 30 }).startOf("day").toJSDate(),
    prevMonthStart: now.minus({ days: 60 }).startOf("day").toJSDate(),
    italyOffsetHours: now.offset / 60,
  };
}

// ─────────────────────────────────────────────────────────────────────────────

export const statsRouter = createTRPCRouter({
  // ── Traccia una visita (pubblico) ──────────────────────────────────────────
  trackVisit: publicProcedure
    .input(
      z.object({
        path: z.string(),
        referer: z.string().optional(),
        clientId: z.string().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const ip =
        ctx.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
        ctx.headers.get("x-real-ip") ??
        "unknown";

      if (isRateLimited(ip)) return { ok: true };

      const ua = ctx.headers.get("user-agent") ?? "";
      const parser = new UAParser(ua);
      const deviceType = parser.getDevice().type ?? "desktop";
      const browser = parser.getBrowser().name ?? "Unknown";
      const os = parser.getOS().name ?? "Unknown";

      await db.insert(visits).values({
        ip,
        clientId: input.clientId ?? null,
        userAgent: ua,
        path: input.path,
        referer: input.referer ?? null,
        deviceType,
        browser,
        os,
      });

      return { ok: true };
    }),

  // ── Overview KPI ──────────────────────────────────────────────────────────
  getOverview: adminProcedure.query(async () => {
    const { todayStart, weekStart, italyOffsetHours } = italyBoundaries();
    const h24ago = new Date(Date.now() - 86_400_000);
    const h48ago = new Date(Date.now() - 172_800_000);
    const w2ago = new Date(Date.now() - 1_209_600_000);

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
      db.execute(
        sql`SELECT COUNT(*) as value FROM visits`,
      ) as unknown as Promise<[CountRow[], unknown]>,
      db.execute(
        sql`SELECT COUNT(*) as value FROM visits WHERE createdAt >= ${h24ago}`,
      ) as unknown as Promise<[CountRow[], unknown]>,
      db.execute(
        sql`SELECT COUNT(*) as value FROM visits WHERE createdAt >= ${h48ago} AND createdAt < ${h24ago}`,
      ) as unknown as Promise<[CountRow[], unknown]>,
      db.execute(
        sql`SELECT COUNT(*) as value FROM visits WHERE createdAt >= ${new Date(Date.now() - 604_800_000)}`,
      ) as unknown as Promise<[CountRow[], unknown]>,
      db.execute(
        sql`SELECT COUNT(*) as value FROM visits WHERE createdAt >= ${w2ago} AND createdAt < ${new Date(Date.now() - 604_800_000)}`,
      ) as unknown as Promise<[CountRow[], unknown]>,
      db.execute(
        sql`SELECT COUNT(DISTINCT ip) as value FROM visits`,
      ) as unknown as Promise<[CountRow[], unknown]>,
      db.execute(
        sql`SELECT COUNT(DISTINCT ip) as value FROM visits WHERE createdAt >= ${todayStart}`,
      ) as unknown as Promise<[CountRow[], unknown]>,
      db.execute(
        sql`SELECT COUNT(DISTINCT client_id) as value FROM visits WHERE client_id IS NOT NULL`,
      ) as unknown as Promise<[CountRow[], unknown]>,
      db.execute(
        sql`SELECT COUNT(DISTINCT client_id) as value FROM visits WHERE client_id IS NOT NULL AND createdAt >= ${todayStart}`,
      ) as unknown as Promise<[CountRow[], unknown]>,
    ]);

    void weekStart;
    void italyOffsetHours;

    const l24 = get(last24h);
    const p24 = get(prev24h);
    const tw = get(thisWeek);
    const pw = get(prevWeek);

    return {
      totalVisits: get(total),
      last24h: l24,
      thisWeek: tw,
      totalUnique: get(totalUnique),
      uniqueToday: get(uniqueToday),
      totalClients: get(totalClients),
      clientsToday: get(clientsToday),
      trend24h: p24 > 0 ? ((l24 - p24) / p24) * 100 : null,
      trendWeek: pw > 0 ? ((tw - pw) / pw) * 100 : null,
    };
  }),

  // ── Utenti attivi DAU / WAU / MAU ─────────────────────────────────────────
  getActiveUsers: adminProcedure.query(async () => {
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
        db.execute(
          sql`SELECT COUNT(*) as value FROM analytics_users WHERE last_seen >= ${todayStart}`,
        ) as unknown as Promise<[CountRow[], unknown]>,
        db.execute(
          sql`SELECT COUNT(*) as value FROM analytics_users WHERE last_seen >= ${yesterdayStart} AND last_seen < ${todayStart}`,
        ) as unknown as Promise<[CountRow[], unknown]>,
        db.execute(
          sql`SELECT COUNT(*) as value FROM analytics_users WHERE last_seen >= ${weekStart}`,
        ) as unknown as Promise<[CountRow[], unknown]>,
        db.execute(
          sql`SELECT COUNT(*) as value FROM analytics_users WHERE last_seen >= ${prevWeekStart} AND last_seen < ${weekStart}`,
        ) as unknown as Promise<[CountRow[], unknown]>,
        db.execute(
          sql`SELECT COUNT(*) as value FROM analytics_users WHERE last_seen >= ${monthStart}`,
        ) as unknown as Promise<[CountRow[], unknown]>,
        db.execute(
          sql`SELECT COUNT(*) as value FROM analytics_users WHERE last_seen >= ${prevMonthStart} AND last_seen < ${monthStart}`,
        ) as unknown as Promise<[CountRow[], unknown]>,
        db.execute(
          sql`SELECT COUNT(*) as value FROM analytics_users`,
        ) as unknown as Promise<[CountRow[], unknown]>,
        db.execute(
          sql`SELECT COUNT(*) as value FROM analytics_users WHERE created_at >= ${todayStart}`,
        ) as unknown as Promise<[CountRow[], unknown]>,
      ]);

    const dauVal = get(dau);
    const prevDauVal = get(prevDau);
    const wauVal = get(wau);
    const prevWauVal = get(prevWau);
    const mauVal = get(mau);
    const prevMauVal = get(prevMau);

    return {
      dau: dauVal,
      wau: wauVal,
      mau: mauVal,
      total: get(total),
      newToday: get(newToday),
      trendDau:
        prevDauVal > 0 ? ((dauVal - prevDauVal) / prevDauVal) * 100 : null,
      trendWau:
        prevWauVal > 0 ? ((wauVal - prevWauVal) / prevWauVal) * 100 : null,
      trendMau:
        prevMauVal > 0 ? ((mauVal - prevMauVal) / prevMauVal) * 100 : null,
    };
  }),

  // ── Statistiche giornaliere (con range custom) ────────────────────────────
  getDailyStats: adminProcedure
    .input(
      z.object({
        days: z.number().min(7).max(365).optional(),
        from: z.string().optional(),
        to: z.string().optional(),
      }),
    )
    .query(async ({ input }) => {
      let fromDate: Date;
      let toDate: Date;

      if (input.from && input.to) {
        fromDate = new Date(input.from);
        toDate = new Date(input.to);
      } else {
        toDate = new Date();
        fromDate = new Date(toDate.getTime() - (input.days ?? 30) * 86_400_000);
      }

      const result = await db.execute(sql`
        SELECT
          DATE_FORMAT(createdAt, '%Y-%m-%d') as date,
          COUNT(*) as count,
          COUNT(DISTINCT ip) as \`unique\`,
          COUNT(DISTINCT client_id) as uniqueClients
        FROM visits
        WHERE createdAt >= ${fromDate} AND createdAt <= ${toDate}
        GROUP BY DATE_FORMAT(createdAt, '%Y-%m-%d')
        ORDER BY date ASC
      `);

      return (
        result[0] as unknown as (DailyRow & { uniqueClients: number })[]
      ).map((r) => ({
        date: r.date,
        count: Number(r.count),
        unique: Number(r.unique),
        uniqueClients: Number(r.uniqueClients),
      }));
    }),

  // ── Distribuzione oraria (timezone italiana, con filtro giorni) ───────────
  getHourlyVisits: adminProcedure
    .input(
      z.object({ days: z.number().min(1).max(365).default(30) }).optional(),
    )
    .query(async ({ input }) => {
      const days = input?.days ?? 30;
      const fromDate = new Date(Date.now() - days * 86_400_000);
      const offsetHours = DateTime.now().setZone("Europe/Rome").offset / 60;

      const result = await db.execute(sql`
        SELECT HOUR(DATE_ADD(createdAt, INTERVAL ${offsetHours} HOUR)) as hour, COUNT(*) as count
        FROM visits
        WHERE createdAt >= ${fromDate}
        GROUP BY HOUR(DATE_ADD(createdAt, INTERVAL ${offsetHours} HOUR))
        ORDER BY hour ASC
      `);

      return (result[0] as unknown as HourlyRow[]).map((r) => ({
        hour: Number(r.hour),
        count: Number(r.count),
      }));
    }),

  // ── Distribuzione dispositivi ─────────────────────────────────────────────
  getDeviceDistribution: adminProcedure.query(async () => {
    const result = await db.execute(sql`
      SELECT deviceType, COUNT(*) as count
      FROM visits
      GROUP BY deviceType
      ORDER BY count DESC
    `);
    return (result[0] as unknown as DeviceRow[]).map((r) => ({
      deviceType: r.deviceType ?? "desktop",
      count: Number(r.count),
    }));
  }),

  // ── Distribuzione OS ──────────────────────────────────────────────────────
  getOsDistribution: adminProcedure.query(async () => {
    const result = await db.execute(sql`
      SELECT os, COUNT(*) as count
      FROM visits
      WHERE os IS NOT NULL AND os != 'Unknown'
      GROUP BY os
      ORDER BY count DESC
      LIMIT 10
    `);
    return (result[0] as unknown as OsRow[]).map((r) => ({
      os: r.os ?? "Unknown",
      count: Number(r.count),
    }));
  }),

  // ── Top pagine ────────────────────────────────────────────────────────────
  getTopPages: adminProcedure.query(async () => {
    const result = await db.execute(sql`
      SELECT path, COUNT(*) as count, COUNT(DISTINCT ip) as \`unique\`
      FROM visits
      WHERE path IS NOT NULL
      GROUP BY path
      ORDER BY count DESC
      LIMIT 10
    `);
    return (result[0] as unknown as PageRow[]).map((r) => ({
      path: r.path,
      count: Number(r.count),
      unique: Number(r.unique),
    }));
  }),

  // ── Distribuzione browser ─────────────────────────────────────────────────
  getBrowserDistribution: adminProcedure.query(async () => {
    const result = await db.execute(sql`
      SELECT browser, COUNT(*) as count
      FROM visits
      WHERE browser IS NOT NULL
      GROUP BY browser
      ORDER BY count DESC
      LIMIT 8
    `);
    return (result[0] as unknown as BrowserRow[]).map((r) => ({
      browser: r.browser ?? "Unknown",
      count: Number(r.count),
    }));
  }),

  // ── Statistiche push notification ─────────────────────────────────────────
  getPushStats: adminProcedure.query(async () => {
    const fromDate = new Date(Date.now() - 30 * 86_400_000);

    const [total, topCourses, trend] = await Promise.all([
      db.execute(
        sql`SELECT COUNT(*) as value FROM push_subscriptions`,
      ) as unknown as Promise<[CountRow[], unknown]>,
      db.execute(sql`
        SELECT link_id as linkId, COUNT(*) as count
        FROM push_subscriptions
        GROUP BY link_id
        ORDER BY count DESC
        LIMIT 8
      `),
      db.execute(sql`
        SELECT DATE_FORMAT(created_at, '%Y-%m-%d') as date, COUNT(*) as count
        FROM push_subscriptions
        WHERE created_at >= ${fromDate}
        GROUP BY DATE_FORMAT(created_at, '%Y-%m-%d')
        ORDER BY date ASC
      `),
    ]);

    return {
      total: get(total),
      topCourses: (topCourses[0] as unknown as PushCourseRow[]).map((r) => ({
        linkId: r.linkId,
        count: Number(r.count),
      })),
      trend: (trend[0] as unknown as PushTrendRow[]).map((r) => ({
        date: r.date,
        count: Number(r.count),
      })),
    };
  }),
});
