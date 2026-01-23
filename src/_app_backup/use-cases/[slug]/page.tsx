import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import SeoLinks from "../../components/SeoLinks";
import { USE_CASES, findBySlug } from "../../lib/marketingCatalog";

type Props = {
  params: { slug: string };
};

export function generateStaticParams() {
  return USE_CASES.map((u) => ({ slug: u.slug }));
}

export function generateMetadata({ params }: Props): Metadata {
  const item = findBySlug(USE_CASES, params.slug);
  if (!item) return { title: "Use Case" };

  return {
    title: `${item.title} Use Case`,
    description: item.description,
    robots: { index: true, follow: true },
  };
}

export default function UseCaseSlugPage({ params }: Props) {
  const item = findBySlug(USE_CASES, params.slug);
  if (!item) notFound();

  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-5xl px-6 py-14">
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/use-cases"
              className="rounded-xl border border-gray-200 px-4 py-2 text-sm hover:bg-gray-50"
            >
              ← Back to use cases
            </Link>

            <Link
              href={`/start?useCase=${encodeURIComponent(params.slug)}`}
              className="rounded-xl bg-black px-4 py-2 text-sm text-white hover:opacity-90"
            >
              Start with this use case
            </Link>

            <Link
              href="/templates"
              className="rounded-xl border border-gray-200 px-4 py-2 text-sm hover:bg-gray-50"
            >
              Browse templates
            </Link>
          </div>

          <h1 className="text-4xl font-semibold tracking-tight">{item.title}</h1>
          <p className="max-w-2xl text-base text-gray-600">{item.description}</p>

          {item.tag ? (
            <div>
              <span className="inline-flex rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700">
                {item.tag}
              </span>
            </div>
          ) : null}
        </div>

        <div className="mt-10 rounded-2xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold">What this page will become</h2>
          <ul className="mt-3 list-disc pl-5 text-sm text-gray-600">
            <li>Conversion-first layout for this use case</li>
            <li>Example section blocks (hero, proof, benefits, FAQs)</li>
            <li>CTA that routes into “Finish-for-me” generation</li>
            <li>Internal linking to relevant templates + comparisons</li>
          </ul>
        </div>

        <div className="mt-10">
          <SeoLinks
            title="Related"
            links={[
              { href: "/use-cases", label: "All use cases" },
              { href: "/templates", label: "Templates" },
              { href: "/start", label: "Start a project" },
            ]}
          />
        </div>
      </div>
    </main>
  );
}
