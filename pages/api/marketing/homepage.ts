import type { NextApiRequest, NextApiResponse } from "next";
import { kv } from "@vercel/kv";

const KEY_BRIEF = "marketing:dominat8:brandBrief:v1";
const KEY_HERO_LAYOUT = "marketing:dominat8:heroLayout:v1";
const KEY_READINESS = "marketing:dominat8:readinessCard:v1";
const KEY_FLOW = "marketing:dominat8:flow:v1";
const KEY_HOME = "marketing:dominat8:homepage:v1";

function nowIso() {
  return new Date().toISOString();
}

type AnyObj = Record<string, any>;

async function getObj(key: string): Promise<AnyObj | null> {
  try {
    const v = (await kv.get(key)) as any;
    return v && typeof v === "object" ? v : null;
  } catch {
    return null;
  }
}

function fallbackHomepage() {
  return {
    marker: "AGENT_marketing_homepage_v2_2026-01-22",
    updatedAtIso: nowIso(),
    brand: {
      name: "Dominat8",
      domain: "www.dominat8.com",
      product: "AI Website Builder",
      tagline: "Build, publish, and rank-on autopilot.",
    },
    hero: {
      headline: "Launch a high-converting website in minutes — with Dominat8.",
      subheadline:
        "AI Website Builder that plans the pages, writes the copy, ships SEO, and publishes for you. No fiddly setup. Just results.",
      bullets: [
        "One-click publish pipeline (SEO → pages → sitemap → publish)",
        "Custom domain + auth + billing ready for launch",
        "Built for growth: program pages, intent pages, and clean sitemaps",
      ],
      primaryCta: { label: "Start building", href: "/sign-in" },
      secondaryCta: { label: "View gallery", href: "/templates" },
      socialProof: "Trusted by builders who want speed, polish, and SEO that actually ships.",
    },
    pricing: {
      title: "Pricing that scales with your ambition",
      subtitle: "Start free. Upgrade when you’re ready to automate everything.",
      tiers: [
        {
          id: "free",
          name: "Free",
          price: "$0",
          period: "forever",
          blurb: "Get a site live fast and test ideas.",
          features: ["Starter site generation", "Basic publish flow", "Hosted on Dominat8"],
          cta: { label: "Start free", href: "/sign-in" },
        },
        {
          id: "pro",
          name: "Pro",
          price: "$29",
          period: "per month",
          blurb: "For creators who want automation + SEO power.",
          features: [
            "Full agent pipeline (SEO + finish-for-me)",
            "Custom domain support",
            "Sitemaps + robots + canonical URLs",
            "Priority generation queue",
          ],
          cta: { label: "Go Pro", href: "/sign-in" },
          highlight: true,
        },
        {
          id: "business",
          name: "Business",
          price: "Let’s talk",
          period: "",
          blurb: "Teams shipping many sites, fast.",
          features: ["Multi-project workflows", "Higher limits + dedicated support", "Custom integrations"],
          cta: { label: "Contact", href: "/sign-in" },
        },
      ],
      footnote: "Pricing copy is placeholder. You can swap numbers and tier names anytime without changing the agent structure.",
    },
    cta: {
      headline: "Ready to ship something beautiful?",
      subheadline: "Stop wrestling with builders. Let agents generate the pages, polish the copy, and publish on your domain.",
      primaryCta: { label: "Create my site", href: "/sign-in" },
      secondaryCta: { label: "See a live example", href: "/p" },
    },
  };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  }

  // Existing homepage KV (copy)
  const existing = (await getObj(KEY_HOME)) || fallbackHomepage();

  // Layout decisions (render contracts)
  const brandBrief = await getObj(KEY_BRIEF);
  const heroLayout = await getObj(KEY_HERO_LAYOUT);
  const readinessCard = await getObj(KEY_READINESS);
  const flow = await getObj(KEY_FLOW);

  // Compose output: keep copy, add "layout" section for rendering
  const out = {
    ok: true,
    key: KEY_HOME,
    exists: true,
    homepage: {
      ...existing,
      marker: "AGENT_marketing_homepage_compose_v1_2026-01-22",
      updatedAtIso: nowIso(),
      layout: {
        fromBrief: !!brandBrief,
        brandBrief,
        heroLayout,
        readinessCard,
        flow,
      },
    },
  };

  return res.status(200).json(out);
}
