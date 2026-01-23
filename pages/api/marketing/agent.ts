import type { NextApiRequest, NextApiResponse } from "next";
import { kv } from "@vercel/kv";

const MARKER = "AGENT_marketing_generic_v1_2026-01-22";

function nowIso() {
  return new Date().toISOString();
}

function asString(v: any) {
  return typeof v === "string" ? v : "";
}

function safeTrim(v: any) {
  return asString(v).trim();
}

function boolish(v: any) {
  if (v === true) return true;
  const s = safeTrim(v).toLowerCase();
  return s === "1" || s === "true" || s === "yes";
}

function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n));
}

function getTarget(req: NextApiRequest): string {
  const q = req.query.target;
  if (typeof q === "string" && q.trim()) return q.trim();
  if (Array.isArray(q) && q[0] && q[0].trim()) return q[0].trim();
  return "";
}

function keyForTarget(target: string): string {
  // We only allow a safe subset to prevent writing arbitrary keys.
  // Add more targets here safely later.
  const t = target.toLowerCase();
  if (t === "features") return "marketing:dominat8:features:v1";
  if (t === "faq") return "marketing:dominat8:faq:v1";
  if (t === "testimonials") return "marketing:dominat8:testimonials:v1";
  if (t === "seo") return "marketing:dominat8:seo:v1";
  if (t === "homepage") return "marketing:dominat8:homepage:v1";
  if (t === "pricing") return "marketing:dominat8:pricing:v1";
  return "";
}

type FeaturesSpec = {
  marker: string;
  updatedAtIso: string;
  title: string;
  subtitle: string;
  items: Array<{ title: string; description: string }>;
};

type FaqSpec = {
  marker: string;
  updatedAtIso: string;
  title: string;
  items: Array<{ q: string; a: string }>;
};

type TestimonialsSpec = {
  marker: string;
  updatedAtIso: string;
  title: string;
  items: Array<{ name: string; role: string; quote: string }>;
};

type SeoSpec = {
  marker: string;
  updatedAtIso: string;
  title: string;
  description: string;
  ogTitle: string;
  ogDescription: string;
};

function genFeatures(brandName: string, product: string): FeaturesSpec {
  const bn = brandName || "Dominat8";
  const pr = product || "AI Website Builder";

  return {
    marker: MARKER,
    updatedAtIso: nowIso(),
    title: "Everything you need to ship and scale",
    subtitle: `${bn} turns your idea into a polished, SEO-ready site — fast.`,
    items: [
      {
        title: "Agent-powered generation",
        description: `Plans your pages, writes copy, and structures sections for conversion — so you don't start from blank.`,
      },
      {
        title: "SEO that ships",
        description: "SEO plans, canonical URLs, sitemaps, robots.txt — generated and published automatically.",
      },
      {
        title: "One-click publish pipeline",
        description: "SEO → finish-for-me → sitemap → publish. Run it again anytime to improve the site.",
      },
      {
        title: "Custom domains + billing",
        description: "Launch on your domain with auth + Stripe billing flows ready for Pro upgrades.",
      },
      {
        title: "Template + gallery system",
        description: "Turn any project into a shareable showcase and build a gallery that updates automatically.",
      },
      {
        title: "Built for program pages",
        description: "Create intent-driven pages at scale to rank and convert across many keywords.",
      },
    ],
  };
}

function genFaq(brandName: string): FaqSpec {
  const bn = brandName || "Dominat8";
  return {
    marker: MARKER,
    updatedAtIso: nowIso(),
    title: "Frequently asked questions",
    items: [
      {
        q: `What is ${bn}?`,
        a: `${bn} is an AI website builder that generates a conversion-focused site and publishes it with SEO built in.`,
      },
      {
        q: "Do I need to code?",
        a: "No. The agents generate the content and structure. You can still customize if you want.",
      },
      {
        q: "Can I use my own domain?",
        a: "Yes. Custom domain support is built into the platform and can be enabled on Pro.",
      },
      {
        q: "How does SEO work?",
        a: "The pipeline generates an SEO plan, metadata, sitemap/robots, and publishes updates when you rerun it.",
      },
      {
        q: "Can I regenerate the homepage anytime?",
        a: "Yes. Use the marketing agents with force=1 to regenerate content instantly.",
      },
    ],
  };
}

