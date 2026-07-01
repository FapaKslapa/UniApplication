import fs from "node:fs/promises";
import path from "node:path";
import * as dotenv from "dotenv";
import mysql from "mysql2/promise";

dotenv.config({ path: ".env.local" });

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error("❌ ERROR: DATABASE_URL is not defined in .env.local");
  process.exit(1);
}

const cleanUrl = databaseUrl.replace(/^["'](.+)["']$/, "$1");

function escapeSqlValue(value: any): string {
  if (value === null || value === undefined) {
    return "NULL";
  }
  if (typeof value === "boolean") {
    return value ? "1" : "0";
  }
  if (value instanceof Date) {
    return value.getTime().toString();
  }
  if (typeof value === "number") {
    return value.toString();
  }

  const strVal = String(value);
  return `'${strVal.replace(/'/g, "''")}'`;
}

async function main() {
  console.log(
    "🚀 Starting data migration from MySQL to SQLite (Cloudflare D1)...",
  );

  let connection: mysql.Connection;
  try {
    console.log("🔌 Connecting to MySQL database...");
    connection = await mysql.createConnection(cleanUrl);
  } catch (err) {
    console.error("❌ Connection failed:", err);
    process.exit(1);
  }

  const tables = [
    "user",
    "session",
    "account",
    "verification",
    "courses",
    "analytics_users",
    "api_logs",
    "push_subscriptions",
    "course_snapshots",
    "visits",
  ];

  let sqlOutput = `-- Auto-generated migration script from MySQL to SQLite\n`;
  sqlOutput += `PRAGMA defer_foreign_keys = ON;\n`;
  sqlOutput += `PRAGMA foreign_keys = OFF;\n\n`;

  for (const table of tables) {
    sqlOutput += `DELETE FROM \`${table}\`;\n`;
  }
  sqlOutput += `\n`;

  for (const table of tables) {
    try {
      console.log(`📦 Fetching rows from table: ${table}...`);
      const [rows] = (await connection.query(`SELECT * FROM \`${table}\``)) as [
        any[],
        any,
      ];

      if (rows.length === 0) {
        console.log(`ℹ️ Table ${table} is empty. Skipping.`);
        continue;
      }

      console.log(
        `✍️ Generating inserts for ${rows.length} rows in ${table}...`,
      );

      const columns = Object.keys(rows[0]);
      const columnsStr = columns.map((col) => `\`${col}\``).join(", ");

      for (const row of rows) {
        const values = columns.map((col) => {
          let val = row[col];

          if (Buffer.isBuffer(val)) {
            if (val.length === 1) {
              val = val[0] === 1;
            } else {
              val = val.toString("utf-8");
            }
          }
          return escapeSqlValue(val);
        });

        sqlOutput += `INSERT INTO \`${table}\` (${columnsStr}) VALUES (${values.join(", ")});\n`;
      }
      sqlOutput += `\n`;
    } catch (err: any) {
      if (err.code === "ER_NO_SUCH_TABLE") {
        console.warn(
          `⚠️ Warning: Table ${table} does not exist in MySQL. Skipping.`,
        );
      } else {
        console.error(`❌ Error migrating table ${table}:`, err);
      }
    }
  }

  sqlOutput += `PRAGMA foreign_keys = ON;\n`;

  const outputPath = path.join(process.cwd(), "migration.sql");
  await fs.writeFile(outputPath, sqlOutput, "utf-8");

  console.log(`\n✅ Migration script created successfully at: ${outputPath}`);
  console.log(`To import this data into Cloudflare D1, run:`);
  console.log(
    `npx wrangler d1 execute uni-app-db --remote --file ./migration.sql`,
  );

  await connection.end();
}

main().catch((err) => {
  console.error("❌ Migration script execution failed:", err);
});
