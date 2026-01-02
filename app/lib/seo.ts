// app/lib/seo.ts
import { storeGet, storeSet } from "./store";

export type ProjectSEO = {
  siteName?: string;
  defaultTitle?: string;
  titleTemplate?: string; // e.g. "{page} | {site}"
  defaultDescription?: string;
  canonicalBase?: string; // e.g. https://example.com
  robots?: string; // e.g. "index,follow" or "noindex,nofollow"
  ogImage?: string; // URL
  twitterCard?: string; // e.g. "summary_large_image"
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

/**
 * Inject SEO tags into an HTML document string.
 * - Ensures <head> exists
 * - Inserts <title>, meta description, robots, canonical, OG/Twitter tags
 */
export function injectSEOIntoHtml(opts: {
  html: string;
  path: string; // "/pricing"
  seo: ProjectSEO;
  pageTitle?: string;
  pageDescription?: string;
}) {
  const { html, path, seo, pageTitle, pageDescription } = opts;

  const title = buildTitle(seo, pageTitle);
  const desc = (pageDescription || seo.defaultDescription || "").trim();
  const robots = (seo.robots || "index,follow").trim();
  const canonical = buildCanonical(seo, path);
  const ogImage = (seo.ogImage || "").trim();
  const twitterCard = (seo.twitterCard || "summary_large_image").trim();

  const tags = [
    `<title>${escapeHtml(title)}</title>`,
    desc ? `<meta name="description" content="${escapeHtml(desc)}" />` : "",
    robots ? `<meta name="robots" content="${escapeHtml(robots)}" />` : "",
    canonical ? `<link rel="canonical" href="${escapeHtml(canonical)}" />` : "",
    `<meta property="og:title" content="${escapeHtml(title)}" />`,
    desc ? `<meta property="og:description" content="${escapeHtml(desc)}" />` : "",
    canonical ? `<meta property="og:url" content="${escapeHtml(canonical)}" />` : "",
    `<meta property="og:site_name" content="${escapeHtml(seo.siteName || "My Site")}" />`,
    ogImage ? `<meta property="og:image" content="${escapeHtml(ogImage)}" />` : "",
    `<meta name="twitter:card" content="${escapeHtml(twitterCard)}" />`,
    `<meta name="twitter:title" content="${escapeHtml(title)}" />`,
    desc ? `<meta name="twitter:description" content="${escapeHtml(desc)}" />` : "",
    ogImage ? `<meta name="twitter:image" content="${escapeHtml(ogImage)}" />` : "",
  ]
    .filter(Boolean)
    .join("\n");

  // Ensure we have <head>
  const hasHead = /<head[\s>]/i.test(html);
  let out = html;

  if (!hasHead) {
    // ensure <html> exists, then add head
    if (/<html[\s>]/i.test(out)) {
      out = out.replace(/<html([^>]*)>/i, `<html$1><head>${tags}</head>`);
    } else {
      out = `<!doctype html><html><head>${tags}</head><body>${out}</body></html>`;
    }
    return out;
  }

  // Insert tags right after <head>
  out = out.replace(/<head([^>]*)>/i, `<head$1>\n${tags}\n`);
  return out;
}
