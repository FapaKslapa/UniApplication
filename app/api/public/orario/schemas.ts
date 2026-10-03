import { z } from "zod";

const linkIdSchema = z.string().regex(/^[A-Za-z0-9_-]{1,64}$/);
const dayOffsetSchema = z.number().int().min(-60).max(60);

export const getOrarioBodySchema = z.object({
  name: z.string().min(1).max(200).optional(),
  linkId: linkIdSchema.optional(),
});

export const nextLessonQuerySchema = z.object({
  dayOffset: z.coerce.number().pipe(dayOffsetSchema).default(0),
  linkId: linkIdSchema.optional(),
});

const jsonHeaders = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
};

export function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: jsonHeaders });
}
