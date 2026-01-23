import type { NextApiRequest, NextApiResponse } from "next";
import { kv } from '../../../src/lib/kv';

const MARKER = "CANON_marketing_usecase_read_v1_2026-01-23";

function cleanSlug(v: any) {
  const s = String(v || "").trim().toLowerCase();
  const ok = /^[a-z0-9-]{3,80}$/.test(s);
  return ok ? s : "";
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ ok: false, marker: MARKER, error: "Method Not Allowed" });
  }

  const slug = cleanSlug(req.query.slug);

  if (!slug) {
    return res.status(400).json({
      ok: false,
      marker: MARKER,
      error: "Missing/invalid slug. Use ?slug=ai-plumber-website (a-z0-9- only, 3-80 chars).",
    });
  }

  const key = "marketing:dominat8:usecase:" + slug + ":pageSpec:v1";
  const spec = (await kv.get(key)) as any;

  return res.status(200).json({
    ok: true,
    marker: MARKER,
    found: !!spec,
    slug,
    key,
    spec: spec || null,
  });
}

