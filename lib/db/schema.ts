import { sql } from "drizzle-orm";
import {
  index,
  integer,
  primaryKey,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

export const visits = sqliteTable(
  "visits",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    ip: text("ip"),
    clientId: text("client_id"),
    userAgent: text("userAgent"),
    path: text("path"),
    referer: text("referer"),
    deviceType: text("deviceType"),
    browser: text("browser"),
    os: text("os"),
    createdAt: integer("createdAt", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (table) => [
    index("idx_visits_created_at").on(table.createdAt),
    index("idx_visits_ip").on(table.ip),
    index("idx_visits_client_id").on(table.clientId),
  ],
);

// ─── Better Auth tables ───────────────────────────────────────────────────────

export const user = sqliteTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: integer("emailVerified", { mode: "boolean" })
    .notNull()
    .default(false),
  image: text("image"),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull(),
});

export const session = sqliteTable("session", {
  id: text("id").primaryKey(),
  expiresAt: integer("expiresAt", { mode: "timestamp" }).notNull(),
  token: text("token").notNull().unique(),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull(),
  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = sqliteTable("account", {
  id: text("id").primaryKey(),
  accountId: text("accountId").notNull(),
  providerId: text("providerId").notNull(),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  idToken: text("idToken"),
  accessTokenExpiresAt: integer("accessTokenExpiresAt", { mode: "timestamp" }),
  refreshTokenExpiresAt: integer("refreshTokenExpiresAt", {
    mode: "timestamp",
  }),
  scope: text("scope"),
  password: text("password"),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull(),
});

export const verification = sqliteTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: integer("expiresAt", { mode: "timestamp" }).notNull(),
  createdAt: integer("createdAt", { mode: "timestamp" }),
  updatedAt: integer("updatedAt", { mode: "timestamp" }),
});

export const rateLimit = sqliteTable("rateLimit", {
  id: text("id").primaryKey(),
  key: text("key").notNull().unique(),
  count: integer("count").notNull(),
  lastRequest: integer("lastRequest").notNull(),
});

// ─────────────────────────────────────────────────────────────────────────────

export const courses = sqliteTable("courses", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  linkId: text("linkId").notNull(),
  year: integer("year"),
  academicYear: text("academic_year"),
  status: text("status").notNull().default("pending"),
  verified: integer("verified", { mode: "boolean" }).notNull().default(false),
  addedBy: text("added_by").notNull(),
  userId: text("user_id"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

export const analyticsUsers = sqliteTable("analytics_users", {
  id: text("id").primaryKey(),
  lastSeen: integer("last_seen", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

export const apiLogs = sqliteTable("api_logs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  endpoint: text("endpoint").notNull(),
  method: text("method").notNull(),
  userId: text("user_id"),
  timestamp: integer("timestamp", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

export const pushSubscriptions = sqliteTable(
  "push_subscriptions",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: text("user_id").notNull(),
    linkId: text("link_id").notNull(),
    endpoint: text("endpoint").notNull(),
    p256dh: text("p256dh").notNull(),
    auth: text("auth").notNull(),
    filters: text("filters"),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (table) => [index("idx_push_subs_link_id").on(table.linkId)],
);

export const courseSnapshots = sqliteTable("course_snapshots", {
  linkId: text("link_id").primaryKey(),
  lastHash: text("last_hash").notNull(),
  lastData: text("last_data"),
  lastChanges: text("last_changes"),
  lastUpdated: integer("last_updated", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

export const exams = sqliteTable(
  "exams",
  {
    id: text("id").primaryKey(),
    source: text("source").notNull(),
    externalId: text("external_id").notNull(),
    linkId: text("link_id").notNull(),
    subject: text("subject").notNull(),
    courseName: text("course_name"),
    startsAt: integer("starts_at", { mode: "timestamp" }).notNull(),
    endsAt: integer("ends_at", { mode: "timestamp" }),
    kind: text("kind"),
    aula: text("aula"),
    professor: text("professor"),
    regOpensAt: integer("reg_opens_at", { mode: "timestamp" }),
    regClosesAt: integer("reg_closes_at", { mode: "timestamp" }),
    regConfirmed: integer("reg_confirmed", { mode: "boolean" })
      .notNull()
      .default(false),
    canceled: integer("canceled", { mode: "boolean" }).notNull().default(false),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (table) => [
    uniqueIndex("idx_exams_source_external").on(table.source, table.externalId),
    index("idx_exams_starts_at").on(table.startsAt),
    index("idx_exams_link_id").on(table.linkId),
  ],
);

export const examCalendars = sqliteTable(
  "exam_calendars",
  {
    examId: text("exam_id").notNull(),
    linkId: text("link_id").notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.examId, table.linkId] }),
    index("idx_exam_calendars_link_id").on(table.linkId),
  ],
);

export const examFollows = sqliteTable(
  "exam_follows",
  {
    userId: text("user_id").notNull(),
    examId: text("exam_id").notNull(),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (table) => [primaryKey({ columns: [table.userId, table.examId] })],
);

export const examRemindersSent = sqliteTable(
  "exam_reminders_sent",
  {
    userId: text("user_id").notNull(),
    examId: text("exam_id").notNull(),
    kind: text("kind").notNull(),
    sentAt: integer("sent_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (table) => [
    primaryKey({ columns: [table.userId, table.examId, table.kind] }),
  ],
);

export type DbExam = typeof exams.$inferSelect;

export type DbCourse = typeof courses.$inferSelect;
export type NewDbCourse = typeof courses.$inferInsert;
export type AnalyticsUser = typeof analyticsUsers.$inferSelect;
export type ApiLog = typeof apiLogs.$inferSelect;
export type PushSubscription = typeof pushSubscriptions.$inferSelect;
export type CourseSnapshot = typeof courseSnapshots.$inferSelect;
export type Visit = typeof visits.$inferSelect;
