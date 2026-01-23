// components/FinishMySiteClient.tsx
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
        setError(`launch-run failed: HTTP ${r.status} (${r.ct || "no content-type"})`);
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
    <section style={{ border: "1px solid #ddd", borderRadius: 12, padding: 16 }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
        <button
          onClick={onRun}
          disabled={isRunning}
          style={{
            padding: "10px 14px",
            borderRadius: 10,
            border: "1px solid #111",
            background: "#111",
            color: "#fff",
            opacity: isRunning ? 0.6 : 1,
            cursor: isRunning ? "not-allowed" : "pointer",
          }}
        >
          {isRunning ? "Running..." : "Finish my site (Launch Run)"}
        </button>

        <button
          onClick={onRefresh}
          type="button"
          style={{
            padding: "10px 14px",
            borderRadius: 10,
            border: "1px solid #ddd",
            background: "#fff",
            cursor: "pointer",
          }}
        >
          Refresh pipeline
        </button>

        <button
          onClick={() => {
            stopPolling();
            setError(null);
          }}
          type="button"
          style={{
            padding: "10px 14px",
            borderRadius: 10,
            border: "1px solid #ddd",
            background: "#fff",
            cursor: "pointer",
          }}
        >
          Stop polling
        </button>
      </div>

      <div style={{ marginTop: 12, fontSize: 13, opacity: 0.8, lineHeight: 1.6 }}>
        <div>
          <strong>Project:</strong> <code>{projectId}</code>
        </div>
        <div>
          <strong>Endpoint:</strong> <code>POST /agents/launch-run</code>
        </div>
        <div>
          <strong>Status:</strong> {pollTimer.current ? "Polling pipeline..." : "Not polling"}
        </div>
      </div>

      {error ? (
        <div style={{ marginTop: 16, border: "1px solid #f2b8b5", background: "#fff5f5", borderRadius: 10, padding: 12 }}>
          <div style={{ fontWeight: 700 }}>Error</div>
          <div style={{ marginTop: 6, whiteSpace: "pre-wrap", fontSize: 13 }}>{error}</div>
        </div>
      ) : null}

      <div style={{ marginTop: 18 }}>
        <h3 style={{ fontSize: 13, fontWeight: 700 }}>Last launch-run result</h3>
        <pre style={{ marginTop: 8, maxHeight: 320, overflow: "auto", border: "1px solid #eee", borderRadius: 10, padding: 12, fontSize: 12 }}>
{JSON.stringify(lastLaunch, null, 2)}
        </pre>
      </div>

      <div style={{ marginTop: 18 }}>
        <h3 style={{ fontSize: 13, fontWeight: 700 }}>Pipeline status</h3>
        <pre style={{ marginTop: 8, maxHeight: 320, overflow: "auto", border: "1px solid #eee", borderRadius: 10, padding: 12, fontSize: 12 }}>
{JSON.stringify(pipeline, null, 2)}
        </pre>
      </div>
    </section>
  );
}
