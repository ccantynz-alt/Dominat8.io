"use client";

/**
 * Dominat8 — Pricing Page v2
 * Marker: PRICING_V2
 *
 * UI-only: no Stripe, no auth, no plan gating in this bundle.
 */

import * as React from "react";
import Link from "next/link";
import { PricingCompare } from "@/components/marketing/PricingCompare";
import { PricingFAQ } from "@/components/marketing/PricingFAQ";

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      {/* Background */}
      <div className="pointer-events-none fixed inset-0 -z-10 opacity-90">
        <div className="absolute inset-0 bg-[radial-gradient(1200px_700px_at_20%_-10%,rgba(255,255,255,0.10),transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(1000px_600px_at_80%_0%,rgba(255,255,255,0.08),transparent_60%)]" />
        <div className="absolute inset-0 opacity-70 [background-image:linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:72px_72px]" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-black/40 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl border border-white/10 bg-white/[0.06]" />
            <div className="leading-tight">
              <div className="text-sm font-semibold tracking-tight">Dominat8</div>
              <div className="text-xs text-white/60">Pricing v2</div>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <Link
              href="/gallery"
              className="rounded-xl border border-white/10 bg-white/[0.05] px-3 py-2 text-sm text-white/80 hover:border-white/20 hover:bg-white/[0.08]"
            >
              Gallery
            </Link>
            <Link
              href="/app"
              className="rounded-xl bg-white px-3 py-2 text-sm font-semibold text-black hover:-translate-y-0.5 hover:shadow-[0_16px_40px_rgba(0,0,0,0.45)] active:translate-y-0"
            >
              Launch builder
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto w-full max-w-6xl px-4 pb-6 pt-10 md:pb-10 md:pt-14">
        <div className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs font-semibold tracking-wide text-white/80">
          PRICING • <span className="ml-1 font-mono text-white/70">PRICING_V2</span>
        </div>

        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white md:text-5xl">
          Simple plans. Serious results.
        </h1>

        <p className="mt-3 max-w-2xl text-sm text-white/70 md:text-base">
          This page is intentionally UI-only for now — no billing wiring in this bundle. We’re keeping production stable while we sharpen conversion.
        </p>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <Link
            href="/app"
            className="inline-flex items-center justify-center rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-black transition-all hover:-translate-y-0.5 hover:shadow-[0_18px_60px_rgba(0,0,0,0.55)] active:translate-y-0"
          >
            Start building →
          </Link>
          <Link
            href="/gallery"
            className="inline-flex items-center justify-center rounded-2xl border border-white/15 bg-white/[0.06] px-5 py-3 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:border-white/25 hover:bg-white/[0.10] active:translate-y-0"
          >
            Explore templates
          </Link>
          <div className="text-xs text-white/55">
            Marker: <span className="font-mono text-white/80">PRICING_V2</span>
          </div>
        </div>
      </section>

      <PricingCompare />
      <PricingFAQ />

      {/* Footer CTA */}
      <section className="mx-auto w-full max-w-6xl px-4 pb-16 pt-14">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.03)] backdrop-blur-md md:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-xs font-semibold tracking-wide text-white/70">READY TO SHIP?</div>
              <div className="mt-2 text-2xl font-semibold tracking-tight text-white md:text-3xl">
                Upgrade to publishing when Pro goes live.
              </div>
              <div className="mt-2 max-w-2xl text-sm text-white/70 md:text-base">
                Next up: publish proof endpoints + domain wizard v1 — the money feature.
              </div>
              <div className="mt-3 text-xs text-white/60">
                Marker: <span className="font-mono text-white/80">PRICING_V2</span>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/app"
                className="inline-flex items-center justify-center rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-black transition-all hover:-translate-y-0.5 hover:shadow-[0_18px_60px_rgba(0,0,0,0.55)] active:translate-y-0"
              >
                Launch builder →
              </Link>
              <Link
                href="/gallery"
                className="inline-flex items-center justify-center rounded-2xl border border-white/15 bg-white/[0.06] px-5 py-3 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:border-white/25 hover:bg-white/[0.10] active:translate-y-0"
              >
                Explore templates
              </Link>
            </div>
          </div>
        </div>

        <div className="pt-10 text-center text-[11px] text-white/40">
          PRICING_V2
        </div>
      </section>
    </main>
  );
}