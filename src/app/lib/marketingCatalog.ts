// src/app/lib/marketingCatalog.ts

export type MarketingItem = {
  slug: string;
  title: string;
  description: string;
  kind: "template" | "use-case";
};

// ✅ Compatibility types expected by older UI code
export type MarketingTemplate = MarketingItem & { kind: "template" };
export type MarketingUseCase = MarketingItem & { kind: "use-case" };

export const TEMPLATES: MarketingTemplate[] = [
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

export const USE_CASES: MarketingUseCase[] = [
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

export function listTemplates(): MarketingTemplate[] {
  return TEMPLATES;
}

export function listUseCases(): MarketingUseCase[] {
  return USE_CASES;
}

/**
 * Find any marketing item by slug.
 * (Returns MarketingItem to match mixed use-cases.)
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
