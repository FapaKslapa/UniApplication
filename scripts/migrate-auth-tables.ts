import path from "node:path";
import * as dotenv from "dotenv";

dotenv.config({ path: path.join(process.cwd(), ".env.local") });

import mysql from "mysql2/promise";

const databaseUrl = process.env.DATABASE_URL?.replace(/^["'](.+)["']$/, "$1");
if (!databaseUrl) throw new Error("DATABASE_URL non definito");

const SQL = `
CREATE TABLE IF NOT EXISTS \`user\` (
  \`id\`            varchar(36)  NOT NULL,
  \`name\`          text         NOT NULL,
  \`email\`         varchar(255) NOT NULL,
  \`emailVerified\` boolean      NOT NULL DEFAULT false,
  \`image\`         text,
  \`createdAt\`     timestamp    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  \`updatedAt\`     timestamp    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`),
  UNIQUE KEY \`user_email_unique\` (\`email\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS \`session\` (
  \`id\`         varchar(255) NOT NULL,
  \`expiresAt\`  timestamp    NOT NULL,
  \`token\`      varchar(255) NOT NULL,
  \`createdAt\`  timestamp    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  \`updatedAt\`  timestamp    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  \`ipAddress\`  text,
  \`userAgent\`  text,
  \`userId\`     varchar(36)  NOT NULL,
  PRIMARY KEY (\`id\`),
  UNIQUE KEY \`session_token_unique\` (\`token\`),
  CONSTRAINT \`session_userId_fk\` FOREIGN KEY (\`userId\`) REFERENCES \`user\` (\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS \`account\` (
  \`id\`                      varchar(255) NOT NULL,
  \`accountId\`               text         NOT NULL,
  \`providerId\`              text         NOT NULL,
  \`userId\`                  varchar(36)  NOT NULL,
  \`accessToken\`             text,
  \`refreshToken\`            text,
  \`idToken\`                 text,
  \`accessTokenExpiresAt\`    timestamp,
  \`refreshTokenExpiresAt\`   timestamp,
  \`scope\`                   text,
  \`password\`                text,
  \`createdAt\`               timestamp    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  \`updatedAt\`               timestamp    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`),
  CONSTRAINT \`account_userId_fk\` FOREIGN KEY (\`userId\`) REFERENCES \`user\` (\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS \`verification\` (
  \`id\`          varchar(255) NOT NULL,
  \`identifier\`  text         NOT NULL,
  \`value\`       text         NOT NULL,
  \`expiresAt\`   timestamp    NOT NULL,
  \`createdAt\`   timestamp    DEFAULT CURRENT_TIMESTAMP,
  \`updatedAt\`   timestamp    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
`;

async function run() {
  const conn = await mysql.createConnection({ uri: databaseUrl });
  const statements = SQL.split(";")
    .map((s) => s.trim())
    .filter(Boolean);

  for (const stmt of statements) {
    await conn.execute(stmt);
    const tableName = stmt.match(/CREATE TABLE IF NOT EXISTS `(\w+)`/)?.[1];
    if (tableName) console.log(`✓ ${tableName}`);
  }

  await conn.end();
  console.log("Migrazione completata.");
}

run()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Errore:", err.message);
    process.exit(1);
  });
