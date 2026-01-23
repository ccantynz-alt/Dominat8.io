import type { NextApiRequest, NextApiResponse } from "next";
import { kv } from "@vercel/kv";

function nowIso() {
  return new Date().toISOString();
}

async function postJson(url: string, body: any, req: NextApiRequest) {
  const proto =
    (req.headers["x-forwarded-proto"] as string) ||
    (req.headers["x-forwarded-protocol"] as string) ||
    "http";
  const host = (req.headers["x-forwarded-host"] as string) || req.headers.host;
  const base = `${proto}://${host}`;
  const full = `${base}${url}${url.includes("?") ? "&" : "?"}ts=${Date.now()}`;

  const r = await fetch(full, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body ?? {}),
    cache: "no-store",
  });

  const ct = r.headers.get("content-type") || "";
  const payload = ct.includes("application/json") ? await r.json() : await r.text();
  return { ok: r.ok, status: r.status, url: full, payload };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  }

  const body = (req.body ?? {}) as any;

  // Optional overrides; normally these come from brandBrief now.
  const brandName = typeof body.brandName === "string" ? body.brandName : "Dominat8";
  const product = typeof body.product === "string" ? body.product : "AI Website Builder";

  const t0 = Date.now();

  try {
    const results = [];
    results.push(await postJson("/api/marketing/hero-layout", { brandName, product }, req));
    results.push(await postJson("/api/marketing/readiness-card", { brandName }, req));
    results.push(await postJson("/api/marketing/flow", { brandName }, req));

    const ok = results.every((x) => x.ok);

    await kv.set("marketing:dominat8:layoutPack:v1", {
      marker: "AGENT_marketing_layoutPack_v2_2026-01-22",
      updatedAtIso: nowIso(),
      ok,
      ms: Date.now() - t0,
      resultsSummary: results.map((r) => ({ ok: r.ok, status: r.status, url: r.url })),
    });

    return res.status(ok ? 200 : 500).json({
      ok,
      marker: "AGENT_marketing_layout_generate_v2_2026-01-22",
      updatedAtIso: nowIso(),
      ms: Date.now() - t0,
      results,
    });
  } catch (e: any) {
    return res.status(500).json({
      ok: false,
      error: String(e?.message || e),
      marker: "AGENT_marketing_layout_generate_v2_2026-01-22",
    });
  }
}
