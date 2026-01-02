// app/lib/seo.ts
import { storeGet, storeSet } from "./store";

export type ProjectSEO = {
  siteName?: string;
  defaultTitle?: string;
  titleTemplate?: string; // "{page} | {site}"
  defaultDescription?: string;
  canonicalBase?: string; // "https://example.com"
  robots?: string; // "index,follow" / "noindex,nofollow"
  ogImage?: string; // absolute URL
  twitterCard?: string; // "summary_large_image"
  language?: string; // e.g. "en-NZ"
  locale?: string; // e.g. "en_NZ"
  // JSON-LD (advanced)
  schema?: {
    type?: "LocalBusiness" | "Organization" | "Service";
    businessName?: string;
    url?: string;
    telephone?: string;
    email?: string;
    address?: {
      streetAddress?: string;
      addressLocality?: string;
      addressRegion?: string;
      postalCode?: string;
      addressCountry?: string; // "NZ"
    };
    areaServed?: string[]; // ["Auckland", ...]
    sameAs?: string[]; // social links
  };
};

export type PageSEOOverride = {
  title?: string;
  description?: string;
  robots?: string;
  canonical?: string; // absolute URL (overrides canonicalBase+path)
  ogImage?: string; // absolute URL
  schemaJsonLd?: any; // additional/override schema
};

function seoKey(projectId: string) {
  return `project:seo:${projectId}`;
}

export async function getProjectSEO(projectId: string): Promise<ProjectSEO> {
  const v = await storeGet(seoKey(projectId));
  if (v && typeof v === "object" && !Array.isArray(v)) return v as ProjectSEO;

  return {
    siteName: "My Site",
    defaultTitle: "Welcome",
    titleTemplate: "{page} | {site}",
    defaultDescription: "A modern website.",
    robots: "index,follow",
    canonicalBase: "",
    ogImage: "",
    twitterCard: "summary_large_image",
    language: "en-NZ",
    locale: "en_NZ",
    schema: {
      type: "Organization",
      businessName: "My Site",
      url: "",
      telephone: "",
      email: "",
      address: {
        streetAddress: "",
        addressLocality: "",
        addressRegion: "",
        postalCode: "",
        addressCountry: "NZ",
      },
      areaServed: [],
      sameAs: [],
    },
  };
}

export async function setProjectSEO(projectId: string, seo: ProjectSEO) {
  await storeSet(seoKey(projectId), seo);
}

