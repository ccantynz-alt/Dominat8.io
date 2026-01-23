// src/app/lib/marketingCatalog.ts

export type MarketingItem = {
  slug: string;
  title: string;
  description: string;
  kind: "template" | "use-case";

  // ✅ Compatibility fields expected by some UI/components
  templateId?: string;
  useCaseId?: string;
  tag?: string;
};

// ✅ Compatibility types expected by older UI code
export type MarketingTemplate = MarketingItem & { kind: "template" };
export type MarketingUseCase = MarketingItem & { kind: "use-case" };

export const TEMPLATES: MarketingTemplate[] = [
  {
    templateId: "startup",
    slug: "startup",
    title: "Startup Template",
    description: "A clean startup landing page with sections for pricing, FAQ, and contact.",
    kind: "template",
    tag: "Popular",
  },
  {
    templateId: "local-business",
    slug: "local-business",
    title: "Local Business Template",
    description: "A simple, conversion-focused site for local services.",
    kind: "template",
    tag: "Fast setup",
  },
];

export const USE_CASES: MarketingUseCase[] = [
  {
    useCaseId: "ai-website-builder",
    slug: "ai-website-builder",
    title: "AI Website Builder",
    description: "Generate a conversion-ready website in minutes with AI.",
    kind: "use-case",
  },
  {
    useCaseId: "saas-landing-page",
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

function normalizeSlug(slug: string) {
  return String(slug || "").trim().toLowerCase();
}

/**
 * ✅ Compatibility helper:
 * Supports BOTH call styles:
 *   findBySlug("startup")
 *   findBySlug(TEMPLATES, "startup")
 */
export function findBySlug(slug: string): MarketingItem | null;
export function findBySlug(list: MarketingItem[], slug: string): MarketingItem | null;
export function findBySlug(a: string | MarketingItem[], b?: string): MarketingItem | null {
  // Signature 1: findBySlug("startup")
  if (typeof a === "string") {
    const s = normalizeSlug(a);
    if (!s) return null;

    return (
      TEMPLATES.find((t) => t.slug === s) ||
      USE_CASES.find((u) => u.slug === s) ||
      null
    );
  }

  // Signature 2: findBySlug(TEMPLATES, "startup")
  const list = a;
  const slug = normalizeSlug(b || "");
  if (!slug) return null;

  return list.find((x) => x.slug === slug) || null;
}
