// src/app/lib/marketingCatalog.ts

export type MarketingUseCase = {
  slug: string;
  title: string;
  description: string;
};

export type MarketingTemplate = {
  slug: string;
  title: string;
  description: string;
  /**
   * V1 strategy:
   * - templateId is OPTIONAL.
   * - If present, it is sent to backend as templateId.
   * - If not present, fall back to slug (still stable).
   * Later you can swap these to real IDs like "tmpl_..." without breaking UI.
   */
  templateId?: string;
};

export const USE_CASES: MarketingUseCase[] = [
  {
    slug: "saas",
    title: "SaaS",
    description: "Launch a modern SaaS site with pricing, features, and onboarding.",
  },
  {
    slug: "startup",
    title: "Startup",
    description: "A fast, conversion-first startup landing page with clear CTAs.",
  },
  {
    slug: "service",
    title: "Service Business",
    description: "Perfect for service providers — benefits, trust, and lead capture.",
  },
  {
    slug: "portfolio",
    title: "Portfolio",
    description: "Showcase your work, testimonials, and contact details cleanly.",
  },
];

export const TEMPLATES: MarketingTemplate[] = [
  {
    slug: "saas",
    title: "SaaS Launch",
    description: "Hero + pricing + feature grid + FAQs — built to convert.",
    templateId: "saas",
  },
  {
    slug: "startup",
    title: "Startup Sprint",
    description: "Simple, crisp, and fast — narrative sections + CTA blocks.",
    templateId: "startup",
  },
  {
    slug: "service",
    title: "Service Pro",
    description: "Trust-building layout with proof, offerings, and contact flow.",
    templateId: "service",
  },
  {
    slug: "portfolio",
    title: "Portfolio Clean",
    description: "Projects-first layout with a strong personal brand style.",
    templateId: "portfolio",
  },
];
