export const dynamic = "force-dynamic";

function envString(key: string, fallback: string) {
  const v = (process.env as any)?.[key];
  if (typeof v === "string" && v.trim().length > 0) return v.trim();
  return fallback;
}

function safeNowIso() {
  try {
    return new Date().toISOString();
  } catch {
    return "now";
  }
}

export default function HomePage() {
  const DEPLOY_ID = envString("VERCEL_DEPLOYMENT_ID", "local_or_unknown");
  const GIT_SHA = envString("VERCEL_GIT_COMMIT_SHA", "unknown");
  const BUILD_STAMP = `GIT_${String(GIT_SHA).slice(0, 8)}`;
  const NOW = safeNowIso();

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-50">
      {/* Proof Overlay (do not remove) */}
      <div className="fixed z-[100] top-3 left-3 rounded-xl border border-white/15 bg-black/55 backdrop-blur px-3 py-2 shadow-[0_10px_40px_rgba(0,0,0,0.6)]">
        <div className="text-[12px] leading-5">
          <div className="font-semibold tracking-wide">
            LIVE_OK <span className="opacity-70">/</span> HOME_OK
          </div>
          <div className="opacity-80">DEPLOY_ID: {DEPLOY_ID}</div>
          <div className="opacity-80">BUILD_STAMP: {BUILD_STAMP}</div>
          <div className="opacity-60">TS: {NOW}</div>
          <div className="mt-1 opacity-80 font-medium">Flagship v4 (Trust + Tour)</div>
        </div>
      </div>

      {/* Ambient Background */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(1200px_600px_at_20%_15%,rgba(99,102,241,0.22),transparent_60%),radial-gradient(900px_500px_at_80%_20%,rgba(34,211,238,0.14),transparent_55%),radial-gradient(900px_700px_at_50%_90%,rgba(16,185,129,0.10),transparent_60%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.0),rgba(0,0,0,0.55),rgba(0,0,0,0.85))]" />
        <div className="absolute inset-0 opacity-[0.10] [background-image:linear-gradient(to_right,rgba(255,255,255,0.12)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.12)_1px,transparent_1px)] [background-size:64px_64px]" />
        <div className="absolute inset-0 bg-black/25" />
      </div>

      {/* Sticky Premium Nav */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-black/35 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-white/10 border border-white/15 grid place-items-center shadow-[0_10px_30px_rgba(0,0,0,0.35)]">
              <span className="text-sm font-bold tracking-tight">D8</span>
            </div>
            <div className="leading-tight">
              <div className="text-sm font-semibold tracking-wide">Dominat8</div>
              <div className="text-[11px] opacity-70">AI website automation builder</div>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-sm">
            <a className="opacity-80 hover:opacity-100 transition" href="#tour">Product tour</a>
            <a className="opacity-80 hover:opacity-100 transition" href="#trust">Trust</a>
            <a className="opacity-80 hover:opacity-100 transition" href="#testimonials">Testimonials</a>
            <a className="opacity-80 hover:opacity-100 transition" href="/pricing">Pricing</a>
          </nav>

          <div className="flex items-center gap-2">
            <a
              href="/pricing"
              className="hidden sm:inline-flex rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium hover:bg-white/10 transition"
            >
              See pricing
            </a>
            <a
              href="/p/new"
              className="inline-flex rounded-xl bg-white text-black px-4 py-2 text-sm font-semibold hover:opacity-95 transition shadow-[0_12px_40px_rgba(255,255,255,0.10)]"
            >
              Start building
            </a>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative">
        <div className="mx-auto max-w-6xl px-4 pt-14 pb-10 md:pt-20 md:pb-14">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium tracking-wide">
                <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_18px_rgba(16,185,129,0.9)]" />
                Premium build flow  fast  controlled
              </div>

              <h1 className="mt-4 text-4xl md:text-5xl font-semibold tracking-tight">
                Build a <span className="text-white">premium website</span> in minutes 
                <span className="block opacity-90">with AI running the whole pipeline.</span>
              </h1>

              <p className="mt-4 text-base md:text-lg opacity-80 leading-relaxed max-w-xl">
                Dominat8 turns a brief into a polished, multi-page site. You get the speed of automation,
                with the clarity and control of a product-grade workflow.
              </p>

              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <a
                  href="/p/new"
                  className="inline-flex justify-center rounded-xl bg-white text-black px-5 py-3 text-sm font-semibold hover:opacity-95 transition shadow-[0_18px_55px_rgba(255,255,255,0.14)]"
                >
                  Start building now
                </a>
                <a
                  href="#tour"
                  className="inline-flex justify-center rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-medium hover:bg-white/10 transition"
                >
                  Take the 60-second tour
                </a>
              </div>

              <div className="mt-6 flex items-center gap-4 text-xs opacity-70">
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-white/70" />
                  No design skills needed
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-white/70" />
                  SEO-ready structure
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-white/70" />
                  Publish fast
                </div>
              </div>
            </div>

            {/* Mock product window (no images, pure CSS) */}
            <div className="relative">
              <div className="absolute -inset-6 rounded-[32px] bg-[radial-gradient(closest-side,rgba(255,255,255,0.10),transparent)] blur-2xl" />
              <div className="relative rounded-[28px] border border-white/15 bg-black/40 backdrop-blur shadow-[0_30px_120px_rgba(0,0,0,0.75)] overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10 bg-black/35">
                  <div className="flex gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
                    <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
                    <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
                  </div>
                  <div className="ml-2 text-xs opacity-70">dominat8.com  Build pipeline</div>
                  <div className="ml-auto text-[11px] opacity-60">DEPLOY: {String(DEPLOY_ID).slice(0, 12)}</div>
                </div>

                <div className="p-5">
                  <div className="grid grid-cols-12 gap-4">
                    <div className="col-span-7 space-y-3">
                      <div className="h-3 w-32 rounded bg-white/10" />
                      <div className="h-7 w-full rounded bg-white/10" />
                      <div className="h-7 w-5/6 rounded bg-white/10" />
                      <div className="h-7 w-4/6 rounded bg-white/10" />
                      <div className="mt-5 space-y-2">
                        {[
                          "Brief  layout decisions",
                          "SEO plan  keywords + structure",
                          "Pages  pricing, FAQ, contact",
                          "Publish  sitemap + robots + canonical",
                        ].map((t) => (
                          <div key={t} className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-emerald-400/80 shadow-[0_0_16px_rgba(16,185,129,0.6)]" />
                            <div className="text-xs opacity-80">{t}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="col-span-5">
                      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                        <div className="text-xs font-semibold">Run status</div>
                        <div className="mt-3 space-y-2">
                          {[
                            ["Spec", "Ready"],
                            ["SEO", "Queued"],
                            ["Pages", "Generating"],
                            ["Publish", "Locked"],
                          ].map(([k, v]) => (
                            <div key={k} className="flex items-center justify-between text-xs">
                              <span className="opacity-70">{k}</span>
                              <span className="rounded-full border border-white/10 bg-black/30 px-2 py-1 opacity-85">
                                {v}
                              </span>
                            </div>
                          ))}
                        </div>
                        <div className="mt-4 rounded-xl border border-white/10 bg-black/25 p-3">
                          <div className="text-[11px] opacity-70">Latest stamp</div>
                          <div className="mt-1 text-xs font-semibold">{BUILD_STAMP}</div>
                          <div className="mt-1 text-[11px] opacity-60">{NOW}</div>
                        </div>
                      </div>

                      <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
                        <div className="text-xs font-semibold">Preview</div>
                        <div className="mt-3 h-24 rounded-xl bg-[linear-gradient(135deg,rgba(99,102,241,0.22),rgba(34,211,238,0.12),rgba(16,185,129,0.10))] border border-white/10" />
                        <div className="mt-3 text-[11px] opacity-70">
                          Premium polish  grid, glow, trust, tour, testimonials.
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 flex items-center justify-between text-[11px] opacity-70">
                    <div>Secure by default  Control by design</div>
                    <div className="opacity-60">Flagship v4</div>
                  </div>
                </div>
              </div>

              <div className="mt-4 text-xs opacity-65">
                Reduced-motion safe. No dependencies. Pure layout + polish.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Band */}
      <section id="trust" className="border-y border-white/10 bg-white/[0.03]">
        <div className="mx-auto max-w-6xl px-4 py-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="text-sm font-semibold tracking-wide">Trusted by teams shipping fast</div>
              <div className="text-xs opacity-70 mt-1">Built for speed, reliability, and clean publishing.</div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full md:w-auto">
              {["Pipeline control", "SEO ready", "Multi-page", "Fast publish"].map((t) => (
                <div
                  key={t}
                  className="rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-center text-xs font-medium opacity-90"
                >
                  {t}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Product Tour */}
      <section id="tour" className="mx-auto max-w-6xl px-4 py-14">
        <div className="flex items-end justify-between gap-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">A premium tour in 3 steps</h2>
            <p className="mt-2 text-sm md:text-base opacity-75 max-w-2xl">
              You get wow design energy without chaos: clear sections, strong hierarchy, and a publish flow thats easy to verify.
            </p>
          </div>
          <a
            href="/pricing"
            className="hidden md:inline-flex rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium hover:bg-white/10 transition"
          >
            Compare plans
          </a>
        </div>

        <div className="mt-8 grid md:grid-cols-3 gap-5">
          {[
            {
              title: "1) Brief  Blueprint",
              desc: "Turn a short brief into a structure with a premium look.",
              bullets: ["Layout decisions", "Section rhythm", "Brand tone locked"],
            },
            {
              title: "2) Pages  Build",
              desc: "Generate multi-page content that stays consistent.",
              bullets: ["Pricing / FAQ / Contact", "Templates + use-cases", "Clean copy hierarchy"],
            },
            {
              title: "3) Publish  Verify",
              desc: "Ship confidently with verifiable stamps and SEO basics.",
              bullets: ["Sitemap / robots / canonical", "Deploy stamps visible", "Fast confirmation"],
            },
          ].map((c) => (
            <div
              key={c.title}
              className="rounded-[26px] border border-white/10 bg-white/[0.04] p-6 shadow-[0_24px_90px_rgba(0,0,0,0.55)]"
            >
              <div className="text-sm font-semibold">{c.title}</div>
              <div className="mt-2 text-sm opacity-75 leading-relaxed">{c.desc}</div>
              <div className="mt-5 space-y-2">
                {c.bullets.map((b) => (
                  <div key={b} className="flex items-center gap-2 text-xs opacity-85">
                    <span className="h-2 w-2 rounded-full bg-white/70" />
                    {b}
                  </div>
                ))}
              </div>
              <div className="mt-6 h-24 rounded-2xl border border-white/10 bg-[radial-gradient(closest-side,rgba(255,255,255,0.10),transparent)]" />
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="border-t border-white/10 bg-black/20">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">Feels premium. Ships faster.</h2>
              <p className="mt-2 text-sm md:text-base opacity-75 max-w-2xl">
                A polished homepage earns trust. Verifiable deploy stamps earn confidence.
              </p>
            </div>
            <div className="text-xs opacity-60">
              * Placeholder quotes for now  swap anytime.
            </div>
          </div>

          <div className="mt-8 grid md:grid-cols-3 gap-5">
            {[
              {
                quote:
                  "We went from idea to a clean, premium site structure in one sitting. The flow felt controlled, not chaotic.",
                name: "Builder team",
                role: "Product",
              },
              {
                quote:
                  "The deploy stamp / proof overlay is underrated. It removes doubt instantly  you always know whats live.",
                name: "Operator",
                role: "Launch",
              },
              {
                quote:
                  "This is the kind of hero + trust rhythm that makes people stay. It feels like a real product, not a template.",
                name: "Founder",
                role: "Growth",
              },
            ].map((t) => (
              <div key={t.name} className="rounded-[26px] border border-white/10 bg-white/[0.04] p-6">
                <div className="text-sm opacity-85 leading-relaxed">{t.quote}</div>
                <div className="mt-4 flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl border border-white/10 bg-white/5 grid place-items-center text-xs font-semibold">
                    {t.name.slice(0, 1)}
                  </div>
                  <div className="leading-tight">
                    <div className="text-sm font-semibold">{t.name}</div>
                    <div className="text-xs opacity-70">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* CTA Strip */}
          <div className="mt-10 rounded-[28px] border border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-7 md:p-9 shadow-[0_26px_120px_rgba(0,0,0,0.65)]">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <div className="text-xl md:text-2xl font-semibold tracking-tight">Ready to ship your flagship?</div>
                <div className="mt-1 text-sm opacity-75">Start building, then verify instantly with your deploy stamp.</div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href="/p/new"
                  className="inline-flex justify-center rounded-xl bg-white text-black px-5 py-3 text-sm font-semibold hover:opacity-95 transition"
                >
                  Start building
                </a>
                <a
                  href="/pricing"
                  className="inline-flex justify-center rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-medium hover:bg-white/10 transition"
                >
                  See pricing
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10">
        <div className="mx-auto max-w-6xl px-4 py-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-white/10 border border-white/15 grid place-items-center">
                <span className="text-sm font-bold tracking-tight">D8</span>
              </div>
              <div className="leading-tight">
                <div className="text-sm font-semibold">Dominat8</div>
                <div className="text-xs opacity-70">Flagship v4  Premium Trust + Tour</div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-sm opacity-80">
              <a className="hover:opacity-100 transition" href="#tour">Tour</a>
              <a className="hover:opacity-100 transition" href="/templates">Templates</a>
              <a className="hover:opacity-100 transition" href="/use-cases">Use cases</a>
              <a className="hover:opacity-100 transition" href="/pricing">Pricing</a>
            </div>
          </div>

          <div className="mt-6 text-xs opacity-55">
             {new Date().getFullYear()} Dominat8. Built to look premium, ship fast, and verify whats live.
          </div>
        </div>
      </footer>
    </main>
  );
}