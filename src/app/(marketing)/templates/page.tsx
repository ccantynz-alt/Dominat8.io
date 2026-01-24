import MarketingCTA from "@/src/components/marketing/MarketingCTA";

const templates = [
  { name: "AI SaaS Website", desc: "Clean SaaS landing, features, pricing, FAQs, and a strong CTA." },
  { name: "Local Service", desc: "Book calls, show service areas, testimonials, and conversion-first layout." },
  { name: "Portfolio", desc: "Case studies, about, contact, and a minimalist hero." },
  { name: "E-commerce Starter", desc: "Simple product highlights, benefits, and trust building." },
  { name: "Creator / Newsletter", desc: "Subscribe-first layout with social proof and content blocks." },
  { name: "Consulting", desc: "Authority-driven page with offers, outcomes, and booking CTA." },
];

export default function TemplatesPage() {
  return (
    <div className="space-y-10">
      <section className="rounded-3xl border bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-semibold tracking-tight">Templates</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 opacity-80">
          Start from a strong baseline. Next upgrade can wire this to your KV catalog and agent-generated specs.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {templates.map((t) => (
          <div key={t.name} className="rounded-3xl border bg-white p-6 shadow-sm">
            <div className="text-sm font-semibold">{t.name}</div>
            <p className="mt-2 text-sm leading-6 opacity-80">{t.desc}</p>
            <a href="/pricing" className="mt-4 inline-flex rounded-xl border px-4 py-2 text-sm font-medium">
              Use this template →
            </a>
          </div>
        ))}
      </section>

      <MarketingCTA />
    </div>
  );
}