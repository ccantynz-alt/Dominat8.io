import type { NextApiRequest, NextApiResponse } from "next";
import { kvJsonGet, kv } from "@/src/app/lib/kv";

type SeoPlanAny = {
  version?: number;
  site?: { domain?: string | null };
  pages?: Array<{ slug?: string }>;
};

function errToJson(e: unknown) {
  if (e && typeof e === "object") {
    const anyE = e as any;
    return {
      name: anyE?.name,
      message: anyE?.message,
      stack:
        typeof anyE?.stack === "string"
          ? anyE.stack.split("\n").slice(0, 12).join("\n")
          : undefined,
    };
  }
  return { message: String(e) };
}

function xmlEscape(s: string): string {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function normalizeBaseUrl(domain: string | null | undefined): string {
  if (!domain) return "https://example.com";
  const d = domain.trim();
  if (!d) return "https://example.com";
  if (d.startsWith("http://") || d.startsWith("https://")) return d.replace(/\/+$/, "");
  return `https://${d}`.replace(/\/+$/, "");
}

function normalizeSlug(slug: string | undefined): string {
  if (!slug) return "/";
  const s = slug.trim();
  if (!s) return "/";
  if (s === "/") return "/";
  return s.startsWith("/") ? s : `/${s}`;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader("Content-Type", "application/json; charset=utf-8");

  const { projectId } = req.query;
  if (!projectId || typeof projectId !== "string") {
    return res.status(400).json({
      ok: false,
      agent: "sitemap",
      error: "Missing projectId",
      source: "pages/api/projects/[projectId]/agents/sitemap.ts",
    });
  }

  const seoKey = `project:${projectId}:seoPlan`;
  const nowIso = new Date().toISOString();

  // ✅ GET = diagnostics: tells you whether seoPlan exists (NO writes)
  if (req.method === "GET") {
    try {
      const raw = await kv.get(seoKey);
      return res.status(200).json({
        ok: true,
        agent: "sitemap",
        projectId,
        nowIso,
        seoKey,
        seoPlanExists: !!raw,
        seoPlanBytes: raw ? raw.length : 0,
        note: "Use POST to generate sitemap XML if seoPlanExists is true.",
        source: "pages/api/projects/[projectId]/agents/sitemap.ts",
        method: req.method,
      });
    } catch (e) {
      return res.status(500).json({
        ok: false,
        agent: "sitemap",
        projectId,
        nowIso,
        error: "KV read failed",
        detail: errToJson(e),
        source: "pages/api/projects/[projectId]/agents/sitemap.ts",
        method: req.method,
      });
    }
  }

  if (req.method !== "POST") {
    return res.status(405).json({
      ok: false,
      agent: "sitemap",
      projectId,
      error: "Method not allowed",
      allowed: ["GET", "POST"],
      source: "pages/api/projects/[projectId]/agents/sitemap.ts",
      method: req.method,
    });
  }

  try {
    const plan = await kvJsonGet<SeoPlanAny>(seoKey);

    if (!plan) {
      return res.status(409).json({
        ok: false,
        agent: "sitemap",
        projectId,
        error: "Missing seoPlan. Run SEO agent first.",
        missingKey: seoKey,
        source: "pages/api/projects/[projectId]/agents/sitemap.ts",
        method: req.method,
      });
    }

    const baseUrl = normalizeBaseUrl(plan.site?.domain ?? null);

    const slugs = Array.isArray(plan.pages) ? plan.pages.map((p) => normalizeSlug(p?.slug)) : ["/"];
    const uniqueSlugs = Array.from(new Set(slugs));

    const urls = uniqueSlugs.map((slug) => `${baseUrl}${slug === "/" ? "" : slug}`);

    const xml =
      `<?xml version="1.0" encoding="UTF-8"?>\n` +
      `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
      urls
        .map((u) => `  <url><loc>${xmlEscape(u)}</loc><lastmod>${xmlEscape(nowIso)}</lastmod></url>`)
        .join("\n") +
      `\n</urlset>\n`;

    const outKey = `project:${projectId}:sitemapXml`;
    await kv.set(outKey, xml);

    return res.status(200).json({
      ok: true,
      agent: "sitemap",
      projectId,
      nowIso,
      seoKey,
      sitemapKey: outKey,
      urlCount: urls.length,
      baseUrl,
      source: "pages/api/projects/[projectId]/agents/sitemap.ts",
      method: req.method,
    });
  } catch (e) {
    return res.status(500).json({
      ok: false,
      agent: "sitemap",
      projectId,
      error: "Sitemap generation failed",
      detail: errToJson(e),
      source: "pages/api/projects/[projectId]/agents/sitemap.ts",
      method: req.method,
    });
  }
}
