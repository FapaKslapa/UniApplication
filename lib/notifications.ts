import crypto from "node:crypto";
import { and, eq } from "drizzle-orm";
import webpush from "web-push";
import { db } from "@/lib/db";
import { pushSubscriptions } from "@/lib/db/schema";

let vapidConfigured = false;

function configureVapid() {
  if (vapidConfigured) return;
  webpush.setVapidDetails(
    "mailto:stefanomarocco0@gmail.com",
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "",
    process.env.VAPID_PRIVATE_KEY || "",
  );
  vapidConfigured = true;
}

interface TimetableEvent {
  title: string;
  date: string;
  time: string;
  location: string;
  professor: string;
}

export function generateCourseHash(events: TimetableEvent[]): string {
  const relevantData = events
    .map(({ title, date, time, location, professor }) => ({
      t: title,
      d: date,
      ti: time,
      l: location,
      p: professor,
    }))
    .sort((a, b) => (a.d + a.ti).localeCompare(b.d + b.ti));

  return crypto
    .createHash("sha256")
    .update(JSON.stringify(relevantData))
    .digest("hex");
}

export async function sendPushNotification(
  userId: string,
  linkId: string,
  title: string,
  body: string,
  data?: Record<string, unknown>,
) {
  configureVapid();

  const subs = await db.query.pushSubscriptions.findMany({
    where: and(
      eq(pushSubscriptions.userId, userId),
      eq(pushSubscriptions.linkId, linkId),
    ),
  });

  for (const sub of subs) {
    try {
      await webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth,
          },
        },
        JSON.stringify({ title, body, ...data }),
      );
    } catch (error) {
      const webPushError = error as { statusCode?: number };
      if (webPushError.statusCode === 410 || webPushError.statusCode === 404) {
        await db
          .delete(pushSubscriptions)
          .where(eq(pushSubscriptions.id, sub.id));
      } else {
        console.error("Push error:", error);
      }
    }
  }
}
