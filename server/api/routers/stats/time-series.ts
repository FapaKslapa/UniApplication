import { sql } from "drizzle-orm";
import { DateTime } from "luxon";
import { z } from "zod";
import { db } from "@/lib/db";
import { adminProcedure } from "@/server/api/trpc";
import { toEpochSeconds } from "./helpers";

type DailyRow = {
  date: string;
  count: number;
  unique: number;
  uniqueClients: number;
};
type HourlyRow = { hour: number; count: number };

export const getDailyStats = adminProcedure
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
    const from = toEpochSeconds(fromDate);
    const to = toEpochSeconds(toDate);

    const result = await db.all(sql`
      SELECT
        date(createdAt / case when createdAt > 9999999999 then 1000 else 1 end, 'unixepoch') as date,
        COUNT(*) as count,
        COUNT(DISTINCT ip) as "unique",
        COUNT(DISTINCT client_id) as uniqueClients
      FROM visits
      WHERE createdAt >= ${from} AND createdAt <= ${to}
      GROUP BY date
      ORDER BY date ASC
    `);

    return (result as unknown as DailyRow[]).map((r) => ({
      date: r.date,
      count: Number(r.count),
      unique: Number(r.unique),
      uniqueClients: Number(r.uniqueClients),
    }));
  });

export const getHourlyVisits = adminProcedure
  .input(z.object({ days: z.number().min(1).max(365).default(30) }).optional())
  .query(async ({ input }) => {
    const days = input?.days ?? 30;
    const fromDate = toEpochSeconds(new Date(Date.now() - days * 86_400_000));
    const offsetHours = DateTime.now().setZone("Europe/Rome").offset / 60;

    const result = await db.all(sql`
      SELECT
        cast(strftime('%H', (createdAt / case when createdAt > 9999999999 then 1000 else 1 end) + ${offsetHours * 3600}, 'unixepoch') as integer) as hour,
        COUNT(*) as count
      FROM visits
      WHERE createdAt >= ${fromDate}
      GROUP BY hour
      ORDER BY hour ASC
    `);

    return (result as unknown as HourlyRow[]).map((r) => ({
      hour: Number(r.hour),
      count: Number(r.count),
    }));
  });
