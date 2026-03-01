/**
 * Cost Tracker & Margin Calculator
 *
 * Tracks actual API costs per generation so you know exactly:
 *   - What each generation costs you
 *   - What you charge the customer
 *   - Your margin per operation
 *   - Monthly P&L across all users
 *
 * All costs in USD cents to avoid floating point issues.
 */

import { kv } from "@vercel/kv";

// ── API pricing per 1M tokens (in cents) ─────────────────────────────────────

export const MODEL_COSTS: Record<string, { inputPer1M: number; outputPer1M: number }> = {
  // Claude models (cents per 1M tokens)
  "claude-opus-4-6-20250514":    { inputPer1M: 500,  outputPer1M: 2500 },
  "claude-sonnet-4-6-20250514":  { inputPer1M: 300,  outputPer1M: 1500 },
  "claude-haiku-4-5-20251001":   { inputPer1M: 100,  outputPer1M: 500  },
  // OpenAI models
  "gpt-4o":                      { inputPer1M: 250,  outputPer1M: 1000 },
  "gpt-4o-mini":                 { inputPer1M: 15,   outputPer1M: 60   },
};

// ── What we charge customers (cents) ─────────────────────────────────────────

export const CUSTOMER_PRICES = {
  // Per-generation pricing (embedded in plan cost)
  plans: {
    free:    { monthlyCents: 0,    generations: 3,   perGenCents: 0 },
    starter: { monthlyCents: 900,  generations: 20,  perGenCents: 45 },  // $9/mo ÷ 20 = $0.45/gen
    pro:     { monthlyCents: 2900, generations: 100, perGenCents: 29 },  // $29/mo ÷ 100 = $0.29/gen
    agency:  { monthlyCents: 9900, generations: 500, perGenCents: 20 },  // $99/mo ÷ 500 = $0.198/gen
  },
  // Overage pricing
  overagePerGenCents: 49,  // $0.49 per overage generation
  // Credit pack pricing
  creditPacks: {
    pack_50:  { cents: 499,  credits: 50,  perCreditCents: 10 },
    pack_200: { cents: 1499, credits: 200, perCreditCents: 7.5 },
    pack_500: { cents: 2999, credits: 500, perCreditCents: 6 },
  },
  // Add-on pricing (NEW)
  addons: {
    "custom-domain":      { monthlyCents: 500,  label: "Custom Domain + SSL" },
    "white-label":        { monthlyCents: 1900, label: "White-Label (remove branding)" },
    "priority-queue":     { monthlyCents: 900,  label: "Priority Queue (Opus model)" },
    "analytics":          { monthlyCents: 700,  label: "Analytics Dashboard" },
    "lead-capture":       { monthlyCents: 500,  label: "Lead Capture Forms" },
    "ab-testing":         { monthlyCents: 1200, label: "A/B Testing (2 variants)" },
    "scheduled-rebuild":  { monthlyCents: 400,  label: "Scheduled Auto-Rebuild" },
    "multi-page":         { onetimeCents: 999,  label: "Multi-Page Expansion (5 pages)" },
    "seo-monthly":        { monthlyCents: 1500, label: "Monthly SEO Monitoring" },
    "live-chat":          { monthlyCents: 800,  label: "AI Live Chat Widget" },
  },
} as const;

// ── Cost calculation ─────────────────────────────────────────────────────────

export interface GenerationCost {
  model: string;
  inputTokens: number;
  outputTokens: number;
  thinkingTokens: number;
  cachedInputTokens: number;
  apiCostCents: number;      // what Anthropic/OpenAI charges us
  customerPriceCents: number; // what we charge the customer
  marginCents: number;        // profit per generation
  marginPercent: number;      // margin as percentage
}

export function calculateCost(
  model: string,
  inputTokens: number,
  outputTokens: number,
  thinkingTokens = 0,
  cachedInputTokens = 0,
  plan = "pro",
): GenerationCost {
  const pricing = MODEL_COSTS[model] ?? MODEL_COSTS["claude-sonnet-4-6-20250514"];

  // Cached tokens are 90% cheaper
  const fullInputTokens = inputTokens - cachedInputTokens;
  const inputCostCents = (fullInputTokens / 1_000_000) * pricing.inputPer1M;
  const cachedCostCents = (cachedInputTokens / 1_000_000) * pricing.inputPer1M * 0.1;
  const outputCostCents = (outputTokens / 1_000_000) * pricing.outputPer1M;
  // Thinking tokens are charged at output rate
  const thinkingCostCents = (thinkingTokens / 1_000_000) * pricing.outputPer1M;

  const apiCostCents = Math.round(
    (inputCostCents + cachedCostCents + outputCostCents + thinkingCostCents) * 100
  ) / 100;

  const planPricing = CUSTOMER_PRICES.plans[plan as keyof typeof CUSTOMER_PRICES.plans]
    ?? CUSTOMER_PRICES.plans.pro;
  const customerPriceCents = planPricing.perGenCents;

  const marginCents = Math.round((customerPriceCents - apiCostCents) * 100) / 100;
  const marginPercent = customerPriceCents > 0
    ? Math.round((marginCents / customerPriceCents) * 10000) / 100
    : 0;

  return {
    model,
    inputTokens,
    outputTokens,
    thinkingTokens,
    cachedInputTokens,
    apiCostCents,
    customerPriceCents,
    marginCents,
    marginPercent,
  };
}

