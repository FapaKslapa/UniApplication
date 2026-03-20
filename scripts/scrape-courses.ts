/**
 * Scraper corsi Insubria → Cineca.
 *
 * Naviga tutte le pagine corso dell'Insubria, estrae i linkCalendarioId
 * Cineca e li salva nel DB come corsi "approved".
 *
 * Uso manuale:  pnpm db:scrape-courses
 * Cron:         integrato in server/jobs/check-updates.ts (domenica 03:00)
 */
import path from "node:path";
import * as dotenv from "dotenv";

dotenv.config({ path: path.join(process.cwd(), ".env.local") });

import { and, eq, ne } from "drizzle-orm";
import { db } from "@/lib/db";
import { courses } from "@/lib/db/schema";

// ─── Costanti ─────────────────────────────────────────────────────────────────

const BASE_URL = "https://www.uninsubria.it";
const DRUPAL_AJAX_URL = `${BASE_URL}/views/ajax`;
const CINECA_RE =
  /href="https:\/\/unins\.prod\.up\.cineca\.it\/calendarioPubblico\/linkCalendarioId=([a-f0-9]+)"[^>]*>(<[^>]+>)*([^<]+)/gi;
const ACADEMIC_YEAR_RE = /Anno Accademico (\d{4})\/(\d{4})/;
const H1_RE = /<h1[^>]*class="[^"]*page-header[^"]*"[^>]*>\s*([^<]+)/i;
const YEAR_RE = /([1-9])[°º]/;
const CAMPUS_RE = /\b(VARESE|COMO|BUSTO)\b/i;

const FETCH_DELAY_MS = 300; // delay educato tra richieste

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getCurrentAcademicYear(): string {
  const now = new Date();
  const y = now.getFullYear();
  // Nuovo anno accademico da settembre
  return now.getMonth() >= 8 ? `${y}/${y + 1}` : `${y - 1}/${y}`;
}

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function slugToName(slug: string): string {
  return slug
    .split("-")
    .map((w) => (w.length > 2 ? w[0].toUpperCase() + w.slice(1) : w))
    .join(" ");
}

// ─── Step 1: lista URL corsi via Drupal Views AJAX ────────────────────────────

async function getCourseUrls(): Promise<string[]> {
  const res = await fetch(DRUPAL_AJAX_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "X-Requested-With": "XMLHttpRequest",
      "User-Agent": "UniApp-CoursesScraper/1.0",
    },
    body: new URLSearchParams({
      view_name: "corsi_di_laurea_e_post_laurea",
      view_display_id: "block_1",
    }).toString(),
  });

  const data = (await res.json()) as Array<{ command: string; data?: string }>;
  const urls = new Set<string>();

  for (const cmd of data) {
    if (!cmd.data || cmd.data.length < 100) continue;

    // I dati HTML sono unicode-escaped nel JSON Drupal
    const decoded = cmd.data.replace(/\\u([0-9a-f]{4})/gi, (_, c: string) =>
      String.fromCharCode(parseInt(c, 16)),
    );

    const pattern =
      /href="(\/formazione\/offerta-formativa\/corsi-di-laurea\/[^"?#]+)"/g;
    let m: RegExpExecArray | null;
    // biome-ignore lint/suspicious/noAssignInExpressions: standard regex exec loop
    while ((m = pattern.exec(decoded)) !== null) {
      urls.add(m[1]);
    }
  }

  return Array.from(urls);
}

// ─── Step 2: scraping di una singola pagina corso ─────────────────────────────

interface FoundEntry {
  linkId: string;
  label: string;
  year: number;
  campus: string;
}

interface CourseData {
  name: string;
  academicYear: string;
  entries: FoundEntry[];
}

