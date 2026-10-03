import { sql } from "drizzle-orm";
import { db } from "@/lib/db";

const STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS exams (
    id TEXT PRIMARY KEY NOT NULL,
    source TEXT NOT NULL,
    external_id TEXT NOT NULL,
    link_id TEXT NOT NULL,
    subject TEXT NOT NULL,
    course_name TEXT,
    starts_at INTEGER NOT NULL,
    ends_at INTEGER,
    kind TEXT,
    aula TEXT,
    professor TEXT,
    reg_opens_at INTEGER,
    reg_closes_at INTEGER,
    reg_confirmed INTEGER NOT NULL DEFAULT 0,
    canceled INTEGER NOT NULL DEFAULT 0,
    updated_at INTEGER NOT NULL DEFAULT (unixepoch())
  )`,
  "CREATE UNIQUE INDEX IF NOT EXISTS idx_exams_source_external ON exams (source, external_id)",
  "CREATE INDEX IF NOT EXISTS idx_exams_starts_at ON exams (starts_at)",
  "CREATE INDEX IF NOT EXISTS idx_exams_link_id ON exams (link_id)",
  `CREATE TABLE IF NOT EXISTS exam_calendars (
    exam_id TEXT NOT NULL,
    link_id TEXT NOT NULL,
    PRIMARY KEY (exam_id, link_id)
  )`,
  "CREATE INDEX IF NOT EXISTS idx_exam_calendars_link_id ON exam_calendars (link_id)",
  `CREATE TABLE IF NOT EXISTS exam_follows (
    user_id TEXT NOT NULL,
    exam_id TEXT NOT NULL,
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    PRIMARY KEY (user_id, exam_id)
  )`,
  `CREATE TABLE IF NOT EXISTS exam_reminders_sent (
    user_id TEXT NOT NULL,
    exam_id TEXT NOT NULL,
    kind TEXT NOT NULL,
    sent_at INTEGER NOT NULL DEFAULT (unixepoch()),
    PRIMARY KEY (user_id, exam_id, kind)
  )`,
];

let ready: Promise<void> | null = null;

async function run() {
  for (const statement of STATEMENTS) {
    await db.run(sql.raw(statement));
  }
}

export function ensureExamTables(): Promise<void> {
  if (!ready) {
    ready = run().catch((error) => {
      ready = null;
      throw error;
    });
  }
  return ready;
}
