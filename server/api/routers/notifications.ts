import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { pushSubscriptions } from "@/lib/db/schema";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { enforceRateLimit } from "@/server/rate-limit";

const filtersSchema = z.array(z.string().max(200)).max(200);

export const notificationsRouter = createTRPCRouter({
  subscribe: publicProcedure
    .input(
      z.object({
        linkId: z.string().min(1).max(128),
        filters: filtersSchema.optional(),
        subscription: z.object({
          endpoint: z.url().max(1024),
          keys: z.object({
            p256dh: z.string().min(1).max(256),
            auth: z.string().min(1).max(128),
          }),
        }),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      enforceRateLimit("notifications.subscribe", ctx.headers, 20);
      const { userId } = ctx;
      const { endpoint, keys } = input.subscription;
      const filters = JSON.stringify(input.filters || []);

      const owned = await db.query.pushSubscriptions.findMany({
        where: eq(pushSubscriptions.endpoint, endpoint),
      });

      const foreign = owned.filter((row) => row.userId !== userId);
      if (foreign.length > 0) {
        const holdsKeys = foreign.every(
          (row) => row.p256dh === keys.p256dh && row.auth === keys.auth,
        );
        if (!holdsKeys) return { success: false };
        await db
          .update(pushSubscriptions)
          .set({ userId })
          .where(eq(pushSubscriptions.endpoint, endpoint));
      }

      const existing = owned.find((row) => row.linkId === input.linkId);

      if (existing) {
        await db
          .update(pushSubscriptions)
          .set({ filters, p256dh: keys.p256dh, auth: keys.auth })
          .where(eq(pushSubscriptions.id, existing.id));

        return { success: true };
      }

      await db.insert(pushSubscriptions).values({
        userId,
        linkId: input.linkId,
        endpoint,
        p256dh: keys.p256dh,
        auth: keys.auth,
        filters,
      });

      return { success: true };
    }),

  updateAllFilters: publicProcedure
    .input(z.object({ filters: filtersSchema }))
    .mutation(async ({ input, ctx }) => {
      await db
        .update(pushSubscriptions)
        .set({ filters: JSON.stringify(input.filters) })
        .where(eq(pushSubscriptions.userId, ctx.userId));

      return { success: true };
    }),

  unsubscribe: publicProcedure
    .input(z.object({ linkId: z.string().min(1).max(128) }))
    .mutation(async ({ input, ctx }) => {
      await db
        .delete(pushSubscriptions)
        .where(
          and(
            eq(pushSubscriptions.userId, ctx.userId),
            eq(pushSubscriptions.linkId, input.linkId),
          ),
        );

      return { success: true };
    }),
});
