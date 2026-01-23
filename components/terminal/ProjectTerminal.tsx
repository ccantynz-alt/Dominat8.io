// components/terminal/ProjectTerminal.tsx
"use client";

import React, { useMemo, useRef, useState } from "react";

type PublishOptions = {
  seed?: boolean;
  autoPublish?: boolean;
};

type PublishStep = {
  name?: string;
  url?: string;
  method?: string;
  ok?: boolean;
  status?: number;
  ms?: number;
  contentType?: string;
  bodyFirst200?: string;
  error?: string;
  text?: string;
};

type PublishResponse = {
  ok?: boolean;
  projectId?: string;
  options?: PublishOptions;
  steps?: PublishStep[];
  status?: number;
  source?: string;
  error?: string;
  [k: string]: any;
};

type DebugSpecResponse = {
  ok?: boolean;
  projectId?: string;
  [k: string]: any;
};

function clsx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

function safeJsonParse<T = any>(text: string): { ok: true; value: T } | { ok: false; error: string } {
  try {
    return { ok: true, value: JSON.parse(text) as T };
  } catch (e: any) {
    return { ok: false, error: e?.message || "Failed to parse JSON" };
  }
}

function shortPreview(s?: string, max = 200) {
  if (!s) return "";
  if (s.length <= max) return s;
  return s.slice(0, max) + "…";
}

function formatMs(ms?: number) {
  if (typeof ms !== "number" || !Number.isFinite(ms)) return "—";
  if (ms < 1000) return `${Math.round(ms)} ms`;
  return `${(ms / 1000).toFixed(2)} s`;
}

function stepStatusBadge(step: PublishStep) {
  const ok = step.ok;
  const status = step.status;

  if (ok === true) return <span className="text-xs rounded px-2 py-0.5 bg-green-100 text-green-800">OK</span>;
  if (ok === false) return <span className="text-xs rounded px-2 py-0.5 bg-red-100 text-red-800">FAIL</span>;

  if (typeof status === "number") {
    if (status >= 200 && status < 300) {
      return <span className="text-xs rounded px-2 py-0.5 bg-green-100 text-green-800">{status}</span>;
    }
    if (status >= 300 && status < 400) {
      return <span className="text-xs rounded px-2 py-0.5 bg-yellow-100 text-yellow-800">{status}</span>;
    }
    return <span className="text-xs rounded px-2 py-0.5 bg-red-100 text-red-800">{status}</span>;
  }

  return <span className="text-xs rounded px-2 py-0.5 bg-gray-100 text-gray-800">—</span>;
}

