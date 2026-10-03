import { z } from "zod";
import { getVisibleCourses } from "@/lib/courses";
import {
  addDays,
  getCurrentItalianDateTime,
  getDayOfWeek,
} from "@/lib/date-utils";
import { withEdgeCache } from "@/lib/edge-cache";
import { publicProcedure } from "@/server/api/trpc";
import { fetchRawEvents, processEvents } from "./events";
import {
  dayOffsetSchema,
  linkIdSchema,
  linkIdsSchema,
  nameSchema,
  professorNameSchema,
} from "./schemas";

export const getOrario = publicProcedure
  .input(
    z.object({
      name: nameSchema,
      dayOffset: dayOffsetSchema,
      linkId: linkIdSchema,
      linkIds: linkIdsSchema,
      professorName: professorNameSchema,
    }),
  )
  .query(async ({ input }) => {
    const explicitIds = input.linkIds || (input.linkId ? [input.linkId] : []);

    if (input.professorName) {
      const targetDate = addDays(getCurrentItalianDateTime(), input.dayOffset);
      const weekStart = targetDate
        .minus({ days: getDayOfWeek(targetDate) })
        .toISODate();
      const cacheKey = `https://orario-cache.internal/orario/professor/${encodeURIComponent(input.professorName)}/${weekStart}`;

      return withEdgeCache(cacheKey, 15 * 60, async () => {
        const visibleCourses = await getVisibleCourses();
        const ids = visibleCourses.map((c) => c.linkId);
        const allRawEvents = await Promise.all(
          ids.map((id) => fetchRawEvents(input.dayOffset, id)),
        );
        return processEvents(allRawEvents.flat(), input.professorName);
      });
    }

    const ids =
      explicitIds.length > 0
        ? explicitIds
        : (await getVisibleCourses()).map((c) => c.linkId);

    if (ids.length === 0) return [];

    const allRawEvents = await Promise.all(
      ids.map((id) => fetchRawEvents(input.dayOffset, id)),
    );

    return processEvents(allRawEvents.flat(), undefined);
  });
