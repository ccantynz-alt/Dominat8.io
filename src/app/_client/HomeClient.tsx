"use client";

import * as React from "react";
import Link from "next/link";

type Props = {
  buildStamp?: string;
};

// TelemetryGuard:
// - In production: hides proof/telemetry unless ?debug=1
// - In dev: always shows (so you can still debug locally)
function useTelemetryGuard() {
  const [debug, setDebug] = React.useState(false);
  React.useEffect(() => {
    try {
      const url = new URL(window.location.href);
      const q = url.searchParams.get("debug");
      if (q === "1" || q === "true") setDebug(true);
    } catch {}
  }, []);

  const isProd =
    typeof process !== "undefined" &&
    !!process.env &&
    process.env.NODE_ENV === "production";

  const show = !isProd || debug;
  return { show, debug, isProd };
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full px-3 py-2 text-xs ring-1 ring-white/15 bg-white/5 text-white/70">
      {children}
    </span>
  );
}

function Card({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-3xl p-6 ring-1 ring-white/15 bg-white/5">
      <div className="text-base font-semibold">{title}</div>
      <div className="mt-2 text-sm text-white/70 leading-relaxed">{body}</div>
    </div>
  );
}

function Step({ n, title, body }: { n: string; title: string; body: string }) {
  return (
    <div className="rounded-3xl p-6 ring-1 ring-white/15 bg-black/30">
      <div className="inline-flex items-center justify-center h-8 w-8 rounded-xl bg-white/10 ring-1 ring-white/15 text-sm font-semibold">
        {n}
      </div>
      <div className="mt-4 text-base font-semibold">{title}</div>
      <div className="mt-2 text-sm text-white/70 leading-relaxed">{body}</div>
    </div>
  );
}

function Faq({ q, a }: { q: string; a: string }) {
  return (
    <div className="rounded-3xl p-6 ring-1 ring-white/15 bg-white/5">
      <div className="text-base font-semibold">{q}</div>
      <div className="mt-2 text-sm text-white/70 leading-relaxed">{a}</div>
    </div>
  );
}

