import { BUILD_MARKER } from "../../lib/buildMarker";

export default function StatusPage() {
  const nowIso = new Date().toISOString();

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <div className="mx-auto max-w-3xl px-6 py-12">
        <div className="rounded-3xl bg-white p-8 ring-1 ring-slate-200 shadow-sm">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-xs text-emerald-700 ring-1 ring-emerald-200">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            PROD / DEPLOY PROOF PAGE
          </div>

          <h1 className="mt-5 text-3xl font-semibold tracking-tight text-slate-950">
            Dominat8 Status
          </h1>

          <p className="mt-3 text-sm text-slate-700">
            If the homepage ever looks “cached”, compare this marker to your latest commit run.
          </p>

          <div className="mt-6 space-y-3 text-sm">
            <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
              <div className="text-xs font-semibold text-slate-600">BUILD MARKER</div>
              <div className="mt-1 font-mono text-slate-950 break-all">{BUILD_MARKER}</div>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
              <div className="text-xs font-semibold text-slate-600">PAGE RENDER TIME (client)</div>
              <div className="mt-1 font-mono text-slate-900">{nowIso}</div>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href="/"
              className="rounded-2xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800 shadow-sm text-center"
            >
              Back to homepage
            </a>
            <a
              href="/pricing"
              className="rounded-2xl bg-white px-6 py-3 text-sm font-semibold text-slate-900 ring-1 ring-slate-200 hover:bg-slate-50 shadow-sm text-center"
            >
              Pricing
            </a>
          </div>
        </div>

        <div className="mt-6 text-xs text-slate-500">
          Tip: After a push, refresh <span className="font-mono text-slate-700">/__status</span> first.
          If the marker updated, prod is updated.
        </div>
      </div>
    </main>
  );
}
