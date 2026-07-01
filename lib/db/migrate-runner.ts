import path from "node:path";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { db } from "./node";

async function runMigrations() {
  console.log("Running local SQLite migrations...");
  try {
    migrate(db, {
      migrationsFolder: path.join(process.cwd(), "drizzle"),
    });
    console.log("Local SQLite migrations applied successfully!");
  } catch (error) {
    console.error("Error applying local migrations:", error);
    process.exit(1);
  }
}

runMigrations().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
