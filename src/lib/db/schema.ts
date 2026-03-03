/**
 * Drizzle ORM schema — Neon Postgres
 *
 * Tables:
 *   users            — synced from Clerk, stores plan + Stripe mapping
 *   projects         — website builder projects
 *   sites            — saved/deployed sites (HTML stored in Vercel Blob)
 *   agent_runs       — history of AI agent executions
 *   credit_usage     — monthly agent credit consumption
 *   domains          — subdomain → site mappings
 */

import {
  pgTable,
  text,
  timestamp,
  integer,
  jsonb,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";

// ── Users ────────────────────────────────────────────────────────────────────
export const users = pgTable("users", {
  id: text("id").primaryKey(),                          // Clerk user ID
  email: text("email"),
  firstName: text("first_name"),
  lastName: text("last_name"),
  plan: text("plan").default("free").notNull(),         // free | starter | pro | agency
  stripeCustomerId: text("stripe_customer_id"),
  purchasedCredits: integer("purchased_credits").default(0).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => [
  uniqueIndex("users_email_idx").on(t.email),
  uniqueIndex("users_stripe_customer_idx").on(t.stripeCustomerId),
]);

// ── Projects ─────────────────────────────────────────────────────────────────
export const projects = pgTable("projects", {
  id: text("id").primaryKey(),                          // proj_<hex>
  name: text("name").notNull(),
  templateId: text("template_id"),
  ownerId: text("owner_id").references(() => users.id),
  status: text("status").default("draft").notNull(),    // draft | generating | ready | error
  prompt: text("prompt"),
  generatedHtml: text("generated_html"),
  lastGeneratedAt: timestamp("last_generated_at", { withTimezone: true }),
  data: jsonb("data"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => [
  index("projects_owner_idx").on(t.ownerId),
  index("projects_updated_idx").on(t.updatedAt),
]);

// ── Sites ────────────────────────────────────────────────────────────────────
export const sites = pgTable("sites", {
  id: text("id").primaryKey(),                          // 12-char random
  userId: text("user_id").references(() => users.id),
  prompt: text("prompt").default("").notNull(),
  title: text("title").default("Untitled Site").notNull(),
  industry: text("industry").default("").notNull(),
  vibe: text("vibe").default("").notNull(),
  blobUrl: text("blob_url").notNull(),
  slug: text("slug"),                                   // subdomain slug (unique)
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => [
  index("sites_user_idx").on(t.userId),
  uniqueIndex("sites_slug_idx").on(t.slug),
]);

// ── Agent runs ───────────────────────────────────────────────────────────────
export const agentRuns = pgTable("agent_runs", {
  id: text("id").primaryKey(),                          // run_<ts>_<rand>
  userId: text("user_id").references(() => users.id),
  projectId: text("project_id").references(() => projects.id),
  agent: text("agent").notNull(),                       // AgentType
  status: text("status").default("running").notNull(),  // queued | running | succeeded | failed
  summary: text("summary").default("").notNull(),
  creditCost: integer("credit_cost").default(1).notNull(),
  startedAt: timestamp("started_at", { withTimezone: true }).defaultNow().notNull(),
  finishedAt: timestamp("finished_at", { withTimezone: true }),
  durationMs: integer("duration_ms"),
}, (t) => [
  index("agent_runs_user_idx").on(t.userId),
  index("agent_runs_project_idx").on(t.projectId),
  index("agent_runs_started_idx").on(t.startedAt),
]);

// ── Credit usage (monthly) ───────────────────────────────────────────────────
export const creditUsage = pgTable("credit_usage", {
  userId: text("user_id").references(() => users.id).notNull(),
  month: text("month").notNull(),                       // "2026-03"
  used: integer("used").default(0).notNull(),
}, (t) => [
  uniqueIndex("credit_usage_user_month_idx").on(t.userId, t.month),
]);

// ── Domains (subdomain → site) ───────────────────────────────────────────────
export const domains = pgTable("domains", {
  slug: text("slug").primaryKey(),
  siteId: text("site_id").references(() => sites.id).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