export default function HomeClient({ buildStamp }: Props) {
  const stamp = buildStamp || "D8_TELEMETRY_GUARD_2026-01-30_3825";
  const tg = useTelemetryGuard();

  return (
    <main
      className="min-h-screen bg-black text-white"
      style={{ backgroundColor: "#000", color: "#fff" }}
    >
      {/* Always-on tiny stamp (safe, minimal) */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed top-2 left-2 z-[9999] text-[10px] opacity-60"
        style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace" }}
      >
        {stamp}
      </div>

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(1200px 600px at 20% 10%, rgba(99,102,241,0.35), transparent 60%)," +
                "radial-gradient(900px 500px at 80% 20%, rgba(236,72,153,0.25), transparent 55%)," +
                "radial-gradient(900px 700px at 60% 80%, rgba(34,197,94,0.15), transparent 60%)," +
                "linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(0,0,0,1) 55%)",
            }}
          />
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), " +
                "linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)",
              backgroundSize: "48px 48px",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black" />
        </div>

        <div className="relative mx-auto max-w-6xl px-6 pt-16 pb-12 sm:pt-20 sm:pb-14">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-white/10 ring-1 ring-white/15" />
              <div className="leading-tight">
                <div className="text-sm font-semibold tracking-wide">Dominat8</div>
                <div className="text-xs text-white/60">AI Website Automation</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/pricing"
                className="rounded-xl px-3 py-2 text-sm text-white/80 hover:text-white ring-1 ring-white/15 hover:ring-white/25 transition"
                style={{ backgroundColor: "rgba(255,255,255,0.06)" }}
              >
                Pricing
              </Link>
              <Link
                href="/templates"
                className="rounded-xl px-3 py-2 text-sm text-white/80 hover:text-white ring-1 ring-white/15 hover:ring-white/25 transition"
                style={{ backgroundColor: "rgba(255,255,255,0.06)" }}
              >
                Templates
              </Link>
            </div>
          </div>

          <div className="mt-12 sm:mt-14">
            <div className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs ring-1 ring-white/15 bg-white/5">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              <span className="text-white/80">
                Build a premium site fast — without the tech headache
              </span>
            </div>

            <h1 className="mt-6 text-4xl sm:text-6xl font-semibold tracking-tight">
              This is how websites are made now.
            </h1>

            <p className="mt-5 max-w-2xl text-base sm:text-lg text-white/70 leading-relaxed">
              Describe your business. Your website assembles itself — structure, pages, SEO, and publish-ready output.
              You stay in control. We do the heavy lifting.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center rounded-2xl px-5 py-3 text-sm font-semibold text-black"
                style={{ background: "linear-gradient(90deg, rgba(255,255,255,1), rgba(255,255,255,0.85))" }}
              >
                Build my site
              </Link>
              <Link
                href="/pricing"
                className="inline-flex items-center justify-center rounded-2xl px-5 py-3 text-sm font-semibold text-white ring-1 ring-white/20 hover:ring-white/30 transition"
                style={{ backgroundColor: "rgba(255,255,255,0.06)" }}
              >
                View pricing →
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap gap-2">
              <Pill>No templates</Pill>
              <Pill>No setup</Pill>
              <Pill>Publish in minutes</Pill>
              <Pill>Conversion-first</Pill>
              <Pill>SEO-ready</Pill>
            </div>

            {/* PROOF/TELEMETRY — hidden in production unless ?debug=1 */}
            {tg.show ? (
              <div className="mt-10 rounded-3xl p-5 ring-1 ring-white/15 bg-black/40">
                <div className="text-sm font-semibold">PROOF / DEBUG</div>
                <div className="mt-2 text-xs text-white/70 leading-relaxed">
                  Visible because {tg.isProd ? "debug=1 (production)" : "dev mode"}.
                  <br />
                  BUILD_STAMP:{" "}
                  <span style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace" }}>
                    {stamp}
                  </span>
                  <br />
                  Tip: remove <span className="text-white">?debug=1</span> for clean production view.
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      {/* TRUST */}
      <section className="mx-auto max-w-6xl px-6 py-14">
        <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">
          Launch fast — and look legitimate doing it
        </h2>
        <p className="mt-3 max-w-2xl text-white/70">
          Dominat8 is built to produce a real, publishable website with structure, SEO fundamentals, and clean URLs — not a flimsy demo.
        </p>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card title="Premium homepage structure" body="Clear offer, strong sections, and a conversion-ready layout that feels like a real business." />
          <Card title="SEO fundamentals built in" body="Metadata, sitemap, structured pages, and content designed around search intent." />
          <Card title="Publish-ready output" body="Deploy confidently and keep iterating — without breaking your site every time you tweak copy." />
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="mx-auto max-w-6xl px-6 pb-16">
        <div className="rounded-3xl ring-1 ring-white/15 bg-white/5 p-6 sm:p-10">
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">How it works</h2>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <Step n="1" title="Describe your business" body="Tell Dominat8 what you do, who it’s for, and what you sell." />
            <Step n="2" title="Generate a premium structure" body="Get a clean, modern layout and pages that make sense." />
            <Step n="3" title="Publish & improve" body="Go live, then keep refining with AI assistance as you grow." />
          </div>

          <div className="mt-10 flex flex-col sm:flex-row gap-3">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center rounded-2xl px-5 py-3 text-sm font-semibold text-black"
              style={{ background: "linear-gradient(90deg, rgba(255,255,255,1), rgba(255,255,255,0.85))" }}
            >
              Start free
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center justify-center rounded-2xl px-5 py-3 text-sm font-semibold text-white ring-1 ring-white/20 hover:ring-white/30 transition"
              style={{ backgroundColor: "rgba(255,255,255,0.06)" }}
            >
              Compare plans →
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-6xl px-6 pb-20">
        <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">Quick answers</h2>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <Faq q="Is this a real website or just a template?" a="It’s a real website you can publish. Dominat8 generates structure and content designed to convert." />
          <Faq q="Can I use my own domain?" a="Yes. Pro supports custom domains and guides you through DNS + verification." />
          <Faq q="Do I need to know code?" a="No. Describe what you want, generate a premium structure, and publish. You can customize later if you choose." />
          <Faq q="Will this help me rank on Google?" a="Dominat8 focuses on SEO fundamentals: clean structure, metadata, sitemap, and content designed around search intent." />
        </div>

        <div className="mt-10 flex flex-col sm:flex-row gap-3">
          <Link
            href="/signup"
            className="inline-flex items-center justify-center rounded-2xl px-5 py-3 text-sm font-semibold text-black"
            style={{ background: "linear-gradient(90deg, rgba(255,255,255,1), rgba(255,255,255,0.85))" }}
          >
            Build my site
          </Link>
          <Link
            href="/templates"
            className="inline-flex items-center justify-center rounded-2xl px-5 py-3 text-sm font-semibold text-white ring-1 ring-white/20 hover:ring-white/30 transition"
            style={{ backgroundColor: "rgba(255,255,255,0.06)" }}
          >
            Browse templates →
          </Link>
        </div>
      </section>
    </main>
  );
}