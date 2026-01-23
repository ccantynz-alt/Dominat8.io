import type { Metadata } from "next";
import { headers } from "next/headers";

export type PublishedSeoInput = {
  projectId: string;
  pageSlug?: string; // "", "about", "pricing", "faq", "contact", etc.
};

function prettySlug(slug?: string) {
  const s = String(slug || "").trim().toLowerCase();
  if (!s) return "Home";
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function descriptionFor(slug?: string) {
  const s = String(slug || "").trim().toLowerCase();

  switch (s) {
    case "":
      return "Published website";
    case "about":
      return "Learn more about this website";
    case "pricing":
      return "Pricing and plans";
    case "faq":
      return "Frequently asked questions";
    case "contact":
      return "Contact information";
    default:
      return `${prettySlug(s)} page`;
  }
}

function normalizeHost(host: string) {
  return String(host || "").trim().toLowerCase().split(":")[0];
}

function isPlatformHost(host: string) {
  const h = normalizeHost(host);

  if (!h) return true;

  // Local/dev
  if (h === "localhost" || h.endsWith(".localhost")) return true;
  if (h.endsWith(".app.github.dev")) return true;

  // Vercel
  if (h.endsWith(".vercel.app")) return true;

  // Add anything else you treat as platform domains here (optional)
  return false;
}

function getBaseFromHeaders() {
  const h = headers();
  const host = h.get("x-forwarded-host") || h.get("host") || "localhost:3000";
  const proto = h.get("x-forwarded-proto") || "https";
  return { host, proto };
}

function canonicalPathFor(input: PublishedSeoInput, host: string) {
  const slug = String(input.pageSlug || "").trim().toLowerCase();

  // Custom domain canonical: / or /pricing (NO /p/[projectId])
  if (!isPlatformHost(host)) {
    if (!slug) return "/";
    return `/${slug}`;
  }

  // Platform canonical: /p/[projectId] or /p/[projectId]/pricing
  if (!slug) return `/p/${input.projectId}`;
  return `/p/${input.projectId}/${slug}`;
}

/**
 * Safe, deterministic metadata for published pages WITH canonical URLs.
 * - Detects platform vs custom domain by host header
 * - Emits alternates.canonical accordingly
 */
export async function getPublishedMetadata(input: PublishedSeoInput): Promise<Metadata> {
  const { host, proto } = getBaseFromHeaders();

  const page = prettySlug(input.pageSlug);
  const desc = descriptionFor(input.pageSlug);

  const canonicalPath = canonicalPathFor(input, host);
  const canonical = `${proto}://${host}${canonicalPath}`;

  return {
    title: `${page} · ${input.projectId}`,
    description: desc,
    alternates: {
      canonical,
    },
    openGraph: {
      title: `${page} · ${input.projectId}`,
      description: desc,
      type: "website",
      url: canonical,
    },
  };
}
