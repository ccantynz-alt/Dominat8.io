// pages/api/projects/[projectId]/agents/seo-v2.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { kvJsonGet, kvJsonSet } from "@/src/app/lib/kv";

type SeoPlanPage = {
  path: string; // e.g. "/pricing"
  canonical: string; // full url
  title: string;
  description: string;
  keywords?: string[];
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: number; // 0.0 - 1.0
};

type SeoPlan = {
  projectId: string;
  createdAtIso: string;
  baseUrl: string; // e.g. "https://example.com"
  pages: SeoPlanPage[];
  notes?: string[];
};

function normalizeBaseUrl(input: string | null | undefined): string | null {
  if (!input) return null;
  const raw = String(input).trim();
  if (!raw) return null;

  // If it already has a scheme, trust it.
  if (raw.startsWith("http://") || raw.startsWith("https://")) {
    return raw.replace(/\/+$/, "");
  }

  // If it's just a domain (example.com), assume https.
  if (/^[a-z0-9.-]+\.[a-z]{2,}$/i.test(raw)) {
    return `https://${raw}`.replace(/\/+$/, "");
  }

  return null;
}

function buildCanonical(baseUrl: string, path: string): string {
  const cleanBase = baseUrl.replace(/\/+$/, "");
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${cleanBase}${cleanPath}`;
}

/**
 * Best-effort real baseUrl resolution.
 * We do NOT assume your publishedSpec schema; we try common fields safely.
 * If nothing found, we fall back to request host (production-safe).
 */
async function resolveBaseUrl(req: NextApiRequest, projectId: string): Promise<{ baseUrl: string; notes: string[] }> {
  const notes: string[] = [];

  // 1) Try published latest (common patterns)
  try {
    const publishedLatest = await kvJsonGet<any>(`published:project:${projectId}:latest`);
    if (publishedLatest && typeof publishedLatest === "object") {
      const candidate =
        publishedLatest.baseUrl ||
        publishedLatest.siteUrl ||
        publishedLatest.domainUrl ||
        publishedLatest.customDomainUrl ||
        publishedLatest.customDomain ||
        publishedLatest.domain;
      const normalized = normalizeBaseUrl(candidate);
      if (normalized) {
        notes.push("baseUrl resolved from published:project:<id>:latest");
        return { baseUrl: normalized, notes };
      }
    }
  } catch {
    // ignore
  }

  // 2) Try project spec (common patterns)
  try {
    const projectSpec = await kvJsonGet<any>(`project:${projectId}:spec`);
    if (projectSpec && typeof projectSpec === "object") {
      const candidate =
        projectSpec.baseUrl ||
        projectSpec.siteUrl ||
        projectSpec.domainUrl ||
        projectSpec.customDomainUrl ||
        projectSpec.customDomain ||
        projectSpec.domain;
      const normalized = normalizeBaseUrl(candidate);
      if (normalized) {
        notes.push("baseUrl resolved from project:<id>:spec");
        return { baseUrl: normalized, notes };
      }
    }
  } catch {
    // ignore
  }

  // 3) Domain mapping (optional future-proof): domain:<host>:projectId => projectId
  // Not used here for baseUrl, but we’ll expose this mapping mechanism for /sitemap.xml.
  // (No action here.)

  // 4) Fallback to request host (works immediately on your Vercel preview/prod host)
  const host = (req.headers["x-forwarded-host"] as string) || (req.headers.host as string) || "";
  const proto = ((req.headers["x-forwarded-proto"] as string) || "https").split(",")[0].trim();
  const fallback = normalizeBaseUrl(`${proto}://${host}`) || "https://example.com";
  notes.push("baseUrl fallback to request host headers");
  return { baseUrl: fallback, notes };
}

function generateDefaultPages(projectId: string, baseUrl: string): SeoPlanPage[] {
  // These are “high value” defaults; you can expand anytime without breaking the pipeline.
  const pages: Array<Omit<SeoPlanPage, "canonical">> = [
    {
      path: "/",
      title: "Home",
      description: "Welcome — fast, clear, conversion-focused.",
      changefreq: "weekly",
      priority: 1.0,
    },
    {
      path: "/pricing",
      title: "Pricing",
      description: "Simple pricing with a free plan and pro upgrades.",
      changefreq: "monthly",
      priority: 0.9,
    },
    {
      path: "/features",
      title: "Features",
      description: "Everything included to launch and grow — fast.",
      changefreq: "monthly",
      priority: 0.8,
    },
    {
      path: "/templates",
      title: "Templates",
      description: "Pick a template and publish a polished site quickly.",
      changefreq: "weekly",
      priority: 0.8,
    },
    {
      path: "/use-cases",
      title: "Use Cases",
      description: "Built for startups, local services, creators, and more.",
      changefreq: "weekly",
      priority: 0.7,
    },
    {
      path: "/faq",
      title: "FAQ",
      description: "Answers to common questions about setup, billing, and publishing.",
      changefreq: "monthly",
      priority: 0.6,
    },
  ];

  return pages.map((p) => ({
    ...p,
    canonical: buildCanonical(baseUrl, p.path),
    keywords: ["website builder", "AI website", "publish", "templates", "SEO"],
  }));
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const projectId = String(req.query.projectId || "").trim();
  if (!projectId) {
    return res.status(400).json({ ok: false, error: "Missing projectId" });
  }

  if (req.method !== "POST" && req.method !== "GET") {
    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  }

  // GET = diagnostics (safe, non-destructive)
  if (req.method === "GET") {
    const key = `project:${projectId}:seoPlan`;
    const existing = await kvJsonGet<any>(key).catch(() => null);
    return res.status(200).json({
      ok: true,
      projectId,
      key,
      exists: !!existing,
      preview: existing ? { baseUrl: existing.baseUrl, pagesCount: Array.isArray(existing.pages) ? existing.pages.length : 0 } : null,
      nowIso: new Date().toISOString(),
    });
  }

  // POST = generate & write seoPlan
  try {
    const { baseUrl, notes } = await resolveBaseUrl(req, projectId);

    const plan: SeoPlan = {
      projectId,
      createdAtIso: new Date().toISOString(),
      baseUrl,
      pages: generateDefaultPages(projectId, baseUrl),
      notes,
    };

    const key = `project:${projectId}:seoPlan`;
    await kvJsonSet(key, plan);

    return res.status(200).json({
      ok: true,
      projectId,
      key,
      baseUrl: plan.baseUrl,
      pagesCount: plan.pages.length,
      message: "SEO-V2 generated seoPlan (multi-page) and saved to KV",
      nowIso: new Date().toISOString(),
    });
  } catch (err: any) {
    return res.status(500).json({
      ok: false,
      projectId,
      error: "SEO-V2 failed",
      detail: err?.message ? String(err.message) : String(err),
      nowIso: new Date().toISOString(),
    });
  }
}
