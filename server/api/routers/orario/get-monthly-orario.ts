import { DateTime } from "luxon";
import { z } from "zod";
import { fetchCinecaEvents } from "@/lib/cineca";
import { publicProcedure } from "@/server/api/trpc";
import { mapEvent } from "./events";
import {
  linkIdSchema,
  linkIdsSchema,
  nameSchema,
  professorNameSchema,
  resolveLinkIds,
} from "./schemas";

export const getMonthlyOrario = publicProcedure
  .input(
    z.object({
      name: nameSchema,
      year: z.number(),
      month: z.number(),
      linkId: linkIdSchema,
      linkIds: linkIdsSchema,
      professorName: professorNameSchema,
    }),
  )
  .query(async ({ input }) => {
    const ids = await resolveLinkIds(input);

    if (ids.length === 0) return [];

    const startRange = DateTime.fromObject(
      { year: input.year, month: input.month, day: 1 },
      { zone: "Europe/Rome" },
    ).startOf("month");
    const endRange = startRange.endOf("month");

    const allRawEvents = await Promise.all(
      ids.map((id) => fetchCinecaEvents(id, startRange, endRange)),
    );

    const processed = allRawEvents
      .flat()
      .map((event) => mapEvent(event, input.professorName))
      .filter((e): e is NonNullable<typeof e> => e !== null);

    return processed.filter(
      (val, index, self) =>
        index ===
        self.findIndex(
          (t) =>
            t.date === val.date && t.time === val.time && t.title === val.title,
        ),
    );
  });