function genTestimonials(brandName: string): TestimonialsSpec {
  const bn = brandName || "Dominat8";
  return {
    marker: MARKER,
    updatedAtIso: nowIso(),
    title: "What builders are saying",
    items: [
      { name: "Ava", role: "Solo founder", quote: `${bn} took me from idea to a live site in under an hour. The copy was shockingly good.` },
      { name: "Noah", role: "Agency owner", quote: `The pipeline approach is brilliant — iterate, publish, rank. It feels like a growth engine.` },
      { name: "Mia", role: "Creator", quote: `I finally shipped a clean landing page that actually converts. No more tweaking templates for days.` },
    ],
  };
}

function genSeo(brandName: string, product: string, domain: string): SeoSpec {
  const bn = brandName || "Dominat8";
  const pr = product || "AI Website Builder";
  const dm = domain || "www.dominat8.com";

  const title = `${bn} — ${pr} that builds, publishes, and ranks`;
  const description = `Generate a beautiful, high-converting website with built-in SEO and one-click publishing. Launch on ${dm} in minutes.`;

  return {
    marker: MARKER,
    updatedAtIso: nowIso(),
    title,
    description,
    ogTitle: title,
    ogDescription: description,
  };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const target = getTarget(req);
  const key = keyForTarget(target);

  if (!target || !key) {
    return res.status(400).json({
      ok: false,
      error: "Missing or invalid target. Use ?target=features|faq|testimonials|seo",
      receivedTarget: target || null,
      allowed: ["features", "faq", "testimonials", "seo"],
    });
  }

  const method = req.method || "GET";

  if (method === "GET") {
    const v: any = await kv.get(key);
    return res.status(200).json({
      ok: true,
      marker: MARKER,
      target,
      key,
      exists: !!v,
      value: v || null,
    });
  }

  if (method !== "POST") {
    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  }

  // parse body safely
  let body: any = req.body;
  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch { body = {}; }
  }

  const force = boolish((req.query.force as any) ?? body?.force);

  const existing: any = await kv.get(key);
  if (existing && !force) {
    return res.status(200).json({
      ok: true,
      marker: MARKER,
      target,
      key,
      exists: true,
      reused: true,
      value: existing,
      note: "Already exists. Use ?force=1 (or body.force=true) to regenerate.",
    });
  }

  const brandName = safeTrim(body?.brandName) || "Dominat8";
  const product = safeTrim(body?.product) || "AI Website Builder";
  const domain = safeTrim(body?.domain) || "www.dominat8.com";

  // Optional length knobs
  const countRaw = safeTrim(body?.count);
  const count = countRaw ? clamp(Number(countRaw), 2, 12) : null;

  let value: any = null;

  if (target.toLowerCase() === "features") {
    const spec = genFeatures(brandName, product);
    if (count != null) spec.items = spec.items.slice(0, count);
    value = spec;
  } else if (target.toLowerCase() === "faq") {
    const spec = genFaq(brandName);
    if (count != null) spec.items = spec.items.slice(0, count);
    value = spec;
  } else if (target.toLowerCase() === "testimonials") {
    const spec = genTestimonials(brandName);
    if (count != null) spec.items = spec.items.slice(0, count);
    value = spec;
  } else if (target.toLowerCase() === "seo") {
    value = genSeo(brandName, product, domain);
  } else {
    return res.status(400).json({ ok: false, error: "Unsupported target" });
  }

  await kv.set(key, value);

  return res.status(200).json({
    ok: true,
    marker: MARKER,
    target,
    key,
    exists: true,
    reused: false,
    updatedAtIso: value?.updatedAtIso || nowIso(),
    value,
  });
}
