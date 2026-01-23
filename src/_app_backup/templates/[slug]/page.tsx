import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import SeoLinks from "../../components/SeoLinks";
import { TEMPLATES, findBySlug } from "../../lib/marketingCatalog";

type Props = {
  params: { slug: string };
};

export function generateStaticParams() {
  return TEMPLATES.map((t) => ({ slug: t.slug }));
}

export function generateMetadata({ params }: Props): Metadata {
  const item = findBySlug(TEMPLATES, params.slug);
  if (!item) return { title: "Template Category" };

  return {
    title: item.title,
    description: item.description,
    robots: { index: true, follow: true },
  };
}

export default function TemplateCategoryPage({ params }: Props) {
  const item = findBySlug(TEMPLATES, params.slug);
  if (!item) notFound();

  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-5xl px-6 py-14">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/templates"
              className="rounded-xl border border-gray-200 px-4 py-2 text-sm hover:bg-gray-50"
            >
              ← Back to templates
            </Link>

            <Link
              href="/use-cases"
              className="rounded-xl bg-black px-4 py-2 text-sm text-white hover:opacity-90"
            >
              Explore use cases
            </Link>
          </div>

          <h1 className="text-4xl font-semibold tracking-tight">{item.title}</h1>
          <p className="max-w-2xl text-base text-gray-600">{item.description}</p>
        </div>

        <div className="mt-10 rounded-2xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Next build step for this page</h2>
          <ul className="mt-3 list-disc pl-5 text-sm text-gray-600">
            <li>Show 6–12 template cards (generated + curated)</li>
            <li>Add “Create from this template” CTA into your builder flow</li>
            <li>Internal links to the most relevant comparisons and guides</li>
          </ul>
        </div>

        <div className="mt-10">
          <SeoLinks
            title="Related"
            links={[
              { href: "/templates", label: "All templates" },
              { href: "/use-cases", label: "Use cases" },
              { href: "/guides", label: "Guides" },
            ]}
          />
        </div>
      </div>
    </main>
  );
}
