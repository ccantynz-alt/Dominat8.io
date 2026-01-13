import Link from "next/link";

type UseCase = {
  title: string;
  description: string;
  bullets: string[];
};

const USE_CASES: UseCase[] = [
  {
    title: "AI websites for SaaS",
    description:
      "Launch subscription landing pages with clear pricing, onboarding, and upgrade paths.",
    bullets: ["Pricing + FAQs baked in", "Trust + social proof sections", "Fast iteration"],
  },
  {
    title: "Local services (global-ready)",
    description:
      "Build location pages and service pages designed for high-intent searches.",
    bullets: ["Service areas", "Conversion-first CTAs", "SEO-friendly structure"],
  },
  {
    title: "Ecommerce starter sites",
    description:
      "Create clean product-focused pages with FAQs and trust flow to reduce friction.",
    bullets: ["Product highlights", "Shipping/returns FAQ", "Mobile-first layout"],
  },
  {
    title: "Agencies & studios",
    description:
      "Showcase your process and outcomes without needing calls — fully automated conversion.",
    bullets: ["Case studies", "Services + process", "Lead capture without meetings"],
  },
  {
    title: "Personal brand & portfolios",
    description:
      "A premium look that makes it easy for people to understand your work and contact you.",
    bullets: ["Work gallery", "Testimonials", "Simple contact flow"],
  },
  {
    title: "Programmatic SEO",
    description:
      "Scale traffic with indexable hubs and internal linking — the foundation of your “SEO engine”.",
    bullets: ["Hubs + detail pages", "Internal linking", "Metadata + sitemap"],
  },
];

export const metadata = {
  title: "Use-cases",
  description:
    "Explore high-value use-cases for AI website building: SaaS, local services, ecommerce, agencies, and programmatic SEO.",
};

export default function UseCasesPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <div className="flex flex-col gap-4">
          <h1 className="text-4xl font-semibold tracking-tight">
            Use-cases that drive real outcomes
          </h1>
          <p className="text-base text-gray-600 max-w-2xl">
            These are the highest-leverage website categories: strong demand,
            clear intent, and easy to productize. Perfect for global, automated
            onboarding.
          </p>

          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/"
              className="rounded-xl border border-gray-200 px-4 py-2 text-sm hover:bg-gray-50"
            >
              Back to home
            </Link>
            <Link
              href="/templates"
              className="rounded-xl bg-black px-4 py-2 text-sm text-white hover:opacity-90"
            >
              Browse templates
            </Link>
          </div>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {USE_CASES.map((u) => (
            <div
              key={u.title}
              className="rounded-2xl border border-gray-200 p-5 shadow-sm"
            >
              <h2 className="text-lg font-semibold">{u.title}</h2>
              <p className="mt-3 text-sm text-gray-600">{u.description}</p>
              <ul className="mt-4 list-disc pl-5 text-sm text-gray-700">
                {u.bullets.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
              <div className="mt-5 flex items-center gap-3">
                <Link
                  href="/projects"
                  className="rounded-xl bg-black px-4 py-2 text-sm text-white hover:opacity-90"
                >
                  Build now
                </Link>
                <Link
                  href="/templates"
                  className="rounded-xl border border-gray-200 px-4 py-2 text-sm hover:bg-gray-50"
                >
                  Start from template
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-14 rounded-2xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold">Next: SEO expansion pages</h3>
          <p className="mt-2 text-sm text-gray-600">
            After lunch we can generate programmatic pages like
            <span className="font-mono"> /use-cases/saas-landing-page </span>
            and wire them into sitemap for scalable indexing.
          </p>
        </div>
      </div>
    </main>
  );
}
