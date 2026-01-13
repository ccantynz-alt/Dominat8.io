import Link from "next/link";
import SeoLinks from "../components/SeoLinks";

type TemplateCard = {
  title: string;
  description: string;
  href: string;
  tag: string;
};

const TEMPLATES: TemplateCard[] = [
  {
    title: "SaaS Landing Page",
    description:
      "Conversion-first layout with hero, benefits, social proof, pricing, and FAQs. Ideal for subscriptions.",
    href: "/projects",
    tag: "Most Popular",
  },
  {
    title: "Local Services",
    description:
      "Service pages, trust badges, coverage areas, and booking-ready CTAs. Built for fast lead capture.",
    href: "/projects",
    tag: "High Intent",
  },
  {
    title: "Ecommerce Starter",
    description:
      "Product highlights, collections, FAQs, and trust flow. Great for small catalogs and DTC brands.",
    href: "/projects",
    tag: "Retail",
  },
];

export const metadata = {
  title: "Templates",
  description:
    "Browse high-converting website templates. Start from a proven layout and customize with AI.",
  robots: { index: true, follow: true },
};

export default function TemplatesPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <div className="flex flex-col gap-4">
          <h1 className="text-4xl font-semibold tracking-tight">Templates</h1>
          <p className="text-base text-gray-600 max-w-2xl">
            Start from a proven layout and customize with AI.
          </p>

          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/"
              className="rounded-xl border border-gray-200 px-4 py-2 text-sm hover:bg-gray-50"
            >
              Back to home
            </Link>
            <Link
              href="/use-cases"
              className="rounded-xl bg-black px-4 py-2 text-sm text-white hover:opacity-90"
            >
              Explore use-cases
            </Link>
          </div>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TEMPLATES.map((t) => (
            <div
              key={t.title}
              className="rounded-2xl border border-gray-200 p-5 shadow-sm"
            >
              <h2 className="text-lg font-semibold">{t.title}</h2>
              <p className="mt-3 text-sm text-gray-600">{t.description}</p>
              <div className="mt-5 flex items-center gap-3">
                <Link
                  href={t.href}
                  className="rounded-xl bg-black px-4 py-2 text-sm text-white hover:opacity-90"
                >
                  Start
                </Link>
                <Link
                  href="/projects"
                  className="rounded-xl border border-gray-200 px-4 py-2 text-sm hover:bg-gray-50"
                >
                  Open builder
                </Link>
              </div>
            </div>
          ))}
        </div>

        <SeoLinks
          title="Related use-cases"
          links={[
            { href: "/use-cases/saas", label: "SaaS websites" },
            { href: "/use-cases/startups", label: "Startup websites" },
            { href: "/use-cases/local-services", label: "Local service websites" },
          ]}
        />
      </div>
    </main>
  );
}
