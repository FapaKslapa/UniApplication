import { sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { adminProcedure } from "@/server/api/trpc";

type DeviceRow = { deviceType: string; count: number };
type OsRow = { os: string; count: number };
type PageRow = { path: string; count: number; unique: number };
type BrowserRow = { browser: string; count: number };

export const getDeviceDistribution = adminProcedure.query(async () => {
  const result = await db.all(sql`
    SELECT deviceType, COUNT(*) as count
    FROM visits
    GROUP BY deviceType
    ORDER BY count DESC
  `);
  return (result as unknown as DeviceRow[]).map((r) => ({
    deviceType: r.deviceType ?? "desktop",
    count: Number(r.count),
  }));
});

export const getOsDistribution = adminProcedure.query(async () => {
  const result = await db.all(sql`
    SELECT os, COUNT(*) as count
    FROM visits
    WHERE os IS NOT NULL AND os != 'Unknown'
    GROUP BY os
    ORDER BY count DESC
    LIMIT 10
  `);
  return (result as unknown as OsRow[]).map((r) => ({
    os: r.os ?? "Unknown",
    count: Number(r.count),
  }));
});

export const getTopPages = adminProcedure.query(async () => {
  const result = await db.all(sql`
    SELECT path, COUNT(*) as count, COUNT(DISTINCT ip) as "unique"
    FROM visits
    WHERE path IS NOT NULL
    GROUP BY path
    ORDER BY count DESC
    LIMIT 10
  `);
  return (result as unknown as PageRow[]).map((r) => ({
    path: r.path,
    count: Number(r.count),
    unique: Number(r.unique),
  }));
});

export const getBrowserDistribution = adminProcedure.query(async () => {
  const result = await db.all(sql`
    SELECT browser, COUNT(*) as count
    FROM visits
    WHERE browser IS NOT NULL
    GROUP BY browser
    ORDER BY count DESC
    LIMIT 8
  `);
  return (result as unknown as BrowserRow[]).map((r) => ({
    browser: r.browser ?? "Unknown",
    count: Number(r.count),
  }));
});
