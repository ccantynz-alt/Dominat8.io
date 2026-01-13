"use client";

import Link from "next/link";

function Container({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto w-full max-w-6xl px-6">{children}</div>;
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white text-zinc-900">
      <div className="sticky top-0 z-50 border-b border-zinc-200/60 bg-white/80 backdrop-blur">
        <Container>
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="text-sm font-extrabold text-zinc-900">
              MySaaS Builder
            </Link>

            <div className="flex items-center gap-4">
              <Link
                href="/projects"
                className="inline-flex items-center justify-center rounded-xl bg-black px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-zinc-900"
              >
                Open Builder
              </Link>
            </div>
          </div>
        </Container>
      </div>

      <main>
        <section className="bg-white py-16 md:py-24">
          <Container>
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-semibold text-zinc-700 shadow-sm">
                <span className="h-2 w-2 rounded-full bg-zinc-900" />
                Bootstrap Mode
              </div>

              <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-zinc-900 md:text-6xl">
                Premium AI website building that actually ships.
              </h1>

              <p className="mt-5 text-base leading-7 text-zinc-600 md:text-lg">
                Create a project, generate a conversion-ready preview, then publish to a shareable URL.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link
                  href="/projects"
                  className="inline-flex items-center justify-center rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-zinc-900"
                >
                  Start building
                </Link>
              </div>
            </div>
          </Container>
        </section>
      </main>
    </div>
  );
}
