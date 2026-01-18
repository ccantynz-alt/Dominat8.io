// pages/api/projects/[projectId]/agents/sitemap.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { kv, kvJsonGet } from "@/src/app/lib/kv";

type SeoPlanPage = {
  path: string;
  canonical: string;
  changefreq?: string;
  priority?: number;
};

type SeoPlan = {
  projectId: string;
  baseUrl: string;
  pages: SeoPlanPage[];
  createdAtIso?: string;
};

function xmlEscape(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function normalizeBaseUrl(input: string | null | undefined): string | null {
  if (!input) return null;
  const raw = String(input).trim();
  if (!raw) return null;

  if (raw.startsWith("http://") || raw.startsWith("https://")) return raw.replace(/\/+$/, "");
  if (/^[a-z0-9.-]+\.[a-z]{2,}$/i.test(raw)) return `https://${raw}`.replace(/\/+$/, "");

  return null;
}

function ensureCanonical(baseUrl: string, page: SeoPlanPage): string {
  const normalized = normalizeBaseUrl(baseUrl) || "https://example.com";
  const base = normalized.replace(/\/+$/, "");
  const path = page.path?.startsWith("/") ? page.path : `/${page.path || ""}`;
  return page.canonical && page.canonical.startsWith("http") ? page.canonical : `${base}${path}`;
}

function buildSitemapXml(pages: Array<{ loc: string; lastmod?: string; changefreq?: string; priority?: number }>): string {
  const urlset = pages
    .map((u) => {
      const parts: string[] = [];
      parts.push(`<loc>${xmlEscape(u.loc)}</loc>`);
      if (u.lastmod) parts.push(`<lastmod>${xmlEscape(u.lastmod)}</lastmod>`);
      if (u.changefreq) parts.push(`<changefreq>${xmlEscape(u.changefreq)}</changefreq>`);
      if (typeof u.priority === "number") parts.push(`<priority>${u.priority.toFixed(1)}</priority>`);
      return `<url>${parts.join("")}</url>`;
    })
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">` +
    urlset +
    `</urlset>`;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const projectId = String(req.query.projectId || "").trim();
  if (!projectId) return res.status(400).json({ ok: false, error: "Missing projectId" });

  if (req.method !== "POST" && req.method !== "GET") {
    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  }

  const seoPlanKey = `project:${projectId}:seoPlan`;
  const sitemapKey = `project:${projectId}:sitemapXml`;

  // GET = diagnostics
  if (req.method === "GET") {
    const seoPlan = await kvJsonGet<SeoPlan>(seoPlanKey).catch(() => null);
    const sitemapXml = await kv.get(sitemapKey).catch(() => null);

    return res.status(200).json({
      ok: true,
      projectId,
      seoPlanKey,
      sitemapKey,
      hasSeoPlan: !!seoPlan,
      seoPlanPagesCount: seoPlan?.pages?.length || 0,
      seoPlanBaseUrl: seoPlan?.baseUrl || null,
      hasSitemapXml: !!sitemapXml,
      sitemapXmlBytes: sitemapXml ? String(sitemapXml).length : 0,
      nowIso: new Date().toISOString(),
    });
  }

  // POST = generate sitemap
  const seoPlan = await kvJsonGet<SeoPlan>(seoPlanKey).catch(() => null);
  if (!seoPlan) {
    return res.status(409).json({
      ok: false,
      projectId,
      error: "Missing seoPlan",
      key: seoPlanKey,
      hint: "Run POST /agents/seo-v2 first",
      nowIso: new Date().toISOString(),
    });
  }

  const baseUrl = normalizeBaseUrl(seoPlan.baseUrl) || "https://example.com";
  const pages = Array.isArray(seoPlan.pages) ? seoPlan.pages : [];

  // Always include homepage at minimum
  const enriched = pages.length
    ? pages
    : [{ path: "/", canonical: `${baseUrl}/`, changefreq: "weekly", priority: 1.0 }];

  const nowIso = new Date().toISOString();

  const items = enriched.map((p) => ({
    loc: ensureCanonical(baseUrl, p),
    lastmod: nowIso.slice(0, 10), // YYYY-MM-DD
    changefreq: p.changefreq || "weekly",
    priority: typeof p.priority === "number" ? p.priority : 0.7,
  }));

  const xml = buildSitemapXml(items);

  // Write sitemap XML using REST kv wrapper (string)
  await kv.set(sitemapKey, xml);

  return res.status(200).json({
    ok: true,
    projectId,
    seoPlanKey,
    sitemapKey,
    baseUrl,
    urls: items.length,
    message: "Sitemap generated from seoPlan.pages and saved to KV",
    nowIso,
  });
}
