import { PageHeader, CardGrid, Card, LogoCloud } from "../../../components/marketing/MarketingShell";

export default function UseCasesPage() {
  return (
    <main>
      <PageHeader
        eyebrow="Use cases"
        title="Built for people who need premium fast"
        subtitle="If you need a website that looks expensive, ships fast, and stays consistent — this is for you."
        rightSlot={
          <a className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800 shadow-sm" href="/templates">
            Explore templates
          </a>
        }
      />

      <LogoCloud label="Trusted rhythm across pages" />

      <CardGrid>
        <Card
          title="Founders launching fast"
          desc="Generate a real marketing site in minutes, not weeks. Iterate without breaking your build."
          href="/pricing"
          meta="Startup"
        />
        <Card
          title="Agencies & freelancers"
          desc="Deliver faster with a pipeline you can control. Keep every client site consistent."
          href="/pricing"
          meta="Production"
        />
        <Card
          title="Local businesses"
          desc="High trust pages, clean design, and clear CTAs — ready to publish on your domain."
          href="/contact"
          meta="Trust"
        />
      </CardGrid>
    </main>
  );
}
