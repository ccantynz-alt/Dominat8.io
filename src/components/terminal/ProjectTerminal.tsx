// src/components/terminal/ProjectTerminal.tsx
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

  // Often returned by your publish aggregator
  bodyFirst200?: string;

  // Fallbacks if your shape differs
  error?: string;
  text?: string;
};

type PublishResponse = {
  ok?: boolean;
  projectId?: string;

  // your publish endpoint mentions this
  options?: PublishOptions;

  // canonical timeline array
  steps?: PublishStep[];

  // sometimes useful
  status?: number;
  source?: string;
  error?: string;

  // allow unknown extra fields without breaking
  [k: string]: any;
};

type DebugSpecResponse = {
  ok?: boolean;
  projectId?: string;

  // unknown shape – we render booleans + raw JSON
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

function boolBadge(v: boolean | null) {
  if (v === true) return <span className="text-xs rounded px-2 py-0.5 bg-green-100 text-green-800">YES</span>;
  if (v === false) return <span className="text-xs rounded px-2 py-0.5 bg-red-100 text-red-800">NO</span>;
  return <span className="text-xs rounded px-2 py-0.5 bg-gray-100 text-gray-800">—</span>;
}

function stepStatusBadge(step: PublishStep) {
  const ok = step.ok;
  const status = step.status;

  // Prefer explicit ok if present
  if (ok === true) return <span className="text-xs rounded px-2 py-0.5 bg-green-100 text-green-800">OK</span>;
  if (ok === false) return <span className="text-xs rounded px-2 py-0.5 bg-red-100 text-red-800">FAIL</span>;

  // Fallback to HTTP status if ok missing
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
  const [seed, setSeed] = useState<boolean>(true);
  const [autoPublish, setAutoPublish] = useState<boolean>(false);

  const [running, setRunning] = useState<boolean>(false);
  const [lastHttpStatus, setLastHttpStatus] = useState<number | null>(null);
  const [lastResponse, setLastResponse] = useState<PublishResponse | null>(null);
  const [lastRawText, setLastRawText] = useState<string>("");

  const [expandedStep, setExpandedStep] = useState<number | null>(null);

  const [artifactsLoading, setArtifactsLoading] = useState<boolean>(false);
  const [debugSpec, setDebugSpec] = useState<DebugSpecResponse | null>(null);
  const [debugSpecRaw, setDebugSpecRaw] = useState<string>("");

  const abortRef = useRef<AbortController | null>(null);

  const publishUrl = useMemo(() => `/api/projects/${projectId}/publish`, [projectId]);
  const debugSpecUrl = useMemo(() => `/api/projects/${projectId}/debug/spec`, [projectId]);

  const steps = lastResponse?.steps || [];

  const pipelineOk = useMemo(() => {
    if (!lastResponse) return null;
    if (typeof lastResponse.ok === "boolean") return lastResponse.ok;
    // fallback: all steps ok
    if (!steps.length) return null;
    return steps.every((s) => s.ok === true);
  }, [lastResponse, steps]);

  const artifactSignals = useMemo(() => {
    if (!debugSpec) return null;

    // We try a few common keys. If they aren't there, we still show raw JSON.
    const seoPlan =
      Boolean((debugSpec as any).seoPlan) ||
      Boolean((debugSpec as any).projectSeoPlan) ||
      Boolean((debugSpec as any).seo?.plan) ||
      Boolean((debugSpec as any).keys?.seoPlan) ||
      false;

    const sitemapXml =
      Boolean((debugSpec as any).sitemapXml) ||
      Boolean((debugSpec as any).sitemap) ||
      Boolean((debugSpec as any).keys?.sitemapXml) ||
      false;

    const publishedLatest =
      Boolean((debugSpec as any).publishedLatest) ||
      Boolean((debugSpec as any).published?.latest) ||
      Boolean((debugSpec as any).keys?.publishedLatest) ||
      Boolean((debugSpec as any).published) ||
      false;

    // If response includes explicit booleans, prefer them
    const seoPlanExplicit =
      typeof (debugSpec as any).seoPlanExists === "boolean" ? (debugSpec as any).seoPlanExists : null;
    const sitemapExplicit =
      typeof (debugSpec as any).sitemapXmlExists === "boolean" ? (debugSpec as any).sitemapXmlExists : null;
    const publishedExplicit =
      typeof (debugSpec as any).publishedLatestExists === "boolean" ? (debugSpec as any).publishedLatestExists : null;

    return {
      seoPlan: seoPlanExplicit ?? seoPlan,
      sitemapXml: sitemapExplicit ?? sitemapXml,
      publishedLatest: publishedExplicit ?? publishedLatest,
    };
  }, [debugSpec]);

  async function runPublish() {
    if (running) return;

    setRunning(true);
    setLastHttpStatus(null);
    setLastResponse(null);
    setLastRawText("");
    setExpandedStep(null);

    const ac = new AbortController();
    abortRef.current = ac;

    const body: PublishOptions = { seed, autoPublish };

    try {
      const r = await fetch(publishUrl + `?ts=${Date.now()}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        signal: ac.signal,
        body: JSON.stringify(body),
      });

      setLastHttpStatus(r.status);

      const text = await r.text();
      setLastRawText(text);

      const parsed = safeJsonParse<PublishResponse>(text);
      if (parsed.ok) {
        setLastResponse(parsed.value);
      } else {
        setLastResponse({
          ok: false,
          projectId,
          error: `Non-JSON response from /publish: ${parsed.error}`,
        });
      }
    } catch (e: any) {
      if (e?.name === "AbortError") {
        setLastResponse({
          ok: false,
          projectId,
          error: "Run cancelled by user.",
        });
      } else {
        setLastResponse({
          ok: false,
          projectId,
          error: e?.message || "Unknown error calling /publish",
        });
      }
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
    setDebugSpec(null);
    setDebugSpecRaw("");

    try {
      const r = await fetch(debugSpecUrl + `?ts=${Date.now()}`, {
        method: "GET",
        cache: "no-store",
      });
      const text = await r.text();
      setDebugSpecRaw(text);

      const parsed = safeJsonParse<DebugSpecResponse>(text);
      if (parsed.ok) setDebugSpec(parsed.value);
      else setDebugSpec({ ok: false, projectId, error: `Non-JSON response from /debug/spec: ${parsed.error}` });
    } catch (e: any) {
      setDebugSpec({ ok: false, projectId, error: e?.message || "Unknown error calling /debug/spec" });
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
            Canonical pipeline: <span className="font-mono">POST {publishUrl}</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            className={clsx(
              "rounded px-3 py-2 text-sm font-medium shadow-sm",
              running ? "bg-gray-200 text-gray-600" : "bg-black text-white hover:opacity-90"
            )}
            onClick={runPublish}
            disabled={running}
          >
            {running ? "Running…" : "Run /publish"}
          </button>

          <button
            className={clsx(
              "rounded px-3 py-2 text-sm font-medium shadow-sm",
              running ? "bg-white border border-gray-300 hover:bg-gray-50" : "bg-gray-100 text-gray-500 border border-gray-200"
            )}
            onClick={cancelRun}
            disabled={!running}
            title="Cancel the current run"
          >
            Cancel
          </button>

          <button
            className={clsx(
              "rounded px-3 py-2 text-sm font-medium shadow-sm border",
              artifactsLoading ? "bg-gray-200 text-gray-600 border-gray-200" : "bg-white hover:bg-gray-50 border-gray-300"
            )}
            onClick={refreshArtifacts}
            disabled={artifactsLoading}
          >
            {artifactsLoading ? "Refreshing…" : "Refresh Artifacts"}
          </button>
        </div>
      </div>

      {/* Options */}
      <div className="mt-6 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm font-medium">Run options</div>
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={seed}
                onChange={(e) => setSeed(e.target.checked)}
                className="h-4 w-4"
              />
              <span>
                seed <span className="text-gray-500">(create draft spec first)</span>
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={autoPublish}
                onChange={(e) => setAutoPublish(e.target.checked)}
                className="h-4 w-4"
              />
              <span>
                autoPublish <span className="text-gray-500">(publish at end)</span>
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Status strip */}
      <div className="mt-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <div className="text-sm font-medium">Last run status</div>
            {pipelineOk === true && (
              <span className="text-xs rounded px-2 py-0.5 bg-green-100 text-green-800">PIPELINE OK</span>
            )}
            {pipelineOk === false && (
              <span className="text-xs rounded px-2 py-0.5 bg-red-100 text-red-800">PIPELINE FAILED</span>
            )}
            {pipelineOk === null && (
              <span className="text-xs rounded px-2 py-0.5 bg-gray-100 text-gray-800">NO RUN YET</span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
            <div>
              HTTP:{" "}
              <span className="font-mono">
                {lastHttpStatus === null ? "—" : String(lastHttpStatus)}
              </span>
            </div>
            <div>
              Steps: <span className="font-mono">{steps.length || "—"}</span>
            </div>
            <div>
              Source:{" "}
              <span className="font-mono">
                {lastResponse?.source ? String(lastResponse.source) : "—"}
              </span>
            </div>
          </div>
        </div>

        {lastResponse?.error ? (
          <div className="mt-3 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-900">
            <div className="font-medium">Error</div>
            <div className="mt-1 font-mono whitespace-pre-wrap">{String(lastResponse.error)}</div>
          </div>
        ) : null}
      </div>

      {/* Timeline */}
      <div className="mt-6">
        <h2 className="text-lg font-semibold">Steps timeline</h2>
        <p className="text-sm text-gray-600">Click a step to expand the response preview.</p>

        <div className="mt-3 space-y-2">
          {steps.length === 0 ? (
            <div className="rounded-lg border border-gray-200 bg-white p-4 text-sm text-gray-600">
              No steps yet. Click <span className="font-mono">Run /publish</span>.
            </div>
          ) : (
            steps.map((s, idx) => {
              const isOpen = expandedStep === idx;
              const title = s.name || `step_${idx + 1}`;
              const preview = s.bodyFirst200 || s.error || s.text || "";

              return (
                <div
                  key={idx}
                  className={clsx(
                    "rounded-lg border bg-white shadow-sm",
                    s.ok === false ? "border-red-200" : "border-gray-200"
                  )}
                >
                  <button
                    className="w-full text-left p-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
                    onClick={() => setExpandedStep(isOpen ? null : idx)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="font-mono text-sm">{idx + 1}.</div>
                      <div className="font-medium">{title}</div>
                      {stepStatusBadge(s)}
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600">
                      <div className="font-mono">{formatMs(s.ms)}</div>
                      {s.contentType ? <div className="font-mono">{s.contentType}</div> : null}
                      {typeof s.status === "number" ? <div className="font-mono">HTTP {s.status}</div> : null}
                    </div>
                  </button>

                  {isOpen ? (
                    <div className="border-t border-gray-100 px-4 pb-4">
                      <div className="mt-3 grid grid-cols-1 gap-2 text-xs text-gray-600 sm:grid-cols-2">
                        <div>
                          <span className="font-medium">Method:</span>{" "}
                          <span className="font-mono">{s.method || "—"}</span>
                        </div>
                        <div>
                          <span className="font-medium">URL:</span>{" "}
                          <span className="font-mono break-all">{s.url || "—"}</span>
                        </div>
                      </div>

                      <div className="mt-3">
                        <div className="text-xs font-medium text-gray-700">Body preview</div>
                        <pre className="mt-2 max-h-64 overflow-auto rounded bg-gray-50 p-3 text-xs text-gray-900 whitespace-pre-wrap">
{preview ? shortPreview(preview, 2000) : "—"}
                        </pre>
                      </div>
                    </div>
                  ) : null}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Artifacts */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold">Artifacts panel</h2>
        <p className="text-sm text-gray-600">
          Read-only health signals from <span className="font-mono">{debugSpecUrl}</span>.
        </p>

        <div className="mt-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm font-medium">Artifact existence</div>
            <div className="text-xs text-gray-600">
              If these show “NO” but the raw JSON contains the data, your debug/spec shape is different — still fine.
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded border border-gray-200 p-3">
              <div className="text-xs text-gray-600">seoPlan</div>
              <div className="mt-1">{boolBadge(artifactSignals?.seoPlan ?? null)}</div>
            </div>
            <div className="rounded border border-gray-200 p-3">
              <div className="text-xs text-gray-600">sitemapXml</div>
              <div className="mt-1">{boolBadge(artifactSignals?.sitemapXml ?? null)}</div>
            </div>
            <div className="rounded border border-gray-200 p-3">
              <div className="text-xs text-gray-600">published latest</div>
              <div className="mt-1">{boolBadge(artifactSignals?.publishedLatest ?? null)}</div>
            </div>
          </div>

          <details className="mt-4">
            <summary className="cursor-pointer text-sm font-medium">Raw debug/spec JSON</summary>
            <pre className="mt-2 max-h-80 overflow-auto rounded bg-gray-50 p-3 text-xs text-gray-900 whitespace-pre-wrap">
{debugSpecRaw ? shortPreview(debugSpecRaw, 50000) : "Click “Refresh Artifacts” to load raw JSON."}
            </pre>
          </details>
        </div>
      </div>

      {/* Raw publish response */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold">Raw /publish response</h2>
        <p className="text-sm text-gray-600">
          Useful when a step returns HTML or a non-standard JSON shape.
        </p>

        <details className="mt-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <summary className="cursor-pointer text-sm font-medium">Open raw response text</summary>
          <pre className="mt-2 max-h-80 overflow-auto rounded bg-gray-50 p-3 text-xs text-gray-900 whitespace-pre-wrap">
{lastRawText ? shortPreview(lastRawText, 50000) : "No run yet."}
          </pre>
        </details>
      </div>
    </div>
  );
}
