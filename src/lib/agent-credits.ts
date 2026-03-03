/**
 * Agent credit system — backed by Neon Postgres
 *
 * Two-pool model:
 *   1. Monthly allowance  — included with plan, resets each calendar month
 *   2. Purchased credits  — bought via Stripe, never expire
 *
 * Deduction order: monthly allowance first, then purchased.
 *
 * Admin bypass: users whose Clerk IDs appear in ADMIN_USER_IDS env var
 * get unlimited access with no deduction.
 */

import { eq, and, sql } from "drizzle-orm";
import { db, schema } from "./db";

export type AgentType =
  | "seo-sweep"
  | "design-fixer"
  | "responsive-audit"
  | "performance-optimizer"
  | "accessibility-checker"
  | "link-scanner"
  | "creative-director"
  | "motion-designer"
  | "conversion-architect"
  | "copy-chief"
  | "proof-engine"
  | "seo-gsc"
  | "domain-ssl"
  | "monetization";

// ── Credit cost per agent run ──────────────────────────────────────────────────
export const AGENT_COSTS: Record<AgentType, number> = {
  "seo-sweep":             1,
  "responsive-audit":      1,
  "link-scanner":          1,
  "seo-gsc":               1,
  "domain-ssl":            1,
  "accessibility-checker": 2,
  "performance-optimizer": 2,
  "conversion-architect":  2,
  "monetization":          2,
  "creative-director":     3,
  "motion-designer":       3,
  "copy-chief":            3,
  "proof-engine":          3,
  "design-fixer":          5,
};

// ── Which agents are unlocked per plan ────────────────────────────────────────
export const PLAN_AGENT_ACCESS: Record<string, AgentType[]> = {
  free: [
    "seo-sweep",
    "responsive-audit",
  ],
  starter: [
    "seo-sweep",
    "responsive-audit",
    "link-scanner",
    "accessibility-checker",
    "performance-optimizer",
    "conversion-architect",
    "seo-gsc",
  ],
  pro: [
    "seo-sweep",
    "responsive-audit",
    "link-scanner",
    "accessibility-checker",
    "performance-optimizer",
    "conversion-architect",
    "seo-gsc",
    "design-fixer",
    "creative-director",
    "motion-designer",
    "copy-chief",
    "proof-engine",
    "domain-ssl",
    "monetization",
  ],
  agency: [
    "seo-sweep",
    "responsive-audit",
    "link-scanner",
    "accessibility-checker",
    "performance-optimizer",
    "conversion-architect",
    "seo-gsc",
    "design-fixer",
    "creative-director",
    "motion-designer",
    "copy-chief",
    "proof-engine",
    "domain-ssl",
    "monetization",
  ],
};

// ── Monthly included credits per plan (reset each calendar month) ─────────────
export const PLAN_MONTHLY_CREDITS: Record<string, number> = {
  free:    5,
  starter: 25,
  pro:     150,
  agency:  600,
};

// ── Credit packs available for purchase ───────────────────────────────────────
export const CREDIT_PACKS = [
  { id: "pack_50",  credits: 50,  priceInCents: 499,  label: "50 credits",  tag: "starter" },
  { id: "pack_200", credits: 200, priceInCents: 1499, label: "200 credits", tag: "popular" },
  { id: "pack_500", credits: 500, priceInCents: 2999, label: "500 credits", tag: "best value" },
] as const;

// ── Admin bypass ──────────────────────────────────────────────────────────────
export function isAdminUser(userId: string): boolean {
  const ids = (process.env.ADMIN_USER_IDS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return ids.includes(userId);
}

// ── Balance ────────────────────────────────────────────────────────────────────
export interface AgentBalance {
  plan: string;
  monthlyAllowance: number;
  monthlyUsed: number;
  monthlyRemaining: number;
  purchased: number;
  total: number;
}

export async function getAgentBalance(userId: string): Promise<AgentBalance> {
  const rows = await db.select().from(schema.users).where(eq(schema.users.id, userId)).limit(1);
  const user = rows[0];

  const plan = user && ["starter", "pro", "agency"].includes(user.plan) ? user.plan : "free";
  const monthlyAllowance = PLAN_MONTHLY_CREDITS[plan] ?? 5;
  const purchased = Math.max(0, user?.purchasedCredits ?? 0);

  const month = new Date().toISOString().slice(0, 7);
  const usageRows = await db
    .select()
    .from(schema.creditUsage)
    .where(and(eq(schema.creditUsage.userId, userId), eq(schema.creditUsage.month, month)))
    .limit(1);

  const monthlyUsed = usageRows[0]?.used ?? 0;
  const monthlyRemaining = Math.max(0, monthlyAllowance - monthlyUsed);

  return {
    plan,
    monthlyAllowance,
    monthlyUsed,
    monthlyRemaining,
    purchased,
    total: monthlyRemaining + purchased,
  };
}

// ── Check + consume ───────────────────────────────────────────────────────────
export type CreditCheckResult =
  | { ok: true; balance: AgentBalance }
  | { ok: false; code: "NO_ACCESS" | "INSUFFICIENT_CREDITS"; message: string; balance: AgentBalance };

export async function checkAndConsumeCredits(
  userId: string,
  agentId: AgentType,
): Promise<CreditCheckResult> {
  const balance = await getAgentBalance(userId);
  const { plan } = balance;

  // Plan access gate
  const accessible = PLAN_AGENT_ACCESS[plan] ?? PLAN_AGENT_ACCESS.free;
  if (!accessible.includes(agentId)) {
    const proAgents: AgentType[] = ["design-fixer", "creative-director", "motion-designer", "copy-chief", "proof-engine", "domain-ssl", "monetization"];
    const neededPlan = proAgents.includes(agentId) ? "Pro" : "Starter";
    return {
      ok: false,
      code: "NO_ACCESS",
      message: `${agentId} requires the ${neededPlan} plan or higher.`,
      balance,
    };
  }

  const cost = AGENT_COSTS[agentId] ?? 1;
  if (balance.total < cost) {
    return {
      ok: false,
      code: "INSUFFICIENT_CREDITS",
      message: `Not enough credits. This agent costs ${cost} credit${cost !== 1 ? "s" : ""} — you have ${balance.total}.`,
      balance,
    };
  }

  // Deduct monthly first, then purchased
  const month = new Date().toISOString().slice(0, 7);
  const fromMonthly = Math.min(cost, balance.monthlyRemaining);
  const fromPurchased = cost - fromMonthly;

  if (fromMonthly > 0) {
    await db
      .insert(schema.creditUsage)
      .values({ userId, month, used: fromMonthly })
      .onConflictDoUpdate({
        target: [schema.creditUsage.userId, schema.creditUsage.month],
        set: { used: sql`${schema.creditUsage.used} + ${fromMonthly}` },
      });
  }

  if (fromPurchased > 0) {
    await db
      .update(schema.users)
      .set({ purchasedCredits: sql`GREATEST(${schema.users.purchasedCredits} - ${fromPurchased}, 0)` })
      .where(eq(schema.users.id, userId));
  }

  return { ok: true, balance: await getAgentBalance(userId) };
}

// ── Add purchased credits (called from Stripe webhook) ────────────────────────
export async function addPurchasedCredits(userId: string, amount: number): Promise<void> {
  await db
    .update(schema.users)
    .set({ purchasedCredits: sql`${schema.users.purchasedCredits} + ${amount}` })
    .where(eq(schema.users.id, userId));
}
