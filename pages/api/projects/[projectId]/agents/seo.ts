import type { NextApiRequest, NextApiResponse } from "next";
import { kv } from "../../../../../src/app/lib/kv";

type SeoPagePlan = {
  slug: string; // e.g. "about", "contact", "auckland-airport-shuttle"
  title: string;
  description: string;
  h1: string;
  sections: string[];
  internalLinks: string[]; // slugs
  schema: Record<string, any>;
};

type SeoPlan = {
  projectId: string;
  createdAtIso: string;
  canonicalBase: string; // e.g. /p/<projectId>
  meta: {
    siteTitle: string;
    siteDescription: string;
  };
  pages: SeoPagePlan[];
  sitemap: {
    enabled: true;
    urls: Array<{ loc: string; priority?: number; changefreq?: string }>;
  };
};

function safeString(v: any, fallback: string) {
  if (typeof v === "string" && v.trim()) return v.trim();
  return fallback;
}

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function buildDefaultSeoPlan(projectId: string, prompt?: string): SeoPlan {
  const createdAtIso = new Date().toISOString();
  const canonicalBase = `/p/${projectId}`;

  const baseName =
    prompt && prompt.trim().length > 0 ? prompt.trim().slice(0, 64) : "Generated Website";

  const siteTitle = safeString(baseName, "Generated Website");
  const siteDescription = "Fast, mobile-first website with SEO-ready structure.";

  const home: SeoPagePlan = {
    slug: "",
    title: `${siteTitle}`,
    description: siteDescription,
    h1: siteTitle,
    sections: ["hero", "features", "testimonials", "faq", "cta"],
    internalLinks: ["about", "contact"],
    schema: {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: siteTitle,
      url: canonicalBase,
    },
  };

  const about: SeoPagePlan = {
    slug: "about",
    title: `About — ${siteTitle}`,
    description: `Learn what makes ${siteTitle} different.`,
    h1: "About",
    sections: ["story", "values", "what-you-get", "cta"],
    internalLinks: ["", "contact"],
    schema: {
      "@context": "https://schema.org",
      "@type": "AboutPage",
      name: `About — ${siteTitle}`,
    },
  };

  const contact: SeoPagePlan = {
    slug: "contact",
    title: `Contact — ${siteTitle}`,
    description: `Contact ${siteTitle}.`,
    h1: "Contact",
    sections: ["contact", "faq", "cta"],
    internalLinks: ["", "about"],
    schema: {
      "@context": "https://schema.org",
      "@type": "ContactPage",
      name: `Contact — ${siteTitle}`,
    },
  };

  // Optional “PSEO seed” page (kept conservative for now)
  const pseoSeed = slugify(`${siteTitle} services`);
  const pseo: SeoPagePlan = {
    slug: pseoSeed || "services",
    title: `Services — ${siteTitle}`,
    description: `Explore services from ${siteTitle}.`,
    h1: "Services",
    sections: ["services", "proof", "faq", "cta"],
    internalLinks: ["", "contact"],
    schema: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: `Services — ${siteTitle}`,
    },
  };

  const pages = [home, about, contact, pseo];

  const sitemapUrls = pages.map((p) => {
    const loc = p.slug ? `${canonicalBase}/${p.slug}` : `${canonicalBase}`;
    return { loc, priority: p.slug ? 0.7 : 1.0, changefreq: "weekly" };
  });

  return {
    projectId,
    createdAtIso,
    canonicalBase,
    meta: { siteTitle, siteDescription },
    pages,
    sitemap: { enabled: true, urls: sitemapUrls },
  };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  }

  const projectId = String(req.query.projectId || "").trim();
  if (!projectId) return res.status(400).json({ ok: false, error: "Missing projectId" });

  const body = (req.body && typeof req.body === "object") ? req.body : {};
  const prompt = typeof body.prompt === "string" ? body.prompt : undefined;

  const plan = buildDefaultSeoPlan(projectId, prompt);

  // Write to KV (authoritative)
  const key = `project:${projectId}:seoPlan`;
  await kv.set(key, JSON.stringify(plan));

  return res.status(200).json({
    ok: true,
    projectId,
    wrote: { key },
    plan,
  });
}
