import { sql } from "drizzle-orm";
import {
  boolean,
  doublePrecision,
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const issueStatusEnum = pgEnum("issue_status", [
  "uj",
  "ertesitve",
  "vizsgalat",
  "folyamatban",
  "megoldott",
  "elutasitott",
]);

export const issueTypeEnum = pgEnum("issue_type", ["problema", "javaslat"]);

export const categoryEnum = pgEnum("category", [
  "kozlekedes",
  "katyu",
  "parkolas",
  "koztisztasag",
  "zoldterulet",
  "vilagitas",
  "zaj",
  "epuletek",
  "egyeb",
]);

export const moderationStatusEnum = pgEnum("moderation_status", [
  "pending",
  "approved",
  "rejected",
]);

export const suggestionStatusEnum = pgEnum("suggestion_status", [
  "pending",
  "approved",
  "rejected",
]);

export const users = pgTable("users", {
  id: uuid().primaryKey(),
  email: varchar({ length: 255 }).notNull(),
  name: varchar({ length: 255 }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const organizations = pgTable("organizations", {
  id: varchar({ length: 64 }).primaryKey(),
  slug: varchar({ length: 128 }).notNull().unique(),
  name: varchar({ length: 255 }).notNull(),
  website: text(),
  contactEmail: varchar("contact_email", { length: 255 }),
  avgResponseDays: doublePrecision("avg_response_days"),
});

export const issues = pgTable("issues", {
  id: varchar({ length: 64 }).primaryKey(),
  slug: varchar({ length: 160 }).notNull().unique(),
  title: varchar({ length: 255 }).notNull(),
  settlement: varchar({ length: 120 }).notNull(),
  address: varchar({ length: 255 }).notNull(),
  category: categoryEnum().notNull(),
  type: issueTypeEnum().notNull(),
  status: issueStatusEnum().notNull().default("uj"),
  supportersCount: integer("supporters_count").notNull().default(0),
  supportersChange24h: integer("supporters_change_24h").notNull().default(0),
  summary: text(),
  problem: text().notNull(),
  request: text().notNull(),
  lat: doublePrecision().notNull(),
  lng: doublePrecision().notNull(),
  images: text().array().notNull().default(sql`'{}'::text[]`),
  organizationId: varchar("organization_id", { length: 64 }).references(
    () => organizations.id,
  ),
  articleSlug: varchar("article_slug", { length: 160 }),
  createdByUserId: uuid("created_by_user_id").references(() => users.id),
  moderationStatus: moderationStatusEnum("moderation_status")
    .notNull()
    .default("approved"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

/** Wiki-style proposed edits — live issue unchanged until a moderator approves. */
export const issueEditSuggestions = pgTable("issue_edit_suggestions", {
  id: varchar({ length: 64 }).primaryKey(),
  issueId: varchar("issue_id", { length: 64 })
    .notNull()
    .references(() => issues.id, { onDelete: "cascade" }),
  authorUserId: uuid("author_user_id")
    .notNull()
    .references(() => users.id),
  status: suggestionStatusEnum().notNull().default("pending"),
  rationale: text(),
  proposedTitle: varchar("proposed_title", { length: 255 }),
  proposedSummary: text("proposed_summary"),
  proposedProblem: text("proposed_problem"),
  proposedRequest: text("proposed_request"),
  proposedCategory: categoryEnum("proposed_category"),
  proposedAddress: varchar("proposed_address", { length: 255 }),
  proposedSettlement: varchar("proposed_settlement", { length: 120 }),
  /** Snapshot of live fields at proposal time (for diff UI). */
  previousTitle: varchar("previous_title", { length: 255 }).notNull(),
  previousSummary: text("previous_summary"),
  previousProblem: text("previous_problem").notNull(),
  previousRequest: text("previous_request").notNull(),
  previousCategory: categoryEnum("previous_category").notNull(),
  previousAddress: varchar("previous_address", { length: 255 }).notNull(),
  previousSettlement: varchar("previous_settlement", { length: 120 }).notNull(),
  reviewerUserId: uuid("reviewer_user_id").references(() => users.id),
  reviewNote: text("review_note"),
  reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const issueSupports = pgTable(
  "issue_supports",
  {
    issueId: varchar("issue_id", { length: 64 })
      .notNull()
      .references(() => issues.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [primaryKey({ columns: [t.issueId, t.userId] })],
);

export const officialResponses = pgTable("official_responses", {
  id: varchar({ length: 64 }).primaryKey(),
  issueId: varchar("issue_id", { length: 64 })
    .notNull()
    .references(() => issues.id, { onDelete: "cascade" }),
  organizationName: varchar("organization_name", { length: 255 }).notNull(),
  summary: text().notNull(),
  originalText: text("original_text").notNull(),
  verified: boolean().notNull().default(true),
  respondedAt: timestamp("responded_at", { withTimezone: true }).notNull(),
});

export type DbUser = typeof users.$inferSelect;
export type DbIssue = typeof issues.$inferSelect;
export type DbEditSuggestion = typeof issueEditSuggestions.$inferSelect;
export type NewIssueSupport = typeof issueSupports.$inferInsert;
