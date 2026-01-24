import MarketingCTA from "@/src/components/marketing/MarketingCTA";

function PriceCard({
  name,
  price,
  desc,
  bullets,
  cta,
  emphasis,
}: {
  name: string;
  price: string;
  desc: string;
  bullets: string[];
  cta: string;
  emphasis?: boolean;
}) {
  return (
    <div className={"rounded-3xl border bg-white p-7 shadow-sm " + (emphasis ? "ring-2 ring-black" : "")}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm font-semibold">{name}</div>
          <div className="mt-2 text-4xl font-semibold tracking-tight">{price}</div>
        </div>
        {emphasis ? (
          <div className="rounded-full bg-black px-3 py-1 text-xs font-medium text-white">Recommended</div>
        ) : null}
      </div>
      <p className="mt-3 text-sm leading-6 opacity-80">{desc}</p>
      <ul className="mt-5 space-y-2 text-sm">
        {bullets.map((b) => (
          <li key={b} className="flex gap-2">
            <span className="mt-[6px] inline-block h-2 w-2 shrink-0 rounded-full bg-black" />
            <span className="opacity-90">{b}</span>
          </li>
        ))}
      </ul>
      <a
        href="/templates"
        className={"mt-6 inline-flex w-full items-center justify-center rounded-2xl px-4 py-3 text-sm font-medium " + (emphasis ? "bg-black text-white" : "border")}
      >
        {cta}
      </a>
    </div>
  );
}

export default function PricingPage() {
  return (
    <div className="space-y-10">
      <section className="rounded-3xl border bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-semibold tracking-tight">Pricing</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 opacity-80">
          Simple tiers for a fast build loop. This is a baseline — wire Stripe plan gating next.
        </p>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <PriceCard
          name="Free"
          price="$0"
          desc="Perfect for exploring templates and generating drafts."
          bullets={["Template browsing", "Draft generation baseline", "Proof endpoints for deploy checks"]}
          cta="Start free"
        />
        <PriceCard
          name="Pro"
          price="$29"
          desc="For shipping real sites with faster iteration and better polish."
          bullets={["More generation runs", "Priority pipeline", "Advanced SEO steps (next upgrade)"]}
          cta="Go Pro"
          emphasis
        />
        <PriceCard
          name="Agency"
          price="Custom"
          desc="Multiple clients, domains, and workflows."
          bullets={["Multi-project management", "Custom domain flows", "SLA + support"]}
          cta="Talk to us"
        />
      </section>

      <MarketingCTA title="Ready to ship?" subtitle="Pick a template and start iterating with the boom loop." />
    </div>
  );
}