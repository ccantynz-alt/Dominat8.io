import type { NextApiRequest, NextApiResponse } from "next";
import { kv } from "@vercel/kv";

const KEY = "marketing:dominat8:brandBrief:v1";

function nowIso() {
  return new Date().toISOString();
}

function asString(v: any, fallback: string) {
  return typeof v === "string" && v.trim().length ? v.trim() : fallback;
}

function asStringArray(v: any, fallback: string[]) {
  if (Array.isArray(v)) {
    const out = v.filter((x) => typeof x === "string" && x.trim().length).map((s) => s.trim());
    return out.length ? out : fallback;
  }
  return fallback;
}

function asNumber(v: any, fallback: number) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function asBool(v: any, fallback: boolean) {
  return typeof v === "boolean" ? v : fallback;
}

type BrandBrief = {
  marker: string;
  updatedAtIso: string;
  key: string;

  brand: {
    name: string;
    domain: string;
    product: string;
    tagline: string;
  };

  audience: {
    primary: string;
    secondary: string;
    excluded: string;
  };

  positioning: {
    promise: string;
    differentiators: string[];
    proofPoints: string[];
    objectionsToAddress: string[];
  };

  voice: {
    tone: string[];
    do: string[];
    dont: string[];
    bannedWords: string[];
  };

  visual: {
    style: "premium-dark" | "clean-light";
    density: "spacious" | "compact";
    radius: "2xl" | "3xl";
    blur: "none" | "soft";
    shadow: "none" | "soft";
    maxTextWidth: "narrow" | "normal";
    ctaStyle: "bold" | "minimal";
    emphasis: {
      usePills: boolean;
      useCards: boolean;
      useChecklist: boolean;
      useStatusBadge: boolean;
    };
  };

  seo: {
    primaryKeywords: string[];
    themes: string[];
  };
};

