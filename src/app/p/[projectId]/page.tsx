// src/app/p/[projectId]/page.tsx
import type { Metadata } from "next";
import Link from "next/link";

/**
 * Minimal spec shape we can safely render.
 * Keep types simple to avoid TS indexed-type issues on optional fields.
 */
type PageSpec = {
  slug?: string;
  title?: string;
  hero?: {
    headline?: string;
    subheadline?: string;
    primaryCta?: { label?: string; href?: string };
    secondaryCta?: { label?: string; href?: string };
  };
  sections?: Array<any>;
};

type PublishedSpec = {
  projectId?: string;
  version?: string;
  brandName?: string;
  createdAtIso?: string;
  pages?: PageSpec[];
  [k: string]: any;
};

function isObj(v: unknown): v is Record<string, any> {
  return typeof v === "object" && v !== null;
}

/**
 * Tries to load a published spec from KV using a few common key patterns.
 */
async function loadPublishedSpec(projectId: string): Promise<PublishedSpec | null> {
  let kv: any = null;
  try {
    const mod: any = await import("@vercel/kv");
    kv = mod?.kv ?? mod?.default?.kv ?? mod?.default ?? null;
  } catch {
    kv = null;
  }

  if (!kv || typeof kv.get !== "function") return null;

  const candidates = [
    `published:${projectId}`,
    `publish:${projectId}`,
    `project:${projectId}:published`,
    `projects:${projectId}:published`,
    `site:published:${projectId}`,
    `site:${projectId}:published`,
    `spec:published:${projectId}`,
    `spec:${projectId}:published`,
  ];

  for (const key of candidates) {
    try {
      const val = await kv.get(key);
      if (!val) continue;

      if (typeof val === "string") {
        try {
          const parsed = JSON.parse(val);
          if (isObj(parsed)) return parsed as PublishedSpec;
        } catch {
          // ignore
        }
      }

      if (isObj(val)) return val as PublishedSpec;
    } catch {
      // ignore and continue
    }
  }

  return null;
}

function pick<T>(...vals: Array<T | undefined | null | "">): T | undefined {
  for (const v of vals) {
    if (v !== undefined && v !== null && v !== "") return v as T;
  }
  return undefined;
}

function safeArray<T>(v: unknown): T[] {
  return Array.isArray(v) ? (v as T[]) : [];
}

export async function generateMetadata({
  params,
}: {
  params: { projectId: string };
}): Promise<Metadata> {
  const spec = await loadPublishedSpec(params.projectId);
  const brand = pick(spec?.brandName, "Your Brand");
  const title = `${brand} — Official Site`;
  const description =
    "A premium, conversion-focused site generated and published from a live spec.";

  return {
    title,
    description,
    openGraph: { title, description, type: "website" },
    robots: { index: true, follow: true },
  };
}