async function scrapeCourse(urlPath: string): Promise<CourseData> {
  const res = await fetch(`${BASE_URL}${urlPath}`, {
    headers: { "User-Agent": "UniApp-CoursesScraper/1.0" },
  });
  const html = await res.text();

  // Nome corso: dal tag h1 o dal path
  const h1Match = H1_RE.exec(html);
  const slug = urlPath.split("/").pop() ?? "";
  const name = h1Match
    ? h1Match[1]
        .trim()
        .replace(/&amp;/g, "&")
        .replace(/&#039;/g, "'")
    : slugToName(slug);

  // Anno accademico
  const ayMatch = ACADEMIC_YEAR_RE.exec(html);
  const academicYear = ayMatch
    ? `${ayMatch[1]}/${ayMatch[2]}`
    : getCurrentAcademicYear();

  // Estrai linkCalendarioId + label
  const entries: FoundEntry[] = [];
  let m: RegExpExecArray | null;
  CINECA_RE.lastIndex = 0;

  // biome-ignore lint/suspicious/noAssignInExpressions: standard regex exec loop
  while ((m = CINECA_RE.exec(html)) !== null) {
    const linkId = m[1];
    const rawLabel = m[3].trim();
    const label = rawLabel.replace(/&amp;/g, "&").replace(/&#039;/g, "'");

    const yearMatch = YEAR_RE.exec(label);
    const campusMatch = CAMPUS_RE.exec(label);

    entries.push({
      linkId,
      label,
      year: yearMatch ? parseInt(yearMatch[1], 10) : 1,
      campus: campusMatch
        ? campusMatch[1][0].toUpperCase() +
          campusMatch[1].slice(1).toLowerCase()
        : "",
    });
  }

  return { name, academicYear, entries };
}

// ─── Step 3: inserimento in DB ────────────────────────────────────────────────

async function upsertCourseEntry(
  courseName: string,
  entry: FoundEntry,
  academicYear: string,
): Promise<"added" | "skipped" | "updated"> {
  const existing = await db.query.courses.findFirst({
    where: eq(courses.linkId, entry.linkId),
  });

  if (existing) {
    // Esiste già con stesso linkId → skip (stesso corso stesso anno)
    if (existing.status === "approved") return "skipped";
    // Era rifiutato (anno vecchio) → ri-approva con nuovo anno
    await db
      .update(courses)
      .set({ status: "approved", academicYear, verified: true })
      .where(eq(courses.id, existing.id));
    return "updated";
  }

  const fullName = entry.campus
    ? `${courseName} - Anno ${entry.year} (${entry.campus})`
    : `${courseName} - Anno ${entry.year}`;

  await db.insert(courses).values({
    id: `scraper-${entry.linkId}`,
    name: fullName,
    linkId: entry.linkId,
    year: entry.year,
    academicYear,
    status: "approved",
    verified: true,
    addedBy: "scraper",
    userId: null,
  });

  return "added";
}

// ─── Step 4: reset corsi anno precedente ──────────────────────────────────────

async function expireOldCourses(currentAcademicYear: string): Promise<number> {
  const result = await db
    .update(courses)
    .set({ status: "rejected" })
    .where(
      and(
        eq(courses.addedBy, "scraper"),
        ne(courses.academicYear, currentAcademicYear),
        eq(courses.status, "approved"),
      ),
    );
  return (result as unknown as { affectedRows: number }).affectedRows ?? 0;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export async function scrapeAllCourses(opts?: { verbose?: boolean }) {
  const verbose = opts?.verbose ?? true;
  const log = (...args: unknown[]) => verbose && console.log(...args);

  log("▶ Scraping corsi Insubria...");

  const currentAcademicYear = getCurrentAcademicYear();
  log(`  Anno accademico corrente: ${currentAcademicYear}`);

  // 1. Reset corsi di anni precedenti
  const expired = await expireOldCourses(currentAcademicYear);
  if (expired > 0) log(`  📦 ${expired} corsi dell'anno precedente archiviati`);

  // 2. Lista URL corsi
  let urls: string[];
  try {
    urls = await getCourseUrls();
  } catch (err) {
    console.error("  ✘ Impossibile ottenere la lista corsi:", err);
    return;
  }
  log(`  📋 ${urls.length} pagine corso trovate`);

  let added = 0;
  let updated = 0;
  let skipped = 0;
  let errors = 0;

  // 3. Scraping pagine
  for (const url of urls) {
    try {
      const { name, academicYear, entries } = await scrapeCourse(url);

      if (entries.length === 0) {
        log(`  ⚠ Nessun link Cineca in: ${url}`);
        continue;
      }

      for (const entry of entries) {
        const result = await upsertCourseEntry(name, entry, academicYear);
        if (result === "added") {
          added++;
          log(`  ✔ Aggiunto: ${name} - ${entry.label}`);
        } else if (result === "updated") {
          updated++;
          log(`  ↺ Aggiornato: ${name} - ${entry.label}`);
        } else {
          skipped++;
        }
      }

      await delay(FETCH_DELAY_MS);
    } catch (err) {
      errors++;
      console.error(`  ✘ Errore su ${url}:`, err);
    }
  }

  log(`\n  ✅ Fine scraping:`);
  log(
    `     Aggiunti: ${added} | Aggiornati: ${updated} | Saltati: ${skipped} | Errori: ${errors}`,
  );
}

// ─── Entry point manuale ──────────────────────────────────────────────────────

if (
  process.argv[1]?.includes("scrape-courses") &&
  !process.argv.includes("--import")
) {
  scrapeAllCourses({ verbose: true })
    .then(() => process.exit(0))
    .catch((e) => {
      console.error(e);
      process.exit(1);
    });
}
