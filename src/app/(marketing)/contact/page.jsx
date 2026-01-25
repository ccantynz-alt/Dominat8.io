import { PageHeader, LogoCloud } from "../../../components/marketing/MarketingShell";

export default function ContactPage() {
  return (
    <main>
      <PageHeader
        eyebrow="Contact"
        title="Talk to the team"
        subtitle="Tell us what you’re building and we’ll point you to the fastest path to a premium launch."
        rightSlot={
          <a className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800 shadow-sm" href="/p/new">
            Generate my site
          </a>
        }
      />

      <LogoCloud label="Premium support experience" />

      <div className="mx-auto max-w-6xl px-6 pb-14">
        <div className="grid gap-5 md:grid-cols-2">
          <div className="rounded-3xl bg-white/85 p-6 ring-1 ring-slate-200 shadow-sm">
            <div className="text-sm font-semibold text-slate-950">Email</div>
            <div className="mt-2 text-sm text-slate-700">support@dominat8.com (placeholder)</div>

            <div className="mt-6 text-sm font-semibold text-slate-950">Response time</div>
            <div className="mt-2 text-sm text-slate-700">We aim to reply within 24 hours.</div>
          </div>

          <div className="rounded-3xl bg-white/85 p-6 ring-1 ring-slate-200 shadow-sm">
            <div className="text-sm font-semibold text-slate-950">Quick note</div>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              This is a marketing placeholder. Next upgrade can wire a contact form endpoint if you want.
            </p>
            <a className="mt-6 inline-flex rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800 shadow-sm" href="/pricing">
              View pricing
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
