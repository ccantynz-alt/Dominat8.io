/**
 * templatesCatalog (Pages Router safe)
 *
 * Expected exports (used by APIs):
 *   - templatesCatalog
 *   - TemplateId
 */

export type TemplateId = string;

export type MarketingSectionType =
  | "hero"
  | "socialProof"
  | "valueProps"
  | "howItWorks"
  | "gallery"
  | "pricing"
  | "faq"
  | "footerCta";

export type MarketingPageSpec = {
  kind: "marketing";
  version: 1;
  title: string;
  sections: Array<{ type: MarketingSectionType; data?: any }>;
};

export type Template = {
  id: TemplateId;
  name: string;
  description?: string;
  data: {
    pageSpec: MarketingPageSpec;
  };
};

/**
 * ONE flagship template: AI SaaS Website
 * - Spec-only (no JSX)
 * - Uses strict allowed section types
 * - Designed to look good immediately, then agents can refine copy later
 */
export const templatesCatalog: Template[] = [
  {
    id: "ai-saas-website",
    name: "AI SaaS Website",
    description: "A conversion-focused SaaS landing page for an AI product with pricing, FAQs, and strong CTAs.",
    data: {
      pageSpec: {
        kind: "marketing",
        version: 1,
        title: "AI SaaS Website",
        sections: [
          {
            type: "hero",
            data: {
              headline: "Launch your AI product in days — not months",
              subheadline:
                "Generate a high-converting website, pricing, FAQs, and SEO foundations automatically. Edit anything. Publish instantly.",
              primaryCta: { label: "Build my site", href: "/sign-in" },
              secondaryCta: { label: "View pricing", href: "#pricing" },
              bullets: [
                "AI-generated sections + copy",
                "SEO-ready structure + sitemap",
                "Publish to your domain (Pro)",
              ],
            },
          },
          {
            type: "socialProof",
            data: {
              eyebrow: "Trusted by builders",
              stats: [
                { label: "Minutes to first publish", value: "5–15" },
                { label: "Sections generated", value: "8+" },
                { label: "Setup required", value: "None" },
              ],
              logos: ["Startups", "Agencies", "Solo founders", "Developers"],
            },
          },
          {
            type: "valueProps",
            data: {
              title: "Everything you need to convert",
              items: [
                { title: "Conversion-first layout", body: "Hero → proof → value → how it works → pricing → FAQ → CTA." },
                { title: "Spec-only agents", body: "Agents write JSON spec. Renderer owns layout forever." },
                { title: "SEO foundations", body: "Clean structure, sitemap support, canonical-ready patterns." },
                { title: "Fast iteration", body: "Re-compose copy and re-publish without breaking structure." },
              ],
            },
          },
          {
            type: "howItWorks",
            data: {
              title: "How it works",
              steps: [
                { title: "Describe your product", body: "Answer a few prompts (or start from this template)." },
                { title: "Agents generate the spec", body: "Sections + copy are produced as strict JSON." },
                { title: "Publish instantly", body: "Go live on Vercel URL. Add a custom domain on Pro." },
              ],
            },
          },
          {
            type: "gallery",
            data: {
              title: "What you can generate",
              items: [
                { title: "Landing page", caption: "High-converting homepage layout" },
                { title: "Pricing page", caption: "Clear tiers + FAQs + CTAs" },
                { title: "Use-case pages", caption: "Programmatic SEO surface area" },
                { title: "On-brand sections", caption: "Consistent spacing, typography, and structure" },
              ],
            },
          },
          {
            type: "pricing",
            data: {
              anchor: "pricing",
              title: "Pricing",
              tiers: [
                {
                  name: "Free",
                  price: "$0",
                  tagline: "Generate & preview",
                  features: ["AI draft site spec", "Preview renderer", "Vercel subdomain publish"],
                  cta: { label: "Get started", href: "/sign-in" },
                },
                {
                  name: "Pro",
                  price: "$29/mo",
                  tagline: "Publish & grow",
                  features: ["Custom domain", "SEO upgrades", "More runs / agents", "Priority generation"],
                  cta: { label: "Go Pro", href: "/pricing" },
                  highlight: true,
                },
              ],
              footnote: "Prices are placeholders — wire to Stripe tiers when ready.",
            },
          },
          {
            type: "faq",
            data: {
              title: "FAQ",
              items: [
                { q: "Do agents write code?", a: "No. Agents write a strict JSON spec only. The renderer owns layout." },
                { q: "Can I edit the content?", a: "Yes. You can re-compose copy and regenerate sections without changing structure." },
                { q: "Is it SEO-ready?", a: "It’s structured for SEO and designed to support sitemaps + program pages." },
                { q: "Can I use my domain?", a: "Yes on Pro. Free uses the Vercel publish URL." },
              ],
            },
          },
          {
            type: "footerCta",
            data: {
              headline: "Ready to publish your AI SaaS site?",
              subheadline: "Generate the spec, preview instantly, then publish with one click.",
              cta: { label: "Build & publish now", href: "/sign-in" },
            },
          },
        ],
      },
    },
  },
];
