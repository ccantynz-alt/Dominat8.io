import type { Metadata } from "next";
import { notFound } from "next/navigation";

// IMPORTANT: do not assume named exports from the catalog module while it evolves
import * as Catalog from "@/lib/marketing/catalog";

type PageProps = {
  params: { slug: string };
};

function slugToTitle(slug: string): string {
  return slug
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function resolveCatalogRoot(): any {
  const mod: any = Catalog as any;
  // Try common patterns:
  // - export default ...
  // - export const catalog = ...
  // - export const marketing = ...
  // - export const marketingCatalog = ... (if it exists later)
  // - fallback to the module object itself
  return mod?.marketingCatalog ?? mod?.marketing ?? mod?.catalog ?? mod?.default ?? mod;
}

function listTemplates(root: any): any[] {
  return (
    (Array.isArray(root?.templates) && root.templates) ||
    (Array.isArray(root?.templateCards) && root.templateCards) ||
    (Array.isArray(root?.items) && root.items) ||
    []
  );
}

function pickTemplateBySlug(slug: string) {
  const root = resolveCatalogRoot();
  const list = listTemplates(root);

  const hit =
    list.find((t) => t?.slug === slug) ||
    list.find((t) => t?.id === slug) ||
    list.find((t) => t?.key === slug) ||
    list.find((t) => t?.routeSlug === slug) ||
    null;

  return { list, hit };
}

export function generateStaticParams() {
  const root = resolveCatalogRoot();
  const list = listTemplates(root);

  const slugs = list
    .map((t) => t?.slug ?? t?.id ?? t?.key ?? t?.routeSlug)
    .filter((v) => typeof v === "string" && v.length > 0);

  return Array.from(new Set(slugs)).map((slug) => ({ slug }));
}

export function generateMetadata({ params }: PageProps): Metadata {
  const { hit } = pickTemplateBySlug(params.slug);
  if (!hit) return { title: "Template Not Found" };

  const anyT = hit as unknown as Record<string, any>;

  const displayTitle =
    (typeof anyT.title === "string" && anyT.title) ||
    (typeof anyT.name === "string" && anyT.name) ||
    (typeof anyT.label === "string" && anyT.label) ||
    slugToTitle(params.slug);

  const displayDescription =
    (typeof anyT.description === "string" && anyT.description) ||
    (typeof anyT.summary === "string" && anyT.summary) ||
    (typeof anyT.tagline === "string" && anyT.tagline) ||
    `Explore the ${displayTitle} template.`;

  return {
    title: `${displayTitle} — Templates`,
    description: displayDescription,
  };
}

export default function TemplateSlugPage({ params }: PageProps) {
  const { hit } = pickTemplateBySlug(params.slug);
  if (!hit) notFound();

  const anyT = hit as unknown as Record<string, any>;

  const displayTitle =
    (typeof anyT.title === "string" && anyT.title) ||
    (typeof anyT.name === "string" && anyT.name) ||
    (typeof anyT.label === "string" && anyT.label) ||
    slugToTitle(params.slug);

  const displayDescription =
    (typeof anyT.description === "string" && anyT.description) ||
    (typeof anyT.summary === "string" && anyT.summary) ||
    (typeof anyT.tagline === "string" && anyT.tagline) ||
    `A polished template designed to help you ship faster.`;

  const primaryCtaText =
    (typeof anyT.ctaText === "string" && anyT.ctaText) || "Use this template";

  return (
    <main className="min-h-screen bg-black text-white">
      <section className="mx-auto max-w-5xl px-6 py-16">
        <div className="mb-10">
          <div className="text-xs uppercase tracking-[0.28em] text-white/60">
            Templates
          </div>

          <h1 className="mt-4 text-4xl font-semibold leading-tight sm:text-5xl">
            {displayTitle}
          </h1>

          <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/70">
            {displayDescription}
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href={`/gallery?template=${encodeURIComponent(params.slug)}`}
              className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black shadow hover:opacity-90"
            >
              {primaryCtaText}
            </a>

            <a
              href="/templates"
              className="rounded-xl border border-white/20 px-5 py-3 text-sm font-semibold text-white/90 hover:border-white/40"
            >
              Back to templates
            </a>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <div className="text-sm font-semibold">What you get</div>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-white/70">
              <li>Clean layout and strong hero structure</li>
              <li>Fast-start defaults that you can customize later</li>
              <li>Marketing-friendly sections and conversion rhythm</li>
            </ul>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <div className="text-sm font-semibold">Good for</div>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-white/70">
              <li>Launching a new idea quickly</li>
              <li>Testing messaging and offers</li>
              <li>Getting a “wow” baseline you can iterate on</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 rounded-2xl border border-white/10 bg-white/5 p-6">
          <div className="text-sm font-semibold">Debug</div>
          <div className="mt-2 text-xs text-white/60">
            slug: <span className="text-white/80">{params.slug}</span>
          </div>
        </div>
      </section>
    </main>
  );
}