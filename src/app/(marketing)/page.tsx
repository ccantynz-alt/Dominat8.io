export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import Link from "next/link";

const BUILD_STAMP = "BUILD_20260124_212756";
const LIVE_MARKER = "LIVE_MARKER_FULLBLEED_20260124_212756";

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-xs text-white/70">
      {children}
    </span>
  );
}

function SectionTitle({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      <div className="text-xs uppercase tracking-[0.28em] text-white/55">{eyebrow}</div>
      <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white md:text-4xl">
        {title}
      </h2>
      {subtitle ? (
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-white/65">
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}

function SoftCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-7 shadow-sm">
      {children}
    </div>
  );
}

export default function MarketingHomePage() {
  return (
    <main className="min-h-screen bg-black text-white">
      {/* Prove route + deploy */}
      <div className="sr-only">HOME_OK</div>

      {/* ===== HERO (flagship / premium / calm) ===== */}
      <section className="relative flex min-h-[100svh] w-screen items-center overflow-hidden">
  {/* Background */}
  <div className="absolute inset-0">
    <div className="absolute inset-0 bg-black" />
    <div className="absolute -top-48 left-1/2 h-[700px] w-[1200px] -translate-x-1/2 rounded-full bg-white/10 blur-3xl opacity-40" />
    <div className="absolute -bottom-64 left-1/2 h-[800px] w-[1400px] -translate-x-1/2 rounded-full bg-white/10 blur-3xl opacity-25" />
    <div className="absolute inset-0 [background-image:radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.05)_1px,transparent_0)] [background-size:26px_26px] opacity-40" />
  </div>

  {/* Content */}
  <div className="relative w-full px-8 md:px-20">
    <div className="mx-auto max-w-6xl">
      <div className="mb-6 text-center text-[11px] tracking-[0.22em] text-white/35">
        BUILD_STAMP: {BUILD_STAMP} • {LIVE_MARKER}
      </div>

      <div className="grid items-center gap-12 md:grid-cols-12">
        <div className="md:col-span-7">
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-xs text-white/70">Flagship calm</span>
            <span className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-xs text-white/70">Premium by default</span>
            <span className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-xs text-white/70">Publishable instantly</span>
          </div>

          <h1 className="mt-8 text-[clamp(3rem,6vw,5.5rem)] font-semibold leading-[1.05] tracking-tight text-white">
            Build a website that
            <span className="block text-white/85">feels expensive</span>
            from the first scroll.
          </h1>

          <p className="mt-8 max-w-xl text-lg leading-relaxed text-white/70">
            Dominat8 creates calm, flagship-quality homepages that earn trust instantly —
            then helps you grow into pages, SEO, and real conversions.
          </p>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <a href="/app" className="inline-flex items-center justify-center rounded-full bg-white px-8 py-4 text-sm font-semibold text-black hover:bg-white/90">
              Start building
            </a>
            <a href="/preview/marketing" className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/[0.06] px-8 py-4 text-sm font-semibold text-white hover:bg-white/[0.12]">
              See a live example
            </a>
          </div>

          <div className="mt-10 text-sm text-white/45">
            Calm. Confident. Built to convert.
          </div>
        </div>

        <div className="hidden md:col-span-5 md:block">
          <div className="rounded-[36px] border border-white/10 bg-white/[0.04] p-6 shadow-sm">
            <div className="rounded-[28px] border border-white/10 bg-black/40 p-6">
              <div className="h-3 w-24 rounded-full bg-white/20" />
              <div className="mt-4 h-8 w-3/4 rounded-lg bg-white/15" />
              <div className="mt-4 h-4 w-full rounded-lg bg-white/10" />
              <div className="mt-3 h-4 w-11/12 rounded-lg bg-white/10" />
              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="h-20 rounded-2xl bg-white/10" />
                <div className="h-20 rounded-2xl bg-white/10" />
              </div>
              <div className="mt-6 h-12 rounded-2xl bg-white/15" />
            </div>
          </div>
        </div>
      </div>

      <div className="sr-only">HOME_OK</div>
    </div>
  </div>
</section>

      {/* ===== BUILT FOR ===== */}
      <section className="mx-auto w-full max-w-6xl px-6 py-14">
        <div className="grid gap-4 md:grid-cols-4">
          {[
            ["Solo founders", "Launch a real presence that looks funded — even if you’re not (yet)."],
            ["Local businesses", "Calm, trustworthy design that makes people feel safe buying."],
            ["Agencies", "Generate strong drafts and iterate quickly with clients."],
            ["Side projects", "Ship now. Upgrade into pages + SEO as you grow."],
          ].map(([t, d]) => (
            <SoftCard key={t}>
              <div className="text-lg font-semibold">{t}</div>
              <p className="mt-2 text-sm leading-relaxed text-white/65">{d}</p>
            </SoftCard>
          ))}
        </div>
      </section>

      {/* ===== WOW OUTCOMES ===== */}
      <section className="mx-auto w-full max-w-6xl px-6 py-14">
        <SectionTitle
          eyebrow="The WOW"
          title="Outcomes that make people subscribe."
          subtitle="Not features. Results. You get a premium homepage people trust — and a workflow that keeps improving it."
        />

        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {[
            {
              title: "From blank → believable",
              desc: "Copy + structure that reads like a real business, not a template.",
              bullets: ["Flagship hero", "Trust cues", "Premium typography rhythm"],
            },
            {
              title: "Publishable by default",
              desc: "A draft you can ship today — then refine as you go.",
              bullets: ["Calm sections", "CTA placement", "Conversion-first layout"],
            },
            {
              title: "SEO foundation (real)",
              desc: "Clean metadata wiring so Google sees the right thing.",
              bullets: ["Canonical-ready", "Sitemap/robots-ready", "Future-proof pages"],
            },
            {
              title: "No more “did it deploy?”",
              desc: "Always-fresh mode with a visible build stamp.",
              bullets: ["Force-dynamic", "BUILD_STAMP proof", "Stop guessing"],
            },
          ].map((x) => (
            <SoftCard key={x.title}>
              <div className="text-xl font-semibold tracking-tight">{x.title}</div>
              <p className="mt-2 text-sm leading-relaxed text-white/65">{x.desc}</p>
              <ul className="mt-4 space-y-2 text-sm text-white/70">
                {x.bullets.map((b) => (
                  <li key={b} className="flex gap-2">
                    <span className="mt-[6px] h-1.5 w-1.5 rounded-full bg-white/60" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </SoftCard>
          ))}
        </div>
      </section>

      {/* ===== HOW IT WORKS (calm) ===== */}
      <section className="mx-auto w-full max-w-6xl px-6 py-14">
        <SectionTitle
          eyebrow="How it works"
          title="Three steps. Calm execution."
          subtitle="You should feel confident shipping quickly — not overwhelmed."
        />

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {[
            ["01", "Choose a direction", "Pick a vibe + goal. Dominat8 generates a premium homepage draft instantly."],
            ["02", "Agents refine", "Structure, copy, and SEO wiring improve in passes — without chaos."],
            ["03", "Publish and grow", "Ship today. Expand into pages + SEO + custom domains as you scale."],
          ].map(([n, t, d]) => (
            <SoftCard key={n}>
              <div className="text-xs tracking-[0.28em] text-white/55">STEP {n}</div>
              <div className="mt-3 text-lg font-semibold">{t}</div>
              <p className="mt-2 text-sm leading-relaxed text-white/65">{d}</p>
            </SoftCard>
          ))}
        </div>
      </section>

      {/* ===== PROOF ===== */}
      <section className="mx-auto w-full max-w-6xl px-6 py-14">
        <SectionTitle
          eyebrow="Proof"
          title="People buy when it feels premium."
          subtitle="A flagship look builds trust. Trust drives subscriptions."
        />

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {[
            ["“This feels like a real agency build.”", "The calm layout and copy rhythm instantly made it feel expensive."],
            ["“We shipped a homepage in one night.”", "Not a rough draft — something we were proud to publish."],
            ["“Clients stopped asking ‘is this a template?’”", "That’s when we knew the design pacing was working."],
          ].map(([q, a]) => (
            <SoftCard key={q}>
              <div className="text-sm font-semibold leading-relaxed text-white">{q}</div>
              <p className="mt-3 text-sm leading-relaxed text-white/65">{a}</p>
              <div className="mt-5 text-xs text-white/45">— Dominat8 early user</div>
            </SoftCard>
          ))}
        </div>
      </section>

      {/* ===== PRICING TEASER ===== */}
      <section className="mx-auto w-full max-w-6xl px-6 py-14">
        <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.07] to-white/[0.03] p-10">
          <div className="grid gap-8 md:grid-cols-12 md:items-center">
            <div className="md:col-span-7">
              <div className="text-xs uppercase tracking-[0.28em] text-white/55">Subscription</div>
              <h3 className="mt-3 text-3xl font-semibold tracking-tight text-white">
                Convert visitors into customers with a flagship homepage.
              </h3>
              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/65">
                Start building immediately. Upgrade when you want custom domains, more pages, and automated SEO passes.
              </p>

              <div className="mt-6 flex flex-wrap gap-2">
                <Pill>Publish-ready drafts</Pill>
                <Pill>Premium sections</Pill>
                <Pill>SEO wiring</Pill>
                <Pill>Domains</Pill>
              </div>
            </div>

            <div className="md:col-span-5">
              <div className="rounded-3xl border border-white/10 bg-black/30 p-7">
                <div className="text-sm font-semibold">Pro</div>
                <div className="mt-2 text-3xl font-semibold">
                  \$— <span className="text-sm font-medium text-white/60">/ month</span>
                </div>
                <div className="mt-2 text-xs text-white/45">
                  (We’ll wire exact pricing into Stripe + UI next.)
                </div>

                <ul className="mt-6 space-y-2 text-sm text-white/70">
                  {[
                    "Premium homepage + sections",
                    "Multi-page publishing",
                    "Custom domain connect",
                    "SEO/sitemap automation",
                  ].map((x) => (
                    <li key={x} className="flex gap-2">
                      <span className="mt-[6px] h-1.5 w-1.5 rounded-full bg-white/60" />
                      <span>{x}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href="/app"
                  className="mt-7 inline-flex w-full items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-black hover:bg-white/90"
                >
                  Start building
                </Link>

                <div className="mt-3 text-center text-xs text-white/45">
                  Calm premium, built to convert.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FINAL CTA ===== */}
      <section className="mx-auto w-full max-w-6xl px-6 py-16">
        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-10 text-center">
          <div className="text-xs uppercase tracking-[0.28em] text-white/55">Ready</div>
          <h3 className="mt-3 text-3xl font-semibold tracking-tight text-white md:text-4xl">
            Impress visitors on the first scroll.
          </h3>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-white/65">
            Build a flagship homepage that looks expensive, feels calm, and converts —
            then expand into pages + SEO as you grow.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-center">
            <Link
              href="/app"
              className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-black hover:bg-white/90"
            >
              Start building now
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/[0.06] px-6 py-3 text-sm font-semibold text-white hover:bg-white/[0.10]"
            >
              View pricing
            </Link>
          </div>
        </div>

        <div className="mt-10 pb-4 text-center text-xs text-white/35">
          Dominat8 — premium by default • BUILD_STAMP: {BUILD_STAMP}
        </div>
      </section>
    </main>
  );
}


