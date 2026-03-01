/**
 * Add-on system — revenue-generating features for site builders.
 *
 * Each add-on either:
 *   - Generates recurring monthly revenue (subscription add-ons)
 *   - Generates one-time revenue (purchase add-ons)
 *   - Provides value that increases retention + LTV
 *
 * Revenue model per add-on with estimated margins:
 *
 * ┌─────────────────────┬────────┬──────────┬─────────────┬─────────┐
 * │ Add-on              │ Price  │ Our Cost │ Margin      │ Type    │
 * ├─────────────────────┼────────┼──────────┼─────────────┼─────────┤
 * │ Custom Domain + SSL │ $5/mo  │ ~$0      │ ~100%       │ Monthly │
 * │ White-Label          │ $19/mo │ $0       │ 100%        │ Monthly │
 * │ Priority Queue       │ $9/mo  │ ~$2/mo   │ ~78%        │ Monthly │
 * │ Analytics Dashboard  │ $7/mo  │ ~$1/mo   │ ~86%        │ Monthly │
 * │ Lead Capture Forms   │ $5/mo  │ ~$0.50   │ ~90%        │ Monthly │
 * │ A/B Testing          │ $12/mo │ ~$3/mo   │ ~75%        │ Monthly │
 * │ Scheduled Rebuild    │ $4/mo  │ ~$0.50   │ ~88%        │ Monthly │
 * │ Multi-Page (5 pages) │ $9.99  │ ~$1.50   │ ~85%        │ One-time│
 * │ Monthly SEO Monitor  │ $15/mo │ ~$0.50   │ ~97%        │ Monthly │
 * │ AI Live Chat Widget  │ $8/mo  │ ~$2/mo   │ ~75%        │ Monthly │
 * └─────────────────────┴────────┴──────────┴─────────────┴─────────┘
 *
 * Combined add-on revenue potential per user:
 *   - Light user:  $5-10/mo in add-ons on top of plan
 *   - Power user:  $30-50/mo in add-ons
 *   - Agency user: $50-100/mo across multiple sites
 */

import { kv } from "@vercel/kv";

// ── Add-on definitions ───────────────────────────────────────────────────────

export interface Addon {
  id: string;
  label: string;
  description: string;
  icon: string;
  priceCents: number;
  billingType: "monthly" | "one-time";
  category: "growth" | "branding" | "performance" | "intelligence";
  minPlan: "free" | "starter" | "pro" | "agency";
  marginPercent: number;
  popular?: boolean;
}

export const ADDONS: Addon[] = [
  // ── Growth add-ons (help them get more customers) ──────────────────────────
  {
    id: "lead-capture",
    label: "Lead Capture Forms",
    description: "Add email capture forms with auto-responders. Leads are stored in your dashboard and forwarded to your email. Integrates with Mailchimp, ConvertKit, and Zapier.",
    icon: "📧",
    priceCents: 500,
    billingType: "monthly",
    category: "growth",
    minPlan: "starter",
    marginPercent: 90,
    popular: true,
  },
  {
    id: "live-chat",
    label: "AI Live Chat Widget",
    description: "Add an AI-powered chat widget to your site that answers visitor questions 24/7 using your site content. Captures leads when human follow-up is needed.",
    icon: "💬",
    priceCents: 800,
    billingType: "monthly",
    category: "growth",
    minPlan: "pro",
    marginPercent: 75,
  },
  {
    id: "ab-testing",
    label: "A/B Testing",
    description: "Generate 2 variants of your site and split traffic 50/50. See which converts better with real-time stats. Auto-promote the winner after 7 days.",
    icon: "🔬",
    priceCents: 1200,
    billingType: "monthly",
    category: "growth",
    minPlan: "pro",
    marginPercent: 75,
    popular: true,
  },
  {
    id: "analytics",
    label: "Analytics Dashboard",
    description: "Privacy-first analytics (no cookies). Track visitors, page views, scroll depth, CTA clicks, bounce rate, and conversion funnels. GDPR-compliant.",
    icon: "📊",
    priceCents: 700,
    billingType: "monthly",
    category: "growth",
    minPlan: "starter",
    marginPercent: 86,
  },

  // ── Branding add-ons (make it theirs) ──────────────────────────────────────
  {
    id: "custom-domain",
    label: "Custom Domain + SSL",
    description: "Connect your own domain (e.g. yourbrand.com). Automatic SSL certificate, instant propagation, and CDN-backed hosting.",
    icon: "🌐",
    priceCents: 500,
    billingType: "monthly",
    category: "branding",
    minPlan: "pro",
    marginPercent: 100,
    popular: true,
  },
  {
    id: "white-label",
    label: "White-Label Output",
    description: "Remove all 'Built with Dominat8.io' branding. Your site, your brand, zero trace of us. Perfect for agencies and client work.",
    icon: "🏷️",
    priceCents: 1900,
    billingType: "monthly",
    category: "branding",
    minPlan: "agency",
    marginPercent: 100,
  },

  // ── Performance add-ons (keep it running + improving) ──────────────────────
  {
    id: "priority-queue",
    label: "Priority Queue",
    description: "Jump the queue and get Opus-powered generation (highest quality model). 2-3x faster generation times during peak hours.",
    icon: "⚡",
    priceCents: 900,
    billingType: "monthly",
    category: "performance",
    minPlan: "starter",
    marginPercent: 78,
  },
  {
    id: "scheduled-rebuild",
    label: "Scheduled Auto-Rebuild",
    description: "Your site is automatically regenerated on a schedule (weekly or monthly). Keeps content fresh and seasonally relevant without manual work.",
    icon: "🔄",
    priceCents: 400,
    billingType: "monthly",
    category: "performance",
    minPlan: "pro",
    marginPercent: 88,
  },
  {
    id: "multi-page",
    label: "Multi-Page Expansion",
    description: "Expand from a single landing page to a full 5-page site: Home, About, Services, Contact, FAQ. All pages share the same design system.",
    icon: "📄",
    priceCents: 999,
    billingType: "one-time",
    category: "performance",
    minPlan: "starter",
    marginPercent: 85,
    popular: true,
  },

  // ── Intelligence add-ons (ongoing AI-powered improvements) ─────────────────
  {
    id: "seo-monthly",
    label: "Monthly SEO Monitoring",
    description: "AI scans your site monthly for SEO issues and auto-applies fixes. Tracks keyword rankings, meta tag freshness, and technical SEO signals. Monthly report emailed to you.",
    icon: "🔍",
    priceCents: 1500,
    billingType: "monthly",
    category: "intelligence",
    minPlan: "pro",
    marginPercent: 97,
  },
];