export default async function PublicProjectPage({
  params,
}: {
  params: { projectId: string };
}) {
  const projectId = params.projectId;
  const spec = await loadPublishedSpec(projectId);

  const brandName = pick(spec?.brandName, "Your Brand");
  const firstPage = safeArray<PageSpec>(spec?.pages)[0];

  const heroHeadline = pick(firstPage?.hero?.headline, firstPage?.title, `${brandName} that converts`);

  const heroSub = pick(
    firstPage?.hero?.subheadline,
    "Launch a clean, premium presence that builds trust and drives action — without the noise."
  );

  const primaryCtaLabel = pick(firstPage?.hero?.primaryCta?.label, "Get started");
  const primaryCtaHref = pick(firstPage?.hero?.primaryCta?.href, "#cta");

  const secondaryCtaLabel = pick(firstPage?.hero?.secondaryCta?.label, "See features");
  const secondaryCtaHref = pick(firstPage?.hero?.secondaryCta?.href, "#features");

  const sections = safeArray<any>(firstPage?.sections);
  const featuresSection = sections.find((s) => s?.type === "features");
  const faqSection = sections.find((s) => s?.type === "faq");

  const featureItems =
    safeArray<{ title?: string; body?: string }>(featuresSection?.items).length > 0
      ? safeArray<{ title?: string; body?: string }>(featuresSection?.items)
      : [
          { title: "Premium structure, fast", body: "A clean layout that looks like a real product — not a template dump." },
          { title: "Conversion-first sections", body: "Hero → proof → benefits → FAQ → strong CTA, in the order that sells." },
          { title: "Built to scale", body: "Designed for global visitors with clear hierarchy and readable spacing." },
          { title: "Trust baked in", body: "Clear value prop, consistent typography, and a confident, modern aesthetic." },
          { title: "Mobile-ready by default", body: "Responsive sections that hold up on phones, tablets, and desktop." },
          { title: "Spec-driven", body: "When your spec updates, your public site updates too — no manual edits." },
        ];

  const faqItems =
    safeArray<{ q?: string; a?: string }>(faqSection?.items).length > 0
      ? safeArray<{ q?: string; a?: string }>(faqSection?.items)
      : [
          { q: "What is this site?", a: "It’s a published marketing page generated from a saved spec — designed to look premium and convert." },
          { q: "Can the content change later?", a: "Yes. When the published spec is updated, this page can render the latest version." },
          { q: "Is it mobile friendly?", a: "Yes — the layout is responsive and uses modern spacing and typography." },
        ];

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-slate-900 text-white shadow-sm">
              <span className="text-sm font-semibold">
                {(brandName || "B").trim().slice(0, 1).toUpperCase()}
              </span>
            </div>
            <div className="leading-tight">
              <div className="text-sm font-semibold">{brandName}</div>
              <div className="text-xs text-slate-500">Official site</div>
            </div>
          </div>

          <nav className="hidden items-center gap-6 md:flex">
            <a className="text-sm text-slate-600 hover:text-slate-900" href="#features">Features</a>
            <a className="text-sm text-slate-600 hover:text-slate-900" href="#proof">Proof</a>
            <a className="text-sm text-slate-600 hover:text-slate-900" href="#faq">FAQ</a>
          </nav>

          <div className="flex items-center gap-2">
            <a
              href={secondaryCtaHref}
              className="hidden rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:border-slate-300 hover:bg-slate-50 md:inline-flex"
            >
              {secondaryCtaLabel}
            </a>
            <a
              href={primaryCtaHref}
              className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
            >
              {primaryCtaLabel}
            </a>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-40 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-slate-100 blur-3xl" />
          <div className="absolute -bottom-48 left-0 h-[520px] w-[520px] rounded-full bg-slate-100 blur-3xl" />
          <div className="absolute -bottom-48 right-0 h-[520px] w-[520px] rounded-full bg-slate-100 blur-3xl" />
        </div>

        <div className="mx-auto max-w-6xl px-4 pt-14 pb-10 md:pt-20 md:pb-16">
          <div className="grid gap-10 md:grid-cols-12 md:items-center">
            <div className="md:col-span-7">
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 shadow-sm">
                <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
                Live published page
                <span className="text-slate-400">•</span>
                <span className="font-mono text-[11px] text-slate-500">{projectId}</span>
              </div>

              <h1 className="mt-5 text-4xl font-semibold tracking-tight text-slate-900 md:text-5xl">
                {heroHeadline}
              </h1>

              <p className="mt-4 max-w-xl text-lg leading-relaxed text-slate-600">{heroSub}</p>

              <div className="mt-7 flex flex-wrap items-center gap-3">
                <a
                  href={primaryCtaHref}
                  className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
                >
                  {primaryCtaLabel}
                </a>
                <a
                  href={secondaryCtaHref}
                  className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-50"
                >
                  {secondaryCtaLabel}
                </a>
              </div>

              <div className="mt-6 grid max-w-xl grid-cols-3 gap-3 text-xs text-slate-600">
                {[
                  { t: "Premium", s: "clean spacing" },
                  { t: "Fast", s: "loads quickly" },
                  { t: "Focused", s: "built to convert" },
                ].map((x) => (
                  <div key={x.t} className="rounded-xl border border-slate-200 bg-white px-3 py-3 shadow-sm">
                    <div className="font-semibold text-slate-900">{x.t}</div>
                    <div className="mt-1">{x.s}</div>
                  </div>
                ))}
              </div>

              {!spec && (
                <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                  <div className="font-semibold">Published spec not found in KV (yet)</div>
                  <div className="mt-1 text-amber-900/80">
                    This page is live and styled, but the renderer couldn’t locate the KV key.
                    Once we confirm your exact publish key, this will render your real content.
                  </div>
                </div>
              )}
            </div>

            <div className="md:col-span-5">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-sm font-semibold text-slate-900">What you get</div>
                    <div className="mt-1 text-sm text-slate-600">
                      A real marketing page structure — no fluff.
                    </div>
                  </div>
                  <div className="rounded-2xl bg-slate-900 px-3 py-1 text-xs font-semibold text-white">
                    Premium
                  </div>
                </div>

                <ul className="mt-5 space-y-3 text-sm text-slate-700">
                  {[
                    "Strong hero with clear CTA",
                    "Proof and trust blocks",
                    "Benefit-driven features",
                    "FAQ that removes doubt",
                    "Final CTA that closes",
                  ].map((t) => (
                    <li key={t} className="flex items-start gap-3">
                      <span className="mt-1 inline-block h-2.5 w-2.5 rounded-full bg-emerald-500" />
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-6 rounded-2xl bg-slate-50 p-4">
                  <div className="text-xs font-semibold text-slate-700">Generated from spec</div>
                  <div className="mt-1 text-xs text-slate-600">
                    Version: <span className="font-mono text-slate-700">{pick(spec?.version, "unknown")}</span>
                  </div>
                  <div className="mt-1 text-xs text-slate-600">
                    Created: <span className="font-mono text-slate-700">{pick(spec?.createdAtIso, "unknown")}</span>
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between">
                  <a href="#cta" className="text-sm font-semibold text-slate-900 hover:underline">
                    Jump to CTA
                  </a>
                  <span className="text-xs text-slate-500">Scroll for details</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="proof" className="border-y border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <div className="grid gap-6 md:grid-cols-12 md:items-center">
            <div className="md:col-span-5">
              <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
                Built for trust, not hype
              </h2>
              <p className="mt-2 text-slate-600">
                A premium layout that feels credible and guides visitors toward a clear action.
              </p>
            </div>
            <div className="md:col-span-7">
              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  { k: "Clarity", v: "Simple value prop" },
                  { k: "Confidence", v: "Premium spacing" },
                  { k: "Conversion", v: "CTA-first structure" },
                ].map((x) => (
                  <div key={x.k} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="text-sm font-semibold text-slate-900">{x.k}</div>
                    <div className="mt-1 text-sm text-slate-600">{x.v}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="bg-white">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-semibold tracking-tight text-slate-900">
              Features that move the needle
            </h2>
            <p className="mt-2 text-slate-600">
              Clear benefits, clean layout, and a structure that makes decisions easy.
            </p>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featureItems.slice(0, 6).map((f, idx) => (
              <div key={idx} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div className="text-base font-semibold text-slate-900">{pick(f.title, `Feature ${idx + 1}`)}</div>
                  <div className="rounded-2xl bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">
                    {String(idx + 1).padStart(2, "0")}
                  </div>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">
                  {pick(f.body, "A benefit-focused block that supports the core promise.")}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <div className="grid gap-6 md:grid-cols-12 md:items-start">
            <div className="md:col-span-5">
              <h2 className="text-3xl font-semibold tracking-tight text-slate-900">
                A smooth path to “yes”
              </h2>
              <p className="mt-2 text-slate-600">
                Visitors should understand, trust, and act — fast.
              </p>
            </div>
            <div className="md:col-span-7">
              <ol className="space-y-3">
                {[
                  { t: "Lead with clarity", d: "One headline that tells people exactly what they get." },
                  { t: "Show proof", d: "Trust blocks that reduce skepticism and increase confidence." },
                  { t: "Deliver benefits", d: "A short set of strong features with real outcomes." },
                  { t: "Remove doubt", d: "FAQ that answers the questions people hesitate on." },
                  { t: "Close with a clear CTA", d: "A final call-to-action that’s easy to say yes to." },
                ].map((x, i) => (
                  <li key={x.t} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-start gap-4">
                      <div className="grid h-9 w-9 place-items-center rounded-xl bg-slate-900 text-sm font-semibold text-white">
                        {i + 1}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-slate-900">{x.t}</div>
                        <div className="mt-1 text-sm text-slate-600">{x.d}</div>
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </section>

      <section id="faq" className="bg-white">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-semibold tracking-tight text-slate-900">FAQ</h2>
            <p className="mt-2 text-slate-600">
              Straight answers that reduce friction and build confidence.
            </p>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {faqItems.slice(0, 6).map((x, idx) => (
              <div key={idx} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="text-sm font-semibold text-slate-900">{pick(x.q, `Question ${idx + 1}`)}</div>
                <div className="mt-2 text-sm leading-relaxed text-slate-600">{pick(x.a, "Answer goes here.")}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="cta" className="bg-slate-900">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <div className="grid gap-8 rounded-3xl border border-white/10 bg-white/5 p-8 md:grid-cols-12 md:items-center">
            <div className="md:col-span-8">
              <h2 className="text-3xl font-semibold tracking-tight text-white">
                Ready to launch something premium?
              </h2>
              <p className="mt-2 text-white/70">
                A clean, conversion-ready layout that’s designed to build trust and drive action.
              </p>
            </div>
            <div className="md:col-span-4 md:flex md:justify-end">
              <Link
                href="/projects"
                className="inline-flex w-full items-center justify-center rounded-2xl bg-white px-6 py-3 text-sm font-semibold text-slate-900 shadow-sm hover:bg-slate-100 md:w-auto"
              >
                Back to Projects
              </Link>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 text-xs text-white/60">
            <div>© {new Date().getFullYear()} {brandName}</div>
            <div className="flex items-center gap-4">
              <a className="hover:text-white" href="#features">Features</a>
              <a className="hover:text-white" href="#faq">FAQ</a>
              <a
                className="hover:text-white"
                href="#top"
                onClick={(e) => e.preventDefault()}
              >
                Top
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
