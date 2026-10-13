import { z } from "zod";
import { getVisibleCourses } from "@/lib/courses";
import {
  addDays,
  getCurrentItalianDateTime,
  getDayOfWeek,
} from "@/lib/date-utils";
import { setEdgeCache, withEdgeCache } from "@/lib/edge-cache";
import { FRESH_HEADER } from "@/lib/freshRequest";
import { publicProcedure } from "@/server/api/trpc";
import { fetchRawEvents, processEvents } from "./events";
import {
  dayOffsetSchema,
  linkIdSchema,
  linkIdsSchema,
  nameSchema,
  professorNameSchema,
} from "./schemas";

const COURSES_TTL_SECONDS = 120;
const PROFESSOR_TTL_SECONDS = 120;

async function cached<T>(
  key: string,
  ttl: number,
  wantsFresh: boolean,
  compute: () => Promise<T>,
): Promise<T> {
  if (!wantsFresh) return withEdgeCache(key, ttl, compute);
  const result = await compute();
  await setEdgeCache(key, ttl, result);
  return result;
}

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
  .query(async ({ input, ctx }) => {
    const wantsFresh = ctx.headers.get(FRESH_HEADER) === "1";
    const explicitIds = input.linkIds || (input.linkId ? [input.linkId] : []);

    if (input.professorName) {
      const targetDate = addDays(getCurrentItalianDateTime(), input.dayOffset);
      const weekStart = targetDate
        .minus({ days: getDayOfWeek(targetDate) })
        .toISODate();
      const cacheKey = `https://orario-cache.internal/orario/professor/${encodeURIComponent(input.professorName)}/${weekStart}`;

      const computeProfessor = async () => {
        const visibleCourses = await getVisibleCourses();
        const ids = visibleCourses.map((c) => c.linkId);
        const allRawEvents = await Promise.all(
          ids.map((id) => fetchRawEvents(input.dayOffset, id)),
        );
        return processEvents(allRawEvents.flat(), input.professorName);
      };

      return cached(
        cacheKey,
        PROFESSOR_TTL_SECONDS,
        wantsFresh,
        computeProfessor,
      );
    }

    const ids =
      explicitIds.length > 0
        ? explicitIds
        : (await getVisibleCourses()).map((c) => c.linkId);

    if (ids.length === 0) return [];

    const targetDate = addDays(getCurrentItalianDateTime(), input.dayOffset);
    const weekStart = targetDate
      .minus({ days: getDayOfWeek(targetDate) })
      .toISODate();
    const cacheKey = `https://orario-cache.internal/orario/courses/${[...ids].sort().join(",")}/${weekStart}`;

    return cached(cacheKey, COURSES_TTL_SECONDS, wantsFresh, async () => {
      const allRawEvents = await Promise.all(
        ids.map((id) => fetchRawEvents(input.dayOffset, id)),
      );
      return processEvents(allRawEvents.flat(), undefined);
    });
  });
