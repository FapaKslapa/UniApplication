import fs from "node:fs/promises";
import path from "node:path";
import * as dotenv from "dotenv";

dotenv.config({ path: path.join(process.cwd(), ".env.local") });

import { db } from "@/lib/db/node";
import {
  type CourseData,
  importCourses,
  scrapeAllCourses,
} from "@/lib/jobs/scrape-courses";

const log = (message: string) => console.log(`  ${message}`);

async function main() {
  const file = process.argv[2];

  if (file) {
    const pages = JSON.parse(await fs.readFile(file, "utf-8")) as CourseData[];
    console.log(`Import di ${pages.length} corsi da ${file}`);
    console.log(await importCourses(db, pages, { onProgress: log }));
    return;
  }

  console.log("Scraping corsi Insubria...");
  console.log(await scrapeAllCourses(db, { onProgress: log }));
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
