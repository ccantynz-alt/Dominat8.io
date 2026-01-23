// app/p/_components/PublishedTemplate.tsx
// TypeScript-safe published template renderer with strong fallbacks.
// This file is intentionally defensive: published pages should NEVER fail because optional
// pricing config is missing.

type PricingPlan = {
  name: string;
  price: string;
  bullets?: string[];
  cta?: { label: string; href: string };
};

type PublishedTemplateProps = {
  // In your app, this is typically the fully merged published spec/template.
  // We keep it flexible (optional + unknown fields) so builds never fail.
  merged?: any;

  // Allow any other props passed by callers without typing explosions.
  [key: string]: any;
};

function normalizePlan(plan: any, fallback: PricingPlan): PricingPlan {
  if (!plan || typeof plan !== "object") return fallback;

  const name = typeof plan.name === "string" && plan.name.trim() ? plan.name : fallback.name;
  const price = typeof plan.price === "string" && plan.price.trim() ? plan.price : fallback.price;

  const bulletsRaw = plan.bullets;
  const bullets =
    Array.isArray(bulletsRaw) ? bulletsRaw.filter((x) => typeof x === "string") : fallback.bullets ?? [];

  const ctaRaw = plan.cta;
  const cta =
    ctaRaw && typeof ctaRaw === "object"
      ? {
          label: typeof ctaRaw.label === "string" && ctaRaw.label.trim() ? ctaRaw.label : fallback.cta?.label ?? "Get Started",
          href: typeof ctaRaw.href === "string" && ctaRaw.href.trim() ? ctaRaw.href : fallback.cta?.href ?? "/sign-up",
        }
      : fallback.cta;

  return { name, price, bullets, cta };
}

export default function PublishedTemplate(props: PublishedTemplateProps) {
  const merged = props?.merged ?? {};

  // Strong fallbacks so TS + runtime are safe
  const freeFallback: PricingPlan = {
    name: "Free",
    price: "$0",
    bullets: [],
    cta: { label: "Start Free", href: "/sign-up" },
  };

  const proFallback: PricingPlan = {
    name: "Pro",
    price: "$19/mo",
    bullets: [],
    cta: { label: "Go Pro", href: "/upgrade" },
  };

  const pricing = merged?.pricing ?? {};
  const free = normalizePlan(pricing?.free, freeFallback);
  const pro = normalizePlan(pricing?.pro, proFallback);

  const brandName =
    typeof merged?.brand?.name === "string" && merged.brand.name.trim() ? merged.brand.name : "my-saas-app";

  const headline =
    typeof merged?.hero?.headline === "string" && merged.hero.headline.trim()
      ? merged.hero.headline
      : "Your AI-generated website is live";

  const subheadline =
    typeof merged?.hero?.subheadline === "string" && merged.hero.subheadline.trim()
      ? merged.hero.subheadline
      : "This is a published preview. Pricing and content may vary by template/spec.";

  // Minimal, safe rendering that won’t break builds if optional pieces are missing.
  return (
    <main className="min-h-screen bg-black text-white">
      {/* HERO */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="flex items-center justify-between gap-6">
          <div className="text-sm tracking-wide text-white/70">{brandName}</div>
          <a
            href="/projects"
            className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-white/90 hover:bg-white/10"
          >
            Back to projects
          </a>
        </div>

        <h1 className="mt-10 text-4xl font-semibold leading-tight md:text-6xl">{headline}</h1>
        <p className="mt-4 max-w-2xl text-lg text-white/70">{subheadline}</p>
      </section>

      {/* PRICING */}
      <section className="mx-auto max-w-6xl px-6 pb-20">
        <div className="grid gap-6 md:grid-cols-2">
          {/* FREE CARD */}
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
            <div className="flex items-center justify-between">
              <div className="text-lg font-semibold">{free.name}</div>
              <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-white/80">
                Starter
              </span>
            </div>

            <div className="mt-4 text-3xl font-bold">{free.price}</div>

            {free.bullets && free.bullets.length > 0 ? (
              <ul className="mt-6 space-y-2 text-white/75">
                {free.bullets.map((b, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-white/60" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-6 text-white/60">A simple starting plan for getting online fast.</p>
            )}

            <div className="mt-8">
              <a
                href={free.cta?.href ?? "/sign-up"}
                className="inline-flex w-full items-center justify-center rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-black hover:bg-white/90"
              >
                {free.cta?.label ?? "Start Free"}
              </a>
            </div>
          </div>

          {/* PRO CARD */}
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
            <div className="flex items-center justify-between">
              <div className="text-lg font-semibold">{pro.name}</div>
              <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-white/80">
                Recommended
              </span>
            </div>

            <div className="mt-4 text-3xl font-bold">{pro.price}</div>

            {pro.bullets && pro.bullets.length > 0 ? (
              <ul className="mt-6 space-y-2 text-white/75">
                {pro.bullets.map((b, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-white/60" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-6 text-white/60">Upgrade for more features, faster workflows, and higher limits.</p>
            )}

            <div className="mt-8">
              <a
                href={pro.cta?.href ?? "/upgrade"}
                className="inline-flex w-full items-center justify-center rounded-2xl border border-white/15 bg-white/10 px-5 py-3 text-sm font-semibold text-white hover:bg-white/15"
              >
                {pro.cta?.label ?? "Go Pro"}
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

