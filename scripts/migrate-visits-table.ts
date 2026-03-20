import path from "node:path";
import * as dotenv from "dotenv";

dotenv.config({ path: path.join(process.cwd(), ".env.local") });

import mysql from "mysql2/promise";

const databaseUrl = process.env.DATABASE_URL?.replace(/^["'](.+)["']$/, "$1");
if (!databaseUrl) throw new Error("DATABASE_URL non definito");

async function run() {
  const conn = await mysql.createConnection({ uri: databaseUrl });
  await conn.execute(`
    CREATE TABLE IF NOT EXISTS \`visits\` (
      \`id\`          int          NOT NULL AUTO_INCREMENT,
      \`ip\`          varchar(64),
      \`userAgent\`   text,
      \`path\`        varchar(512),
      \`referer\`     text,
      \`deviceType\`  varchar(32),
      \`browser\`     varchar(64),
      \`os\`          varchar(64),
      \`createdAt\`   timestamp    NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (\`id\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);
  console.log("✓ visits");
  await conn.end();
}

run()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e.message);
    process.exit(1);
  });
