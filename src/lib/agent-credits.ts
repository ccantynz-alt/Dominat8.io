/**
 * Agent credit system
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

import { kv } from "@vercel/kv";

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
  | "monetization"
  | "video-script"
  | "video-pro"
  | "seo-deep"
  | "ai-copywriter"
  | "social-kit";

// ── Credit cost per agent run ──────────────────────────────────────────────────
export const AGENT_COSTS: Record<AgentType, number> = {
  "seo-sweep":             1,
  "responsive-audit":      1,
  "link-scanner":          1,
  "seo-gsc":               1,
  "domain-ssl":            1,
  "video-script":          2,
  "accessibility-checker": 2,
  "performance-optimizer": 2,
  "conversion-architect":  2,
  "monetization":          2,
  "creative-director":     3,
  "motion-designer":       3,
  "copy-chief":            3,
  "proof-engine":          3,
  "ai-copywriter":         3,
  "social-kit":            3,
  "design-fixer":          5,
  "seo-deep":              5,
  "video-pro":            10,
};

// ── Which agents are unlocked per plan ────────────────────────────────────────
// Agents NOT in a plan's list are locked behind an upgrade wall.
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
    "video-script",
    "ai-copywriter",
    "social-kit",
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
    "video-script",
    "video-pro",
    "seo-deep",
    "ai-copywriter",
    "social-kit",
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
    "video-script",
    "video-pro",
    "seo-deep",
    "ai-copywriter",
    "social-kit",
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
  { id: "pack_50",   credits: 50,   priceInCents: 499,  label: "50 credits",    tag: "starter" },
  { id: "pack_200",  credits: 200,  priceInCents: 1499, label: "200 credits",   tag: "popular" },
  { id: "pack_500",  credits: 500,  priceInCents: 2999, label: "500 credits",   tag: "best value" },
  { id: "pack_1500", credits: 1500, priceInCents: 7499, label: "1,500 credits", tag: "agency pack" },
] as const;

// ── Admin bypass ──────────────────────────────────────────────────────────────
export function isAdminUser(userId: string): boolean {
  const ids = (process.env.ADMIN_USER_IDS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return ids.includes(userId);
}

// ── KV key helpers ────────────────────────────────────────────────────────────
export function agentUsageKey(userId: string, month: string) {
  return `agent-usage:${userId}:${month}`;
}
export function purchasedKey(userId: string) {
  return `agent-purchased:${userId}`;
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
  const planRaw = await kv.get<string>(`user:${userId}:plan`);
  const plan = ["starter", "pro", "agency"].includes(planRaw ?? "") ? planRaw! : "free";
  const monthlyAllowance = PLAN_MONTHLY_CREDITS[plan] ?? 5;

  const month = new Date().toISOString().slice(0, 7); // "2026-02"
  const usedRaw = await kv.get<string | number>(agentUsageKey(userId, month));
  const monthlyUsed = parseInt(String(usedRaw ?? "0"), 10) || 0;
  const monthlyRemaining = Math.max(0, monthlyAllowance - monthlyUsed);

  const purchasedRaw = await kv.get<number>(purchasedKey(userId));
  const purchased = Math.max(0, Number(purchasedRaw ?? 0) || 0);

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
    const proAgents: AgentType[] = ["design-fixer", "creative-director", "motion-designer", "copy-chief", "proof-engine", "domain-ssl", "monetization", "video-pro", "seo-deep"];
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
  const usageKey = agentUsageKey(userId, month);
  const fromMonthly = Math.min(cost, balance.monthlyRemaining);
  const fromPurchased = cost - fromMonthly;

  if (fromMonthly > 0) {
    await kv.incrby(usageKey, fromMonthly);
    await kv.expire(usageKey, 60 * 60 * 24 * 35);
  }
  if (fromPurchased > 0) {
    const remaining = await kv.decrby(purchasedKey(userId), fromPurchased);
    if (remaining < 0) await kv.set(purchasedKey(userId), 0);
  }

  return { ok: true, balance: await getAgentBalance(userId) };
}

// ── Add purchased credits (called from Stripe webhook) ────────────────────────
export async function addPurchasedCredits(userId: string, amount: number): Promise<void> {
  await kv.incrby(purchasedKey(userId), amount);
}
