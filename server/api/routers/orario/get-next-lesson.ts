import { z } from "zod";
import {
  addDays,
  formatDate,
  getCurrentItalianDateTime,
  getDayOfWeek,
} from "@/lib/date-utils";
import { publicProcedure } from "@/server/api/trpc";
import { fetchRawEvents, processEvents } from "./events";
import { dayNames, findNextLesson } from "./next-lesson";
import {
  dayOffsetSchema,
  linkIdSchema,
  linkIdsSchema,
  nameSchema,
  professorNameSchema,
  resolveLinkIds,
} from "./schemas";

export const getNextLesson = publicProcedure
  .input(
    z.object({
      dayOffset: dayOffsetSchema,
      name: nameSchema,
      linkId: linkIdSchema,
      linkIds: linkIdsSchema,
      professorName: professorNameSchema,
    }),
  )
  .query(async ({ input }) => {
    const ids = await resolveLinkIds(input);

    if (ids.length === 0) {
      return { hasLessons: false, lessons: [], dayName: "" };
    }

    const allRawEvents = await Promise.all(
      ids.map((id) => fetchRawEvents(input.dayOffset, id)),
    );

    const orarioData = processEvents(allRawEvents.flat(), input.professorName);

    const currentDate = getCurrentItalianDateTime();
    const targetDate = addDays(currentDate, input.dayOffset);
    const adjustedDay = getDayOfWeek(targetDate);

    const daySchedule = orarioData.find((day) => day.day === adjustedDay);

    if (!daySchedule || daySchedule.events.length === 0) {
      return {
        hasLessons: false,
        dayName: dayNames[adjustedDay],
        date: formatDate(targetDate),
        lessons: [],
      };
    }

    const nextLessonInfo = findNextLesson(
      daySchedule.events,
      currentDate,
      input.dayOffset === 0,
    );

    return {
      hasLessons: true,
      dayName: dayNames[adjustedDay],
      date: formatDate(targetDate),
      lessons: daySchedule.events,
      nextLesson: nextLessonInfo,
      totalLessons: daySchedule.events.length,
    };
  });