export function escapeHtml(s: string) {
  return String(s || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function buildTitle(seo: ProjectSEO, pageTitle?: string) {
  const site = seo.siteName || "My Site";
  const page = pageTitle || seo.defaultTitle || site;

  const tpl = seo.titleTemplate || "{page} | {site}";
  return tpl.replaceAll("{page}", page).replaceAll("{site}", site);
}

export function buildCanonical(seo: ProjectSEO, path: string) {
  const base = (seo.canonicalBase || "").trim().replace(/\/+$/, "");
  if (!base) return "";
  const p = path.startsWith("/") ? path : `/${path}`;
  return base + p;
}

function safeJsonStringify(obj: any) {
  try {
    return JSON.stringify(obj);
  } catch {
    return "";
  }
}

function defaultSchema(seo: ProjectSEO, canonicalForPage: string) {
  const sch = seo.schema || {};
  const type = sch.type || "Organization";
  const businessName = sch.businessName || seo.siteName || "My Site";
  const url = sch.url || seo.canonicalBase || canonicalForPage || "";

  const out: any = {
    "@context": "https://schema.org",
    "@type": type,
    name: businessName,
    url: url,
  };

  if (sch.telephone) out.telephone = sch.telephone;
  if (sch.email) out.email = sch.email;

  if (sch.address && typeof sch.address === "object") {
    out.address = {
      "@type": "PostalAddress",
      streetAddress: sch.address.streetAddress || "",
      addressLocality: sch.address.addressLocality || "",
      addressRegion: sch.address.addressRegion || "",
      postalCode: sch.address.postalCode || "",
      addressCountry: sch.address.addressCountry || "NZ",
    };
  }

  if (Array.isArray(sch.areaServed) && sch.areaServed.length > 0) {
    out.areaServed = sch.areaServed.map((x) => ({ "@type": "Place", name: String(x) }));
  }

  if (Array.isArray(sch.sameAs) && sch.sameAs.length > 0) {
    out.sameAs = sch.sameAs.map((x) => String(x));
  }

  return out;
}

/**
 * Inject SEO tags into HTML:
 * - <title>
 * - meta description / robots
 * - canonical
 * - OG/Twitter
 * - JSON-LD script
 * - lang attribute
 */
export function injectSEOIntoHtml(opts: {
  html: string;
  path: string;
  seo: ProjectSEO;
  pageOverride?: PageSEOOverride;
  pageTitleFallback?: string; // e.g. "Pricing"
}) {
  const { html, path, seo, pageOverride, pageTitleFallback } = opts;

  const override = pageOverride || {};

  const title = buildTitle(seo, override.title || pageTitleFallback);
  const desc = (override.description || seo.defaultDescription || "").trim();
  const robots = (override.robots || seo.robots || "index,follow").trim();
  const canonical = (override.canonical || buildCanonical(seo, path)).trim();
  const ogImage = (override.ogImage || seo.ogImage || "").trim();
  const twitterCard = (seo.twitterCard || "summary_large_image").trim();

  const lang = (seo.language || "en-NZ").trim();
  const locale = (seo.locale || "en_NZ").trim();

  const baseSchema = defaultSchema(seo, canonical);
  const extraSchema = override.schemaJsonLd;

  const schemaList: any[] = [];
  if (baseSchema) schemaList.push(baseSchema);
  if (extraSchema) schemaList.push(extraSchema);

  const schemaJson = schemaList.length === 1 ? schemaList[0] : schemaList;

  const schemaScript = schemaJson
    ? `<script type="application/ld+json">${escapeHtml(safeJsonStringify(schemaJson))}</script>`
    : "";

  const tags = [
    `<meta charset="utf-8" />`,
    `<meta name="viewport" content="width=device-width, initial-scale=1" />`,
    `<title>${escapeHtml(title)}</title>`,
    desc ? `<meta name="description" content="${escapeHtml(desc)}" />` : "",
    robots ? `<meta name="robots" content="${escapeHtml(robots)}" />` : "",
    canonical ? `<link rel="canonical" href="${escapeHtml(canonical)}" />` : "",
    `<meta property="og:title" content="${escapeHtml(title)}" />`,
    desc ? `<meta property="og:description" content="${escapeHtml(desc)}" />` : "",
    canonical ? `<meta property="og:url" content="${escapeHtml(canonical)}" />` : "",
    `<meta property="og:site_name" content="${escapeHtml(seo.siteName || "My Site")}" />`,
    `<meta property="og:locale" content="${escapeHtml(locale)}" />`,
    ogImage ? `<meta property="og:image" content="${escapeHtml(ogImage)}" />` : "",
    `<meta name="twitter:card" content="${escapeHtml(twitterCard)}" />`,
    `<meta name="twitter:title" content="${escapeHtml(title)}" />`,
    desc ? `<meta name="twitter:description" content="${escapeHtml(desc)}" />` : "",
    ogImage ? `<meta name="twitter:image" content="${escapeHtml(ogImage)}" />` : "",
    schemaScript,
  ]
    .filter(Boolean)
    .join("\n");

  let out = String(html || "");

  // Ensure <html> has lang
  if (/<html[\s>]/i.test(out)) {
    // add lang if missing
    if (!/<html[^>]*\slang=/i.test(out)) {
      out = out.replace(/<html([^>]*)>/i, `<html$1 lang="${escapeHtml(lang)}">`);
    }
  }

  // Ensure <head> exists
  const hasHead = /<head[\s>]/i.test(out);
  if (!hasHead) {
    if (/<html[\s>]/i.test(out)) {
      out = out.replace(/<html([^>]*)>/i, `<html$1><head>\n${tags}\n</head>`);
    } else {
      out = `<!doctype html><html lang="${escapeHtml(lang)}"><head>\n${tags}\n</head><body>${out}</body></html>`;
    }
    return out;
  }

  // I