// ── Typical cost estimates per model ─────────────────────────────────────────
// Based on average generation: ~2K input tokens (system prompt + user prompt)
// + ~8K output tokens (HTML). These help with pricing decisions.

export const TYPICAL_COSTS = {
  "claude-haiku":  calculateCost("claude-haiku-4-5-20251001", 2000, 8000, 0, 0, "pro"),
  "claude-sonnet": calculateCost("claude-sonnet-4-6-20250514", 2000, 8000, 4000, 1500, "pro"),
  "claude-opus":   calculateCost("claude-opus-4-6-20250514", 2000, 12000, 8000, 1500, "pro"),
  "gpt-4o":        calculateCost("gpt-4o", 2000, 8000, 0, 0, "pro"),
};

// ── KV-based usage tracking ──────────────────────────────────────────────────

export async function trackGenerationCost(
  userId: string,
  cost: GenerationCost,
): Promise<void> {
  const month = new Date().toISOString().slice(0, 7);
  const dayKey = new Date().toISOString().slice(0, 10);

  // Track per-user monthly spend
  const userMonthKey = `cost:user:${userId}:${month}`;
  await kv.incrbyfloat(userMonthKey, cost.apiCostCents);
  await kv.expire(userMonthKey, 60 * 60 * 24 * 45);

  // Track global daily revenue + cost
  const dailyCostKey = `cost:global:api:${dayKey}`;
  const dailyRevKey = `cost:global:revenue:${dayKey}`;
  await kv.incrbyfloat(dailyCostKey, cost.apiCostCents);
  await kv.incrbyfloat(dailyRevKey, cost.customerPriceCents);
  await kv.expire(dailyCostKey, 60 * 60 * 24 * 90);
  await kv.expire(dailyRevKey, 60 * 60 * 24 * 90);

  // Track per-model usage count
  const modelKey = `cost:model:${cost.model}:${month}`;
  await kv.incr(modelKey);
  await kv.expire(modelKey, 60 * 60 * 24 * 45);
}

// ── Margin summary for admin dashboard ───────────────────────────────────────

export interface MarginSummary {
  month: string;
  totalApiCostCents: number;
  totalRevenueCents: number;
  marginCents: number;
  marginPercent: number;
  generationCount: number;
  avgCostPerGenCents: number;
  avgRevenuePerGenCents: number;
  modelBreakdown: Record<string, number>;
}

export async function getMarginSummary(month?: string): Promise<MarginSummary> {
  const m = month ?? new Date().toISOString().slice(0, 7);

  // Sum daily costs for the month
  let totalApiCost = 0;
  let totalRevenue = 0;
  const daysInMonth = new Date(parseInt(m.slice(0, 4)), parseInt(m.slice(5, 7)), 0).getDate();

  for (let d = 1; d <= daysInMonth; d++) {
    const dayKey = `${m}-${String(d).padStart(2, "0")}`;
    const [cost, rev] = await Promise.all([
      kv.get<number>(`cost:global:api:${dayKey}`),
      kv.get<number>(`cost:global:revenue:${dayKey}`),
    ]);
    totalApiCost += Number(cost ?? 0);
    totalRevenue += Number(rev ?? 0);
  }

  // Model breakdown
  const models = [
    "claude-opus-4-6-20250514",
    "claude-sonnet-4-6-20250514",
    "claude-haiku-4-5-20251001",
    "gpt-4o",
    "gpt-4o-mini",
  ];
  const modelBreakdown: Record<string, number> = {};
  let totalGens = 0;
  for (const model of models) {
    const count = Number(await kv.get<number>(`cost:model:${model}:${m}`) ?? 0);
    if (count > 0) {
      modelBreakdown[model] = count;
      totalGens += count;
    }
  }

  const marginCents = totalRevenue - totalApiCost;

  return {
    month: m,
    totalApiCostCents: Math.round(totalApiCost * 100) / 100,
    totalRevenueCents: Math.round(totalRevenue * 100) / 100,
    marginCents: Math.round(marginCents * 100) / 100,
    marginPercent: totalRevenue > 0
      ? Math.round((marginCents / totalRevenue) * 10000) / 100
      : 0,
    generationCount: totalGens,
    avgCostPerGenCents: totalGens > 0 ? Math.round((totalApiCost / totalGens) * 100) / 100 : 0,
    avgRevenuePerGenCents: totalGens > 0 ? Math.round((totalRevenue / totalGens) * 100) / 100 : 0,
    modelBreakdown,
  };
}
