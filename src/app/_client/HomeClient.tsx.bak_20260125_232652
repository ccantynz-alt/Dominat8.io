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

function useIntervalTick(ms: number) {
  const [tick, setTick] = React.useState(0);
  React.useEffect(() => {
    const id = window.setInterval(() => setTick((t) => t + 1), ms);
    return () => window.clearInterval(id);
  }, [ms]);
  return tick;
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

export default function HomeClient() {
  const tick = useIntervalTick(1000);

  const [clientStartMs] = React.useState<number>(() => Date.now());
  const [clientTs] = React.useState<number>(() => Math.floor(Date.now() / 1000));
  const [probe, setProbe] = React.useState<ProbePayload | null>(null);
  const [probeErr, setProbeErr] = React.useState<string | null>(null);
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

  const heroGlow =
    "absolute inset-0 -z-10 opacity-90 [mask-image:radial-gradient(ellipse_at_center,black,transparent_66%)]";

  return (
    <main className="min-h-screen bg-black text-white">
      {/* Background: grid + glow + noise */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className={cx(heroGlow, "bg-gradient-to-b from-white/12 via-white/0 to-white/0")} />
        <div className="absolute inset-0 opacity-[0.10] [background-image:linear-gradient(to_right,rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:72px_72px]" />
        <div className="absolute inset-0 opacity-[0.10] bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.10),transparent_35%),radial-gradient(circle_at_80%_10%,rgba(255,255,255,0.08),transparent_40%),radial-gradient(circle_at_60%_70%,rgba(255,255,255,0.06),transparent_45%)]" />
        <div className="absolute inset-0 opacity-[0.08] [background-image:url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22200%22><filter id=%22n%22 x=%220%22 y=%220%22><feTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%224%22 stitchTiles=%22stitch%22/></filter><rect width=%22200%22 height=%22200%22 filter=%22url(%23n)%22 opacity=%220.35%22/></svg>')]" />
      </div>

      <div className="mx-auto max-w-6xl px-6 pt-10 pb-16">
        {/* Trust Mode Proof Panel */}
        <section className="rounded-2xl border border-white/15 bg-white/5 p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.06)] backdrop-blur">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-xs uppercase tracking-[0.28em] text-white/70">Trust Mode • Live Proof</div>
              <div className="mt-1 text-sm text-white/90">
                If you see this panel + live probe JSON, you are not stuck in cache.
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <a
                className="rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold hover:bg-white/15"
                href={`/?ts=${clientTs}`}
              >
                Refresh with ts={clientTs}
              </a>
              <button
                className="rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold hover:bg-white/15"
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
            </div>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <div className="rounded-xl border border-white/10 bg-black/20 p-3">
              <div className="text-xs text-white/60">Client time</div>
              <div className="mt-1 font-mono text-sm">{new Date(nowMs).toISOString()}</div>
              <div className="mt-1 text-xs text-white/60">Client uptime: {formatRelative(uptime)}</div>
            </div>

            <div className="rounded-xl border border-white/10 bg-black/20 p-3">
              <div className="text-xs text-white/60">Server time (probe)</div>
              <div className="mt-1 font-mono text-sm">{probe?.serverTimeIso ?? (loading ? "Loading..." : "—")}</div>
              <div className="mt-1 text-xs text-white/60">
                Skew (client - server): {skewMs === null ? "—" : `${skewMs}ms`}
              </div>
            </div>

            <div className="rounded-xl border border-white/10 bg-black/20 p-3">
              <div className="text-xs text-white/60">Vercel / Git (server)</div>
              <div className="mt-1 text-xs text-white/80">
                env: <span className="font-mono">{probe?.env?.VERCEL_ENV ?? "—"}</span>
              </div>
              <div className="mt-1 text-xs text-white/80">
                deploy: <span className="font-mono">{probe?.env?.VERCEL_DEPLOYMENT_ID ?? "—"}</span>
              </div>
              <div className="mt-1 text-xs text-white/80">
                git: <span className="font-mono">{probe?.env?.VERCEL_GIT_COMMIT_SHA ?? "—"}</span>
              </div>
            </div>
          </div>

          <div className="mt-4">
            <div className="text-xs uppercase tracking-[0.28em] text-white/60">Probe JSON</div>
            <div className="mt-2 rounded-2xl border border-white/10 bg-black/35 p-4">
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
          </div>
        </section>

        {/* Hero */}
        <section className="mt-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs text-white/80">
            <span className="inline-block h-2 w-2 rounded-full bg-white/70" />
            Dominat8 • AI website automation builder
          </div>

          <h1 className="mt-6 text-balance text-4xl font-extrabold leading-[1.05] md:text-6xl">
            Build a premium website in minutes.
            <span className="block text-white/70">Launch like you hired a full team.</span>
          </h1>

          <p className="mt-5 max-w-2xl text-pretty text-lg text-white/75">
            Dominat8 turns a simple idea into a polished, multi-page site with structure, copy, and a publish-ready build.
            Trust Mode proves you’re seeing the latest deploy—no more “is it cached?” stress.
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <a
              className="rounded-2xl bg-white px-6 py-3 text-center text-sm font-bold text-black hover:bg-white/90"
              href="/templates"
            >
              Explore templates
            </a>
            <a
              className="rounded-2xl border border-white/20 bg-white/10 px-6 py-3 text-center text-sm font-bold text-white hover:bg-white/15"
              href="/pricing"
            >
              View pricing
            </a>
          </div>

          {/* Social proof strip */}
          <div className="mt-10 grid gap-3 rounded-2xl border border-white/10 bg-white/5 p-5 md:grid-cols-4">
            {[
              { k: "Fast", v: "Idea → site in minutes" },
              { k: "Structured", v: "Multi-page layout flow" },
              { k: "SEO-minded", v: "Sitemap + metadata ready" },
              { k: "Trust Mode", v: "Proof you’re live" },
            ].map((x) => (
              <div key={x.k} className="rounded-xl border border-white/10 bg-black/20 p-4">
                <div className="text-xs uppercase tracking-[0.28em] text-white/60">{x.k}</div>
                <div className="mt-2 text-sm font-semibold text-white/90">{x.v}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Feature pillars */}
        <section className="mt-14">
          <div className="text-xs uppercase tracking-[0.28em] text-white/60">What you get</div>
          <h2 className="mt-3 text-2xl font-bold md:text-3xl">Everything you need to ship clean and confident.</h2>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {[
              {
                t: "Premium hero + sections",
                d: "Modern layout, clear CTA rhythm, and strong visual polish out of the box.",
              },
              {
                t: "Publish pipeline ready",
                d: "Generated specs, SEO planning, sitemap, and deploy-friendly output.",
              },
              {
                t: "Live verification built in",
                d: "Probe endpoint + proof panel so you can confirm the current deploy instantly.",
              },
            ].map((c) => (
              <div key={c.t} className="rounded-2xl border border-white/12 bg-white/5 p-6">
                <div className="text-lg font-bold">{c.t}</div>
                <div className="mt-2 text-sm text-white/75">{c.d}</div>
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section className="mt-14">
          <div className="rounded-2xl border border-white/10 bg-black/20 p-6">
            <div className="text-xs uppercase tracking-[0.28em] text-white/60">How it works</div>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              {[
                { n: "01", t: "Describe your business", d: "What you do, who it’s for, and the vibe you want." },
                { n: "02", t: "Generate structure + copy", d: "Hero, sections, pages, and conversion-ready wording." },
                { n: "03", t: "Publish with proof", d: "Deploy with no-store verification so you know it’s live." },
              ].map((s) => (
                <div key={s.n} className="rounded-2xl border border-white/10 bg-white/5 p-5">
                  <div className="text-xs font-mono text-white/70">{s.n}</div>
                  <div className="mt-2 text-base font-bold">{s.t}</div>
                  <div className="mt-2 text-sm text-white/75">{s.d}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing + FAQ + CTA */}
        <section className="mt-14 grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-white/12 bg-white/5 p-6">
            <div className="text-xs uppercase tracking-[0.28em] text-white/60">Pricing</div>
            <div className="mt-2 text-2xl font-bold">Simple, upgrade when you’re ready.</div>
            <div className="mt-5 grid gap-3">
              <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
                <div className="flex items-baseline justify-between">
                  <div className="text-base font-bold">Free</div>
                  <div className="text-sm text-white/70">$0</div>
                </div>
                <ul className="mt-3 list-inside list-disc text-sm text-white/75">
                  <li>Explore templates</li>
                  <li>Generate and preview</li>
                  <li>Basic publishing flow</li>
                </ul>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
                <div className="flex items-baseline justify-between">
                  <div className="text-base font-bold">Pro</div>
                  <div className="text-sm text-white/70">Unlock</div>
                </div>
                <ul className="mt-3 list-inside list-disc text-sm text-white/75">
                  <li>Full pipeline automation</li>
                  <li>SEO + sitemap outputs</li>
                  <li>Custom domain workflows</li>
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

          <div className="rounded-2xl border border-white/12 bg-white/5 p-6">
            <div className="text-xs uppercase tracking-[0.28em] text-white/60">FAQ</div>
            <div className="mt-2 text-2xl font-bold">Quick answers</div>

            <div className="mt-5 space-y-3">
              {[
                {
                  q: "How do I know I’m seeing the latest deploy?",
                  a: "Use the Trust Mode panel and /api/__probe__ headers. They are no-store and include timestamps and deploy/git identifiers.",
                },
                {
                  q: "Why do we force dynamic on the homepage?",
                  a: "To eliminate confusing cache behavior while you iterate fast. You can relax it later once the baseline is stable.",
                },
                {
                  q: "Is this safe to roll back?",
                  a: "Yes. This patch writes .bak backups next to every overwritten file.",
                },
              ].map((f) => (
                <div key={f.q} className="rounded-2xl border border-white/10 bg-black/20 p-5">
                  <div className="text-sm font-bold">{f.q}</div>
                  <div className="mt-2 text-sm text-white/75">{f.a}</div>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-2xl border border-white/10 bg-black/30 p-5">
              <div className="text-sm font-bold">Ready to push it live?</div>
              <div className="mt-2 text-sm text-white/75">
                If builds are green, deploy and verify with the probe headers. Then you can iterate with confidence.
              </div>
              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <a
                  className="rounded-2xl bg-white px-6 py-3 text-center text-sm font-bold text-black hover:bg-white/90"
                  href="/"
                >
                  Reload homepage
                </a>
                <a
                  className="rounded-2xl border border-white/20 bg-white/10 px-6 py-3 text-center text-sm font-bold text-white hover:bg-white/15"
                  href="/api/__probe__"
                >
                  Open probe JSON
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-14 border-t border-white/10 pt-8 pb-10 text-sm text-white/60">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>© {new Date().getFullYear()} Dominat8</div>
            <div className="font-mono">tick:{tick} • clientTs:{clientTs}</div>
          </div>
        </footer>
      </div>
    </main>
  );
}