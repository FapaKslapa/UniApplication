import { db } from "@/lib/db";
import { checkUpdates } from "@/lib/jobs/check-updates";
import { scrapeAllCourses } from "@/lib/jobs/scrape-courses";

const jobs = {
  "check-updates": async () => {
    await checkUpdates();
    return { ok: true };
  },
  "scrape-courses": () => scrapeAllCourses(db),
} as const;

export async function POST(
  req: Request,
  { params }: { params: Promise<{ job: string }> },
) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("x-cron-secret") !== secret) {
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
    const message = error instanceof Error ? error.message : "Job failed";
    console.error(`Cron job ${job} failed:`, error);
    return Response.json({ error: message }, { status: 500 });
  }
}
