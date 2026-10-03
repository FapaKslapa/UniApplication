import { z } from "zod";
import { fetchCinecaEvents } from "@/lib/cineca";
import { getCurrentItalianDateTime } from "@/lib/date-utils";
import { withEdgeCache } from "@/lib/edge-cache";
import { computeAllProfessors, PROFESSORS_CACHE_URL } from "@/lib/professors";
import { toTitleCase } from "@/lib/utils";
import { publicProcedure } from "@/server/api/trpc";

export const getProfessors = publicProcedure
  .input(
    z.object({
      linkIds: z.array(z.string().max(64)).max(30).optional(),
    }),
  )
  .query(async ({ input }) => {
    if (input?.linkIds?.length) {
      const currentDate = getCurrentItalianDateTime();
      const startRange = currentDate.startOf("day");
      const endRange = startRange.plus({ days: 30 }).endOf("day");

      const lists = await Promise.all(
        input.linkIds.map(async (id) => {
          const rawEvents = await fetchCinecaEvents(id, startRange, endRange);
          return rawEvents.flatMap((e) =>
            (e.docenti || []).map((d) => toTitleCase(`${d.cognome} ${d.nome}`)),
          );
        }),
      );
      return Array.from(new Set(lists.flat()))
        .filter((p) => p !== "N/A" && p.trim() !== "")
        .sort();
    }

    return withEdgeCache(PROFESSORS_CACHE_URL, 20 * 60, () =>
      computeAllProfessors(30),
    );
  });