function defaultBrief(): BrandBrief {
  return {
    marker: "AGENT_marketing_brandBrief_v1_2026-01-22",
    updatedAtIso: nowIso(),
    key: KEY,

    brand: {
      name: "Dominat8",
      domain: "www.dominat8.com",
      product: "AI Website Builder",
      tagline: "Build, publish, and rank — on autopilot.",
    },

    audience: {
      primary: "Founders and small business owners who want a great site without technical stress.",
      secondary: "Creators launching offers fast (coaches, agencies, SaaS builders).",
      excluded: "Developers looking for a full custom framework (not the promise).",
    },

    positioning: {
      promise: "A website you’re confident publishing — because readiness is checked before you go live.",
      differentiators: [
        "Readiness-first publishing (you know what’s ready and what isn’t)",
        "Agents ship SEO, pages, sitemap, and publish in one flow",
        "Designed for speed + polish (not fiddly configuration)",
      ],
      proofPoints: [
        "One-click publish pipeline (SEO → pages → sitemap → publish)",
        "Custom domain + auth + billing built-in",
        "Clean sitemaps, canonical URLs, robots.txt",
      ],
      objectionsToAddress: [
        "Will this look professional?",
        "Will SEO actually be shipped, not just suggested?",
        "Can I publish on my domain?",
      ],
    },

    voice: {
      tone: ["calm", "confident", "practical", "founder-first"],
      do: [
        "Use short, clear sentences",
        "Emphasize confidence and readiness",
        "Describe outcomes, not internals",
      ],
      dont: [
        "Don’t over-hype AI",
        "Don’t sound like developer tooling docs",
        "Don’t use buzzword soup",
      ],
      bannedWords: ["revolutionary", "game-changing", "synergy", "disrupt", "unleash"],
    },

    visual: {
      style: "premium-dark",
      density: "spacious",
      radius: "3xl",
      blur: "soft",
      shadow: "soft",
      maxTextWidth: "normal",
      ctaStyle: "bold",
      emphasis: {
        usePills: true,
        useCards: true,
        useChecklist: true,
        useStatusBadge: true,
      },
    },

    seo: {
      primaryKeywords: ["AI website builder", "website builder", "publish website", "SEO website builder"],
      themes: ["readiness", "confidence", "publish", "SEO that ships"],
    },
  };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET" && req.method !== "POST") {
    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  }

  if (req.method === "GET") {
    try {
      const v = (await kv.get(KEY)) as any;
      if (!v) {
        return res.status(200).json({ ok: true, key: KEY, exists: false, brandBrief: null });
      }
      return res.status(200).json({ ok: true, key: KEY, exists: true, brandBrief: v });
    } catch (e: any) {
      return res.status(500).json({ ok: false, key: KEY, error: String(e?.message || e) });
    }
  }

  // POST: write/update brief (partial allowed)
  const body = (req.body ?? {}) as any;

  try {
    const existing = ((await kv.get(KEY)) as any) || defaultBrief();
    const next: BrandBrief = {
      ...existing,
      marker: "AGENT_marketing_brandBrief_v1_2026-01-22",
      updatedAtIso: nowIso(),
      key: KEY,

      brand: {
        name: asString(body?.brand?.name, existing.brand.name),
        domain: asString(body?.brand?.domain, existing.brand.domain),
        product: asString(body?.brand?.product, existing.brand.product),
        tagline: asString(body?.brand?.tagline, existing.brand.tagline),
      },

      audience: {
        primary: asString(body?.audience?.primary, existing.audience.primary),
        secondary: asString(body?.audience?.secondary, existing.audience.secondary),
        excluded: asString(body?.audience?.excluded, existing.audience.excluded),
      },

      positioning: {
        promise: asString(body?.positioning?.promise, existing.positioning.promise),
        differentiators: asStringArray(body?.positioning?.differentiators, existing.positioning.differentiators),
        proofPoints: asStringArray(body?.positioning?.proofPoints, existing.positioning.proofPoints),
        objectionsToAddress: asStringArray(body?.positioning?.objectionsToAddress, existing.positioning.objectionsToAddress),
      },

      voice: {
        tone: asStringArray(body?.voice?.tone, existing.voice.tone),
        do: asStringArray(body?.voice?.do, existing.voice.do),
        dont: asStringArray(body?.voice?.dont, existing.voice.dont),
        bannedWords: asStringArray(body?.voice?.bannedWords, existing.voice.bannedWords),
      },

      visual: {
        style: body?.visual?.style === "clean-light" ? "clean-light" : existing.visual.style,
        density: body?.visual?.density === "compact" ? "compact" : existing.visual.density,
        radius: body?.visual?.radius === "2xl" ? "2xl" : existing.visual.radius,
        blur: body?.visual?.blur === "none" ? "none" : existing.visual.blur,
        shadow: body?.visual?.shadow === "none" ? "none" : existing.visual.shadow,
        maxTextWidth: body?.visual?.maxTextWidth === "narrow" ? "narrow" : existing.visual.maxTextWidth,
        ctaStyle: body?.visual?.ctaStyle === "minimal" ? "minimal" : existing.visual.ctaStyle,
        emphasis: {
          usePills: asBool(body?.visual?.emphasis?.usePills, existing.visual.emphasis.usePills),
          useCards: asBool(body?.visual?.emphasis?.useCards, existing.visual.emphasis.useCards),
          useChecklist: asBool(body?.visual?.emphasis?.useChecklist, existing.visual.emphasis.useChecklist),
          useStatusBadge: asBool(body?.visual?.emphasis?.useStatusBadge, existing.visual.emphasis.useStatusBadge),
        },
      },

      seo: {
        primaryKeywords: asStringArray(body?.seo?.primaryKeywords, existing.seo.primaryKeywords),
        themes: asStringArray(body?.seo?.themes, existing.seo.themes),
      },
    };

    await kv.set(KEY, next);
    return res.status(200).json({ ok: true, key: KEY, exists: true, brandBrief: next });
  } catch (e: any) {
    return res.status(500).json({ ok: false, key: KEY, error: String(e?.message || e) });
  }
}