export default function ProjectTerminal({ projectId }: { projectId: string }) {
  const [seed, setSeed] = useState(true);
  const [autoPublish, setAutoPublish] = useState(false);

  const [running, setRunning] = useState(false);
  const [lastHttpStatus, setLastHttpStatus] = useState<number | null>(null);
  const [lastResponse, setLastResponse] = useState<PublishResponse | null>(null);
  const [lastRawText, setLastRawText] = useState("");

  const [expandedStep, setExpandedStep] = useState<number | null>(null);

  const [artifactsLoading, setArtifactsLoading] = useState(false);
  const [debugSpecRaw, setDebugSpecRaw] = useState("");

  const abortRef = useRef<AbortController | null>(null);

  const publishUrl = useMemo(() => `/api/projects/${projectId}/publish`, [projectId]);
  const debugSpecUrl = useMemo(() => `/api/projects/${projectId}/debug/spec`, [projectId]);

  const steps = lastResponse?.steps || [];

  async function runPublish() {
    if (running) return;

    setRunning(true);
    setLastHttpStatus(null);
    setLastResponse(null);
    setLastRawText("");
    setExpandedStep(null);

    const ac = new AbortController();
    abortRef.current = ac;

    try {
      const r = await fetch(publishUrl + `?ts=${Date.now()}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        signal: ac.signal,
        body: JSON.stringify({ seed, autoPublish }),
      });

      setLastHttpStatus(r.status);

      const text = await r.text();
      setLastRawText(text);

      const parsed = safeJsonParse<PublishResponse>(text);
      if (parsed.ok) setLastResponse(parsed.value);
      else setLastResponse({ ok: false, projectId, error: `Non-JSON response: ${parsed.error}` });
    } catch (e: any) {
      if (e?.name === "AbortError") setLastResponse({ ok: false, projectId, error: "Cancelled." });
      else setLastResponse({ ok: false, projectId, error: e?.message || "Unknown error" });
    } finally {
      abortRef.current = null;
      setRunning(false);
    }
  }

  function cancelRun() {
    abortRef.current?.abort();
  }

  async function refreshArtifacts() {
    if (artifactsLoading) return;
    setArtifactsLoading(true);
    setDebugSpecRaw("");

    try {
      const r = await fetch(debugSpecUrl + `?ts=${Date.now()}`, { method: "GET", cache: "no-store" });
      const text = await r.text();
      setDebugSpecRaw(text);
    } finally {
      setArtifactsLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Project Terminal</h1>
          <p className="text-sm text-gray-600">
            Project: <span className="font-mono">{projectId}</span>
          </p>
          <p className="text-sm text-gray-600">
            Pipeline: <span className="font-mono">POST {publishUrl}</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            className={clsx("rounded px-3 py-2 text-sm font-medium shadow-sm", running ? "bg-gray-200 text-gray-600" : "bg-black text-white hover:opacity-90")}
            onClick={runPublish}
            disabled={running}
          >
            {running ? "Running…" : "Run /publish"}
          </button>

          <button
            className={clsx("rounded px-3 py-2 text-sm font-medium shadow-sm", running ? "bg-white border border-gray-300 hover:bg-gray-50" : "bg-gray-100 text-gray-500 border border-gray-200")}
            onClick={cancelRun}
            disabled={!running}
          >
            Cancel
          </button>

          <button
            className={clsx("rounded px-3 py-2 text-sm font-medium shadow-sm border", artifactsLoading ? "bg-gray-200 text-gray-600 border-gray-200" : "bg-white hover:bg-gray-50 border-gray-300")}
            onClick={refreshArtifacts}
            disabled={artifactsLoading}
          >
            {artifactsLoading ? "Refreshing…" : "Refresh Artifacts"}
          </button>
        </div>
      </div>

      <div className="mt-6 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm font-medium">Run options</div>
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={seed} onChange={(e) => setSeed(e.target.checked)} className="h-4 w-4" />
              <span>seed</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={autoPublish} onChange={(e) => setAutoPublish(e.target.checked)} className="h-4 w-4" />
              <span>autoPublish</span>
            </label>
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm text-sm text-gray-600">
        HTTP: <span className="font-mono">{lastHttpStatus ?? "—"}</span> • Steps: <span className="font-mono">{steps.length || "—"}</span>
      </div>

      <div className="mt-6">
        <h2 className="text-lg font-semibold">Steps timeline</h2>
        <div className="mt-3 space-y-2">
          {steps.length === 0 ? (
            <div className="rounded-lg border border-gray-200 bg-white p-4 text-sm text-gray-600">No steps yet.</div>
          ) : (
            steps.map((s, idx) => {
              const isOpen = expandedStep === idx;
              const title = s.name || `step_${idx + 1}`;
              const preview = s.bodyFirst200 || s.error || s.text || "";

              return (
                <div key={idx} className="rounded-lg border border-gray-200 bg-white shadow-sm">
                  <button className="w-full text-left p-4 flex items-center justify-between gap-4" onClick={() => setExpandedStep(isOpen ? null : idx)}>
                    <div className="flex items-center gap-3">
                      <div className="font-mono text-sm">{idx + 1}.</div>
                      <div className="font-medium">{title}</div>
                      {stepStatusBadge(s)}
                    </div>
                    <div className="text-xs text-gray-600 font-mono">{formatMs(s.ms)}</div>
                  </button>

                  {isOpen ? (
                    <div className="border-t border-gray-100 px-4 pb-4">
                      <pre className="mt-3 max-h-64 overflow-auto rounded bg-gray-50 p-3 text-xs text-gray-900 whitespace-pre-wrap">
{preview ? shortPreview(preview, 2000) : "—"}
                      </pre>
                    </div>
                  ) : null}
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-semibold">Raw debug/spec</h2>
        <pre className="mt-3 max-h-80 overflow-auto rounded bg-gray-50 p-3 text-xs text-gray-900 whitespace-pre-wrap">
{debugSpecRaw ? shortPreview(debugSpecRaw, 50000) : "Click “Refresh Artifacts”."}
        </pre>
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-semibold">Raw /publish response</h2>
        <pre className="mt-3 max-h-80 overflow-auto rounded bg-gray-50 p-3 text-xs text-gray-900 whitespace-pre-wrap">
{lastRawText ? shortPreview(lastRawText, 50000) : "No run yet."}
        </pre>
      </div>
    </div>
  );
}
