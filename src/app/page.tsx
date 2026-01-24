import Link from "next/link";

export default function HomePage() {
  return (
    <div className="space-y-16">
      <div data-x-home-ok className="hidden">HOME_OK</div>

      <section className="relative overflow-hidden rounded-[28px] border bg-gradient-to-br from-black via-neutral-900 to-neutral-800 text-white shadow-xl">
        <div className="absolute inset-0 opacity-40">
          <div className="absolute -left-24 -top-24 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -right-24 -bottom-24 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
        </div>

        <div className="relative grid gap-10 px-8 py-14 md:grid-cols-2 md:px-12 md:py-16">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold text-white/90">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              AI Website Builder • From brief → live website
            </div>

            <h1 className="mt-6 text-4xl font-bold tracking-tight md:text-5xl">
              A website that looks premium —
              <span className="text-white/70"> built in minutes</span>
            </h1>

            <p className="mt-5 max-w-xl text-base leading-7 text-white/75">
              Dominat8 generates a complete site from a short brief: pages, copy, layout, and SEO basics.
              You review, tweak, and publish fast.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/templates"
                className="inline-flex items-center justify-center rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black hover:bg-neutral-200"
              >
                Browse templates
              </Link>

              <Link
                href="/pricing"
                className="inline-flex items-center justify-center rounded-xl border border-white/20 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10"
              >
                View pricing
              </Link>

              <a href="/templates" className="text-sm font-semibold text-white/80 hover:text-white">
                Get started →
              </a>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-inner">
            <div className="text-sm font-semibold text-white/90">Preview</div>
            <div className="mt-5 space-y-4">
              <div className="rounded-2xl border border-white/10 bg-black/30 p-5">
                <div className="h-3 w-24 rounded bg-white/20" />
                <div className="mt-4 h-7 w-3/4 rounded bg-white/15" />
                <div className="mt-3 h-3 w-5/6 rounded bg-white/10" />
                <div className="mt-2 h-3 w-2/3 rounded bg-white/10" />
                <div className="mt-6 flex gap-3">
                  <div className="h-9 w-28 rounded-xl bg-white/20" />
                  <div className="h-9 w-28 rounded-xl border border-white/15" />
                </div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/30 p-4 text-xs text-white/70">
                Tip: start with a template, then let the agents fill content + SEO.
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}