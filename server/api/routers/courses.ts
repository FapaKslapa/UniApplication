import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  addCourse,
  approveCourse,
  deleteCourse,
  getAllCoursesForAdmin,
  getPendingCourses,
  getVisibleCourses,
  rejectCourse,
  verifyCourse,
} from "@/lib/courses";
import {
  adminProcedure,
  createTRPCRouter,
  publicProcedure,
} from "@/server/api/trpc";
import { enforceRateLimit } from "@/server/rate-limit";

export const coursesRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    return await getVisibleCourses(ctx.userId);
  }),

  getAllForAdmin: adminProcedure.query(async () => {
    return await getAllCoursesForAdmin();
  }),

  getPending: adminProcedure.query(async () => {
    return await getPendingCourses();
  }),

  add: publicProcedure
    .input(
      z.object({
        name: z.string().min(1).max(200),
        linkId: z.string().min(1).max(128),
        year: z.number().int().min(1).max(6).optional(),
        academicYear: z.string().max(20).optional(),
        addedBy: z.enum(["user", "admin"]).default("user"),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.isAdmin) enforceRateLimit("courses.add", ctx.headers, 5);
      const isAdmin = ctx.isAdmin;
      const status =
        isAdmin && input.addedBy === "admin" ? "approved" : "pending";
      const verified = isAdmin && input.addedBy === "admin";

      return await addCourse({
        ...input,
        userId: ctx.userId,
        status,
        verified,
      });
    }),

  approve: adminProcedure
    .input(z.object({ courseId: z.string() }))
    .mutation(async ({ input }) => {
      try {
        const success = await approveCourse(input.courseId);
        return { success };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            error instanceof Error
              ? error.message
              : "Errore durante l'approvazione",
        });
      }
    }),

  reject: adminProcedure
    .input(z.object({ courseId: z.string() }))
    .mutation(async ({ input }) => {
      const success = await rejectCourse(input.courseId);
      return { success };
    }),

  verify: adminProcedure
    .input(z.object({ courseId: z.string() }))
    .mutation(async ({ input }) => {
      const success = await verifyCourse(input.courseId);
      return { success };
    }),

  delete: adminProcedure
    .input(z.object({ courseId: z.string() }))
    .mutation(async ({ input }) => {
      const success = await deleteCourse(input.courseId);
      return { success };
    }),
});
