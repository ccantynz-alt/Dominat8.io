"use client";

import Link from "next/link";

export default function HomeDemo() {
  return (
    <section id="demo" className="bg-white py-16 md:py-24">
      <div className="mx-auto w-full max-w-6xl px-6">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 md:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-semibold text-zinc-700 shadow-sm">
              <span className="h-2 w-2 rounded-full bg-zinc-900" />
              Live preview (example)
            </div>

            <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-zinc-900 md:text-4xl">
              See what you can build in minutes
            </h2>

            <p className="mt-4 text-sm leading-6 text-zinc-600 md:text-base">
              This is a representative example of what the builder generates.
              Real projects are created inside the app, where you can preview,
              iterate, and publish to a public URL.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/projects"
                className="inline-flex items-center justify-center rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-zinc-900"
              >
                Open the builder
              </Link>
            </div>

            <div className="mt-6 text-xs text-zinc-500">
              Real publishing happens inside the app.
            </div>
          </div>

          <div className="rounded-3xl border border-zinc-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-3">
              <div className="flex items-center gap-2">
                <div className="h-2.5 w-2.5 rounded-full bg-zinc-300" />
                <div className="h-2.5 w-2.5 rounded-full bg-zinc-300" />
                <div className="h-2.5 w-2.5 rounded-full bg-zinc-300" />
              </div>
              <div className="text-xs font-semibold text-zinc-500">
                Example output
              </div>
            </div>

            <div className="p-6">
              <div className="rounded-2xl bg-zinc-50 p-5">
                <div className="text-xs font-semibold text-zinc-500">Prompt</div>
                <div className="mt-2 text-sm font-semibold text-zinc-800">
                  “Create a premium SaaS website with hero, features, pricing,
                  FAQ, and a CTA. Clean, modern design.”
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-4">
                <div className="rounded-2xl border border-zinc-200 bg-white p-4">
                  <div className="text-xs font-semibold text-zinc-500">
                    Output
                  </div>
                  <div className="mt-2 text-sm font-extrabold text-zinc-900">
                    Conversion-ready
                  </div>
                  <div className="mt-1 text-xs text-zinc-600">
                    Sections + CTA
                  </div>
                </div>

                <div className="rounded-2xl border border-zinc-200 bg-white p-4">
                  <div className="text-xs font-semibold text-zinc-500">
                    Publish
                  </div>
                  <div className="mt-2 text-sm font-extrabold text-zinc-900">
                    One click
                  </div>
                  <div className="mt-1 text-xs text-zinc-600">Public URL</div>
                </div>
              </div>

              <div className="mt-5 rounded-2xl border border-zinc-200 bg-white p-4">
                <div className="text-sm font-extrabold text-zinc-900">
                  Built for momentum
                </div>
                <div className="mt-1 text-xs text-zinc-600">
                  Create → preview → publish, then share the link.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
