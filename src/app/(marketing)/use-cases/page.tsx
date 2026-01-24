import MarketingCTA from "@/src/components/marketing/MarketingCTA";

const cases = [
  { title: "Launch a SaaS landing page", body: "Ship a polished homepage + pricing + FAQs that converts, then iterate nightly with proof checks." },
  { title: "Local services & bookings", body: "Create a clear offer page with service areas, testimonials, and contact conversion paths." },
  { title: "Agency client sites", body: "Repeatable structure + fast generation pipeline. Hook in custom domains and billing as you scale." },
  { title: "Portfolio & personal brand", body: "Build credibility with case studies, outcomes, and a sharp CTA for leads." },
  { title: "Product validation", body: "Test positioning quickly: swap copy, reorder sections, and redeploy with confidence." },
  { title: "SEO foundation", body: "Start with safe canonical/metadata baselines, then wire in sitemap/robots/SEO plans next." },
];

export default function UseCasesPage() {
  return (
    <div className="space-y-10">
      <section className="rounded-3xl border bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-semibold tracking-tight">Use cases</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 opacity-80">
          Dominat8 is built for speed and iteration: generate → deploy → verify → improve.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cases.map((c) => (
          <div key={c.title} className="rounded-3xl border bg-white p-6 shadow-sm">
            <div className="text-sm font-semibold">{c.title}</div>
            <p className="mt-2 text-sm leading-6 opacity-80">{c.body}</p>
          </div>
        ))}
      </section>

      <MarketingCTA />
    </div>
  );
}