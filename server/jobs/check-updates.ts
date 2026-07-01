import path from "node:path";
import * as dotenv from "dotenv";

dotenv.config({ path: path.join(process.cwd(), ".env.local") });

import { eq } from "drizzle-orm";
import cron from "node-cron";
import { db } from "@/lib/db";
import { courseSnapshots, pushSubscriptions } from "@/lib/db/schema";
import { generateCourseHash, sendPushNotification } from "@/lib/notifications";
import { scrapeAllCourses } from "@/scripts/scrape-courses";
import { appRouter } from "@/server/api/root";
import { createCallerFactory } from "@/server/api/trpc";

const createCaller = createCallerFactory(appRouter);

type TimetableEvent = {
  title: string;
  date: string;
  time: string;
  location: string;
  professor: string;
};

export type TimetableChange = TimetableEvent & {
  type: "ADDED" | "CANCELED" | "MODIFIED";
  diffs?: {
    time?: { old: string; new: string };
    location?: { old: string; new: string };
    professor?: { old: string; new: string };
  };
};

async function checkUpdates() {
  console.log("Checking updates...");

  const caller = createCaller({
    headers: new Headers(),
    isAdmin: true,
    userId: "system-job",
  });

  const activeSubs = await db.query.pushSubscriptions.findMany({
    columns: { linkId: true },
  });

  const linkIds: string[] = Array.from(
    new Set(activeSubs.map((s: any) => s.linkId as string)),
  );

  if (linkIds.length === 0) {
    return;
  }

  for (const linkId of linkIds) {
    try {
      const now = new Date();
      const orario = (await caller.orario.getMonthlyOrario({
        linkId,
        year: now.getFullYear(),
        month: now.getMonth() + 1,
        location: "Tutte",
      })) as TimetableEvent[];

      const newHash = generateCourseHash(orario);
      const snapshot = await db.query.courseSnapshots.findFirst({
        where: eq(courseSnapshots.linkId, linkId),
      });

      if (!snapshot) {
        await db.insert(courseSnapshots).values({
          linkId,
          lastHash: newHash,
          lastData: JSON.stringify(orario),
        });
        continue;
      }

      if (snapshot.lastHash !== newHash) {
        let oldData: TimetableEvent[] = [];
        if (snapshot.lastData) {
          try {
            oldData = JSON.parse(snapshot.lastData) as TimetableEvent[];
            if (!Array.isArray(oldData)) oldData = [];
          } catch (_e) {
            console.error(
              `Malformed JSON in lastData for ${linkId}. Content:`,
              snapshot.lastData.substring(0, 100),
            );
            oldData = [];
          }
        }

        const today = new Date().toISOString().split("T")[0];
        const filterCurrent = (events: TimetableEvent[]) =>
          events.filter((e) => e.date >= today);

        const changes = findDetailedChanges(
          filterCurrent(oldData),
          filterCurrent(orario as TimetableEvent[]),
        );

        if (changes.length === 0) {
          await db
            .update(courseSnapshots)
            .set({
              lastHash: newHash,
              lastData: JSON.stringify(orario),
              lastChanges: null,
            })
            .where(eq(courseSnapshots.linkId, linkId));
          continue;
        }

        const subscriptions = await db.query.pushSubscriptions.findMany({
          where: eq(pushSubscriptions.linkId, linkId),
        });

        for (const sub of subscriptions) {
          let hidden: string[] = [];
          if (sub.filters) {
            try {
              hidden = JSON.parse(sub.filters) as string[];
              if (!Array.isArray(hidden)) hidden = [];
            } catch (_e) {
              console.error(
                `Malformed JSON in filters for user ${sub.userId}. Content:`,
                sub.filters,
              );
              hidden = [];
            }
          }

          const relevantChanges = changes.filter(
            (c) => !hidden.includes(c.title),
          );

          if (relevantChanges.length > 0) {
            const subjectList =
              Array.from(new Set(relevantChanges.map((c) => c.title)))
                .slice(0, 2)
                .join(", ") + (relevantChanges.length > 2 ? "..." : "");

            await sendPushNotification(
              sub.userId,
              linkId,
              "Aggiornamento Orario",
              `Variazione rilevata per: ${subjectList}. Controlla i dettagli nell'app.`,
              { changes: relevantChanges },
            );
          }
        }

        await db
          .update(courseSnapshots)
          .set({
            lastHash: newHash,
            lastData: JSON.stringify(orario),
            lastChanges: JSON.stringify(changes),
            lastUpdated: new Date(),
          })
          .where(eq(courseSnapshots.linkId, linkId));
      }
    } catch (err) {
      console.error(`Error for ${linkId}:`, err);
    }
  }
}

function findDetailedChanges(
  oldEvents: TimetableEvent[],
  newEvents: TimetableEvent[],
): TimetableChange[] {
  const changes: TimetableChange[] = [];

  const getEventId = (e: TimetableEvent) => `${e.date}-${e.title}`;

  const oldMap = new Map<string, TimetableEvent[]>();
  for (const e of oldEvents) {
    const id = getEventId(e);
    if (!oldMap.has(id)) oldMap.set(id, []);
    oldMap.get(id)?.push(e);
  }

  const newMap = new Map<string, TimetableEvent[]>();
  for (const e of newEvents) {
    const id = getEventId(e);
    if (!newMap.has(id)) newMap.set(id, []);
    newMap.get(id)?.push(e);
  }

  for (const e of newEvents) {
    const id = getEventId(e);
    const matchingOld = oldMap.get(id);

    if (!matchingOld) {
      changes.push({ type: "ADDED", ...e });
      continue;
    }

    const exactMatch = matchingOld.find(
      (o) =>
        o.time === e.time &&
        o.location === e.location &&
        o.professor === e.professor,
    );

    if (!exactMatch) {
      const timeMatch = matchingOld.find((o) => o.time === e.time);
      if (timeMatch) {
        const diffs: TimetableChange["diffs"] = {};
        if (timeMatch.location !== e.location)
          diffs.location = { old: timeMatch.location, new: e.location };
        if (timeMatch.professor !== e.professor)
          diffs.professor = { old: timeMatch.professor, new: e.professor };

        if (Object.keys(diffs).length > 0) {
          changes.push({ type: "MODIFIED", ...e, diffs });
        }
      } else {
        const firstOld = matchingOld[0];
        changes.push({
          type: "MODIFIED",
          ...e,
          diffs: { time: { old: firstOld.time, new: e.time } },
        });
      }
    }
  }

  for (const o of oldEvents) {
    const id = getEventId(o);
    const matchingNew = newMap.get(id);
    if (!matchingNew?.find((n) => n.time === o.time)) {
      changes.push({ type: "CANCELED", ...o });
    }
  }

  return changes;
}

if (process.argv.includes("--cron")) {
  cron.schedule("*/20 * * * *", () => {
    checkUpdates().catch(console.error);
  });

  cron.schedule("0 3 * * 0", () => {
    console.log("[cron] Avvio scraping settimanale corsi Insubria...");
    scrapeAllCourses({ verbose: true }).catch(console.error);
  });
} else {
  checkUpdates()
    .then(() => {
      process.exit(0);
    })
    .catch((_err) => {
      process.exit(1);
    });
}
