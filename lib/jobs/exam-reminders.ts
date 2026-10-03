import { and, eq, gte } from "drizzle-orm";
import { DateTime } from "luxon";
import { db } from "@/lib/db";
import { ensureExamTables } from "@/lib/db/ensure-exam-tables";
import {
  type DbExam,
  examFollows,
  examRemindersSent,
  exams,
  type pushSubscriptions,
} from "@/lib/db/schema";
import { sendPushToUser } from "@/lib/notifications";

const ZONE = "Europe/Rome";
const HOUR_MS = 60 * 60 * 1000;
const EVENING_HOUR = 17;
const REMINDER_URL = "/?view=esami";

type ReminderKind = "reg_open" | "reg_close" | "exam_tomorrow";

type Reminder = { kind: ReminderKind; title: string; body: string };

const formatWhen = (date: Date) =>
  DateTime.fromJSDate(date).setZone(ZONE).toFormat("dd/MM HH:mm");

function dueReminders(exam: DbExam, now: Date): Reminder[] {
  const when = `${exam.subject} · ${formatWhen(exam.startsAt)}`;
  const due: Reminder[] = [];
  const nowMs = now.getTime();
  const opens = exam.regOpensAt?.getTime();
  const closes = exam.regClosesAt?.getTime();

  if (opens !== undefined && closes !== undefined) {
    if (nowMs >= opens && nowMs < closes) {
      due.push({
        kind: "reg_open",
        title: exam.regConfirmed
          ? "Iscrizioni aperte"
          : "Iscrizioni previste aperte",
        body: when,
      });
    }
  }

  if (
    closes !== undefined &&
    closes > nowMs &&
    closes - nowMs <= 24 * HOUR_MS
  ) {
    due.push({
      kind: "reg_close",
      title: exam.regConfirmed
        ? "Ultime ore per iscriverti"
        : "Ultime ore previste per iscriverti",
      body: when,
    });
  }

  const romeNow = DateTime.fromJSDate(now).setZone(ZONE);
  const tomorrow = romeNow.plus({ days: 1 }).toISODate();
  const examDay = DateTime.fromJSDate(exam.startsAt).setZone(ZONE).toISODate();
  if (romeNow.hour >= EVENING_HOUR && examDay === tomorrow) {
    due.push({
      kind: "exam_tomorrow",
      title: "Domani hai l'esame",
      body: when,
    });
  }

  return due;
}

async function claim(userId: string, examId: string, kind: ReminderKind) {
  const inserted = await db
    .insert(examRemindersSent)
    .values({ userId, examId, kind })
    .onConflictDoNothing()
    .returning({ kind: examRemindersSent.kind });
  return inserted.length > 0;
}

export async function examReminders() {
  await ensureExamTables();

  const now = new Date();
  const rows = await db
    .select({ userId: examFollows.userId, exam: exams })
    .from(examFollows)
    .innerJoin(exams, eq(exams.id, examFollows.examId))
    .where(
      and(
        eq(exams.canceled, false),
        gte(exams.startsAt, new Date(now.getTime() - HOUR_MS)),
      ),
    );

  if (rows.length === 0) return { sent: 0 };

  const subscribed = new Set(
    (
      await db.query.pushSubscriptions.findMany({
        columns: { userId: true },
      })
    ).map(
      (s: Pick<typeof pushSubscriptions.$inferSelect, "userId">) => s.userId,
    ),
  );

  let sent = 0;
  for (const { userId, exam } of rows) {
    if (!subscribed.has(userId)) continue;
    for (const reminder of dueReminders(exam, now)) {
      try {
        if (!(await claim(userId, exam.id, reminder.kind))) continue;
        await sendPushToUser(userId, reminder.title, reminder.body, {
          url: REMINDER_URL,
        });
        sent++;
      } catch (error) {
        console.error(`Exam reminder failed for ${userId}:`, error);
      }
    }
  }

  return { sent };
}
