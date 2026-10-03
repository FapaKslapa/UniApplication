import { db } from "@/lib/db";
import { checkUpdates } from "@/lib/jobs/check-updates";
import { cleanupVisits } from "@/lib/jobs/cleanup-visits";
import { examReminders } from "@/lib/jobs/exam-reminders";
import { refreshProfessors } from "@/lib/jobs/refresh-professors";
import { scrapeAllCourses } from "@/lib/jobs/scrape-courses";
import { syncExams } from "@/lib/jobs/sync-exams";
import { isCronRequestAuthorized } from "@/server/cron-auth";

const jobs = {
  "check-updates": async () => {
    await checkUpdates();
    try {
      await examReminders();
    } catch (error) {
      console.error("Exam reminders failed:", error);
    }
    return { ok: true };
  },
  "scrape-courses": () => scrapeAllCourses(db),
  "refresh-professors": async () => {
    await cleanupVisits();
    const result = await refreshProfessors();
    try {
      await syncExams();
    } catch (error) {
      console.error("Exam sync failed:", error);
    }
    return result;
  },
} as const;

export async function POST(
  req: Request,
  { params }: { params: Promise<{ job: string }> },
) {
  if (!(await isCronRequestAuthorized(req))) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { job } = await params;
  if (!(job in jobs)) {
    return Response.json({ error: "Unknown job" }, { status: 404 });
  }

  try {
    const result = await jobs[job as keyof typeof jobs]();
    return Response.json(result);
  } catch (error) {
    console.error(`Cron job ${job} failed:`, error);
    return Response.json({ error: "Job failed" }, { status: 500 });
  }
}
