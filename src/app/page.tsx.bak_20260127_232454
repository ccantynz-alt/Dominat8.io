import Link from "next/link";

export const dynamic = "force-dynamic";

function nowIso() {
  return new Date().toISOString();
}

function buildMeta() {
  // Safe, deterministic proof fields
  const env = process.env.VERCEL_ENV || "unknown";
  const deployId = process.env.VERCEL_DEPLOYMENT_ID || process.env.VERCEL_GIT_COMMIT_SHA || "unknown";
  const buildStamp = process.env.NEXT_PUBLIC_BUILD_STAMP || process.env.VERCEL_GIT_COMMIT_SHA || "unknown";
  return { env, deployId, buildStamp, at: nowIso() };
}

export default function HomePage() {
  const meta = buildMeta();

  return (
    <main className="min-h-screen bg-[#070A12] text-white">
      {/* HERO BACKDROP: subtle stars + gradient + stripe glow (American SaaS energy) */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        {/* deep gradient */}
        <div className="absolute inset-0 bg-[radial-gradient(1200px_600px_at_70%_-10%,rgba(59,130,246,0.28),transparent_60%),radial-gradient(900px_500px_at_20%_0%,rgba(239,68,68,0.18),transparent_55%),radial-gradient(900px_700px_at_50%_100%,rgba(34,197,94,0.12),transparent_60%)]" />
        {/* stars */}
        <div className="absolute inset-0 opacity-[0.18] [background-image:radial-gradient(rgba(255,255,255,0.7)_1px,transparent_1px)] [background-size:28px_28px]" />
        {/* subtle diagonal stripe glow */}
        <div className="absolute -inset-x-40 top-24 h-64 rotate-[-12deg] bg-[linear-gradient(90deg,transparent,rgba(59,130,246,0.22),rgba(239,68,68,0.16),transparent)] blur-2xl" />
        {/* vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(900px_500px_at_50%_30%,transparent,rgba(7,10,18,0.92))]" />
      </div>

      {/* TOP BAR */}
      <header className="relative z-10 border-b border-white/10 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/10 ring-1 ring-white/15">
              <span className="text-sm font-extrabold tracking-tight">D8</span>
            </div>
            <div className="leading-tight">
              <div className="text-sm font-semibold tracking-tight">Dominat8</div>
              <div className="text-[11px] text-white/60">AI website engine</div>
            </div>
          </div>

          <nav className="hidden items-center gap-7 md:flex">
            <a className="text-sm text-white/80 hover:text-white" href="#how">How it works</a>
            <a className="text-sm text-white/80 hover:text-white" href="#proof">Proof</a>
            <a className="text-sm text-white/80 hover:text-white" href="#pricing">Pricing</a>
            <a className="text-sm text-white/80 hover:text-white" href="/admin">Admin</a>
          </nav>

          <div className="flex items-center gap-3">
            <a
              href="/admin"
              className="hidden rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white/90 hover:bg-white/10 md:inline-flex"
            >
              Sign in
            </a>
            <a
              href="#cta"
              className="inline-flex items-center justify-center rounded-xl bg-white px-4 py-2 text-sm font-extrabold text-[#070A12] shadow-lg shadow-black/30 hover:bg-white/90"
            >
              Launch your site →
            </a>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative z-10">
        <div className="mx-auto max-w-7xl px-4 pb-10 pt-12 sm:px-6 sm:pb-14 sm:pt-16 lg:px-8 lg:pb-20 lg:pt-20">
          <div className="grid gap-10 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[12px] font-semibold text-white/80">
                <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_18px_rgba(52,211,153,0.55)]" />
                Built for speed • Built for trust • Built to ship
              </div>

              <h1 className="mt-5 text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
                Build a <span className="text-white">money-ready</span> website —
                <span className="block bg-gradient-to-r from-blue-400 via-white to-red-300 bg-clip-text text-transparent">
                  in minutes.
                </span>
              </h1>

              <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/75 sm:text-lg">
                Dominat8 generates a modern multi-page site, SEO foundations, and a publish-ready build.
                You stay in control. The AI does the heavy lifting.
              </p>

              <div id="cta" className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
                <a
                  href="/admin"
                  className="inline-flex items-center justify-center rounded-2xl bg-white px-6 py-3 text-base font-extrabold text-[#070A12] shadow-xl shadow-black/35 hover:bg-white/90"
                >
                  Start building now
                </a>
                <a
                  href="#how"
                  className="inline-flex items-center justify-center rounded-2xl border border-white/15 bg-white/5 px-6 py-3 text-base font-semibold text-white/90 hover:bg-white/10"
                >
                  See how it works
                </a>
              </div>

              {/* Proof bullets */}
              <div className="mt-7 grid gap-3 sm:grid-cols-2">
                {[
                  "AI generates real pages: Home, Pricing, FAQ, Contact",
                  "SEO essentials: sitemap + metadata + structure",
                  "Guardrails prevent “AI chaos” and keep it shippable",
                  "Deploy-ready workflow on Vercel",
                ].map((t) => (
                  <div
                    key={t}
                    className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4"
                  >
                    <div className="mt-1 h-2.5 w-2.5 rounded-full bg-white/70" />
                    <div className="text-sm font-semibold text-white/85">{t}</div>
                  </div>
                ))}
              </div>

              {/* Trust strip */}
              <div className="mt-8 flex flex-wrap items-center gap-3 text-xs text-white/60">
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">Fast build</span>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">Clean deploy</span>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">Safe edits</span>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">Ship tonight</span>
              </div>
            </div>

            {/* RIGHT PANEL: "American SaaS" product card */}
            <div className="lg:col-span-5">
              <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-5 shadow-2xl shadow-black/40 backdrop-blur">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-extrabold">Live build proof</div>
                  <div className="text-[11px] text-white/60">real deployment metadata</div>
                </div>

                <div className="mt-4 rounded-2xl border border-white/10 bg-black/30 p-4">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-semibold tracking-wide text-white/70">STATUS</div>
                    <div className="text-xs font-extrabold text-emerald-300">'@ + $liveOkLine + @'</div>
                  </div>

                  <div className="mt-3 grid gap-2 text-sm">
                    <div className="flex items-center justify-between">
                      <div className="text-white/60">ENV</div>
                      <div className="font-semibold">{meta.env}</div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-white/60">DEPLOY_ID</div>
                      <div className="font-mono text-xs text-white/85">{meta.deployId}</div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-white/60">BUILD_STAMP</div>
                      <div className="font-mono text-xs text-white/85">{meta.buildStamp}</div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-white/60">AT</div>
                      <div className="font-mono text-xs text-white/85">{meta.at}</div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="text-xs font-semibold text-white/70">What happens next</div>
                  <ol className="mt-3 space-y-2 text-sm text-white/80">
                    <li className="flex gap-2">
                      <span className="font-extrabold text-white">1.</span>
                      Describe your business in one sentence.
                    </li>
                    <li className="flex gap-2">
                      <span className="font-extrabold text-white">2.</span>
                      Dominat8 generates pages + SEO plan.
                    </li>
                    <li className="flex gap-2">
                      <span className="font-extrabold text-white">3.</span>
                      Publish to production with confidence.
                    </li>
                  </ol>
                </div>

                <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                  <a
                    href="/admin"
                    className="inline-flex flex-1 items-center justify-center rounded-2xl bg-white px-5 py-3 text-sm font-extrabold text-[#070A12] hover:bg-white/90"
                  >
                    Open Admin →
                  </a>
                  <a
                    href="#pricing"
                    className="inline-flex flex-1 items-center justify-center rounded-2xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white/90 hover:bg-white/10"
                  >
                    View pricing
                  </a>
                </div>
              </div>

              {/* Tiny assurance note */}
              <div className="mt-4 text-center text-xs text-white/55">
                Guardrails enabled. No “AI rewrites your whole repo” surprises.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW */}
      <section id="how" className="relative z-10 border-t border-white/10">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between gap-6">
            <div>
              <h2 className="text-2xl font-extrabold tracking-tight">How it works</h2>
              <p className="mt-2 max-w-2xl text-sm text-white/70">
                Simple flow. Fast output. You stay in control.
              </p>
            </div>
          </div>

          <div className="mt-7 grid gap-4 md:grid-cols-3">
            {[
              { t: "Describe", d: "Tell us what you sell and who it’s for. One sentence is enough." },
              { t: "Generate", d: "We produce pages + structure + SEO foundations ready to ship." },
              { t: "Publish", d: "Deploy to production and iterate safely with focused changes." },
            ].map((x) => (
              <div key={x.t} className="rounded-3xl border border-white/10 bg-white/5 p-6">
                <div className="text-sm font-extrabold">{x.t}</div>
                <div className="mt-2 text-sm leading-relaxed text-white/75">{x.d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROOF */}
      <section id="proof" className="relative z-10 border-t border-white/10">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-extrabold tracking-tight">Proof you can trust</h2>
          <p className="mt-2 max-w-2xl text-sm text-white/70">
            Real builds. Real deploy metadata. Real guardrails.
          </p>

          <div className="mt-7 grid gap-4 md:grid-cols-2">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <div className="text-sm font-extrabold">'@ + $homeOkLine + @'</div>
              <p className="mt-2 text-sm text-white/75">
                If you can see this, you’re on the live deployed route and the homepage is rendering correctly.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <div className="text-sm font-extrabold">Safe evolution</div>
              <p className="mt-2 text-sm text-white/75">
                Agents propose scoped changes. You apply with a patch. This is how we move fast without wrecking production.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING (simple, conversion-first) */}
      <section id="pricing" className="relative z-10 border-t border-white/10">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-2xl font-extrabold tracking-tight">Pricing</h2>
              <p className="mt-2 max-w-2xl text-sm text-white/70">
                Start fast. Upgrade when you’re ready.
              </p>
            </div>
            <a
              href="/admin"
              className="inline-flex items-center justify-center rounded-2xl bg-white px-6 py-3 text-sm font-extrabold text-[#070A12] hover:bg-white/90"
            >
              Build your site →
            </a>
          </div>

          <div className="mt-7 grid gap-4 md:grid-cols-2">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-7">
              <div className="text-sm font-extrabold">Starter</div>
              <div className="mt-2 text-4xl font-extrabold">$0</div>
              <div className="mt-1 text-sm text-white/65">Generate, test, iterate.</div>
              <ul className="mt-5 space-y-2 text-sm text-white/80">
                <li>• Core generation flow</li>
                <li>• Basic publish pipeline</li>
                <li>• Proof box + deploy confidence</li>
              </ul>
              <a
                href="/admin"
                className="mt-6 inline-flex w-full items-center justify-center rounded-2xl border border-white/15 bg-white/10 px-5 py-3 text-sm font-extrabold hover:bg-white/15"
              >
                Start free
              </a>
            </div>

            <div className="rounded-3xl border border-white/15 bg-gradient-to-b from-white/10 to-white/5 p-7 shadow-2xl shadow-black/30">
              <div className="flex items-center justify-between">
                <div className="text-sm font-extrabold">Pro</div>
                <div className="rounded-full bg-white px-3 py-1 text-[11px] font-extrabold text-[#070A12]">
                  Most popular
                </div>
              </div>
              <div className="mt-2 text-4xl font-extrabold">$29</div>
              <div className="mt-1 text-sm text-white/65">Ship faster. Stronger guardrails.</div>
              <ul className="mt-5 space-y-2 text-sm text-white/80">
                <li>• Priority generation runs</li>
                <li>• Enhanced SEO & publish helpers</li>
                <li>• Better agent workflows</li>
              </ul>
              <a
                href="/admin"
                className="mt-6 inline-flex w-full items-center justify-center rounded-2xl bg-white px-5 py-3 text-sm font-extrabold text-[#070A12] hover:bg-white/90"
              >
                Go Pro
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative z-10 border-t border-white/10">
        <div className="mx-auto max-w-7xl px-4 py-10 text-sm text-white/60 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-white/10 ring-1 ring-white/15">
                <span className="text-xs font-extrabold">D8</span>
              </div>
              <div>
                <div className="font-semibold text-white/80">Dominat8</div>
                <div className="text-xs">Build. Publish. Dominate.</div>
              </div>
            </div>
            <div className="flex flex-wrap gap-5">
              <a className="hover:text-white" href="/admin">Admin</a>
              <a className="hover:text-white" href="#pricing">Pricing</a>
              <a className="hover:text-white" href="#proof">Proof</a>
            </div>
          </div>

          <div className="mt-6 text-xs text-white/45">
            © {new Date().getFullYear()} Dominat8. All rights reserved.
          </div>
        </div>
      </footer>
    </main>
  );
}
