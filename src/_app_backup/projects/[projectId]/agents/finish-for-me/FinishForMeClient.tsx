// src/app/projects/[projectId]/agents/finish-for-me/FinishForMeClient.tsx
"use client";

import { useMemo, useState } from "react";

type AgentResult =
  | { ok: true; projectId: string; message: string; summary: any }
  | { ok: false; error: string; hint?: string };

export default function FinishForMeClient({ projectId }: { projectId: string }) {
  const [busy, setBusy] = useState(false);
  const [agentRes, setAgentRes] = useState<AgentResult | null>(null);
  const [publishRes, setPublishRes] = useState<any>(null);

  const publicUrl = useMemo(() => `/p/${projectId}`, [projectId]);

  async function runAgent() {
    setBusy(true);
    setAgentRes(null);
    setPublishRes(null);
    try {
      const r = await fetch(`/api/projects/${projectId}/agents/finish-for-me`, { method: "POST" });
      const json = (await r.json()) as AgentResult;
      setAgentRes(json);
    } catch (e: any) {
      setAgentRes({ ok: false, error: e?.message ?? "Agent request failed" });
    } finally {
      setBusy(false);
    }
  }

  async function publish() {
    setBusy(true);
    setPublishRes(null);
    try {
      const r = await fetch(`/api/projects/${projectId}/publish`, { method: "POST" });
      const json = await r.json();
      setPublishRes(json);
    } catch (e: any) {
      setPublishRes({ ok: false, error: e?.message ?? "Publish request failed" });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <div className="mx-auto max-w-3xl px-4 py-10">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Finish-for-me Agent</h1>
            <p className="mt-2 text-slate-600">
              One click to make your draft spec conversion-ready (hero + features + FAQ), then publish.
            </p>
            <div className="mt-3 text-xs text-slate-500">
              Project: <span className="font-mono">{projectId}</span>
            </div>
          </div>
          <a
            href={publicUrl}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
          >
            Open public page
          </a>
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          <button
            onClick={runAgent}
            disabled={busy}
            className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
          >
            {busy ? "Working..." : "Run Finish-for-me"}
          </button>

          <button
            onClick={publish}
            disabled={busy}
            className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-50 disabled:opacity-50"
          >
            {busy ? "Working..." : "Publish now"}
          </button>
        </div>

        {agentRes && (
          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
            <div className="text-sm font-semibold">Agent result</div>
            <pre className="mt-3 overflow-auto rounded-xl bg-slate-50 p-3 text-xs text-slate-800">
              {JSON.stringify(agentRes, null, 2)}
            </pre>
          </div>
        )}

        {publishRes && (
          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
            <div className="text-sm font-semibold">Publish result</div>
            <pre className="mt-3 overflow-auto rounded-xl bg-slate-50 p-3 text-xs text-slate-800">
              {JSON.stringify(publishRes, null, 2)}
            </pre>

            {publishRes?.ok && (
              <div className="mt-4 flex flex-wrap gap-3">
                <a
                  href={publicUrl}
                  className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
                >
                  View premium public page
                </a>
                <a
                  href={`/projects/${projectId}`}
                  className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-50"
                >
                  Back to builder
                </a>
              </div>
            )}
          </div>
        )}

        <div className="mt-8 rounded-2xl bg-slate-50 p-5 text-sm text-slate-700">
          <div className="font-semibold">Quick path</div>
          <ol className="mt-2 list-decimal space-y-1 pl-5">
            <li>Run agent (adds hero/features/FAQ if missing)</li>
            <li>Click publish</li>
            <li>Open <span className="font-mono">{publicUrl}</span></li>
          </ol>
        </div>
      </div>
    </div>
  );
}
