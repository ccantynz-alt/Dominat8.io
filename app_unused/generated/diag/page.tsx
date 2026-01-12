import Link from "next/link";
import { storeGet } from "../../lib/store";

export const runtime = "nodejs";

export default async function GeneratedDiagPage() {
  const latest = await storeGet<any>("generated:latest");

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50">
      <header className="border-b border-white/10 bg-zinc-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div className="leading-tight">
            <div className="text-sm font-semibold tracking-wide">Generated Diagnostics</div>
            <div className="text-xs text-zinc-400">KV key: generated:latest</div>
          </div>

          <nav className="flex items-center gap-2">
            <Link
              href="/generated"
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm hover:bg-white/10"
            >
              /generated
            </Link>
            <Link
              href="/projects"
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm hover:bg-white/10"
            >
              Projects
            </Link>
            <Link
              href="/dashboard"
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm hover:bg-white/10"
            >
              Dashboard
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-8">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <h1 className="text-xl font-semibold">KV Read Result</h1>
          <p className="mt-2 text-sm text-zinc-400">
            If this shows <span className="text-zinc-200">null</span>, Apply never wrote to KV.
          </p>

          <pre className="mt-4 overflow-x-auto rounded-2xl border border-white/10 bg-black/30 p-4 text-xs text-zinc-200">
            {JSON.stringify(latest, null, 2)}
          </pre>
        </div>
      </main>
    </div>
  );
}
