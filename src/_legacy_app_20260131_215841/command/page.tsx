import Link from "next/link";
import { buildStamp } from "@/lib/buildStamp";

export default function Page() {
  const stamp = buildStamp();

  return (
    <main className="min-h-screen bg-[#06070b] text-white">
      {/* Background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-32 left-1/2 h-[520px] w-[900px] -translate-x-1/2 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute left-[-160px] top-[40%] h-[520px] w-[520px] rounded-full bg-white/4 blur-3xl" />
        <div className="absolute right-[-200px] top-[18%] h-[620px] w-[620px] rounded-full bg-white/4 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(255,255,255,0.10),rgba(0,0,0,0)_60%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,0)_0%,rgba(0,0,0,0.55)_55%,rgba(0,0,0,0.9)_100%)]" />
      </div>

      {/* Header */}
      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <Link href="/" className="group inline-flex items-center gap-2">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white/8 ring-1 ring-white/10">
            <span className="text-sm font-semibold tracking-tight">D8</span>
          </span>
          <span className="text-sm font-semibold tracking-[0.12em] text-white/90 group-hover:text-white">
            DOMINAT8
          </span>
        </Link>

        <nav className="hidden items-center gap-2 sm:flex">
          <Link
            href="/pricing"
            className="rounded-xl px-3 py-2 text-sm text-white/70 hover:text-white hover:bg-white/5 ring-1 ring-transparent hover:ring-white/10"
          >
            Pricing
          </Link>
          <Link
            href="/gallery"
            className="rounded-xl px-3 py-2 text-sm text-white/70 hover:text-white hover:bg-white/5 ring-1 ring-transparent hover:ring-white/10"
          >
            Gallery
          </Link>
          <Link
            href="/templates"
            className="rounded-xl px-3 py-2 text-sm text-white/70 hover:text-white hover:bg-white/5 ring-1 ring-transparent hover:ring-white/10"
          >
            Templates
          </Link>
          <Link
            href="/projects"
            className="rounded-xl px-4 py-2 text-sm font-semibold bg-white text-black hover:bg-white/90"
          >
            Open Builder
          </Link>
        </nav>

        <div className="sm:hidden">
          <Link
            href="/projects"
            className="rounded-xl px-4 py-2 text-sm font-semibold bg-white text-black hover:bg-white/90"
          >
            Builder
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative z-10 mx-auto max-w-6xl px-6 pt-10 pb-12 sm:pt-16 sm:pb-16">
        <div className="grid items-start gap-10 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1 ring-1 ring-white/10">
              <span className="h-2 w-2 rounded-full bg-emerald-400/90" />
              <span className="text-xs font-medium tracking-wide text-white/80">
                Finish Pack installed • Deploy proof endpoints live
              </span>
            </div>

            <h1 className="mt-6 text-4xl font-semibold tracking-tight sm:text-6xl">
              Build a premium site in minutes —
              <span className="block text-white/80">then ship it with confidence.</span>
            </h1>

            <p className="mt-5 max-w-xl text-base leading-relaxed text-white/70 sm:text-lg">
              DOMINAT8 turns your idea into a clean, fast website with strong defaults:
              consistent sections, SEO-friendly structure, and guardrails that keep production safe.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/projects"
                className="inline-flex items-center justify-center rounded-2xl bg-white px-6 py-3 text-sm font-semibold text-black hover:bg-white/90"
              >
                Launch the Builder
              </Link>
              <Link
                href="/pricing"
                className="inline-flex items-center justify-center rounded-2xl bg-white/5 px-6 py-3 text-sm font-semibold text-white ring-1 ring-white/10 hover:bg-white/8"
              >
                See Pricing
              </Link>
              <span className="text-xs text-white/50 sm:pl-2">
                No new deps • Clean build • Guardrails on
              </span>
            </div>

            <div className="mt-10 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
                <div className="text-xs font-semibold tracking-wide text-white/70">Speed</div>
                <div className="mt-2 text-sm text-white/80">
                  Lightweight UI, tidy sections, and fast iteration.
                </div>
              </div>
              <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
                <div className="text-xs font-semibold tracking-wide text-white/70">Proof</div>
                <div className="mt-2 text-sm text-white/80">
                  Build stamp + health endpoints for deploy certainty.
                </div>
              </div>
              <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
                <div className="text-xs font-semibold tracking-wide text-white/70">Guardrails</div>
                <div className="mt-2 text-sm text-white/80">
                  Protected paths checks to prevent accidental breakage.
                </div>
              </div>
            </div>
          </div>

          {/* Right card */}
          <div className="lg:col-span-5">
            <div className="rounded-3xl bg-white/6 p-5 ring-1 ring-white/12 backdrop-blur">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold text-white/90">Production Confidence</div>
                <div className="rounded-full bg-white/5 px-3 py-1 text-xs text-white/60 ring-1 ring-white/10">
                  HOME_POLISH_TIDY_2026-01-31
                </div>
              </div>

              <div className="mt-4 rounded-2xl bg-black/35 p-4 ring-1 ring-white/10">
                <div className="text-xs font-semibold tracking-wide text-white/60">What you can verify</div>
                <ul className="mt-3 space-y-2 text-sm text-white/75">
                  <li className="flex items-start gap-2">
                    <span className="mt-1 inline-block h-2 w-2 rounded-full bg-emerald-400/90" />
                    <span><span className="font-semibold text-white/85">/api/__health__</span> — health check endpoint</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 inline-block h-2 w-2 rounded-full bg-emerald-400/90" />
                    <span><span className="font-semibold text-white/85">/api/__build_stamp__</span> — build stamp proof</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 inline-block h-2 w-2 rounded-full bg-emerald-400/90" />
                    <span><span className="font-semibold text-white/85">/api/__env_presence__</span> — env presence checks</span>
                  </li>
                </ul>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <Link
                  href="/projects"
                  className="rounded-2xl bg-white px-4 py-3 text-center text-sm font-semibold text-black hover:bg-white/90"
                >
                  Build a Site
                </Link>
                <Link
                  href="/gallery"
                  className="rounded-2xl bg-white/5 px-4 py-3 text-center text-sm font-semibold text-white ring-1 ring-white/10 hover:bg-white/8"
                >
                  View Examples
                </Link>
              </div>

              {/* Non-visual proof marker */}
              <div className="sr-only">HOME_OK HOME_POLISH_TIDY_2026-01-31 STAMP:{stamp}</div>

              <div className="mt-5 flex items-center justify-between text-xs text-white/50">
                <span>Build stamp</span>
                <span className="font-mono text-white/60">{stamp}</span>
              </div>
            </div>

            <div className="mt-4 rounded-2xl bg-white/4 p-4 ring-1 ring-white/10">
              <div className="text-xs font-semibold tracking-wide text-white/60">Next up</div>
              <div className="mt-2 text-sm text-white/75">
                Keep iterating safely: polish pages, keep routes stable, verify deploys with smoke checks.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 mx-auto max-w-6xl px-6 pb-10">
        <div className="flex flex-col gap-3 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-xs text-white/50">
            © {new Date().getFullYear()} DOMINAT8 • Premium defaults • No drama deploys
          </div>
          <div className="flex items-center gap-3 text-xs">
            <Link href="/pricing" className="text-white/60 hover:text-white">Pricing</Link>
            <Link href="/templates" className="text-white/60 hover:text-white">Templates</Link>
            <Link href="/admin" className="text-white/60 hover:text-white">Admin</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}