import type { Metadata } from "next";
import Link from "next/link";
import SeoLinks from "../components/SeoLinks";

type UseCaseCard = {
  title: string;
  description: string;
  href: string;
  tag: string;
};

const USE_CASES: UseCaseCard[] = [
  {
    title: "SaaS",
    description:
      "Launch subscription-ready SaaS sites with pricing, FAQs, and conversion-first sections.",
    href: "/use-cases/saas",
    tag: "High Intent",
  },
  {
    title: "Startups",
    description:
      "Fast MVP websites that explain value clearly and drive signups without meetings.",
    href: "/use-cases/startups",
    tag: "Popular",
  },
  {
    title: "Local Services",
    description:
      "Service pages and trust flow designed to convert people searching right now.",
    href: "/use-cases/local-services",
    tag: "Local SEO",
  },
  {
    title: "Ecommerce",
    description:
      "Product-driven pages that build trust, answer objections, and drive purchases.",
    href: "/use-cases/ecommerce",
    tag: "Retail",
  },
  {
    title: "Creators",
    description:
      "Portfolio and personal brand sites that look premium and convert followers into customers.",
    href: "/use-cases/creators",
    tag: "Brand",
  },
  {
    title: "Agencies",
    description:
      "Studio/agency sites with case studies, services, and lead capture flows.",
    href: "/use-cases/agencies",
    tag: "B2B",
  },
];

export const metadata: Metadata = {
  title: "Use Cases",
  description:
    "Explore high-value use cases for AI website building. Start from proven structures and scale with SEO-safe pages.",
  robots: {
    index: true,
    follow: true,
  },
};

export default function UseCasesPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <div className="flex flex-col gap-4">
          <h1 className="text-4xl font-semibold tracking-tight">Use cases</h1>
          <p className="max-w-2xl text-base text-gray-600">
            Build sites designed for outcomes: signups, sales, and rankings.
            Choose a proven structure and let AI do the heavy lifting.
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
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg font-semibold">{u.title}</h2>
                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700">
                  {u.tag}
                </span>
              </div>

              <p className="mt-3 text-sm text-gray-600">{u.description}</p>

              <div className="mt-5">
                <Link
                  href={u.href}
                  className="inline-flex rounded-xl bg-black px-4 py-2 text-sm text-white hover:opacity-90"
                >
                  Explore
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10">
          <SeoLinks
            title="Related"
            links={[
              { href: "/templates", label: "Templates" },
              { href: "/templates/saas", label: "SaaS templates" },
              { href: "/templates/startups", label: "Startup templates" },
            ]}
          />
        </div>

        <div className="mt-8">
          <SeoLinks
            title="Learn more"
            links={[
              { href: "/guides", label: "Guides" },
              { href: "/comparisons", label: "Comparisons" },
            ]}
          />
        </div>
      </div>
    </main>
  );
}
