export type SiteSpecSection =
  | { type: "hero"; headline: string; subheadline?: string; primaryCta?: string; secondaryCta?: string }
  | { type: "features"; items: { title: string; body: string }[] }
  | { type: "socialProof"; quotes: { name?: string; quote: string }[] }
  | { type: "steps"; title?: string; steps: { title: string; body: string }[] }
  | { type: "faq"; items: { q: string; a: string }[] }
  | { type: "finalCta"; headline: string; body?: string; primaryCta?: string };

export type SiteSpecPage = {
  slug: string; // "/", "/pricing", "/about"
  title: string;
  metaDescription?: string;
  sections: SiteSpecSection[];
};

export type SiteSpec = {
  version: 1;
  brandName: string;
  industry?: string;
  tone?: "premium" | "friendly" | "bold" | "minimal";
  pages: SiteSpecPage[];
  createdAtIso: string;
};
