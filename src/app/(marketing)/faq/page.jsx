import { PageHeader, FAQAccordion, LogoCloud } from "../../../components/marketing/MarketingShell";

export default function FaqPage() {
  const items = [
    {
      q: "Why did changes not show earlier?",
      a: "Because builds were failing. Vercel correctly pins the last green deployment. Now we only push when builds are green."
    },
    {
      q: "Why are we using .jsx instead of .tsx?",
      a: "To avoid TSX/JSX parsing landmines and keep the system reliably deployable. We can reintroduce TypeScript later."
    },
    {
      q: "What does Dominat8 actually do?",
      a: "It turns a brief into a full website spec, then runs agents to generate pages, apply SEO, produce sitemap/robots, and publish artifacts."
    },
    {
      q: "How do I know production updated?",
      a: "Open /__status and compare the marker. If it changed, production changed."
    }
  ];

  return (
    <main>
      <PageHeader
        eyebrow="FAQ"
        title="Clear answers, no guesswork"
        subtitle="The fastest way to stay sane: markers + build-gated shipping."
        rightSlot={
          <a className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800 shadow-sm" href="/__status">
            Check status
          </a>
        }
      />

      <LogoCloud label="Designed for calm shipping" />

      <div className="mx-auto max-w-6xl px-6 pb-16">
        <div className="rounded-3xl bg-white/85 p-8 ring-1 ring-slate-200 shadow-sm">
          <FAQAccordion items={items} />
        </div>
      </div>
    </main>
  );
}
