// pages/api/projects/[projectId]/agents/sitemap.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { kv } from "../../../../../src/lib/kv";

function getBaseUrl(req: NextApiRequest) {
  const proto = (req.headers["x-forwarded-proto"] as string) || "https";
  const host = req.headers.host;
  return `${proto}://${host}`;
}

function sitemapKey(projectId: string) {
  // âœ… Canonical key expected by pages/api/projects/[projectId]/debug/spec.ts allowlist
  return `project:${projectId}:sitemapXml`;
}

export default async function sitemapAgent(req: NextApiRequest, res: NextApiResponse) {
  const projectId = String(req.query.projectId || "");

  if (!projectId) {
    return res.status(400).json({ ok: false, error: "Missing projectId" });
  }

  if (req.method === "GET") {
    return res.status(200).json({
      ok: true,
      agent: "sitemap",
      projectId,
      message: "POST this endpoint to persist live /sitemap.xml into KV as project:<id>:sitemapXml.",
    });
  }

  if (req.method !== "POST") {
    res.setHeader("allow", "GET,POST");
    return res.status(405).end("");
  }

  const baseUrl = getBaseUrl(req);
  const liveUrl = `${baseUrl}/sitemap.xml?ts=${Date.now()}`;

  try {
    const r = await fetch(liveUrl, { method: "GET", cache: "no-store" });
    const ct = r.headers.get("content-type") || "";

    if (!r.ok) {
      const text = await r.text();
      return res.status(500).json({
        ok: false,
        agent: "sitemap",
        projectId,
        error: `Failed to fetch live sitemap (${r.status})`,
        liveUrl,
        contentType: ct,
        bodyFirst500: text.slice(0, 500),
      });
    }

    const xml = await r.text();

    if (!xml || typeof xml !== "string" || xml.length < 20) {
      return res.status(500).json({
        ok: false,
        agent: "sitemap",
        projectId,
        error: "Live sitemap response was empty/invalid",
        liveUrl,
        contentType: ct,
      });
    }

    const key = sitemapKey(projectId);
    await kv.set(key, xml);

    return res.status(200).json({
      ok: true,
      agent: "sitemap",
      projectId,
      message: "Persisted live sitemap.xml to KV",
      liveUrl,
      key,
      bytes: xml.length,
      nowIso: new Date().toISOString(),
      writtenKeys: [key],
    });
  } catch (e: any) {
    return res.status(500).json({
      ok: false,
      agent: "sitemap",
      projectId,
      error: String(e?.message || e),
      nowIso: new Date().toISOString(),
    });
  }
}

