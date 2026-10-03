import { createTRPCRouter } from "@/server/api/trpc";
import { getLatestChanges } from "./get-latest-changes";
import { getMonthlyOrario } from "./get-monthly-orario";
import { getNextLesson } from "./get-next-lesson";
import { getOrario } from "./get-orario";
import { getProfessors } from "./get-professors";
import { getSubjects } from "./get-subjects";

export const orarioRouter = createTRPCRouter({
  getOrario,
  getMonthlyOrario,
  getNextLesson,
  getSubjects,
  getProfessors,
  getLatestChanges,
});
