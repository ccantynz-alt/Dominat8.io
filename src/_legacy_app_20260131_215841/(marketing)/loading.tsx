export default function Loading() {
  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-16">
      <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
        <div className="text-sm font-semibold">Loading…</div>
        <div className="mt-2 text-sm opacity-70">
          Preparing the page.
        </div>
      </div>
    </main>
  );
}