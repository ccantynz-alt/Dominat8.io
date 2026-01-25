export const dynamic = "force-dynamic";

import { BUILD_MARKER, MONSTER_MARKER } from "../lib/buildMarker";
import { TopBar, HeaderNav, Footer } from "../components/marketing/MarketingShell";

function Pill({ children }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-xs text-slate-700 ring-1 ring-slate-200 shadow-sm d8-fade-up d8-delay-0">
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
      {children}
    </div>
  );
}

function ProofTile({ title, desc }) {
  return (
    <div className="rounded-2xl bg-white/85 p-4 ring-1 ring-slate-200 shadow-sm">
      <div className="text-xs font-semibold text-slate-700">✔ {title}</div>
      <div className="mt-1 text-xs text-slate-600">{desc}</div>
    </div>
  );
}

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      {/* WOW BACKGROUND LAYERS (CSS-only) */}
      <div className="d8-wow-bg" aria-hidden="true">
        <div className="d8-wow-orb d8-wow-orb-a" />
        <div className="d8-wow-orb d8-wow-orb-b" />
        <div className="d8-wow-orb d8-wow-orb-c" />
        <div className="d8-wow-grid" />
        <div className="d8-wow-noise" />
        <div className="d8-wow-vignette" />
      </div>

      <TopBar />
      <HeaderNav />

      {/* HERO: FULL SCREEN TAKEOVER */}
      <section className="mx-auto max-w-6xl px-6 pt-6 pb-10 d8-hero-full">
        <div className="flex flex-col gap-10 md:flex-row md:items-center md:justify-between">
          {/* Left */}
          <div className="max-w-2xl">
            <Pill>
              Premium, clean, fast — SiteGround-style build
              <span className="ml-2 font-mono text-slate-500">({BUILD_MARKER})</span>
            </Pill>

            <h1 className="mt-6 text-5xl font-semibold tracking-tight text-slate-950 md:text-6xl d8-fade-up d8-delay-1">
              Build a website <br />
              that looks expensive. <br />
              Automatically.
            </h1>

            <p className="mt-6 max-w-xl text-base leading-relaxed text-slate-700 md:text-lg d8-fade-up d8-delay-2">
              Dominat8 generates a <span className="font-semibold text-slate-900">complete, production-ready website</span> from a brief —
              then runs pages, SEO, sitemap, and publish automatically (with controls you can trust).
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row d8-fade-up d8-delay-3">
              <a
                className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800 shadow-sm d8-btn-lift"
                href="/p/new"
              >
                Generate my site
              </a>

              <a
                className="inline-flex items-center justify-center rounded-2xl bg-white px-6 py-3 text-sm font-semibold text-slate-900 ring-1 ring-slate-200 hover:bg-slate-50 shadow-sm d8-btn-lift"
                href="/gallery"
              >
                See real examples
              </a>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-2 d8-fade-up d8-delay-4">
              <ProofTile title="Publish-ready HTML" desc="Clean output, structured sections, consistent rhythm." />
              <ProofTile title="SEO included" desc="Titles, metas, schema, sitemap + robots." />
              <ProofTile title="Custom domain ready" desc="Publish + map when you’re ready." />
              <ProofTile title="No templates to fight" desc="Premium layout defaults that stay consistent." />
            </div>

            {/* Scroll cue */}
            <div className="mt-10 d8-fade-up d8-delay-4">
              <div className="inline-flex items-center gap-3 rounded-full bg-white/70 px-4 py-2 text-xs text-slate-600 ring-1 ring-slate-200 shadow-sm">
                <span className="font-mono text-slate-500">Marker:</span>
                <span className="font-mono text-slate-700">{MONSTER_MARKER}</span>
                <span className="mx-1 text-slate-300">•</span>
                <span>Scroll</span>
                <span className="d8-scroll-dot" aria-hidden="true" />
              </div>
            </div>
          </div>

          {/* Right trust card */}
          <div className="w-full max-w-md d8-fade-up d8-delay-2">
            <div className="rounded-3xl bg-white/80 p-6 ring-1 ring-slate-200 shadow-sm d8-card-float">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-xs text-slate-500">Trusted quality</div>
                  <div className="mt-2 text-lg font-semibold text-slate-950">
                    Premium output, every time
                  </div>
                </div>
                <div className="text-amber-500 text-sm" aria-label="5 stars">
                  ★★★★★
                </div>
              </div>

              <div className="mt-5 rounded-2xl bg-white p-5 ring-1 ring-slate-200">
                <div className="text-xs font-semibold text-slate-600">What you get</div>
                <div className="mt-3 space-y-2 text-sm text-slate-700">
                  <div className="flex items-center gap-2"><span className="text-emerald-600">✓</span> Homepage + marketing pages</div>
                  <div className="flex items-center gap-2"><span className="text-emerald-600">✓</span> SEO plan + sitemap</div>
                  <div className="flex items-center gap-2"><span className="text-emerald-600">✓</span> Publish-ready HTML</div>
                </div>
              </div>

              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <a className="inline-flex w-full items-center justify-center rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800 shadow-sm d8-btn-lift" href="/pricing">
                  View pricing
                </a>
                <a className="inline-flex w-full items-center justify-center rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-900 ring-1 ring-slate-200 hover:bg-slate-50 shadow-sm d8-btn-lift" href="/__status">
                  Check status
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CONTENT BELOW THE FOLD (placeholder - keep simple for now) */}
      <section className="mx-auto max-w-6xl px-6 pb-16">
        <div className="rounded-3xl bg-white/80 p-6 ring-1 ring-slate-200 shadow-sm">
          <div className="text-xs font-semibold text-slate-500">Below the fold</div>
          <div className="mt-2 text-2xl font-semibold text-slate-950">This is where sections begin after scroll</div>
          <div className="mt-2 text-sm text-slate-700 max-w-2xl">
            Next we can add the “3 real examples” grid, how-it-works, or pricing preview — but your hero is now a full-screen WOW takeover.
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
