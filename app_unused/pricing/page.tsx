import Link from "next/link";

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <Link
          href="/"
          className="text-sm font-semibold text-zinc-700 hover:text-zinc-900"
        >
          ← Back
        </Link>

        <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-zinc-900">
          Pricing
        </h1>

        <p className="mt-3 text-base leading-7 text-zinc-600">
          Keep pricing aligned with your real enforcement rules. This page can
          evolve as your Pro limits and billing logic harden.
        </p>

        <div className="mt-10 rounded-3xl border border-zinc-200 bg-zinc-50 p-8">
          <div className="text-lg font-extrabold text-zinc-900">Pro</div>
          <div className="mt-2 text-3xl font-extrabold text-zinc-900">$29</div>
          <p className="mt-3 text-sm leading-6 text-zinc-600">
            More generations, fewer limits, and priority improvements.
          </p>

          <Link
            href="/projects"
            className="mt-6 inline-flex rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white hover:bg-zinc-900"
          >
            Open Builder
          </Link>
        </div>
      </div>
    </div>
  );
}
