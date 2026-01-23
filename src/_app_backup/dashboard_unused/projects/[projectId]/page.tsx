"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Run = {
  id: string;
  projectId: string;
  prompt: string;
  status: string;
  createdAt?: string;
};

export default function ProjectRunsPage({ params }: { params: { projectId: string } }) {
  const projectId = params.projectId;

  const [runs, setRuns] = useState<Run[]>([]);
  const [prompt, setPrompt] = useState(
    "Build a modern landing page with pricing, FAQ, and a contact form."
  );
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sorted = useMemo(() => {
    return [...runs].sort((a, b) => {
      const ad = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bd = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return bd - ad;
    });
  }, [runs]);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/projects/${projectId}/runs`, { cache: "no-store" });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.ok) throw new Error(data?.error || "Failed to load runs");
      setRuns(Array.isArray(data.runs) ? data.runs : []);
    } catch (e: any) {
      setError(e?.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  async function createRun() {
    const trimmed = prompt.trim();
    if (!trimmed) return;

    setCreating(true);
    setError(null);
    try {
      const res = await fetch(`/api/projects/${projectId}/runs`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ prompt: trimmed }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.ok) throw new Error(data?.error || "Failed to create run");

      if (data.run?.id) {
        setRuns((prev) => [data.run as Run, ...prev]);
      } else {
        await load();
      }
    } catch (e: any) {
      setError(e?.message || "Unknown error");
    } finally {
      setCreating(false);
    }
  }

  useEffect(() => {
    load();
  }, [projectId]);

  return (
    <main className="mx-auto max-w-4xl p-6">
      <header className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Project Runs</h1>
          <Link href="/dashboard" className="rounded-xl border px-3 py-2 text-sm">
            ← Back
          </Link>
        </div>

        <p className="text-sm opacity-80">
          <span className="opacity-70">Project ID:</span> {projectId}
        </p>
      </header>

      <section className="mt-6 rounded-2xl border p-4">
        <h2 className="text-lg font-medium">Create a run</h2>

        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="mt-3 min-h-[120px] w-full rounded-xl border bg-transparent p-3 outline-none"
        />

        <div className="mt-3 flex gap-2">
          <button
            onClick={createRun}
            disabled={creating || !prompt.trim()}
            className="rounded-xl border px-4 py-2 disabled:opacity-50"
          >
            {creating ? "Creating…" : "Create Run"}
          </button>

          <button
            onClick={load}
            disabled={loading}
            className="rounded-xl border px-4 py-2 disabled:opacity-50"
          >
            Refresh
          </button>
        </div>

        {error ? (
          <p className="mt-3 text-sm text-red-400">Error: {error}</p>
        ) : null}
      </section>

      <section className="mt-6 rounded-2xl border p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">Runs</h2>
          <span className="text-sm opacity-70">{sorted.length} total</span>
        </div>

        {loading ? (
          <p className="mt-3 text-sm opacity-70">Loading…</p>
        ) : sorted.length === 0 ? (
          <p className="mt-3 text-sm opacity-70">
            No runs yet — create one above.
          </p>
        ) : (
          <ul className="mt-3 grid gap-2">
            {sorted.map((r) => (
              <li key={r.id} className="rounded-xl border p-3">
                <div className="flex flex-col gap-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium">{r.id}</span>
                    <span className="rounded-full border px-2 py-0.5 text-xs opacity-80">
                      {r.status}
                    </span>
                    {r.createdAt ? (
                      <span className="text-xs opacity-70">
                        {new Date(r.createdAt).toLocaleString()}
                      </span>
                    ) : null}
                  </div>
                  <p className="text-sm opacity-85">{r.prompt}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
