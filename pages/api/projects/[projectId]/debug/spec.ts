import type { NextApiRequest, NextApiResponse } from "next";

type KVGetResponse = { result?: any; error?: string };

const CANDIDATE_KEYS = [
  // common patterns
  "project:{projectId}:siteSpec",
  "project:{projectId}:spec",
  "project:{projectId}:draftSpec",
  "project:{projectId}:publishedSpec",
  "project:{projectId}:site_spec",
  "project:{projectId}:seedSpec",

  // other plausible patterns
  "projects:{projectId}:siteSpec",
  "projects:{projectId}:spec",
  "siteSpec:{projectId}",
  "spec:{projectId}",
];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ ok: false, error: "Method Not Allowed", allow: ["GET"] });
  }

  const projectId = String(req.query.projectId || "").trim();
  if (!projectId) return res.status(400).json({ ok: false, error: "Missing projectId" });

  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;

  if (!url || !token) {
    return res.status(500).json({
      ok: false,
      error: "Missing KV REST env vars",
      missing: {
        KV_REST_API_URL: !url,
        KV_REST_API_TOKEN: !token,
      },
    });
  }

  const tried: Array<{ key: string; found: boolean; type: string | null }> = [];

  for (const raw of CANDIDATE_KEYS) {
    const key = raw.replace("{projectId}", projectId);

    const v = await kvGetJson(url, token, key);
    const found = v !== null && v !== undefined;

    tried.push({ key, found, type: found ? typeof v : null });

    if (found) {
      return res.status(200).json({
        ok: true,
        projectId,
        foundKey: key,
        preview: summarize(v),
        full: v,
        tried,
      });
    }
  }

  return res.status(404).json({
    ok: false,
    projectId,
    error: "No spec found under known keys",
    tried,
  });
}

async function kvGetJson(baseUrl: string, token: string, key: string) {
  // Works for Vercel KV / Upstash-style REST GET
  const endpoint = `${baseUrl.replace(/\/$/, "")}/get/${encodeURIComponent(key)}`;

  const r = await fetch(endpoint, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!r.ok) return null;

  const data = (await r.json()) as KVGetResponse;
  const result = data?.result;

  // Upstash/Vercel often returns JSON as a string; try to parse
  if (typeof result === "string") {
    try {
      return JSON.parse(result);
    } catch {
      return result;
    }
  }

  return result ?? null;
}

function summarize(v: any) {
  const out: any = {};

  // brand-ish
  if (v?.brandName) out.brandName = v.brandName;
  if (v?.brand?.name) out.brand = v.brand.name;
  if (v?.tagline) out.tagline = v.tagline;
  if (v?.brand?.tagline) out.brandTagline = v.brand.tagline;

  // hero-ish
  if (v?.headline) out.headline = v.headline;
  if (v?.subheadline) out.subheadline = v.subheadline;
  if (v?.hero?.headline) out.heroHeadline = v.hero.headline;
  if (v?.hero?.subheadline) out.heroSubheadline = v.hero.subheadline;

  // features/pricing-ish
  if (Array.isArray(v?.features)) out.featuresCount = v.features.length;
  if (v?.pricing && typeof v.pricing === "object") out.pricingKeys = Object.keys(v.pricing);

  // meta
  out.valueType = typeof v;

  return out;
}
