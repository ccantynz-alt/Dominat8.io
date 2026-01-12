// app/lib/programmaticPages.ts

export type ProgramPage = {
  category:
    | "templates"
    | "use-cases"
    | "features"
    | "comparisons"
    | "integrations"
    | "docs";
  slug: string;
  title: string;
  description: string;
  h1: string;
  bullets: string[];
  faq: { q: string; a: string }[];
};

function p(
  category: ProgramPage["category"],
  slug: string,
  title: string,
  description: string,
  h1: string,
  bullets: string[],
  faq: { q: string; a: string }[]
): ProgramPage {
  return { category, slug, title, description, h1, bullets, faq };
}

/**
 * NUCLEAR SaaS programmatic pages
 * Expand freely — keep high-quality, non-spammy slugs.
 */
export const PROGRAM_PAGES: ProgramPage[] = [
  // Templates
  p(
    "templates",
    "saas-landing-page",
    "AI SaaS Landing Page Builder",
    "Generate high-converting SaaS landing pages with AI. Fast, clean, responsive layouts built for conversion and SEO.",
    "AI SaaS Landing Page Builder",
    [
      "Hero + CTA variants that convert",
      "Pricing, FAQ, and contact sections included",
      "SEO-ready structure and metadata",
      "Multi-page output in one run",
    ],
    [
      { q: "Can I generate a full SaaS site with AI?", a: "Yes. Generate multi-page sites including home, pricing, about, and contact." },
      { q: "Do I need to code?", a: "No. You can generate and publish without writing code." },
      { q: "Is it SEO-ready?", a: "Yes. Pages can include meta tags, canonical, schema, and clean structure." },
    ]
  ),
  p(
    "templates",
    "portfolio",
    "AI Portfolio Website Builder",
    "Create a beautiful portfolio site with AI: projects, about, contact, and a polished design that looks premium.",
    "AI Portfolio Website Builder",
    [
      "Project gallery layouts",
      "About + contact built-in",
      "Fast, responsive HTML output",
      "Easy iteration with runs and apply",
    ],
    [
      { q: "Can I build a portfolio in minutes?", a: "Yes. Generate a full portfolio and tweak by re-running prompts." },
      { q: "Can I add more pages?", a: "Yes. Generate additional pages like /work, /services, /blog." },
    ]
  ),

  // Use-cases
  p(
    "use-cases",
    "launch-mvp-fast",
    "Launch an MVP Website Fast with AI",
    "Generate a full MVP website in minutes: landing, pricing, contact, and a clean structure you can publish immediately.",
    "Launch an MVP Website Fast with AI",
    [
      "Multi-page site generation",
      "Instant preview and apply workflow",
      "Safe publishing model",
      "Designed for iteration",
    ],
    [
      { q: "How fast can I launch?", a: "You can generate and publish a usable site in one session." },
      { q: "Can I iterate?", a: "Yes. Each run is versioned so you can improve and re-apply." },
    ]
  ),

  // Features
  p(
    "features",
    "multi-page-generation",
    "Multi-Page Website Generation",
    "Generate multi-page websites in one run: home, about, pricing, contact, and more — structured and consistent.",
    "Multi-Page Website Generation",
    [
      "Consistent navigation across pages",
      "Structured output for reliable publishing",
      "Per-page SEO metadata support",
      "Clean HTML ready for deployment",
    ],
    [
      { q: "Does it create multiple pages automatically?", a: "Yes. It can generate and store a set of pages per run." },
      { q: "Can I add custom routes like /blog?", a: "Yes. You can prompt additional pages or templates." },
    ]
  ),
  p(
    "features",
    "seo-schema",
    "Advanced SEO + Schema",
    "SEO tools that matter: titles, descriptions, canonicals, robots, FAQ schema, and clean indexable pages.",
    "Advanced SEO + Schema",
    [
      "Per-page titles & descriptions",
      "Canonical + robots controls",
      "FAQ schema for rich results",
      "Sitemaps + robots.txt per project",
    ],
    [
      { q: "Is the HTML indexable?", a: "Yes. Pages can be served as real HTML responses for crawlers." },
      { q: "Can I add schema like FAQPage?", a: "Yes. Schema can be injected and/or generated per page." },
    ]
  ),

  // Integrations
  p(
    "integrations",
    "github",
    "GitHub Integration",
    "Export and manage generated websites in GitHub for full control, collaboration, and deployment workflows.",
    "GitHub Integration",
    [
      "Version your sites in a repo",
      "Collaborate with your team",
      "Deploy via Vercel or any host",
      "Track changes across runs",
    ],
    [
      { q: "Can I export to GitHub?", a: "Yes. You can publish output to a repo or export as a ZIP." },
      { q: "Does it support deployment workflows?", a: "Yes. GitHub enables CI/CD and team collaboration." },
    ]
  ),

  // Comparisons (keep careful wording; factual, non-defamatory)
  p(
    "comparisons",
    "base44-alternative",
    "Base44 Alternative for AI Website Building",
    "Compare approaches and workflows for AI website building. Focus on versioned runs, safe apply, and publish control.",
    "Base44 Alternative for AI Website Building",
    [
      "Versioned runs and history",
      "Explicit apply and set-home workflow",
      "Project-based publishing control",
      "SEO + schema support",
    ],
    [
      { q: "What matters in an AI website builder?", a: "Reliability, versioning, easy iteration, publish control, and SEO readiness." },
      { q: "Can I generate multi-page sites?", a: "Yes. Multi-page generation is core to the workflow." },
    ]
  ),

  // Docs
  p(
    "docs",
    "how-to-publish",
    "How to Publish an AI-Generated Website",
    "A step-by-step guide to generating, applying, and publishing a website using versioned AI runs.",
    "How to Publish an AI-Generated Website",
    [
      "Generate → Apply → Preview → Publish",
      "Set your homepage safely",
      "Configure SEO settings",
      "Use sitemaps and robots.txt",
    ],
    [
      { q: "Do I need to deploy automatically?", a: "No. Publishing can be intentional and controlled." },
      { q: "How do I update later?", a: "Run again, compare outputs, apply updates, and republish." },
    ]
  ),
];
