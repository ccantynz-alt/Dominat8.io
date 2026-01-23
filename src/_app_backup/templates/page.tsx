import type { Metadata } from "next";
import Link from "next/link";
import SeoLinks from "../components/SeoLinks";
import { TEMPLATES } from "../lib/marketingCatalog";

export const metadata: Metadata = {
  title: "Templates",
  description:
    "Browse conversion-focused templates built for outcomes: signups, sales, and SEO.",
  robots: { index: true, follow: true },
};

export default function TemplatesPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <div className="flex flex-col gap-4">
          <h1 className="text-4xl font-semibold tracking-tight">Templates</h1>
          <p className="max-w-2xl text-base text-gray-600">
            Start with a proven layout, then let AI generate the content and structure.
          </p>

          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/"
              className="rounded-xl border border-gray-200 px-4 py-2 text-sm hover:bg-gray-50"
            >
              Back to home
            </Link>

            <Link
              href="/start"
              className="rounded-xl bg-black px-4 py-2 text-sm text-white hover:opacity-90"
            >
              Start a project
            </Link>

            <Link
              href="/use-cases"
              className="rounded-xl border border-gray-200 px-4 py-2 text-sm hover:bg-gray-50"
            >
              Explore use cases
            </Link>
          </div>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TEMPLATES.map((t) => (
            <div key={t.slug} className="rounded-2xl border border-gray-200 p-5 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg font-semibold">{t.title}</h2>
                {t.tag ? (
                  <span className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700">
                    {t.tag}
                  </span>
                ) : null}
              </div>

              <p className="mt-3 text-sm text-gray-600">{t.description}</p>

              <div className="mt-5 flex gap-3">
                <Link
                  href={`/templates/${t.slug}`}
                  className="inline-flex rounded-xl border border-gray-200 px-4 py-2 text-sm hover:bg-gray-50"
                >
                  View
                </Link>

                <Link
                  href={`/start?template=${encodeURIComponent(t.slug)}`}
                  className="inline-flex rounded-xl bg-black px-4 py-2 text-sm text-white hover:opacity-90"
                >
                  Start
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10">
          <SeoLinks
            title="Related"
            links={[
              { href: "/use-cases", label: "Use cases" },
              { href: "/guides", label: "Guides" },
              { href: "/comparisons", label: "Comparisons" },
            ]}
          />
        </div>
      </div>
    </main>
  );
}
