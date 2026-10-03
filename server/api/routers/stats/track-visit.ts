import { UAParser } from "ua-parser-js";
import { z } from "zod";
import { db } from "@/lib/db";
import { visits } from "@/lib/db/schema";
import { publicProcedure } from "@/server/api/trpc";
import { getClientIp, isRateLimited } from "@/server/rate-limit";

async function hashIp(ip: string): Promise<string> {
  const salt = process.env.BETTER_AUTH_SECRET ?? "";
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(`${salt}:${ip}`),
  );
  return Array.from(new Uint8Array(digest), (b) =>
    b.toString(16).padStart(2, "0"),
  )
    .join("")
    .slice(0, 32);
}

export const trackVisit = publicProcedure
  .input(
    z.object({
      path: z.string().max(512),
      referer: z.string().max(512).optional(),
      clientId: z.string().max(64).optional(),
    }),
  )
  .mutation(async ({ input, ctx }) => {
    if (isRateLimited("stats.trackVisit", ctx.headers, 8, 60_000)) {
      return { ok: true };
    }
    const ip = await hashIp(getClientIp(ctx.headers));

    const ua = (ctx.headers.get("user-agent") ?? "").slice(0, 512);
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
  });
