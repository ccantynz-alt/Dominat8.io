'use client';
/**
 * src/app/page.tsx
 * FLAGSHIP HOMEPAGE v1 (safe written by PS)
 */

import React, { useEffect, useMemo, useState } from "react";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

function useScrollY() {
  const [y, setY] = useState(0);
  useEffect(() => {
    const onScroll = () => setY(window.scrollY || 0);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return y;
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-white/15 bg-white/[0.06] px-3 py-1 text-xs text-white/80">
      {children}
    </span>
  );
}

function PrimaryButton({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      className="inline-flex items-center justify-center rounded-full bg-white px-8 py-4 text-sm font-semibold text-black hover:bg-white/90 transition"
    >
      {children}
    </a>
  );
}

function SecondaryButton({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/[0.06] px-8 py-4 text-sm font-semibold text-white hover:bg-white/[0.12] transition"
    >
      {children}
    </a>
  );
}

function SectionTitle({ kicker, title, desc }: { kicker: string; title: string; desc: string }) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      <div className="text-xs uppercase tracking-[0.28em] text-white/55">{kicker}</div>
      <h2 className="mt-4 text-[clamp(2rem,4vw,3rem)] font-semibold tracking-tight text-white leading-[1.05]">
        {title}
      </h2>
      <p className="mx-auto mt-5 max-w-2xl text-base sm:text-lg leading-relaxed text-white/70">
        {desc}
      </p>
    </div>
  );
}

