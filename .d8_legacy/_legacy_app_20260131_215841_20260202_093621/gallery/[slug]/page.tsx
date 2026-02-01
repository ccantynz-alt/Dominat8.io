/**
 * Dominat8 — Gallery Template Detail
 * Marker: GALLERY_V2
 *
 * Server component by default (no "use client") for stability.
 */

import Link from "next/link";
import { getTemplateBySlug, GALLERY_MARKER } from "@/lib/marketing/catalog";

type PageProps = {
  params: { slug: string };
};

export default function GalleryTemplatePage({ params }: PageProps) {
  const slug = decodeURIComponent(params.slug || "");
  const t = getTemplateBySlug(slug);

  if (!t) {
    return (
      <main className="min-h-screen bg-black text-white">
        <div className="mx-auto w-full max-w-3xl px-4 py-14">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-md">
            <div className="text-sm font-semibold">Template not found</div>
            <div className="mt-2 text-sm text-white/70">
              Slug: <span className="font-mono text-white/80">{slug}</span>
            </div>
            <div className="mt-6 flex gap-2">
              <Link
                href="/gallery"
                className="rounded-xl border border-white/10 bg-white/[0.05] px-4 py-2 text-sm text-white/80 hover:border-white/20 hover:bg-white/[0.08]"
              >
                Back to Gallery
              </Link>
              <Link
                href="/"
                className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black hover:-translate-y-0.5 hover:shadow-[0_16px_40px_rgba(0,0,0,0.45)] active:translate-y-0"
              >
                Home
              </Link>
            </div>
            <div className="mt-4 text-xs text-white/55">Marker: {GALLERY_MARKER}</div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white">
      {/* Background */}
      <div className="pointer-events-none fixed inset-0 -z-10 opacity-90">
        <div className="absolute inset-0 bg-[radial-gradient(1200px_700px_at_20%_-10%,rgba(255,255,255,0.10),transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(1000px_600px_at_80%_0%,rgba(255,255,255,0.08),transparent_60%)]" />
        <div className="absolute inset-0 opacity-70 [background-image:linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:72px_72px]" />
      </div>

      <header className="sticky top-0 z-40 border-b border-white/10 bg-black/40 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3">
          <Link href="/gallery" className="text-sm font-semibold text-white/85 hover:text-white">
            ← Back to Gallery
          </Link>
          <div className="text-xs text-white/60">
            Marker: <span className="font-mono text-white/75">{GALLERY_MARKER}</span>
          </div>
        </div>
      </header>

      <section className="mx-auto w-full max-w-6xl px-4 pb-10 pt-10 md:pt-14">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
          {/* Left */}
          <div className="md:col-span-7">
            <div className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs font-semibold tracking-wide text-white/80">
              {t.category} • <span className="ml-1 font-mono text-white/70">{t.vibe}</span>
              {t.featured ? <span className="ml-2 rounded-full border border-white/15 bg-white/[0.06] px-2 py-0.5 text-[10px] font-semibold text-white/70">FEATURED</span> : null}
            </div>

            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white md:text-5xl">
              {t.name}
            </h1>

            <p className="mt-3 max-w-2xl text-sm text-white/70 md:text-base">
              {t.description}
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href={`/app?template=${encodeURIComponent(t.slug)}`}
                className="inline-flex items-center justify-center rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-black transition-all hover:-translate-y-0.5 hover:shadow-[0_18px_60px_rgba(0,0,0,0.55)] active:translate-y-0"
              >
                Use this template →
              </Link>

              <Link
                href="/gallery"
                className="inline-flex items-center justify-center rounded-2xl border border-white/15 bg-white/[0.06] px-5 py-3 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:border-white/25 hover:bg-white/[0.10] active:translate-y-0"
              >
                Browse more
              </Link>
            </div>

            <div className="mt-7 rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-md">
              <div className="text-xs font-semibold tracking-wide text-white/80">What you get</div>
              <ul className="mt-3 space-y-2 text-sm text-white/70">
                {t.bullets.map((b) => (
                  <li key={b} className="flex items-start gap-2">
                    <span className="mt-[6px] inline-block h-1.5 w-1.5 rounded-full bg-white/70" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {t.tags.map((tag) => (
                <span key={tag} className="rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-1 text-[11px] font-semibold text-white/65">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Right: preview / proof */}
          <div className="md:col-span-5">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.03)] backdrop-blur-md md:p-6">
              <div className="text-sm font-semibold text-white">Preview</div>
              <div className="mt-2 text-sm text-white/70">
                Abstract preview tile (safe static). Later we can render real screenshots.
              </div>

              <div className="mt-4 rounded-2xl border border-white/10 bg-black/30 p-4">
                <div className="h-3 w-28 rounded bg-white/10" />
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <div className="h-16 rounded-xl border border-white/10 bg-white/[0.04]" />
                  <div className="h-16 rounded-xl border border-white/10 bg-white/[0.04]" />
                </div>
                <div className="mt-2 h-14 rounded-xl border border-white/10 bg-white/[0.04]" />
              </div>

              <div className="mt-5 rounded-2xl border border-white/10 bg-black/30 p-4 text-xs text-white/60">
                Builder route:
                <div className="mt-1 font-mono text-white/75">
                  /app?template={t.slug}
                </div>
                <div className="mt-2">
                  Marker: <span className="font-mono text-white/75">{GALLERY_MARKER}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 text-xs text-white/55">
              Later upgrade: add screenshots + real template previews without changing slugs.
            </div>
          </div>
        </div>
      </section>

      <div className="pb-10 text-center text-[11px] text-white/40">
        GALLERY_V2 • {t.slug}
      </div>
    </main>
  );
}