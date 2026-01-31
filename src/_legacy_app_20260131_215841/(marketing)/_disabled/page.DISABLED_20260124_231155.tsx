{/* ==========================================================
   DISABLED FILE
   Reason: src/app/(marketing)/page.tsx shadows '/' and breaks Vercel trace.
   Keep this for history only. Do NOT restore unless you remove src/app/page.tsx.
   ========================================================== */}
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BUILD_STAMP = "BUILD_20260124_213310";
const DEPLOY_ID = "93580b84922c";

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white">
      {/* BIG VISIBLE DEPLOY PROBE (cannot miss) */}
      <div className="fixed left-4 top-4 z-[9999] rounded-2xl border border-white/20 bg-black/80 px-4 py-3 text-left shadow-sm">
        <div className="text-xs uppercase tracking-[0.28em] text-white/80">LIVE_OK</div>
        <div className="mt-1 text-sm font-semibold text-white">DEPLOY_ID: {DEPLOY_ID}</div>
        <div className="text-sm font-semibold text-white">BUILD_STAMP: {BUILD_STAMP}</div>
        <div className="mt-1 text-xs text-white/55">If you don’t see this box, you are NOT on the deployed route.</div>
      </div>

      {/* HERO = ENTIRE VIEWPORT */}
      <section className="relative flex min-h-[100svh] w-screen items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-black via-black to-black" />
          <div className="absolute inset-0 [background-image:radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.08)_1px,transparent_0)] [background-size:22px_22px] opacity-60" />
          <div className="absolute left-1/2 top-1/2 h-[900px] w-[1400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/15 blur-3xl opacity-55" />
        </div>

        <div className="relative mx-auto w-full px-8">
          <div className="mx-auto max-w-5xl text-center">
            <div className="mb-4 text-xs uppercase tracking-[0.28em] text-white/60">
              Dominat8 — Production Deploy Probe
            </div>

            <h1 className="text-[clamp(3.4rem,7vw,6.6rem)] font-semibold leading-[1.02] tracking-tight text-white">
              Full-screen hero.
              <span className="block text-white/80">Entire viewport.</span>
              <span className="block">No doubt.</span>
            </h1>

            <p className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-white/70">
              This page is intentionally extreme. If production updated, you will see the fixed LIVE_OK box and this hero fills the screen.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <a
                href="/app"
                className="inline-flex items-center justify-center rounded-full bg-white px-8 py-4 text-sm font-semibold text-black hover:bg-white/90"
              >
                Start building
              </a>
              <a
                href="/pricing"
                className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/[0.06] px-8 py-4 text-sm font-semibold text-white hover:bg-white/[0.12]"
              >
                View pricing
              </a>
            </div>

            <div className="mt-10 text-xs text-white/45">HOME_OK</div>
          </div>
        </div>
      </section>
    </main>
  );
}

