import * as dotenv from "dotenv";
import { sql } from "drizzle-orm";

dotenv.config({ path: ".env.local" });

async function main() {
  const { db } = await import("./lib/db/node");
  try {
    console.log("Inspecting courses table...");

    const r = db.run(sql`PRAGMA table_info(courses)`);
    console.log(JSON.stringify(r, null, 2));

    console.log("Testing select query...");
    const test = db.all(sql`SELECT * FROM courses LIMIT 1`);
    console.log("Select test result:", JSON.stringify(test, null, 2));
  } catch (error) {
    console.error("Error inspecting database:", error);
  } finally {
    process.exit(0);
  }
}

main();
