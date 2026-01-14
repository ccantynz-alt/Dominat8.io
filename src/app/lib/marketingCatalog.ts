export type MarketingItem = {
  slug: string;
  title: string;
  description: string;
  kind: "template" | "use-case";
};

export const TEMPLATES: MarketingItem[] = [
  {
    slug: "startup",
    title: "Startup Template",
    description: "A clean startup landing page with sections for pricing, FAQ, and contact.",
    kind: "template",
  },
  {
    slug: "local-business",
    title: "Local Business Template",
    description: "A simple, conversion-focused site for local services.",
    kind: "template",
  },
];

export const USE_CASES: MarketingItem[] = [
  {
    slug: "ai-website-builder",
    title: "AI Website Builder",
    description: "Generate a conversion-ready website in minutes with AI.",
    kind: "use-case",
  },
  {
    slug: "saas-landing-page",
    title: "SaaS Landing Page",
    description: "Launch faster with a modern SaaS landing page layout.",
    kind: "use-case",
  },
];

export function listTemplates() {
  return TEMPLATES;
}

export function listUseCases() {
  return USE_CASES;
}

/**
 * Find any marketing item by slug.
 */
export function findBySlug(slug: string): MarketingItem | null {
  const s = String(slug || "").trim().toLowerCase();
  if (!s) return null;

  return (
    TEMPLATES.find((t) => t.slug === s) ||
    USE_CASES.find((u) => u.slug === s) ||
    null
  );
}
