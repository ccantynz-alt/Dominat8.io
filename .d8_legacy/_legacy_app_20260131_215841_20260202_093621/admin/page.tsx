import Link from "next/link";

function Card(props: { title: string; desc: string; href: string; cta: string }) {
  return (
    <Link href={props.href} className="block rounded-3xl border border-white/10 bg-black/30 p-6 hover:bg-white/5 transition">
      <div className="text-lg font-semibold tracking-tight">{props.title}</div>
      <div className="mt-2 text-sm text-white/60">{props.desc}</div>
      <div className="mt-5 inline-flex items-center rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs hover:bg-white/10">
        {props.cta} →
      </div>
    </Link>
  );
}

export default function AdminDashboard() {
  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-white/10 bg-black/30 p-8">
        <div className="text-xs font-semibold tracking-wide text-white/60">ADMIN DASHBOARD</div>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">
          Your website factory is almost done.
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-white/60">
          This console is the “finished product” surface area. Keep the UI stable and iterate by shipping small patches.
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="text-[11px] text-white/50">Status</div>
            <div className="mt-1 text-sm font-semibold">Admin UI baseline</div>
            <div className="mt-2 text-[11px] text-emerald-300/80">GREEN</div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="text-[11px] text-white/50">Next move</div>
            <div className="mt-1 text-sm font-semibold">Wire real data</div>
            <div className="mt-2 text-[11px] text-white/60">Projects / Runs / Domains</div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="text-[11px] text-white/50">Rule</div>
            <div className="mt-1 text-sm font-semibold">No refactors</div>
            <div className="mt-2 text-[11px] text-white/60">Ship small polish fast</div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card
          title="Projects"
          desc="Manage generated sites, publish, and view status."
          href="/admin/projects"
          cta="Open Projects"
        />
        <Card
          title="Agents"
          desc="Run strict bundles and apply safe patches."
          href="/admin/agents"
          cta="Open Agents"
        />
        <Card
          title="Domains"
          desc="Custom domain status + verification checklist."
          href="/admin/domains"
          cta="Open Domains"
        />
        <Card
          title="Billing"
          desc="Plans and Stripe integration surface."
          href="/admin/billing"
          cta="Open Billing"
        />
      </div>

      <div className="rounded-3xl border border-white/10 bg-black/30 p-6">
        <div className="text-sm font-semibold">Finish checklist (admin)</div>
        <ul className="mt-3 space-y-2 text-sm text-white/60 list-disc pl-5">
          <li>Projects list loads real items (KV-backed).</li>
          <li>Agents page links to bundle UI + last run status.</li>
          <li>Domains page has a step-by-step verification checklist.</li>
          <li>Billing page has plan status + “Manage subscription”.</li>
        </ul>
      </div>
    </div>
  );
}