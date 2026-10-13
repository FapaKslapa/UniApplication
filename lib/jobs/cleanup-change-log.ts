import { lt } from "drizzle-orm";
import { db } from "@/lib/db";
import { changeLog } from "@/lib/db/schema";

const RETENTION_DAYS = 30;

export async function cleanupChangeLog() {
  const cutoff = new Date(Date.now() - RETENTION_DAYS * 86_400_000);
  await db.delete(changeLog).where(lt(changeLog.detectedAt, cutoff));
}
