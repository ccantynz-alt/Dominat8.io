export type MarketingTemplate = {
  slug: string;
  name: string;
  description: string;
  includes: string[];
};

export type MarketingUseCase = {
  slug: string;
  title: string;
  summary: string;
  bullets: string[];
};

export const templates: MarketingTemplate[] = [
  {
    slug: "local-service",
    name: "Local Service",
    description:
      "Perfect for trades, home services, and local providers who want leads fast.",
    includes: ["Home", "Services", "Service Areas", "Reviews", "Pricing", "Contact"],
  },
  {
    slug: "saas-startup",
    name: "SaaS Startup",
    description:
      "Launch a product site with clear value props, pricing, FAQs, and conversion CTAs.",
    includes: ["Home", "Features", "Pricing", "FAQs", "Changelog", "Contact"],
  },
  {
    slug: "consulting",
    name: "Consulting",
    description:
      "High-trust positioning for consultants, coaches, and agencies.",
    includes: ["Home", "Services", "Case Studies", "About", "Pricing", "Contact"],
  },
  {
    slug: "ecommerce-lite",
    name: "Ecommerce Lite",
    description:
      "Showcase products, collections, and trust signals â€” even without a full store build.",
    includes: ["Home", "Collections", "Product Highlights", "Shipping", "FAQs", "Contact"],
  },
  {
    slug: "restaurant",
    name: "Restaurant",
    description:
      "Menus, bookings, location SEO, and strong mobile-first design.",
    includes: ["Home", "Menu", "Bookings", "Events", "Location", "Contact"],
  },
  {
    slug: "portfolio",
    name: "Portfolio",
    description:
      "A clean personal or studio portfolio with projects and lead capture.",
    includes: ["Home", "Work", "About", "Services", "Testimonials", "Contact"],
  },
  {
    slug: "real-estate",
    name: "Real Estate",
    description:
      "Listings focus + local SEO + lead capture for agents and brokerages.",
    includes: ["Home", "Listings", "Buy", "Sell", "About", "Contact"],
  },
  {
    slug: "events",
    name: "Events",
    description:
      "Sell tickets, show schedules, and publish SEO-safe event pages.",
    includes: ["Home", "Upcoming", "Speakers", "Venue", "FAQs", "Contact"],
  },
  {
    slug: "clinic",
    name: "Clinic",
    description:
      "Medical/health-style layout with trust, services, and location SEO.",
    includes: ["Home", "Services", "Team", "Pricing", "FAQs", "Contact"],
  },
  {
    slug: "construction",
    name: "Construction",
    description:
      "Project galleries, capability statements, and quote capture.",
    includes: ["Home", "Projects", "Capabilities", "About", "Reviews", "Contact"],
  },
];

export const useCases: MarketingUseCase[] = [
  {
    slug: "rank-local",
    title: "Rank locally and capture leads",
    summary:
      "Generate location-targeted service pages, FAQs, and CTAs designed to convert.",
    bullets: [
      "SEO-safe service + location pages",
      "Conversion CTAs above the fold",
      "Trust blocks: reviews, guarantees, logos",
    ],
  },
  {
    slug: "launch-fast",
    title: "Launch a product site in minutes",
    summary:
      "Start with a clean template, then let the agents refine copy, pricing, and metadata.",
    bullets: [
      "Instant multi-page site spec",
      "Pricing + FAQ generation",
      "Metadata + sitemap included",
    ],
  },
  {
    slug: "programmatic-seo",
    title: "Programmatic SEO without chaos",
    summary:
      "Scale pages while keeping canonical rules, internal linking, and sitemap hygiene.",
    bullets: [
      "Structured page generation",
      "Canonical + metadata rules",
      "Sitemap/robots defaults included",
    ],
  },
  {
    slug: "conversion-upgrade",
    title: "Turn traffic into customers",
    summary:
      "Add conversion sections, pricing clarity, and objection-handling FAQs.",
    bullets: [
      "Conversion pass across key pages",
      "Pricing clarity + packaging",
      "FAQs for objections + trust signals",
    ],
  },
  {
    slug: "agency-delivery",
    title: "Agency-ready delivery",
    summary:
      "Ship client sites faster with repeatable templates and automated publishing.",
    bullets: [
      "Template-driven consistent builds",
      "Faster iteration loops",
      "Publish + domain connection workflows",
    ],
  },
  {
    slug: "niche-authority",
    title: "Own a niche with authority pages",
    summary:
      "Create structured pages for specific intents, services, and audiences.",
    bullets: [
      "Intent-led page planning",
      "Clean internal linking structure",
      "SEO hygiene from day one",
    ],
  },
  {
    slug: "service-bundles",
    title: "Bundle services into profitable packages",
    summary:
      "Generate package pages that sell outcomes, not hours.",
    bullets: [
      "Package naming + positioning",
      "Pricing tiers + comparison blocks",
      "CTA and trust sections",
    ],
  },
  {
    slug: "seasonal-campaigns",
    title: "Spin up seasonal campaigns quickly",
    summary:
      "Create landing pages for promotions and events without breaking your main site.",
    bullets: [
      "Campaign landing pages",
      "Fast updates + publishing",
      "SEO-safe structure",
    ],
  },
  {
    slug: "multi-location",
    title: "Multi-location businesses",
    summary:
      "Create consistent location pages with unique content and clean sitemap coverage.",
    bullets: [
      "Location page templates",
      "Unique content per page",
      "Sitemap visibility",
    ],
  },
  {
    slug: "trust-first",
    title: "Trust-first pages for high-value services",
    summary:
      "Position expertise with case studies, proof, and clear CTAs.",
    bullets: [
      "Proof blocks: results + logos",
      "Case studies structure",
      "Strong conversion CTA placement",
    ],
  },
];export const USE_CASES = useCases;

