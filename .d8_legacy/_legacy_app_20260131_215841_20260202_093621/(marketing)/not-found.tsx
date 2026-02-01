import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-16">
      <div className="rounded-2xl border border-black/10 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold">Page not found</h1>
        <p className="mt-2 text-sm opacity-80">
          The page you’re looking for doesn’t exist.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-md bg-black px-5 py-3 text-sm text-white hover:opacity-90"
          >
            Back home
          </Link>
          <Link
            href="/templates"
            className="inline-flex items-center justify-center rounded-md border border-black/15 px-5 py-3 text-sm hover:bg-black/[0.02]"
          >
            Browse templates
          </Link>
        </div>
      </div>
    </main>
  );
}