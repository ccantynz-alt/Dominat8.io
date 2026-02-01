import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";

// IMPORTANT: do not assume named exports from the catalog module while it evolves
import * as Catalog from "@/lib/marketing/catalog";

import MarketingCTA from "@/components/marketing/MarketingCTA";

type Props = {
  params: { slug: string };
};

function slugToTitle(slug: string): string {
  return slug
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function resolveCatalogRoot(): any {
  const mod: any = Catalog as any;
  return mod?.marketingCatalog ?? mod?.marketing ?? mod?.catalog ?? mod?.default ?? mod;
}

function listUseCases(root: any): any[] {
  return (
    (Array.isArray(root?.useCases) && root.useCases) ||
    (Array.isArray(root?.useCaseCards) && root.useCaseCards) ||
    (Array.isArray(root?.items) && root.items) ||
    []
  );
}

function pickUseCase(slug: string) {
  const root = resolveCatalogRoot();
  const list = listUseCases(root);

  const hit =
    list.find((u) => u?.slug === slug) ||
    list.find((u) => u?.id === slug) ||
    list.find((u) => u?.key === slug) ||
    null;

  return { list, hit };
}

export function generateStaticParams() {
  const root = resolveCatalogRoot();
  const list = listUseCases(root);

  const slugs = list
    .map((u) => u?.slug ?? u?.id ?? u?.key)
    .filter((v) => typeof v === "string" && v.length > 0);

  return Array.from(new Set(slugs)).map((slug) => ({ slug }));
}

export function generateMetadata({ params }: Props): Metadata {
  const { hit } = pickUseCase(params.slug);
  if (!hit) return { title: "Use Case Not Found" };

  const anyU = hit as Record<string, any>;

  const title =
    (typeof anyU.title === "string" && anyU.title) ||
    (typeof anyU.name === "string" && anyU.name) ||
    (typeof anyU.label === "string" && anyU.label) ||
    slugToTitle(params.slug);

  const description =
    (typeof anyU.description === "string" && anyU.description) ||
    (typeof anyU.summary === "string" && anyU.summary) ||
    `Explore how Dominat8 helps with ${title}.`;

  return { title: `${title} — Use Case`, description };
}

export default function UseCasePage({ params }: Props) {
  const { hit } = pickUseCase(params.slug);
  if (!hit) notFound();

  const anyU = hit as Record<string, any>;

  const title =
    (typeof anyU.title === "string" && anyU.title) ||
    (typeof anyU.name === "string" && anyU.name) ||
    (typeof anyU.label === "string" && anyU.label) ||
    slugToTitle(params.slug);

  const description =
    (typeof anyU.description === "string" && anyU.description) ||
    (typeof anyU.summary === "string" && anyU.summary) ||
    `See how this use case works with Dominat8.`;

  return (
    <main className="min-h-screen bg-black text-white">
      <section className="mx-auto max-w-5xl px-6 py-16">
        <div className="mb-10">
          <div className="text-xs uppercase tracking-[0.28em] text-white/60">
            Use Cases
          </div>

          <h1 className="mt-4 text-4xl font-semibold sm:text-5xl">{title}</h1>

          <p className="mt-4 max-w-2xl text-white/70">{description}</p>

          <div className="mt-8 flex flex-wrap gap-3">
            <MarketingCTA />

            <Link
              href="/use-cases"
              className="rounded-xl border border-white/20 px-5 py-3 text-sm font-semibold text-white/90 hover:border-white/40"
            >
              Back to use cases
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}