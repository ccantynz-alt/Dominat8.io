// src/app/projects/[projectId]/finish-my-site/FinishMySiteClient.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type AnyJson = any;

async function fetchJson(url: string, init?: RequestInit) {
  const res = await fetch(url, {
    ...init,
    cache: "no-store",
    headers: {
      ...(init?.headers || {}),
    },
  });

  const ct = res.headers.get("content-type") || "";
  const text = await res.text();

  let json: AnyJson = null;
  if (ct.includes("application/json")) {
    try {
      json = JSON.parse(text);
    } catch {
      json = null;
    }
  }

  return { ok: res.ok, status: res.status, ct, text, json };
}

export default function FinishMySiteClient({ projectId }: { projectId: string }) {
  const [isRunning, setIsRunning] = useState(false);
  const [lastLaunch, setLastLaunch] = useState<AnyJson | null>(null);
  const [pipeline, setPipeline] = useState<AnyJson | null>(null);
  const [error, setError] = useState<string | null>(null);

  const pollTimer = useRef<number | null>(null);

  const launchUrl = useMemo(() => {
    const targetCount = 5000;
    const chunkSize = 500;
    return `/api/projects/${projectId}/agents/launch-run?targetCount=${targetCount}&chunkSize=${chunkSize}&ts=${Date.now()}`;
  }, [projectId]);

  const pipelineUrl = useMemo(() => {
    return `/api/projects/${projectId}/agents/pipeline?ts=${Date.now()}`;
  }, [projectId]);

  async function loadPipelineOnce() {
    const r = await fetchJson(pipelineUrl, { method: "GET" });
    if (!r.ok) {
      setPipeline({
        ok: false,
        status: r.status,
        contentType: r.ct,
        bodyPreview: (r.text || "").slice(0, 300),
      });
      return;
    }
    setPipeline(r.json ?? { ok: true, raw: r.text });
  }

  function startPolling() {
    stopPolling();
    pollTimer.current = window.setInterval(() => {
      loadPipelineOnce().catch(() => {});
    }, 3000);
  }

  function stopPolling() {
    if (pollTimer.current) {
      window.clearInterval(pollTimer.current);
      pollTimer.current = null;
    }
  }

  useEffect(() => {
    loadPipelineOnce().catch(() => {});
    return () => stopPolling();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  async function onRun() {
    setError(null);
    setIsRunning(true);
    setLastLaunch(null);

    try {
      const r = await fetchJson(launchUrl, { method: "POST" });

      if (!r.ok) {
        setError(
          `launch-run failed: HTTP ${r.status} (${r.ct || "no content-type"})`
        );
        setLastLaunch({
          ok: false,
          status: r.status,
          contentType: r.ct,
          bodyPreview: (r.text || "").slice(0, 500),
        });
        setIsRunning(false);
        return;
      }

      setLastLaunch(r.json ?? { ok: true, raw: r.text });

      await loadPipelineOnce();
      startPolling();
    } catch (e: any) {
      setError(e?.message || "launch-run error");
    } finally {
      setIsRunning(false);
    }
  }

  async function onRefresh() {
    setError(null);
    await loadPipelineOnce();
  }

  return (
    <section className="rounded-xl border p-4">
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={onRun}
          disabled={isRunning}
          className="rounded-lg bg-black px-4 py-2 text-white disabled:opacity-50"
        >
          {isRunning ? "Running..." : "Finish my site (Launch Run)"}
        </button>

        <button
          onClick={onRefresh}
          className="rounded-lg border px-4 py-2"
          type="button"
        >
          Refresh pipeline
        </button>

        <button
          onClick={() => {
            stopPolling();
            setError(null);
          }}
          className="rounded-lg border px-4 py-2"
          type="button"
        >
          Stop polling
        </button>
      </div>

      <div className="mt-3 text-sm opacity-80">
        <div>
          <span className="font-medium">Project:</span>{" "}
          <code className="px-1">{projectId}</code>
        </div>
        <div>
          <span className="font-medium">Endpoint:</span>{" "}
          <code className="px-1">POST /agents/launch-run</code>
        </div>
        <div>
          <span className="font-medium">Status:</span>{" "}
          {pollTimer.current ? "Polling pipeline..." : "Not polling"}
        </div>
      </div>

      {error ? (
        <div className="mt-4 rounded-lg border border-red-300 bg-red-50 p-3 text-sm">
          <div className="font-semibold">Error</div>
          <div className="mt-1 whitespace-pre-wrap">{error}</div>
        </div>
      ) : null}

      <div className="mt-5">
        <h3 className="text-sm font-semibold">Last launch-run result</h3>
        <pre className="mt-2 max-h-80 overflow-auto rounded-lg border p-3 text-xs">
{JSON.stringify(lastLaunch, null, 2)}
        </pre>
      </div>

      <div className="mt-5">
        <h3 className="text-sm font-semibold">Pipeline status</h3>
        <pre className="mt-2 max-h-80 overflow-auto rounded-lg border p-3 text-xs">
{JSON.stringify(pipeline, null, 2)}
        </pre>
      </div>
    </section>
  );
}
