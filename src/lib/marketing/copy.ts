// src/lib/marketing/copy.ts
export const BRAND = {
  name: "Dominat8",
  domain: "dominat8.io",
  url: "https://dominat8.io",
  tagline: "The AI website builder that ships. Describe it. We build it. You publish.",
};

export const CTA = {
  primary: { label: "Build my site", href: "/" },
  secondary: { label: "View templates", href: "/templates" },
  tertiary: { label: "Pricing", href: "/pricing" },
};

export const PROOF = [
  { k: "Trust", v: "professional, grounded output" },
  { k: "Speed", v: "minutes from brief to draft" },
  { k: "Pages", v: "multi-page generation" },
  { k: "SEO", v: "metadata + sitemap-ready" },
] as const;

export const TRUST = [
  { title: "Coverage", body: "Clear regions, service areas, and availability. No ambiguity." },
  { title: "Credibility", body: "Proof-first layout: experience, outcomes, and reassurance." },
  { title: "Responsiveness", body: "Calls-to-action where they matter. Easy contact." },
  { title: "Professional tone", body: "Calm typography and spacing. Premium brochure feel." },
] as const;

export const SERVICES = [
  { title: "Homepage (flagship)", body: "Full-screen hero, services, proof, and strong CTA — calm and premium." },
  { title: "Pricing page", body: "Clear options and guidance. Built to reduce hesitation." },
  { title: "FAQ page", body: "Objection handling that feels natural, not salesy." },
  { title: "Contact page", body: "Fast conversion: phone, email, form — clean and simple." },
  { title: "SEO basics", body: "Metadata, canonical, structure, and sitemap-ready layout." },
  { title: "Publish-ready output", body: "Clean routing and consistent structure, built for confidence." },
] as const;

export const TESTIMONIALS = [
  {
    quote:
      "This feels like a real premium site — not a template. The structure and clarity are exactly what we needed.",
    name: "Local operator",
    detail: "Service business",
  },
  {
    quote:
      "It reads like a brochure we’d pay a studio for — calm, trustworthy, and easy to understand.",
    name: "Owner",
    detail: "Trade & rural services",
  },
  {
    quote:
      "The best part is the flow: brief → draft → publish. No mystery, no mess.",
    name: "Founder",
    detail: "Small business",
  },
] as const;

export const FAQ = [
  {
    q: "Is this only for ‘tech’ companies?",
    a: "No. It’s designed for real-world businesses: trades, rural services, local operators, and premium providers.",
  },
  {
    q: "Will the site feel ‘AI generated’?",
    a: "The output is professional first — calm layout, clear hierarchy, and a premium tone. AI is the engine, not the aesthetic.",
  },
  {
    q: "What do I get after generation?",
    a: "A multi-page site structure with homepage, pricing, FAQ, and contact — plus SEO basics and publish-ready output.",
  },
] as const;

export const STEPS = [
  { title: "Brief", desc: "Tell us what you do. We extract structure, tone, and layout rhythm." },
  { title: "Generate", desc: "Pages + content + components — polished, consistent, and brand-aligned." },
  { title: "Publish", desc: "SEO, sitemap, and publish artifacts — ready to ship on your domain." }
] as const;
