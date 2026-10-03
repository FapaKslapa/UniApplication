import { z } from "zod";
import { fetchCinecaEvents } from "@/lib/cineca";
import { getCurrentItalianDateTime } from "@/lib/date-utils";
import { withEdgeCache } from "@/lib/edge-cache";
import { publicProcedure } from "@/server/api/trpc";
import { professorName, subjectTitle } from "./events";
import {
  linkIdSchema,
  linkIdsSchema,
  professorNameSchema,
  resolveLinkIds,
} from "./schemas";

export const getSubjects = publicProcedure
  .input(
    z.object({
      linkId: linkIdSchema,
      linkIds: linkIdsSchema,
      professorName: professorNameSchema,
    }),
  )
  .query(async ({ input }) => {
    const ids = await resolveLinkIds(input);

    if (ids.length === 0) return [];

    const compute = async () => {
      const currentDate = getCurrentItalianDateTime();
      const startRange = currentDate.startOf("day");
      const endRange = startRange.plus({ days: 45 }).endOf("day");

      const fetchSubjectsForId = async (id: string) => {
        try {
          const rawEvents = await fetchCinecaEvents(id, startRange, endRange);

          const subjects: string[] = [];
          for (const e of rawEvents) {
            if (
              input.professorName &&
              professorName(e).toLowerCase() !==
                input.professorName.toLowerCase()
            )
              continue;
            subjects.push(subjectTitle(e));
          }
          return subjects;
        } catch (error) {
          console.error(`Failed to fetch subjects for ${id}:`, error);
          return [];
        }
      };

      const allSubjectsLists = await Promise.all(ids.map(fetchSubjectsForId));
      const combinedSubjects = new Set(allSubjectsLists.flat());

      return Array.from(combinedSubjects).sort();
    };

    const isAggregate = !!(input.professorName || !input.linkIds?.length);
    if (!isAggregate) return compute();

    return withEdgeCache(
      `https://orario-cache.internal/subjects?professor=${encodeURIComponent(input.professorName ?? "")}`,
      20 * 60,
      compute,
    );
  });
