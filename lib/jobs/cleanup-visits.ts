import { lt } from "drizzle-orm";
import { db } from "@/lib/db";
import { visits } from "@/lib/db/schema";

const RETENTION_DAYS = 180;

export async function cleanupVisits() {
  const cutoff = new Date(Date.now() - RETENTION_DAYS * 86_400_000);
  await db.delete(visits).where(lt(visits.createdAt, cutoff));
}
