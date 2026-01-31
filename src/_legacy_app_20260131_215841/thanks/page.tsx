import Link from "next/link";

const MARKER = "THANKS_20260126_BUNDLE2";

export default function ThanksPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-3xl px-4 py-14">
        <div className="text-xs text-white/40">{MARKER}</div>

        <h1 className="mt-6 text-4xl font-semibold tracking-[-0.04em]">
          You’re on the path.
        </h1>
        <p className="mt-4 text-white/70 leading-relaxed">
          This page completes the conversion flow visually. Next bundle wires real checkout + plan gating.
        </p>

        <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-6">
          <div className="text-xs uppercase tracking-[0.22em] text-white/60">Next upgrades</div>
          <div className="mt-3 grid gap-2 text-white/75">
            <div>1) Stripe checkout</div>
            <div>2) Pro gating (publish/custom domain)</div>
            <div>3) Post-checkout success handling</div>
            <div>4) Conversion analytics</div>
          </div>
        </div>

        <div className="mt-8 flex gap-3">
          <Link href="/" className="rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold hover:bg-white/10 transition">
            Home
          </Link>
          <Link href="/pricing" className="rounded-xl bg-white text-black px-5 py-3 text-sm font-semibold hover:opacity-95 transition">
            Back to pricing
          </Link>
        </div>
      </div>
    </div>
  );
}