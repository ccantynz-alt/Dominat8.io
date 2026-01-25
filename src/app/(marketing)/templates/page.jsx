import { PageHeader, SectionHeader, TemplateGalleryCard, LogoCloud } from "../../../components/marketing/MarketingShell";

export default function TemplatesPage() {
  return (
    <main>
      <PageHeader
        eyebrow="Templates"
        title="Premium templates, ready to ship"
        subtitle="Pick a direction. The system generates a complete site from your brief — then polishes it into something that looks expensive."
        rightSlot={
          <a className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800 shadow-sm" href="/p/new">
            Start generating
          </a>
        }
      />

      <LogoCloud label="Designed for conversion rhythm" />

      <SectionHeader
        eyebrow="Gallery"
        title="Choose a starting point"
        subtitle="These are structured patterns. Your content and branding makes it yours."
        linkText="See pricing"
        linkHref="/pricing"
      />

      <div className="mx-auto max-w-6xl px-6 pt-8 pb-14">
        <div className="grid gap-5 md:grid-cols-3">
          <TemplateGalleryCard
            tag="Default"
            title="AI SaaS Website"
            desc="Clean SaaS layout: hero, proof, features, pricing, FAQ, CTA."
            href="/p/new"
          />
          <TemplateGalleryCard
            tag="High trust"
            title="Local Service"
            desc="Trust-first layout: outcomes, testimonials, areas served, contact."
            href="/p/new"
          />
          <TemplateGalleryCard
            tag="Showcase"
            title="Creator / Portfolio"
            desc="Highlights, case studies, gallery, and social proof."
            href="/p/new"
          />
          <TemplateGalleryCard
            tag="Commerce"
            title="Product Landing"
            desc="Feature-led layout: benefits, comparison, proof, FAQ, CTA."
            href="/p/new"
          />
          <TemplateGalleryCard
            tag="B2B"
            title="Agency"
            desc="Services, proof, process, packages, and contact."
            href="/p/new"
          />
          <TemplateGalleryCard
            tag="Launch"
            title="Coming Soon"
            desc="Waitlist-first: clarity, benefits, trust, and CTA."
            href="/p/new"
          />
        </div>
      </div>
    </main>
  );
}