export default function Home() {
  const y = useScrollY();
  const navOn = y > 24;

  const glowTranslate = Math.min(40, y * 0.12);
  const heroShrink = Math.min(0.12, y / 2400);
  const heroOpacity = Math.max(0.65, 1 - y / 1200);

  const build = useMemo(
    () => ({ stamp: "BUILD_20260124_232456", deployId: "9d72fea2938f" }),
    []
  );

  return (
    <main className="min-h-screen bg-black text-white">
      {/* PROBE OVERLAY */}
      <div className="fixed left-4 top-4 z-[9999] rounded-2xl border border-white/15 bg-black/70 px-4 py-3 text-left shadow-sm backdrop-blur">
        <div className="text-xs uppercase tracking-[0.28em] text-white/70">LIVE_OK</div>
        <div className="mt-1 text-sm font-semibold text-white">DEPLOY_ID: {build.deployId}</div>
        <div className="text-sm font-semibold text-white">BUILD_STAMP: {build.stamp}</div>
        <div className="mt-1 text-[11px] text-white/50">If you don’t see this box, you’re not on the deployed route.</div>
        <div className="mt-1 text-[11px] text-white/45">HOME_OK</div>
      </div>

      {/* SCROLL REVEAL NAV */}
      <header
        className={cx(
          "fixed left-0 right-0 top-0 z-50 transition-all duration-300",
          navOn ? "translate-y-0 opacity-100" : "-translate-y-3 opacity-0 pointer-events-none"
        )}
      >
        <div className="mx-auto max-w-6xl px-4 pt-4">
          <div className="rounded-2xl border border-white/10 bg-black/60 backdrop-blur-xl shadow-lg">
            <div className="flex items-center justify-between px-4 py-3">
              <a className="flex items-center gap-2" href="/">
                <div className="grid h-9 w-9 place-items-center rounded-xl bg-white text-black text-sm font-semibold">D8</div>
                <div className="leading-tight">
                  <div className="text-sm font-semibold">Dominat8</div>
                  <div className="text-[11px] opacity-70">AI Website Builder</div>
                </div>
              </a>

              <nav className="hidden sm:flex items-center gap-2 text-sm">
                <a className="rounded-lg px-3 py-2 hover:bg-white/5 transition" href="/templates">Templates</a>
                <a className="rounded-lg px-3 py-2 hover:bg-white/5 transition" href="/use-cases">Use cases</a>
                <a className="rounded-lg px-3 py-2 hover:bg-white/5 transition" href="/pricing">Pricing</a>
                <a className="ml-2 inline-flex items-center justify-center rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-white/90 transition" href="/templates">
                  Get started
                </a>
              </nav>

              <a className="sm:hidden inline-flex items-center justify-center rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-white/90 transition" href="/templates">
                Start
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative flex min-h-[100svh] w-screen items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-black via-black to-black" />
          <div className="absolute inset-0 opacity-60 d8-grid" />
          <div
            className="absolute left-1/2 top-1/2 h-[980px] w-[1500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/12 blur-3xl"
            style={{ transform: "translate(-50%, -50%) translateY(" + glowTranslate + "px)" }}
          />
          <div className="absolute inset-0 d8-vignette" style={{ opacity: heroOpacity }} />
        </div>

        <div className="relative mx-auto w-full px-6 sm:px-8">
          <div className="mx-auto max-w-5xl text-center" style={{ transform: "scale(" + (1 - heroShrink).toFixed(4) + ")" }}>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <Pill>AI agents</Pill><Pill>SEO-first</Pill><Pill>Publish-ready</Pill><Pill>No fluff</Pill>
            </div>

            <div className="mt-6 text-xs uppercase tracking-[0.28em] text-white/60">Build. Optimize. Publish. Repeat.</div>

            <h1 className="mt-5 text-[clamp(3.1rem,6.8vw,6.3rem)] font-semibold leading-[1.02] tracking-tight text-white">
              Websites that feel
              <span className="block text-white/80">premium —</span>
              <span className="block">built by automation.</span>
            </h1>

            <p className="mx-auto mt-7 max-w-2xl text-base sm:text-lg leading-relaxed text-white/70">
              Dominat8 generates a complete site, locks in SEO-ready fundamentals, and gets you live fast.
              Stop tweaking. Start shipping.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <PrimaryButton href="/templates">Start building</PrimaryButton>
              <SecondaryButton href="/pricing">View pricing</SecondaryButton>
            </div>

            <div className="mt-12 flex justify-center">
              <div className="flex items-center gap-2 text-xs text-white/45">
                <span className="inline-block h-6 w-[1px] bg-white/20" /><span>Scroll</span><span className="inline-block h-6 w-[1px] bg-white/20" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CONVERSION SPINE */}
      <section className="w-screen bg-black">
        <div className="mx-auto max-w-6xl px-6 sm:px-8 py-20 sm:py-24">
          <SectionTitle kicker="Built for" title="Founders. Agencies. Operators." desc="Remove busywork. Keep the output sharp." />

          <div className="mt-12 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
              <div className="text-sm font-semibold">Agencies</div>
              <p className="mt-2 text-sm leading-relaxed text-white/70">Repeatable templates + automation to ship client sites faster.</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
              <div className="text-sm font-semibold">Founders</div>
              <p className="mt-2 text-sm leading-relaxed text-white/70">Launch pages that don’t look DIY — without weeks of iteration.</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
              <div className="text-sm font-semibold">Local services</div>
              <p className="mt-2 text-sm leading-relaxed text-white/70">Locations, services, FAQs — built in a consistent ranking structure.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="w-screen bg-black">
        <div className="mx-auto max-w-6xl px-6 sm:px-8 pb-24">
          <div className="rounded-3xl border border-white/12 bg-white/[0.05] p-8 sm:p-10">
            <div className="flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-2xl">
                <div className="text-xs uppercase tracking-[0.28em] text-white/60">Ready to ship</div>
                <h3 className="mt-4 text-3xl sm:text-4xl font-semibold tracking-tight leading-[1.05]">
                  Impress people the moment they land.
                </h3>
                <p className="mt-4 text-sm sm:text-base leading-relaxed text-white/70">
                  Start with a template, then let automation do the heavy lifting.
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <PrimaryButton href="/templates">Start building</PrimaryButton>
                <SecondaryButton href="/pricing">See pricing</SecondaryButton>
              </div>
            </div>
          </div>

          <div className="mt-10 flex items-center justify-center text-[11px] text-white/35">
            Flagship v1 • BUILD_STAMP: {build.stamp} • DEPLOY_ID: {build.deployId}
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 bg-black">
        <div className="mx-auto max-w-6xl px-6 sm:px-8 py-10">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm font-medium">Dominat8</div>
            <div className="text-xs text-white/45">© {new Date().getFullYear()} Dominat8.com • Built on Vercel</div>
          </div>
          <div className="mt-4 flex flex-wrap gap-3 text-xs text-white/55">
            <a className="underline-offset-4 hover:underline" href="/pricing">Pricing</a>
            <a className="underline-offset-4 hover:underline" href="/templates">Templates</a>
            <a className="underline-offset-4 hover:underline" href="/use-cases">Use cases</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
