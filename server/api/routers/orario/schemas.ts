import { z } from "zod";
import { getVisibleCourses } from "@/lib/courses";

export const locationSchema = z
  .enum(["Varese", "Como", "Tutte"])
  .default("Tutte");
export const nameSchema = z.string().max(100).default("INFORMATICA");
export const dayOffsetSchema = z.number().int().min(-60).max(60).default(0);
export const linkIdSchema = z.string().max(64).optional();
export const linkIdsSchema = z.array(z.string().max(64)).max(30).optional();
export const professorNameSchema = z.string().max(100).optional();

export const resolveLinkIds = async (input: {
  linkId?: string;
  linkIds?: string[];
  professorName?: string;
}) => {
  const ids = input.linkIds || (input.linkId ? [input.linkId] : []);

  if (input.professorName || ids.length === 0) {
    const visibleCourses = await getVisibleCourses();
    return visibleCourses.map((c) => c.linkId);
  }

  return ids;
};
