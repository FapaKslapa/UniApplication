import { sql } from "drizzle-orm";
import { db } from "@/lib/db";

let pending: Promise<void> | undefined;

async function createAuthTables() {
  await db.run(sql`
    CREATE TABLE IF NOT EXISTS "rateLimit" (
      "id" text PRIMARY KEY NOT NULL,
      "key" text NOT NULL,
      "count" integer NOT NULL,
      "lastRequest" integer NOT NULL
    )
  `);
  await db.run(
    sql`CREATE UNIQUE INDEX IF NOT EXISTS "rateLimit_key_unique" ON "rateLimit" ("key")`,
  );
}

export function ensureAuthTables() {
  pending ??= createAuthTables().catch((error) => {
    pending = undefined;
    throw error;
  });
  return pending;
}
