import { and, eq, ne } from "drizzle-orm";
import type { BaseSQLiteDatabase } from "drizzle-orm/sqlite-core";
import * as schema from "@/lib/db/schema";

const { courses } = schema;

export type AppDatabase = BaseSQLiteDatabase<
  "sync" | "async",
  unknown,
  typeof schema
>;

const BASE_URL = "https://www.uninsubria.it";
const DRUPAL_AJAX_URL = `${BASE_URL}/views/ajax`;
const COURSE_LINK_RE =
  /href="(\/formazione\/offerta-formativa\/corsi-di-laurea\/[^"?#]+)"/g;
const CINECA_RE =
  /href="https:\/\/unins\.prod\.up\.cineca\.it\/calendarioPubblico\/linkCalendarioId=([a-f0-9]+)"[^>]*>(<[^>]+>)*([^<]+)/gi;
const ACADEMIC_YEAR_RE = /Anno Accademico (\d{4})\/(\d{4})/;
const H1_RE = /<h1[^>]*>\s*([^<]+?)\s*<\/h1>/i;
const ARABIC_YEAR_RE = /([1-9])\s*[°º]/;
const ROMAN_YEAR_RE = /\b(VI|IV|V|I{1,3})\s*[°º]/i;
const ROMAN_YEARS: Record<string, number> = {
  I: 1,
  II: 2,
  III: 3,
  IV: 4,
  V: 5,
  VI: 6,
};
const CAMPUS_RE = /\b(VARESE|COMO|BUSTO)\b/i;

const FETCH_DELAY_MS = 300;

const LOWERCASE_WORDS = new Set([
  "e",
  "ed",
  "di",
  "del",
  "della",
  "dello",
  "dei",
  "delle",
  "degli",
  "per",
  "la",
  "le",
  "il",
  "lo",
  "alla",
  "nei",
  "and",
  "for",
  "the",
  "of",
]);
const ACCENTS: Record<string, string> = {
  a: "à",
  e: "è",
  i: "ì",
  o: "ò",
  u: "ù",
};

export interface FoundEntry {
  linkId: string;
  label: string;
  year: number;
  campus: string;
}

export interface CourseData {
  name: string;
  academicYear: string;
  entries: FoundEntry[];
}

export interface ScrapeSummary {
  expired: number;
  pages: number;
  added: number;
  updated: number;
  skipped: number;
  errors: number;
}

export function parseYear(label: string): number {
  const arabic = ARABIC_YEAR_RE.exec(label);
  if (arabic) return parseInt(arabic[1], 10);
  const roman = ROMAN_YEAR_RE.exec(label);
  if (roman) return ROMAN_YEARS[roman[1].toUpperCase()] ?? 1;
  return 1;
}