// ── Add-on access check ──────────────────────────────────────────────────────

const PLAN_RANK: Record<string, number> = {
  free: 0,
  starter: 1,
  pro: 2,
  agency: 3,
};

export function getAvailableAddons(plan: string): { available: Addon[]; locked: Addon[] } {
  const rank = PLAN_RANK[plan] ?? 0;
  const available: Addon[] = [];
  const locked: Addon[] = [];

  for (const addon of ADDONS) {
    if (rank >= (PLAN_RANK[addon.minPlan] ?? 0)) {
      available.push(addon);
    } else {
      locked.push(addon);
    }
  }

  return { available, locked };
}

// ── User add-on state ────────────────────────────────────────────────────────

export async function getUserAddons(userId: string): Promise<string[]> {
  const raw = await kv.get<string[]>(`addons:${userId}`);
  return raw ?? [];
}

export async function enableAddon(userId: string, addonId: string): Promise<void> {
  const current = await getUserAddons(userId);
  if (!current.includes(addonId)) {
    await kv.set(`addons:${userId}`, [...current, addonId]);
  }
}

export async function disableAddon(userId: string, addonId: string): Promise<void> {
  const current = await getUserAddons(userId);
  await kv.set(`addons:${userId}`, current.filter((id) => id !== addonId));
}

export function hasAddon(activeAddons: string[], addonId: string): boolean {
  return activeAddons.includes(addonId);
}

// ── Revenue calculations ─────────────────────────────────────────────────────

export function calculateAddonRevenue(activeAddonIds: string[]): {
  monthlyRevenueCents: number;
  onetimeRevenueCents: number;
  totalMarginCents: number;
} {
  let monthlyRevenueCents = 0;
  let onetimeRevenueCents = 0;
  let totalMarginCents = 0;

  for (const id of activeAddonIds) {
    const addon = ADDONS.find((a) => a.id === id);
    if (!addon) continue;

    if (addon.billingType === "monthly") {
      monthlyRevenueCents += addon.priceCents;
    } else {
      onetimeRevenueCents += addon.priceCents;
    }
    totalMarginCents += Math.round(addon.priceCents * addon.marginPercent / 100);
  }

  return { monthlyRevenueCents, onetimeRevenueCents, totalMarginCents };
}

// ── Revenue potential ────────────────────────────────────────────────────────
// Total addressable revenue if a user buys every add-on available for their plan:

export function maxRevenuePotential(plan: string): {
  maxMonthlyCents: number;
  maxOnetimeCents: number;
  description: string;
} {
  const { available } = getAvailableAddons(plan);
  let maxMonthlyCents = 0;
  let maxOnetimeCents = 0;

  for (const addon of available) {
    if (addon.billingType === "monthly") {
      maxMonthlyCents += addon.priceCents;
    } else {
      maxOnetimeCents += addon.priceCents;
    }
  }

  return {
    maxMonthlyCents,
    maxOnetimeCents,
    description: `Up to $${(maxMonthlyCents / 100).toFixed(2)}/mo recurring + $${(maxOnetimeCents / 100).toFixed(2)} one-time`,
  };
}
