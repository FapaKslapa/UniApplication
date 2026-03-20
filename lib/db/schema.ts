import {
  boolean,
  index,
  int,
  longtext,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

export const visits = mysqlTable(
  "visits",
  {
    id: int("id").primaryKey().autoincrement(),
    ip: varchar("ip", { length: 64 }),
    clientId: varchar("client_id", { length: 255 }),
    userAgent: text("userAgent"),
    path: varchar("path", { length: 512 }),
    referer: text("referer"),
    deviceType: varchar("deviceType", { length: 32 }),
    browser: varchar("browser", { length: 64 }),
    os: varchar("os", { length: 64 }),
    createdAt: timestamp("createdAt").notNull().defaultNow(),
  },
  (table) => [
    index("idx_visits_created_at").on(table.createdAt),
    index("idx_visits_ip").on(table.ip),
    index("idx_visits_client_id").on(table.clientId),
  ],
);

// ─── Better Auth tables ───────────────────────────────────────────────────────

export const user = mysqlTable("user", {
  id: varchar("id", { length: 36 }).primaryKey(),
  name: text("name").notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  emailVerified: boolean("emailVerified").notNull().default(false),
  image: text("image"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow().onUpdateNow(),
});

export const session = mysqlTable("session", {
  id: varchar("id", { length: 255 }).primaryKey(),
  expiresAt: timestamp("expiresAt").notNull(),
  token: varchar("token", { length: 255 }).notNull().unique(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow().onUpdateNow(),
  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),
  userId: varchar("userId", { length: 36 })
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = mysqlTable("account", {
  id: varchar("id", { length: 255 }).primaryKey(),
  accountId: text("accountId").notNull(),
  providerId: text("providerId").notNull(),
  userId: varchar("userId", { length: 36 })
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  idToken: text("idToken"),
  accessTokenExpiresAt: timestamp("accessTokenExpiresAt"),
  refreshTokenExpiresAt: timestamp("refreshTokenExpiresAt"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow().onUpdateNow(),
});

export const verification = mysqlTable("verification", {
  id: varchar("id", { length: 255 }).primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow(),
});

// ─────────────────────────────────────────────────────────────────────────────

export const courses = mysqlTable("courses", {
  id: varchar("id", { length: 255 }).primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  linkId: varchar("linkId", { length: 255 }).notNull(),
  year: int("year"),
  academicYear: varchar("academic_year", { length: 255 }),
  status: mysqlEnum("status", ["pending", "approved", "rejected"])
    .notNull()
    .default("pending"),
  verified: boolean("verified").notNull().default(false),
  addedBy: varchar("added_by", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const analyticsUsers = mysqlTable("analytics_users", {
  id: varchar("id", { length: 255 }).primaryKey(),
  lastSeen: timestamp("last_seen").notNull().defaultNow().onUpdateNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const apiLogs = mysqlTable("api_logs", {
  id: int("id").primaryKey().autoincrement(),
  endpoint: varchar("endpoint", { length: 255 }).notNull(),
  method: varchar("method", { length: 10 }).notNull(),
  userId: varchar("user_id", { length: 255 }),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

export const pushSubscriptions = mysqlTable(
  "push_subscriptions",
  {
    id: int("id").primaryKey().autoincrement(),
    userId: varchar("user_id", { length: 255 }).notNull(),
    linkId: varchar("link_id", { length: 255 }).notNull(),
    endpoint: varchar("endpoint", { length: 1024 }).notNull(),
    p256dh: varchar("p256dh", { length: 255 }).notNull(),
    auth: varchar("auth", { length: 255 }).notNull(),
    filters: text("filters"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [index("idx_push_subs_link_id").on(table.linkId)],
);

export const courseSnapshots = mysqlTable("course_snapshots", {
  linkId: varchar("link_id", { length: 255 }).primaryKey(),
  lastHash: varchar("last_hash", { length: 255 }).notNull(),
  lastData: longtext("last_data"),
  lastChanges: longtext("last_changes"),
  lastUpdated: timestamp("last_updated").notNull().defaultNow().onUpdateNow(),
});

export type DbCourse = typeof courses.$inferSelect;
export type NewDbCourse = typeof courses.$inferInsert;
export type AnalyticsUser = typeof analyticsUsers.$inferSelect;
export type ApiLog = typeof apiLogs.$inferSelect;
export type PushSubscription = typeof pushSubscriptions.$inferSelect;
export type CourseSnapshot = typeof courseSnapshots.$inferSelect;
export type Visit = typeof visits.$inferSelect;