export function normalizeCourseName(raw: string): string {
  const base = raw
    .replace(/^\[[^\]]*\]\s*/, "")
    .replace(/\s*\(abilitante[^)]*\)/i, "")
    .split("/")[0]
    .replace(/\s*-\s*$/, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase()
    .replace(/([aeiou])['’](?=\s|$)/g, (_, vowel: string) => ACCENTS[vowel]);

  return base
    .split(" ")
    .map((word, index) => {
      if (index > 0 && LOWERCASE_WORDS.has(word)) return word;
      const elided = /^(dell|nell|all|sull|dall|l|d)(['’])(\p{L})/u.exec(word);
      if (index > 0 && elided) {
        return `${elided[1]}${elided[2]}${elided[3].toUpperCase()}${word.slice(elided[0].length)}`;
      }
      return word.replace(
        /(^|['’\-(])(\p{L})/gu,
        (_, sep: string, char: string) => sep + char.toUpperCase(),
      );
    })
    .join(" ");
}

export function getCurrentAcademicYear(): string {
  const now = new Date();
  const y = now.getFullYear();
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

  if (!res.ok) throw new Error(`Lista corsi non disponibile: ${res.status}`);

  const data = (await res.json()) as Array<{ command: string; data?: string }>;
  const urls = new Set<string>();

  for (const cmd of data) {
    if (!cmd.data || cmd.data.length < 100) continue;
    for (const m of cmd.data.matchAll(COURSE_LINK_RE)) {
      urls.add(m[1]);
    }
  }

  return Array.from(urls);
}

export function parseCoursePage(urlPath: string, html: string): CourseData {
  const h1Match = H1_RE.exec(html);
  const slug = urlPath.split("/").pop() ?? "";
  const name = h1Match
    ? h1Match[1]
        .trim()
        .replace(/&amp;/g, "&")
        .replace(/&#039;/g, "'")
    : slugToName(slug);

  const ayMatch = ACADEMIC_YEAR_RE.exec(html);
  const academicYear = ayMatch
    ? `${ayMatch[1]}/${ayMatch[2]}`
    : getCurrentAcademicYear();

  const entries: FoundEntry[] = [];
  for (const m of html.matchAll(CINECA_RE)) {
    const label = m[3]
      .trim()
      .replace(/&amp;/g, "&")
      .replace(/&#039;/g, "'");
    const campusMatch = CAMPUS_RE.exec(label);

    entries.push({
      linkId: m[1],
      label,
      year: parseYear(label),
      campus: campusMatch
        ? campusMatch[1][0].toUpperCase() +
          campusMatch[1].slice(1).toLowerCase()
        : "",
    });
  }

  return { name, academicYear, entries };
}

async function scrapeCourse(urlPath: string): Promise<CourseData> {
  const res = await fetch(`${BASE_URL}${urlPath}`, {
    headers: { "User-Agent": "UniApp-CoursesScraper/1.0" },
  });
  if (!res.ok) throw new Error(`Pagina corso non disponibile: ${res.status}`);
  return parseCoursePage(urlPath, await res.text());
}

async function upsertCourseEntry(
  db: AppDatabase,
  courseName: string,
  entry: FoundEntry,
  academicYear: string,
): Promise<"added" | "skipped" | "updated"> {
  const existing = await db.query.courses.findFirst({
    where: eq(courses.linkId, entry.linkId),
  });

  if (existing) {
    if (existing.status === "approved") return "skipped";
    await db
      .update(courses)
      .set({ status: "approved", academicYear, verified: true })
      .where(eq(courses.id, existing.id));
    return "updated";
  }

  const displayName = normalizeCourseName(courseName);
  const fullName = entry.campus
    ? `${displayName} - Anno ${entry.year} (${entry.campus})`
    : `${displayName} - Anno ${entry.year}`;

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

async function expireOldCourses(
  db: AppDatabase,
  currentAcademicYear: string,
): Promise<number> {
  const expired = await db
    .update(courses)
    .set({ status: "rejected" })
    .where(
      and(
        eq(courses.addedBy, "scraper"),
        ne(courses.academicYear, currentAcademicYear),
        eq(courses.status, "approved"),
      ),
    )
    .returning({ id: courses.id });
  return expired.length;
}

export async function importCourses(
  db: AppDatabase,
  pages: CourseData[],
  opts?: { onProgress?: (message: string) => void },
): Promise<Omit<ScrapeSummary, "expired">> {
  const log = opts?.onProgress ?? (() => {});
  const summary = {
    pages: pages.length,
    added: 0,
    updated: 0,
    skipped: 0,
    errors: 0,
  };

  for (const page of pages) {
    if (page.entries.length === 0) {
      log(`Nessun link Cineca in: ${page.name}`);
      continue;
    }

    for (const entry of page.entries) {
      try {
        const result = await upsertCourseEntry(
          db,
          page.name,
          { ...entry, year: parseYear(entry.label) },
          page.academicYear,
        );
        summary[result]++;
        if (result !== "skipped")
          log(`${result}: ${page.name} - ${entry.label}`);
      } catch (err) {
        summary.errors++;
        console.error(`Errore su ${page.name} - ${entry.label}:`, err);
      }
    }
  }

  return summary;
}

export async function scrapeAllCourses(
  db: AppDatabase,
  opts?: { onProgress?: (message: string) => void },
): Promise<ScrapeSummary> {
  const log = opts?.onProgress ?? (() => {});

  const expired = await expireOldCourses(db, getCurrentAcademicYear());
  if (expired > 0) log(`${expired} corsi dell'anno precedente archiviati`);

  const urls = await getCourseUrls();
  log(`${urls.length} pagine corso trovate`);

  const pages: CourseData[] = [];
  let errors = 0;

  for (const url of urls) {
    try {
      pages.push(await scrapeCourse(url));
      await delay(FETCH_DELAY_MS);
    } catch (err) {
      errors++;
      console.error(`Errore su ${url}:`, err);
    }
  }

  const imported = await importCourses(db, pages, opts);
  return {
    expired,
    ...imported,
    pages: urls.length,
    errors: imported.errors + errors,
  };
}
