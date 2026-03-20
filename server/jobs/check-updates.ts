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

  const linkIds = Array.from(new Set(activeSubs.map((s) => s.linkId)));

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

  // Mappa degli eventi vecchi per un confronto rapido
  const oldMap = new Map<string, TimetableEvent[]>();
  for (const e of oldEvents) {
    const id = getEventId(e);
    if (!oldMap.has(id)) oldMap.set(id, []);
    oldMap.get(id)?.push(e);
  }

  // Mappa degli eventi nuovi
  const newMap = new Map<string, TimetableEvent[]>();
  for (const e of newEvents) {
    const id = getEventId(e);
    if (!newMap.has(id)) newMap.set(id, []);
    newMap.get(id)?.push(e);
  }

  // 1. Cerchiamo Nuovi e Modificati
  for (const e of newEvents) {
    const id = getEventId(e);
    const matchingOld = oldMap.get(id);

    if (!matchingOld) {
      // È una nuova lezione (non esisteva in quella data con quel titolo)
      changes.push({ type: "ADDED", ...e });
      continue;
    }

    // Cerchiamo se esiste un match esatto per tempo
    const exactMatch = matchingOld.find(
      (o) =>
        o.time === e.time &&
        o.location === e.location &&
        o.professor === e.professor,
    );

    if (!exactMatch) {
      // Se non c'è match esatto, cerchiamo quello con lo stesso orario ma campi diversi (Modifica)
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
        // Se cambia l'orario, lo consideriamo come modifica dell'orario della stessa lezione
        const firstOld = matchingOld[0]; // Assunzione semplificata
        changes.push({
          type: "MODIFIED",
          ...e,
          diffs: { time: { old: firstOld.time, new: e.time } },
        });
      }
    }
  }

  // 2. Cerchiamo Annullati
  for (const o of oldEvents) {
    const id = getEventId(o);
    const matchingNew = newMap.get(id);
    if (!matchingNew || !matchingNew.find((n) => n.time === o.time)) {
      changes.push({ type: "CANCELED", ...o });
    }
  }

  return changes;
}

if (process.argv.includes("--cron")) {
  // Ogni 20 minuti: controlla aggiornamenti orario
  cron.schedule("*/20 * * * *", () => {
    checkUpdates().catch(console.error);
  });

  // Ogni domenica alle 03:00: scopri nuovi corsi e resetta anno precedente
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
