// src/app/projects/[projectId]/agents/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";

type Agent = { id: string; label: string; endpoint: string; method: "POST" | "GET" };
type IndexResponse =
  | { ok: true; projectId: string; agents: Agent[]; publicUrl: string }
  | { ok: false; error: string };

export default function AgentsPage({ params }: { params: { projectId: string } }) {
  const projectId = params.projectId;

  const [index, setIndex] = useState<IndexResponse | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);

  const publicUrl = useMemo(() => `/p/${projectId}`, [projectId]);

  useEffect(() => {
    fetch(`/api/projects/${projectId}/agents?ts=` + Date.now(), { cache: "no-store" })
      .then((r) => r.json())
      .then(setIndex)
      .catch((e) => setIndex({ ok: false, error: String(e?.message ?? e) }));
  }, [projectId]);

  async function run(agent: Agent) {
    setBusyId(agent.id);
    setResult(null);
    try {
      const r = await fetch(agent.endpoint, { method: agent.method });
      const json = await r.json();
      setResult({ agent: agent.id, status: r.status, json });
    } catch (e: any) {
      setResult({ agent: agent.id, error: e?.message ?? "Request failed" });
    } finally {
      setBusyId(null);
    }
  }

  const agents = index && (index as any).ok ? ((index as any).agents as Agent[]) : [];

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <div className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="text-3xl font-semibold tracking-tight">Agents</h1>
        <div className="mt-2 text-sm text-slate-600">
          Project ID: <span className="font-mono">{projectId}</span>
        </div>

        <div className="mt-4">
          <a
            href={publicUrl}
            className="inline-flex rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
          >
            Open public page
          </a>
        </div>

        {!index && (
          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 text-sm">
            Loading…
          </div>
        )}

        {index && !(index as any).ok && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-900">
            {(index as any).error}
          </div>
        )}

        {agents.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-3">
            {agents.map((a) => (
              <button
                key={a.id}
                onClick={() => run(a)}
                disabled={!!busyId}
                className={[
                  "rounded-md border px-3 py-1 text-sm",
                  a.id === "auto" ? "border-slate-900 bg-slate-900 text-white" : "border-slate-300 bg-white",
                  busyId ? "opacity-60" : "",
                ].join(" ")}
              >
                {busyId === a.id ? "Working…" : a.label}
              </button>
            ))}
          </div>
        )}

        {result && (
          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
            <div className="text-sm font-semibold">Result</div>
            <pre className="mt-3 overflow-auto rounded-xl bg-slate-50 p-3 text-xs text-slate-800">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
