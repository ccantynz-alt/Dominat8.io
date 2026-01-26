import Link from "next/link";

const MARKER = "PRICING_20260126_BUNDLE2";

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-sm text-white/70 hover:text-white transition">← Back</Link>
          <div className="text-xs text-white/40">{MARKER}</div>
        </div>

        <div className="mt-10 grid gap-10 lg:grid-cols-12 lg:items-start">
          <div className="lg:col-span-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs tracking-[0.22em] uppercase text-white/80">
              Pricing
            </div>
            <h1 className="mt-5 text-4xl sm:text-5xl font-semibold tracking-[-0.04em] leading-[1.05]">
              Turn the builder into a product.
            </h1>
            <p className="mt-4 text-white/65 leading-relaxed max-w-xl">
              Start free. Upgrade when you want custom domains, advanced automation, and priority generation.
            </p>

            <div className="mt-7 rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="text-xs uppercase tracking-[0.22em] text-white/60">What buyers want</div>
              <div className="mt-3 grid gap-2 text-white/75">
                <div>✓ A premium site that feels expensive</div>
                <div>✓ A clear upgrade path</div>
                <div>✓ Proof that the system is real</div>
                <div>✓ Fast publish to a real domain</div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <PlanCard
                name="Free"
                price="$0"
                subtitle="Build & preview"
                bullets={[
                  "Generate homepage baseline",
                  "Preview the pipeline experience",
                  "Basic SEO scaffolding",
                ]}
                cta="Start free"
                href="/"
              />

              <PlanCard
                name="Pro"
                price="$29"
                subtitle="Publish & monetize"
                bullets={[
                  "Custom domain + publish flow",
                  "Advanced SEO automation",
                  "Priority generation queue",
                  "Conversion sections + upgrades",
                ]}
                cta="Upgrade to Pro"
                href="/thanks"
                highlight
              />
            </div>

            <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="text-xs uppercase tracking-[0.22em] text-white/60">FAQ</div>
              <div className="mt-4 grid gap-4">
                <FAQ q="Is Pro real billing yet?" a="Not wired in this bundle. This page is the conversion scaffolding. Next bundle: Stripe checkout + gating." />
                <FAQ q="Can I cancel anytime?" a="Yes — once billing is live, this will be standard subscription cancel-anytime." />
                <FAQ q="Why does this convert better?" a="Because it completes the story: proof → pricing → decision → next step." />
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <Link href="/" className="rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold hover:bg-white/10 transition">
                Back to home
              </Link>
              <Link href="/thanks" className="rounded-xl bg-white text-black px-5 py-3 text-sm font-semibold hover:opacity-95 transition">
                Continue
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-10 text-xs text-white/35">
          Marker: {MARKER}
        </div>
      </div>
    </div>
  );
}

function PlanCard({
  name,
  price,
  subtitle,
  bullets,
  cta,
  href,
  highlight,
}: {
  name: string;
  price: string;
  subtitle: string;
  bullets: string[];
  cta: string;
  href: string;
  highlight?: boolean;
}) {
  return (
    <div className={[
      "rounded-2xl border bg-white/5 p-6",
      highlight ? "border-white/25 shadow-[0_20px_80px_rgba(255,255,255,0.06)]" : "border-white/10"
    ].join(" ")}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold">{name}</div>
          <div className="mt-1 text-sm text-white/60">{subtitle}</div>
        </div>
        {highlight && (
          <span className="text-xs rounded-full border border-white/15 bg-white/10 px-3 py-1 text-white/80">
            Recommended
          </span>
        )}
      </div>

      <div className="mt-5 flex items-end justify-between">
        <div className="text-3xl font-semibold tracking-[-0.03em]">{price}</div>
        <div className="text-xs text-white/45">/mo (example)</div>
      </div>

      <div className="mt-5 h-px w-full bg-white/10" />

      <ul className="mt-5 grid gap-2 text-sm text-white/70">
        {bullets.map((b, i) => (
          <li key={i}>✓ {b}</li>
        ))}
      </ul>

      <Link
        href={href}
        className={[
          "mt-6 inline-flex w-full items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold transition active:scale-[0.99]",
          highlight ? "bg-white text-black hover:opacity-95" : "border border-white/15 bg-white/5 hover:bg-white/10"
        ].join(" ")}
      >
        {cta}
      </Link>
    </div>
  );
}

function FAQ({ q, a }: { q: string; a: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/30 p-4">
      <div className="text-sm font-semibold">{q}</div>
      <div className="mt-2 text-sm text-white/65 leading-relaxed">{a}</div>
    </div>
  );
}