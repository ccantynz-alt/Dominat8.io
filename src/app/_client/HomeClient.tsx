"use client";

import { useEffect, useMemo, useState } from "react";

type DeployInfo = {
  serverIso: string;
  deployId: string;
  gitSha: string;
  gitRef: string;
  nodeEnv: string;
  vercelEnv: string;
};

type ProbeResponse = {
  ok: boolean;
  nowIso: string;
  stamp: string;
  deployId?: string;
  gitSha?: string;
  gitRef?: string;
  vercelEnv?: string;
  nodeEnv?: string;
};

export default function HomeClient({ deploy }: { deploy: DeployInfo }) {
  const [probe, setProbe] = useState<ProbeResponse | null>(null);
  const [probeErr, setProbeErr] = useState<string>("");

  const clientIso = useMemo(() => new Date().toISOString(), []);
  const cacheBust = useMemo(() => `${Date.now()}`, []);

  useEffect(() => {
    const url = `/api/__probe__?ts=${encodeURIComponent(cacheBust)}`;

    fetch(url, {
      method: "GET",
      cache: "no-store",
      headers: {
        "cache-control": "no-store",
        pragma: "no-cache",
      },
    })
      .then(async (r) => {
        const j = (await r.json()) as ProbeResponse;
        setProbe(j);
      })
      .catch((e: any) => {
        setProbeErr(e?.message || String(e));
      });
  }, [cacheBust]);

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      {/* HERO */}
      <section className="mb-12">
        <div className="text-xs uppercase tracking-[0.28em] text-white/60">
          Dominat8
        </div>

        <h1 className="mt-4 text-4xl font-semibold leading-tight sm:text-6xl">
          Build a stunning website.
          <span className="block text-white/70">Launch in minutes.</span>
        </h1>

        <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/70">
          This homepage is in “Trust Mode”: it shows undeniable proof you are
          seeing the latest deployed build — no guessing, no cache confusion.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <a
            href="/gallery"
            className="rounded-2xl bg-white px-6 py-3 text-sm font-semibold text-black shadow hover:opacity-90"
          >
            Open Gallery
          </a>

          <a
            href="/templates"
            className="rounded-2xl border border-white/20 px-6 py-3 text-sm font-semibold text-white/90 hover:border-white/40"
          >
            Browse Templates
          </a>

          <a
            href="/use-cases"
            className="rounded-2xl border border-white/20 px-6 py-3 text-sm font-semibold text-white/90 hover:border-white/40"
          >
            Explore Use Cases
          </a>
        </div>
      </section>

      {/* PROOF PANEL */}
      <section className="rounded-2xl border-2 border-white/20 bg-white/5 p-6 shadow">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-xs uppercase tracking-[0.28em] text-white/60">
              LIVE PROOF PANEL
            </div>
            <div className="mt-2 text-lg font-semibold">
              If you see this panel, you are on the real homepage route.
            </div>
          </div>

          <div className="rounded-xl border border-white/20 bg-black/40 px-4 py-2 text-xs text-white/80">
            CACHE_BUST: {cacheBust}
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-black/30 p-5">
            <div className="text-sm font-semibold">Client</div>
            <div className="mt-3 space-y-2 text-sm text-white/70">
              <div>
                <span className="text-white/50">URL:</span>{" "}
                <span className="text-white/85">
                  {typeof window !== "undefined" ? window.location.href : ""}
                </span>
              </div>
              <div>
                <span className="text-white/50">CLIENT_ISO:</span>{" "}
                <span className="text-white/85">{clientIso}</span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/30 p-5">
            <div className="text-sm font-semibold">Server</div>
            <div className="mt-3 space-y-2 text-sm text-white/70">
              <div>
                <span className="text-white/50">SERVER_ISO:</span>{" "}
                <span className="text-white/85">{deploy.serverIso}</span>
              </div>
              <div>
                <span className="text-white/50">VERCEL_ENV:</span>{" "}
                <span className="text-white/85">{deploy.vercelEnv || "(n/a)"}</span>
              </div>
              <div>
                <span className="text-white/50">NODE_ENV:</span>{" "}
                <span className="text-white/85">{deploy.nodeEnv || "(n/a)"}</span>
              </div>
              <div>
                <span className="text-white/50">GIT_REF:</span>{" "}
                <span className="text-white/85">{deploy.gitRef || "(n/a)"}</span>
              </div>
              <div>
                <span className="text-white/50">GIT_SHA:</span>{" "}
                <span className="text-white/85">{deploy.gitSha || "(n/a)"}</span>
              </div>
              <div>
                <span className="text-white/50">DEPLOY_ID:</span>{" "}
                <span className="text-white/85">{deploy.deployId || "(n/a)"}</span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/30 p-5 md:col-span-2">
            <div className="text-sm font-semibold">Probe (/api/__probe__)</div>

            {probeErr ? (
              <div className="mt-3 text-sm text-red-200">
                PROBE_ERROR: {probeErr}
              </div>
            ) : null}

            {!probe && !probeErr ? (
              <div className="mt-3 text-sm text-white/60">Loading probe…</div>
            ) : null}

            {probe ? (
              <pre className="mt-3 overflow-auto rounded-xl border border-white/10 bg-black/60 p-4 text-xs text-white/80">
{JSON.stringify(probe, null, 2)}
              </pre>
            ) : null}
          </div>
        </div>

        <div className="mt-6 text-xs text-white/55">
          Tip: open a new tab with a cache-buster to prove updates are live:{" "}
          <span className="text-white/80">/?ts=123</span>
        </div>
      </section>

      {/* NEXT STEP AREA (simple) */}
      <section className="mt-12 rounded-2xl border border-white/10 bg-white/5 p-6">
        <div className="text-sm font-semibold">Next</div>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-white/70">
          <li>
            Once this is visibly live, we can polish the design (SiteGround-level)
            without guessing whether deploys are applying.
          </li>
          <li>
            If this page is live but looks plain, that’s GOOD — it means deploy + routing
            are trustworthy again.
          </li>
        </ul>
      </section>
    </div>
  );
}