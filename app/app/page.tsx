"use client";

import Link from "next/link";
import HomeDemo from "./components/HomeDemo";

function Container({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto w-full max-w-6xl px-6">{children}</div>;
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white text-zinc-900">
      <div className="sticky top-0 z-50 border-b border-zinc-200/60 bg-white/70 backdrop-blur">
        <Container>
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="text-sm font-extrabold text-zinc-900">
              MySaaS Builder
            </Link>

            <div className="flex items-center gap-4">
              <Link
                href="#demo"
                className="text-sm font-semibold text-zinc-700 hover:text-zinc-900"
              >
                Demo
              </Link>
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
            <h1 className="text-4xl font-extrabold tracking-tight md:text-6xl">
              Premium AI website building that actually ships.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-zinc-600 md:text-lg">
              Generate a conversion-ready site, preview it instantly, and publish
              to a shareable URL. Built to move fast.
            </p>
            <div className="mt-8 flex gap-3">
              <Link
                href="/projects"
                className="inline-flex items-center justify-center rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-zinc-900"
              >
                Start building
              </Link>
              <Link
                href="#demo"
                className="inline-flex items-center justify-center rounded-xl border border-zinc-200 bg-white px-5 py-3 text-sm font-semibold text-zinc-900 hover:bg-zinc-50"
              >
                View demo
              </Link>
            </div>
          </Container>
        </section>

        <HomeDemo />

        <footer className="border-t border-zinc-200 bg-white">
          <Container>
            <div className="py-10 text-sm font-semibold text-zinc-600">
              © {new Date().getFullYear()} MySaaS Builder. All rights reserved.
            </div>
          </Container>
        </footer>
      </main>
    </div>
  );
}
