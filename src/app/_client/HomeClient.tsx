"use client";

import React from "react";

type ProbePayload = {
  ok: boolean;
  probe: string;
  serverTimeIso: string;
  serverTimeMs: number;
  rand: string;
  ts: string | null;
  env?: Record<string, string | null>;
};

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

async function fetchProbe(ts: number): Promise<ProbePayload> {
  const r = await fetch(`/api/__probe__?ts=${ts}`, {
    method: "GET",
    cache: "no-store",
    headers: { "cache-control": "no-store" },
  });
  if (!r.ok) throw new Error(`Probe failed: ${r.status}`);
  return (await r.json()) as ProbePayload;
}

function formatRelative(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}m ${r}s`;
}

function Pill({
  title,
  desc,
  icon,
}: {
  title: string;
  desc: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-white/12 bg-white/[0.04] p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.04)]">
      <div className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
        <div className="absolute -inset-24 bg-[radial-gradient(circle_at_40%_30%,rgba(34,211,238,0.14),transparent_50%),radial-gradient(circle_at_80%_60%,rgba(59,130,246,0.10),transparent_50%)]" />
      </div>
      <div className="relative">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/12 bg-black/30">
            {icon}
          </div>
          <div className="text-base font-bold text-white/95">{title}</div>
        </div>
        <div className="mt-3 text-sm text-white/72 leading-relaxed">{desc}</div>
      </div>
    </div>
  );
}

function ExampleCard({
  tag,
  title,
  desc,
  minutes,
}: {
  tag: string;
  title: string;
  desc: string;
  minutes: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-white/12 bg-white/[0.03] p-5">
      <div className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
        <div className="absolute -inset-24 bg-[radial-gradient(circle_at_30%_30%,rgba(34,211,238,0.12),transparent_55%),radial-gradient(circle_at_80%_70%,rgba(59,130,246,0.10),transparent_55%)]" />
      </div>

      <div className="relative">
        <div className="flex items-center justify-between gap-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-black/25 px-3 py-1 text-xs text-white/75">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-300/80" />
            {tag}
          </div>
          <div className="text-xs text-white/60">Generated in {minutes}</div>
        </div>

        <div className="mt-4 rounded-2xl border border-white/10 bg-black/25 p-4">
          <div className="h-28 w-full rounded-xl border border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.10),rgba(255,255,255,0.02))]" />
          <div className="mt-4 text-sm font-bold text-white/92">{title}</div>
          <div className="mt-1 text-sm text-white/70">{desc}</div>
          <div className="mt-4 inline-flex w-full items-center justify-center rounded-xl border border-white/15 bg-white/[0.06] px-4 py-2 text-sm font-semibold text-white/90 hover:bg-white/[0.10]">
            View example
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HomeClient() {
  const [clientStartMs] = React.useState<number>(() => Date.now());
  const [clientTs] = React.useState<number>(() => Math.floor(Date.now() / 1000));

  const [probe, setProbe] = React.useState<ProbePayload | null>(null);
  const [probeErr, setProbeErr] = React.useState<string | null>(null);
  const [probeOpen, setProbeOpen] = React.useState<boolean>(false);
  const [loading, setLoading] = React.useState<boolean>(true);

  React.useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setProbeErr(null);
        const data = await fetchProbe(clientTs);
        if (!alive) return;
        setProbe(data);
      } catch (e: any) {
        if (!alive) return;
        setProbeErr(e?.message ?? "Unknown error");
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [clientTs]);

  const nowMs = Date.now();
  const uptime = nowMs - clientStartMs;
  const serverNowMs = probe?.serverTimeMs ?? null;
  const skewMs = serverNowMs ? Math.round(nowMs - serverNowMs) : null;

  return (
    <main className="min-h-screen bg-black text-white">
      {/* Cinematic background system */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        {/* animated gradient wash */}
        <div className="absolute inset-0 opacity-[0.22] bg-[radial-gradient(circle_at_20%_20%,rgba(34,211,238,0.55),transparent_50%),radial-gradient(circle_at_80%_30%,rgba(59,130,246,0.45),transparent_55%),radial-gradient(circle_at_50%_80%,rgba(255,255,255,0.14),transparent_60%)] animate-dominat8-drift" />

        {/* spotlight behind headline */}
        <div className="absolute inset-0 opacity-[0.60] [mask-image:radial-gradient(ellipse_at_center,black,transparent_64%)] bg-gradient-to-b from-white/10 via-white/0 to-white/0" />

        {/* precision grid */}
        <div className="absolute inset-0 opacity-[0.10] [background-image:linear-gradient(to_right,rgba(255,255,255,0.09)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:72px_72px]" />

        {/* film grain / noise */}
        <div className="absolute inset-0 opacity-[0.08] [background-image:url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22200%22><filter id=%22n%22 x=%220%22 y=%220%22><feTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%224%22 stitchTiles=%22stitch%22/></filter><rect width=%22200%22 height=%22200%22 filter=%22url(%23n)%22 opacity=%220.35%22/></svg>')]" />
      </div>

      {/* Local keyframes (no config changes needed) */}
      <style jsx global>{`
        @keyframes dominat8Drift {
          0% { transform: translate3d(0px, 0px, 0px) scale(1); filter: hue-rotate(0deg); }
          50% { transform: translate3d(-18px, 10px, 0px) scale(1.02); filter: hue-rotate(6deg); }
          100% { transform: translate3d(0px, 0px, 0px) scale(1); filter: hue-rotate(0deg); }
        }
        .animate-dominat8-drift {
          animation: dominat8Drift 28s ease-in-out infinite;
          will-change: transform, filter;
        }
      `}</style>

      <div className="mx-auto max-w-6xl px-6">
        {/* Top Trust Strip (compact) */}
        <div className="pt-6">
          <div className="rounded-2xl border border-white/12 bg-white/[0.04] p-4 shadow-[0_0_0_1px_rgba(255,255,255,0.04)] backdrop-blur">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="text-xs uppercase tracking-[0.28em] text-white/70">Trust Mode</div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-black/25 px-3 py-1 text-xs text-white/70">
                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-300/80" />
                    live proof enabled
                  </div>
                </div>

                <div className="mt-1 text-sm text-white/80">
                  Client uptime: <span className="font-mono text-white/85">{formatRelative(uptime)}</span>
                  {" • "}
                  Skew: <span className="font-mono text-white/85">{skewMs === null ? "—" : `${skewMs}ms`}</span>
                  {" • "}
                  env: <span className="font-mono text-white/85">{probe?.env?.VERCEL_ENV ?? (loading ? "…" : "—")}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <a
                  className="rounded-xl border border-white/15 bg-white/[0.06] px-4 py-2 text-sm font-semibold text-white/90 hover:bg-white/[0.10]"
                  href={`/?ts=${clientTs}`}
                >
                  Refresh with ts={clientTs}
                </a>

                <button
                  className="rounded-xl border border-white/15 bg-white/[0.06] px-4 py-2 text-sm font-semibold text-white/90 hover:bg-white/[0.10]"
                  onClick={async () => {
                    try {
                      setLoading(true);
                      setProbeErr(null);
                      const t = Math.floor(Date.now() / 1000);
                      const data = await fetchProbe(t);
                      setProbe(data);
                    } catch (e: any) {
                      setProbeErr(e?.message ?? "Unknown error");
                    } finally {
                      setLoading(false);
                    }
                  }}
                >
                  Re-run probe
                </button>

                <button
                  className={cx(
                    "rounded-xl border px-4 py-2 text-sm font-semibold transition-colors",
                    probeOpen
                      ? "border-cyan-300/30 bg-cyan-300/10 text-white hover:bg-cyan-300/14"
                      : "border-white/15 bg-white/[0.06] text-white/90 hover:bg-white/[0.10]"
                  )}
                  onClick={() => setProbeOpen((v) => !v)}
                >
                  {probeOpen ? "Hide proof" : "Show proof"}
                </button>
              </div>
            </div>

            {probeOpen ? (
              <div className="mt-4 rounded-2xl border border-white/10 bg-black/35 p-4">
                {probeErr ? (
                  <div className="text-sm text-red-200">
                    Probe error: <span className="font-mono">{probeErr}</span>
                  </div>
                ) : (
                  <pre className="max-h-[260px] overflow-auto whitespace-pre-wrap break-words text-xs text-white/85">
{JSON.stringify(probe, null, 2)}
                  </pre>
                )}
              </div>
            ) : null}
          </div>
        </div>

        {/* FULL-PAGE CINEMATIC HERO */}
        <section className="relative flex min-h-[86vh] items-center pt-10 pb-10">
          <div className="w-full">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.05] px-4 py-2 text-xs text-white/80">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-300/80" />
              Built for real launches • Not toy demos
            </div>

            <h1 className="mt-6 max-w-4xl text-balance text-4xl font-extrabold leading-[1.04] tracking-tight md:text-6xl">
              Build a production-ready website
              <span className="text-white/70"> in minutes — not weeks.</span>
            </h1>

            <p className="mt-5 max-w-2xl text-pretty text-lg text-white/75 leading-relaxed">
              One prompt → pages, structure, copy, SEO outputs, and deploy-friendly builds.
              <span className="text-white/85"> Trust Mode</span> proves you’re seeing the latest deploy so you can iterate fast without doubt.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                className="group relative inline-flex items-center justify-center rounded-2xl bg-white px-6 py-3 text-sm font-bold text-black shadow-[0_12px_60px_rgba(255,255,255,0.12)] hover:bg-white/90"
                href="/templates"
              >
                Generate my site
                <span className="ml-2 text-black/60 transition-transform group-hover:translate-x-0.5">→</span>
              </a>

              <a
                className="inline-flex items-center justify-center rounded-2xl border border-white/18 bg-white/[0.06] px-6 py-3 text-sm font-bold text-white hover:bg-white/[0.10]"
                href="#examples"
              >
                View examples
              </a>
            </div>

            {/* Confidence strip */}
            <div className="mt-10 grid gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-5 md:grid-cols-4">
              {[
                { k: "Outcome", v: "Clean, publish-ready layout" },
                { k: "Speed", v: "Minutes, not weeks" },
                { k: "Clarity", v: "No setup soup" },
                { k: "Proof", v: "Live deploy verification" },
              ].map((x) => (
                <div key={x.k} className="rounded-xl border border-white/10 bg-black/20 p-4">
                  <div className="text-xs uppercase tracking-[0.28em] text-white/60">{x.k}</div>
                  <div className="mt-2 text-sm font-semibold text-white/90">{x.v}</div>
                </div>
              ))}
            </div>

            {/* Scroll hint */}
            <div className="mt-10 text-sm text-white/55">
              <a className="inline-flex items-center gap-2 hover:text-white/75" href="#who">
                <span className="font-mono">↓</span> See how it converts
              </a>
            </div>
          </div>
        </section>

        {/* WHO IT’S FOR / NOT FOR */}
        <section id="who" className="py-12">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-white/12 bg-white/[0.04] p-6">
              <div className="text-xs uppercase tracking-[0.28em] text-white/60">Perfect for</div>
              <h2 className="mt-3 text-2xl font-bold">Teams who need speed + confidence.</h2>
              <ul className="mt-5 space-y-3 text-sm text-white/75">
                <li className="flex gap-3"><span className="mt-1 h-1.5 w-1.5 rounded-full bg-cyan-300/80" /> Founders launching fast</li>
                <li className="flex gap-3"><span className="mt-1 h-1.5 w-1.5 rounded-full bg-cyan-300/80" /> Agencies producing many sites</li>
                <li className="flex gap-3"><span className="mt-1 h-1.5 w-1.5 rounded-full bg-cyan-300/80" /> Operators who don’t want tool-wrestling</li>
              </ul>
            </div>

            <div className="rounded-2xl border border-white/12 bg-white/[0.04] p-6">
              <div className="text-xs uppercase tracking-[0.28em] text-white/60">Not for</div>
              <h3 className="mt-3 text-2xl font-bold">If you want hand-crafted pixel art.</h3>
              <ul className="mt-5 space-y-3 text-sm text-white/75">
                <li className="flex gap-3"><span className="mt-1 h-1.5 w-1.5 rounded-full bg-white/40" /> Designers polishing every micro-pixel</li>
                <li className="flex gap-3"><span className="mt-1 h-1.5 w-1.5 rounded-full bg-white/40" /> Long bespoke dev projects</li>
                <li className="flex gap-3"><span className="mt-1 h-1.5 w-1.5 rounded-full bg-white/40" /> People who love complex setup & config</li>
              </ul>
            </div>
          </div>
        </section>

        {/* EXAMPLES */}
        <section id="examples" className="py-12">
          <div className="flex items-end justify-between gap-6">
            <div>
              <div className="text-xs uppercase tracking-[0.28em] text-white/60">Visual proof</div>
              <h2 className="mt-3 text-2xl font-bold md:text-3xl">Generated outputs people can believe.</h2>
              <p className="mt-2 max-w-2xl text-sm text-white/70">
                These are example cards (placeholders). You can later wire these to real screenshots and published URLs.
              </p>
            </div>
            <a
              className="hidden rounded-xl border border-white/15 bg-white/[0.06] px-4 py-2 text-sm font-semibold text-white/90 hover:bg-white/[0.10] md:inline-flex"
              href="/templates"
            >
              Browse templates
            </a>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <ExampleCard tag="SaaS" title="AI Tool Landing" desc="Hero, benefits, pricing, FAQ, CTA." minutes="7 min" />
            <ExampleCard tag="Local" title="Service Business" desc="Trust, testimonials, booking CTA." minutes="6 min" />
            <ExampleCard tag="Agency" title="Portfolio + Leads" desc="Showcase, case studies, inbound flow." minutes="8 min" />
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="py-12">
          <div className="rounded-2xl border border-white/12 bg-white/[0.04] p-6">
            <div className="text-xs uppercase tracking-[0.28em] text-white/60">How it works</div>
            <h2 className="mt-3 text-2xl font-bold">Three steps. No chaos.</h2>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {[
                { n: "01", t: "Describe your site", d: "Business, audience, and vibe — one prompt." },
                { n: "02", t: "Generate structure + copy", d: "Pages, sections, conversion-first wording." },
                { n: "03", t: "Publish with proof", d: "Deploy with Trust Mode verification." },
              ].map((s) => (
                <div key={s.n} className="rounded-2xl border border-white/10 bg-black/20 p-5">
                  <div className="text-xs font-mono text-white/70">{s.n}</div>
                  <div className="mt-2 text-base font-bold">{s.t}</div>
                  <div className="mt-2 text-sm text-white/75">{s.d}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PILLARS */}
        <section className="py-12">
          <div className="text-xs uppercase tracking-[0.28em] text-white/60">Why Dominat8</div>
          <h2 className="mt-3 text-2xl font-bold md:text-3xl">A marketing machine — built like infrastructure.</h2>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <Pill
              title="Conversion-first layout"
              desc="Hero → proof → clarity → decision → CTA. No scroll fatigue."
              icon={<span className="text-cyan-200/90">◆</span>}
            />
            <Pill
              title="SEO-ready outputs"
              desc="Clean metadata, sitemap readiness, structured page rhythm."
              icon={<span className="text-cyan-200/90">⌁</span>}
            />
            <Pill
              title="Trust Mode verification"
              desc="Probe endpoint + no-store proof so you always know what’s live."
              icon={<span className="text-cyan-200/90">✓</span>}
            />
          </div>
        </section>

        {/* PRICING + FAQ + FINAL CTA */}
        <section className="py-12">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-white/12 bg-white/[0.04] p-6">
              <div className="text-xs uppercase tracking-[0.28em] text-white/60">Pricing</div>
              <h2 className="mt-3 text-2xl font-bold">Simple. Upgrade when you’re ready to publish.</h2>

              <div className="mt-5 grid gap-3">
                <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
                  <div className="flex items-baseline justify-between">
                    <div className="text-base font-bold">Free</div>
                    <div className="text-sm text-white/70">$0</div>
                  </div>
                  <ul className="mt-3 list-inside list-disc text-sm text-white/75">
                    <li>Explore templates</li>
                    <li>Generate and preview</li>
                    <li>Confidence-first baseline</li>
                  </ul>
                </div>

                <div className="rounded-2xl border border-cyan-300/20 bg-cyan-300/5 p-5">
                  <div className="flex items-baseline justify-between">
                    <div className="text-base font-bold">Pro</div>
                    <div className="text-sm text-white/70">Unlock</div>
                  </div>
                  <ul className="mt-3 list-inside list-disc text-sm text-white/75">
                    <li>Full pipeline automation</li>
                    <li>SEO + sitemap outputs</li>
                    <li>Domain workflows</li>
                  </ul>
                  <a
                    className="mt-4 inline-flex w-full items-center justify-center rounded-2xl bg-white px-5 py-3 text-sm font-bold text-black hover:bg-white/90"
                    href="/pricing"
                  >
                    See Pro details
                  </a>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/12 bg-white/[0.04] p-6">
              <div className="text-xs uppercase tracking-[0.28em] text-white/60">FAQ</div>
              <h2 className="mt-3 text-2xl font-bold">Quick answers</h2>

              <div className="mt-5 space-y-3">
                {[
                  {
                    q: "How do I know I’m seeing the latest deploy?",
                    a: "Trust Mode uses a no-store probe endpoint with timestamps and deploy/git identifiers.",
                  },
                  {
                    q: "Why force dynamic on the homepage?",
                    a: "So iteration is predictable while you’re building. You can relax caching later.",
                  },
                  {
                    q: "Is this rollback-safe?",
                    a: "Yes. This patch creates .bak backups next to each overwritten file.",
                  },
                ].map((f) => (
                  <div key={f.q} className="rounded-2xl border border-white/10 bg-black/20 p-5">
                    <div className="text-sm font-bold">{f.q}</div>
                    <div className="mt-2 text-sm text-white/75">{f.a}</div>
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-2xl border border-white/10 bg-black/30 p-5">
                <div className="text-sm font-bold">Ready to ship?</div>
                <div className="mt-2 text-sm text-white/75">
                  Stop wrestling with tools. Launch like a team built it for you.
                </div>
                <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                  <a
                    className="rounded-2xl bg-white px-6 py-3 text-center text-sm font-bold text-black hover:bg-white/90"
                    href="/templates"
                  >
                    Generate my site
                  </a>
                  <a
                    className="rounded-2xl border border-white/18 bg-white/[0.06] px-6 py-3 text-center text-sm font-bold text-white hover:bg-white/[0.10]"
                    href="/pricing"
                  >
                    View pricing
                  </a>
                </div>
              </div>
            </div>
          </div>

          <footer className="mt-12 border-t border-white/10 py-8 text-sm text-white/60">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>© {new Date().getFullYear()} Dominat8</div>
              <div className="font-mono">clientTs:{clientTs}</div>
            </div>
          </footer>
        </section>
      </div>
    </main>
  );
}