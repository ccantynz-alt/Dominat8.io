export default function AdminBilling() {
  return (
    <div className="space-y-6">
      <div>
        <div className="text-xs font-semibold tracking-wide text-white/60">BILLING</div>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">Billing</h1>
        <p className="mt-2 text-sm text-white/60">
          This page becomes: plan status + upgrade + manage subscription.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-3xl border border-white/10 bg-black/30 p-6">
          <div className="text-sm font-semibold">Plan</div>
          <div className="mt-2 text-sm text-white/60">Connect to your existing Stripe/Pro gating keys.</div>
          <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="text-[11px] text-white/50">Current</div>
            <div className="mt-1 text-sm font-semibold">Free (placeholder)</div>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-black/30 p-6">
          <div className="text-sm font-semibold">Actions</div>
          <ul className="mt-3 space-y-2 text-sm text-white/60 list-disc pl-5">
            <li>Upgrade to Pro</li>
            <li>Manage subscription</li>
            <li>View invoices</li>
          </ul>
        </div>
      </div>
    </div>
  );
}