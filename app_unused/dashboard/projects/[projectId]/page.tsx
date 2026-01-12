"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Run = {
  id: string;
  projectId: string;
  prompt: string;
  status: string;
  createdAt?: string;
  updatedAt?: string;
  output?: {
    summary?: string;
    files?: { path: string; content: string }[];
  };
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
  const [openRunId, setOpenRunId] = useState<string | null>(null);

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

      const newRun = data.run as Run | undefined;
      if (newRun?.id) {
        setRuns((prev) => [newRun, ...prev]);
        setOpenRunId(newRun.id);

        // Optional: if you created the simulate route earlier, this makes it feel alive
        await fetch(`/api/projects/${projectId}/runs/${newRun.id}/simulate`, { method: "POST" })
          .catch(() => null);

        await load();
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
    <div className="space-y-6">
      <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Runs</h1>
            <p className="mt-1 text-sm text-zinc-400">
              Project: <span className="text-zinc-200">{projectId}</span>
            </p>
          </div>

          <Link
            href="/projects"
            className="mt-2 inline-flex rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm hover:bg-white/10 sm:mt-0"
          >
            ← Back
          </Link>
        </div>

        <div className="mt-5">
          <div className="text-sm font-medium text-zinc-200">Run the agent</div>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="mt-3 min-h-[130px] w-full rounded-2xl border border-white/10 bg-zinc-950/60 p-4 text-sm outline-none placeholder:text-zinc-600 focus:border-white/20"
          />

          <div className="mt-3 flex flex-wrap gap-2">
            <button
              onClick={createRun}
              disabled={creating || !prompt.trim()}
              className="rounded-2xl border border-white/10 bg-white px-5 py-3 text-sm font-medium text-zinc-950 hover:bg-zinc-200 disabled:opacity-50"
            >
              {creating ? "Running…" : "Run Agent"}
            </button>

            <button
              onClick={load}
              disabled={loading}
              className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm hover:bg-white/10 disabled:opacity-50"
            >
              Refresh
            </button>
          </div>

          {error ? (
            <div className="mt-4 rounded-2xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-200">
              {error}
            </div>
          ) : null}
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">Run history</h2>
          <span className="text-sm text-zinc-400">{sorted.length} total</span>
        </div>

        {loading ? (
          <p className="mt-4 text-sm text-zinc-400">Loading…</p>
        ) : sorted.length === 0 ? (
          <p className="mt-4 text-sm text-zinc-400">No runs yet — run the agent above.</p>
        ) : (
          <ul className="mt-4 grid gap-3">
            {sorted.map((r) => {
              const isOpen = openRunId === r.id;
              return (
                <li key={r.id} className="rounded-2xl border border-white/10 bg-zinc-950/40 p-4">
                  <button
                    className="w-full text-left"
                    onClick={() => setOpenRunId(isOpen ? null : r.id)}
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold">{r.id}</span>
                      <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-xs text-zinc-200">
                        {r.status}
                      </span>
                      {r.createdAt ? (
                        <span className="text-xs text-zinc-500">
                          {new Date(r.createdAt).toLocaleString()}
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-2 text-sm text-zinc-300">{r.prompt}</p>
                    <p className="mt-2 text-xs text-zinc-500">
                      Click to {isOpen ? "hide" : "view"} output
                    </p>
                  </button>

                  {isOpen ? (
                    <div className="mt-4 rounded-2xl border border-white/10 bg-zinc-950/60 p-4">
                      <div className="text-sm font-medium text-zinc-200">Output</div>
                      <div className="mt-2 text-sm text-zinc-300">
                        {r.output?.summary || "No output yet."}
                      </div>

                      {r.output?.files?.length ? (
                        <div className="mt-4 grid gap-3">
                          {r.output.files.map((f) => (
                            <div key={f.path} className="rounded-2xl border border-white/10 bg-black/30 p-4">
                              <div className="text-xs text-zinc-400">{f.path}</div>
                              <pre className="mt-3 overflow-x-auto text-xs text-zinc-200">
                                {f.content}
                              </pre>
                            </div>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
