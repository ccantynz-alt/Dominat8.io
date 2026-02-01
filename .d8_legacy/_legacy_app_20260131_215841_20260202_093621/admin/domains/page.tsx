export default function AdminDomains() {
  return (
    <div className="space-y-6">
      <div>
        <div className="text-xs font-semibold tracking-wide text-white/60">DOMAINS</div>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">Domains</h1>
        <p className="mt-2 text-sm text-white/60">
          This page should become a step-by-step checklist (TXT/CNAME verify → SSL → ready).
        </p>
      </div>

      <div className="rounded-3xl border border-white/10 bg-black/30 p-6">
        <div className="text-sm font-semibold">Domain checklist (UI baseline)</div>
        <ol className="mt-3 space-y-2 text-sm text-white/60 list-decimal pl-5">
          <li>Enter domain</li>
          <li>Show required DNS records</li>
          <li>Poll verification</li>
          <li>Provision SSL</li>
          <li>Mark ready + show “Open site”</li>
        </ol>
      </div>
    </div>
  );
}