import { PageHeader, SectionHeader, LogoCloud, FAQAccordion } from "../../../components/marketing/MarketingShell";

function PriceCard({ name, price, note, bullets, primary, ctaText, ctaHref, badge }) {
  return (
    <div className={primary ? "rounded-3xl bg-slate-900 p-6 text-white shadow-sm" : "rounded-3xl bg-white/90 p-6 ring-1 ring-slate-200 shadow-sm"}>
      {badge ? (
        <div className={primary ? "inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-xs text-white/80 ring-1 ring-white/15" : "inline-flex items-center rounded-full bg-slate-900 px-3 py-1 text-xs text-white ring-1 ring-slate-900"}>
          {badge}
        </div>
      ) : null}

      <div className={primary ? "mt-3 text-xs text-white/70" : "mt-3 text-xs text-slate-500"}>{name}</div>
      <div className={primary ? "mt-2 text-3xl font-semibold" : "mt-2 text-3xl font-semibold text-slate-950"}>{price}</div>
      <div className={primary ? "mt-2 text-sm text-white/75" : "mt-2 text-sm text-slate-700"}>{note}</div>

      <ul className={primary ? "mt-5 space-y-2 text-sm text-white/80" : "mt-5 space-y-2 text-sm text-slate-700"}>
        {bullets.map((b) => <li key={b}>• {b}</li>)}
      </ul>

      <a
        className={primary
          ? "mt-6 inline-flex w-full justify-center rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-900 hover:bg-white/90"
          : "mt-6 inline-flex w-full justify-center rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800"}
        href={ctaHref}
      >
        {ctaText}
      </a>
    </div>
  );
}

export default function PricingPage() {
  const faq = [
    { q: "Do I need to be a designer?", a: "No. The system uses proven layout rhythm and spacing so your site looks premium by default." },
    { q: "How do I know production updated?", a: "Open /__status and compare the marker. If it changed, production changed." },
    { q: "Why do we build-gate upgrades?", a: "So you never lose time to silent deploy pins. Green builds only = shipping confidence." },
    { q: "Can I map my domain?", a: "Yes — the platform is designed to publish and map to your domain when ready." }
  ];

  return (
    <main>
      <PageHeader
        eyebrow="Pricing"
        title="Simple pricing, premium output"
        subtitle="Start free. Upgrade when you want full automation and faster publishing. Clear tiers, no confusion."
        rightSlot={
          <a className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800 shadow-sm" href="/p/new">
            Generate my site
          </a>
        }
      />

      <LogoCloud label="Trusted premium SaaS rhythm" />

      <div className="mx-auto max-w-6xl px-6 pb-12">
        <div className="grid gap-5 md:grid-cols-3">
          <PriceCard
            name="Free"
            price="$0"
            note="Perfect to test the pipeline."
            bullets={["Generate a site spec", "Preview marketing pages", "Basic publish flow"]}
            ctaText="Start free"
            ctaHref="/p/new"
          />

          <PriceCard
            name="Pro"
            price="$29"
            note="Ship faster with full automation."
            bullets={["Auto-run pipeline", "SEO plan + sitemap", "Publish artifacts"]}
            primary
            badge="Most popular"
            ctaText="Go Pro"
            ctaHref="/p/new"
          />

          <PriceCard
            name="Business"
            price="$99"
            note="For teams & higher volume."
            bullets={["Multiple sites", "Priority pipeline", "Advanced controls"]}
            ctaText="Talk to us"
            ctaHref="/contact"
          />
        </div>
      </div>

      <div className="pb-12">
        <SectionHeader
          eyebrow="Included"
          title="What you’re really paying for"
          subtitle="A pipeline that stays consistent, builds cleanly, and publishes confidently."
          linkText="Explore templates"
          linkHref="/templates"
        />
        <div className="mx-auto max-w-6xl px-6 pt-8">
          <div className="rounded-3xl bg-white/85 p-8 ring-1 ring-slate-200 shadow-sm">
            <div className="grid gap-5 md:grid-cols-3">
              <div className="rounded-2xl bg-white p-6 ring-1 ring-slate-200">
                <div className="text-sm font-semibold text-slate-950">Premium structure</div>
                <div className="mt-2 text-sm text-slate-700">Hero rhythm, trust strip, features, proof, CTA ladder.</div>
              </div>
              <div className="rounded-2xl bg-white p-6 ring-1 ring-slate-200">
                <div className="text-sm font-semibold text-slate-950">SEO included</div>
                <div className="mt-2 text-sm text-slate-700">Titles, metas, schema, sitemap/robots — built into the flow.</div>
              </div>
              <div className="rounded-2xl bg-white p-6 ring-1 ring-slate-200">
                <div className="text-sm font-semibold text-slate-950">Build-gated shipping</div>
                <div className="mt-2 text-sm text-slate-700">No more “did it deploy?” — green builds only.</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 pb-16">
        <div className="rounded-3xl bg-white/85 p-8 ring-1 ring-slate-200 shadow-sm">
          <div className="text-xs font-semibold text-slate-600">FAQ</div>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 md:text-3xl">
            Clear answers
          </h2>
          <div className="mt-6">
            <FAQAccordion items={faq} />
          </div>
        </div>
      </div>
    </main>
  );
}
