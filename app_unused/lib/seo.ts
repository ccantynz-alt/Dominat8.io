// app/lib/seo.ts
import { storeGet, storeSet } from "./store";

/* -------------------- TYPES -------------------- */

export type ProjectSEO = {
  siteName?: string;
  defaultTitle?: string;
  titleTemplate?: string;
  defaultDescription?: string;
  canonicalBase?: string;
  robots?: string;
  ogImage?: string;
  twitterCard?: string;
  language?: string; // en-NZ, en-AU
  locale?: string; // en_NZ, en_AU

  geo?: {
    country?: "NZ" | "AU";
    region?: string;
    city?: string;
    lat?: string;
    lng?: string;
  };

  schema?: {
    businessName?: string;
    url?: string;
    telephone?: string;
    email?: string;
    priceRange?: string;
    address?: {
      streetAddress?: string;
      addressLocality?: string;
      addressRegion?: string;
      postalCode?: string;
      addressCountry?: "NZ" | "AU";
    };
    sameAs?: string[];
    services?: string[];
  };
};

export type PageSEOOverride = {
  title?: string;
  description?: string;
  robots?: string;
  canonical?: string;
  ogImage?: string;
  schemaJsonLd?: any;
};

/* -------------------- STORAGE -------------------- */

function seoKey(projectId: string) {
  return `project:seo:${projectId}`;
}

export async function getProjectSEO(projectId: string): Promise<ProjectSEO> {
  const v = await storeGet(seoKey(projectId));
  if (v && typeof v === "object") return v as ProjectSEO;

  return {
    siteName: "My Business",
    defaultTitle: "Professional Services",
    titleTemplate: "{page} | {site}",
    defaultDescription: "Professional services across New Zealand and Australia.",
    robots: "index,follow",
    canonicalBase: "",
    ogImage: "",
    twitterCard: "summary_large_image",
    language: "en-NZ",
    locale: "en_NZ",
    geo: { country: "NZ" },
    schema: {
      businessName: "My Business",
      priceRange: "$$",
      address: { addressCountry: "NZ" },
      services: [],
      sameAs: [],
    },
  };
}

export async function setProjectSEO(projectId: string, seo: ProjectSEO) {
  await storeSet(seoKey(projectId), seo);
}

/* -------------------- HELPERS -------------------- */

export function escapeHtml(s: string) {
  return String(s || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function buildTitle(seo: ProjectSEO, pageTitle?: string) {
  const site = seo.siteName || "My Business";
  const page = pageTitle || seo.defaultTitle || site;
  return (seo.titleTemplate || "{page} | {site}")
    .replaceAll("{page}", page)
    .replaceAll("{site}", site);
}

export function buildCanonical(seo: ProjectSEO, path: string) {
  if (!seo.canonicalBase) return "";
  return seo.canonicalBase.replace(/\/+$/, "") + path;
}

/* -------------------- SCHEMA BUILDERS -------------------- */

function localBusinessSchema(seo: ProjectSEO, canonical: string) {
  const s = seo.schema || {};
  const g = seo.geo || {};

  const out: any = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: s.businessName || seo.siteName,
    url: canonical,
    priceRange: s.priceRange,
    areaServed: g.country === "AU" ? "Australia" : "New Zealand",
  };

  if (s.telephone) out.telephone = s.telephone;
  if (s.email) out.email = s.email;
  if (s.sameAs?.length) out.sameAs = s.sameAs;

  if (s.address) {
    out.address = {
      "@type": "PostalAddress",
      ...s.address,
    };
  }

  if (g.lat && g.lng) {
    out.geo = {
      "@type": "GeoCoordinates",
      latitude: g.lat,
      longitude: g.lng,
    };
  }

  return out;
}

function serviceSchema(seo: ProjectSEO) {
  const services = seo.schema?.services || [];
  return services.map((name) => ({
    "@context": "https://schema.org",
    "@type": "Service",
    name,
    areaServed: seo.geo?.country === "AU" ? "Australia" : "New Zealand",
    provider: {
      "@type": "LocalBusiness",
      name: seo.schema?.businessName || seo.siteName,
    },
  }));
}

function breadcrumbSchema(path: string, canonicalBase: string) {
  const parts = path.split("/").filter(Boolean);
  let acc = "";
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: parts.map((p, i) => {
      acc += "/" + p;
      return {
        "@type": "ListItem",
        position: i + 1,
        name: p.charAt(0).toUpperCase() + p.slice(1),
        item: canonicalBase + acc,
      };
    }),
  };
}

/* -------------------- INJECTOR -------------------- */

export function injectSEOIntoHtml(opts: {
  html: string;
  path: string;
  seo: ProjectSEO;
  pageOverride?: PageSEOOverride;
  pageTitleFallback?: string;
}) {
  const { html, path, seo, pageOverride, pageTitleFallback } = opts;

  const title = buildTitle(seo, pageOverride?.title || pageTitleFallback);
  const desc = pageOverride?.description || seo.defaultDescription || "";
  const canonical = pageOverride?.canonical || buildCanonical(seo, path);

  const schemas = [
    localBusinessSchema(seo, canonical),
    ...serviceSchema(seo),
    breadcrumbSchema(path, seo.canonicalBase || ""),
    pageOverride?.schemaJsonLd,
  ].filter(Boolean);

  const schemaScript = schemas.length
    ? `<script type="application/ld+json">${escapeHtml(JSON.stringify(schemas))}</script>`
    : "";

  const tags = `
<title>${escapeHtml(title)}</title>
<meta name="description" content="${escapeHtml(desc)}" />
<link rel="canonical" href="${escapeHtml(canonical)}" />
<meta name="robots" content="${escapeHtml(pageOverride?.robots || seo.robots || "index,follow")}" />
<meta property="og:title" content="${escapeHtml(title)}" />
<meta property="og:description" content="${escapeHtml(desc)}" />
<meta property="og:url" content="${escapeHtml(canonical)}" />
${schemaScript}
`;

  return html.replace(/<head([^>]*)>/i, `<head$1>${tags}`);
}
