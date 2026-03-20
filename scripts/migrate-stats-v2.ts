/**
 * Migrazione stats v2:
 * - Aggiunge colonna client_id alla tabella visits
 * - Aggiunge indici su visits (createdAt, ip, client_id)
 * - Aggiunge indice su push_subscriptions (link_id)
 *
 * Esegui con: pnpm tsx scripts/migrate-stats-v2.ts
 */
import path from "node:path";
import * as dotenv from "dotenv";

dotenv.config({ path: path.join(process.cwd(), ".env.local") });

import { sql } from "drizzle-orm";
import { db } from "@/lib/db";

async function run() {
  console.log("▶ Migrazione stats v2...\n");

  const steps: { name: string; query: string }[] = [
    {
      name: "Aggiunta colonna client_id su visits",
      query: `
        ALTER TABLE visits
        ADD COLUMN IF NOT EXISTS client_id VARCHAR(255) DEFAULT NULL
      `,
    },
    {
      name: "Indice idx_visits_created_at",
      query: `
        CREATE INDEX IF NOT EXISTS idx_visits_created_at
        ON visits (createdAt)
      `,
    },
    {
      name: "Indice idx_visits_ip",
      query: `
        CREATE INDEX IF NOT EXISTS idx_visits_ip
        ON visits (ip)
      `,
    },
    {
      name: "Indice idx_visits_client_id",
      query: `
        CREATE INDEX IF NOT EXISTS idx_visits_client_id
        ON visits (client_id)
      `,
    },
    {
      name: "Indice idx_push_subs_link_id",
      query: `
        CREATE INDEX IF NOT EXISTS idx_push_subs_link_id
        ON push_subscriptions (link_id)
      `,
    },
  ];

  for (const step of steps) {
    try {
      await db.execute(sql.raw(step.query));
      console.log(`  ✔ ${step.name}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      // "Duplicate key name" = indice già esistente, ok
      if (
        msg.includes("Duplicate key name") ||
        msg.includes("already exists")
      ) {
        console.log(`  ─ ${step.name} (già presente, skip)`);
      } else {
        console.error(`  ✘ ${step.name}:`, msg);
        process.exit(1);
      }
    }
  }

  console.log("\n✅ Migrazione completata.");
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
