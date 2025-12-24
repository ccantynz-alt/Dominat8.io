"use client";

import { useEffect, useRef, useState } from "react";

type Run = {
  id: string;
  status?: string;
  title?: string;
  createdAt?: number;
};

type LogLine = {
  ts: number;
  level: string;
  message: string;
};

function isJsonResponse(res: Response) {
  const ct = res.headers.get("content-type") || "";
  return ct.includes("application/json");
}

async function safeReadJson<T>(res: Response): Promise<T | null> {
  if (!isJsonResponse(res)) return null;
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

export default function RunPage({ params }: { params: { runId: string } }) {
  const runId = params.runId;

  const [run, setRun] = useState<Run | null>(null);
  const [runNotFound, setRunNotFound] = useState(false);

  const [logs, setLogs] = useState<LogLine[]>([]);
  const [loading, setLoading] = useState(true);

  const [simulating, setSimulating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const intervalRef = useRef<number | null>(null);
  const stepRef = useRef<number>(0);

  async function fetchRun() {
    const res = await fetch(`/api/runs/${runId}`, { method: "GET" });

    if (res.status === 404) {
      setRun(null);
      setRunNotFound(true);
      return;
    }

    const data = await safeReadJson<any>(res);
    if (!res.ok || !data) {
      throw new Error("Failed to load run");
    }

    // Accept either { run: {...} } or the run object directly
    const r = (data.run ?? data) as Run;
    setRun(r);
    setRunNotFound(false);
  }

  async function fetchLogs() {
    const res = await fetch(`/api/runs/${runId}/logs`, { method: "GET" });
    const data = await safeReadJson<any>(res);

    if (!res.ok || !data) {
      // If logs endpoint fails, don't hard-crash the page
      setLogs([]);
      return;
    }

    const nextLogs = Array.isArray(data.logs) ? (data.logs as LogLine[]) : [];
    setLogs(nextLogs);
  }

  async function appendLogs(lines: string[]) {
    const res = await fetch(`/api/runs/${runId}/logs/append`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ lines }),
    });

    // If your append endpoint expects a different body shape,
    // this will fail here and we’ll adjust to match it.
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(
        `Append failed (${res.status}). ${text ? "Response: " + text : ""}`.trim()
      );
    }
  }

  function stopSimulation() {
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setSimulating(false);
  }

  async function startSimulation() {
    setError(null);
    setSimulating(true);
    stepRef.current = 0;

    try {
      await appendLogs([`Starting simulation for ${runId}…`]);
      await fetchLogs();

      intervalRef.current = window.setInterval(async () => {
        try {
          stepRef.current += 1;

          const step = stepRef.current;
          const lines = [
            `Step ${step}: Doing work…`,
            step % 3 === 0 ? "Calling tool…" : "Processing…",
            step % 5 === 0 ? "Writing output…" : "Still running…",
          ];

          await appendLogs(lines);
          await fetchLogs();

          if (step >= 12) {
            await appendLogs(["Simulation complete ✅"]);
            await fetchLogs();
            stopSimulation();
          }
        } catch (e: any) {
          stopSimulation();
          setError(e?.message ?? "Simulation error");
        }
      }, 900);
    } catch (e: any) {
      stopSimulation();
      setError(e?.message ?? "Simulation error");
    }
  }

  // Initial load
  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      setError(null);

      try {
        await fetchRun();
        await fetchLogs();
      } catch (e: any) {
        if (!cancelled) setError(e?.message ?? "Load error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      stopSimulation();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [runId]);

  if (loading) {
    return (
      <div style={{ padding: 16 }}>
        <h1>Run: {runId}</h1>
        <p>Loading…</p>
      </div>
    );
  }

  if (runNotFound) {
    return (
      <div style={{ padding: 16 }}>
        <h1>Run: {runId}</h1>
        <p>Run not found</p>
      </div>
    );
  }

  return (
    <div style={{ padding: 16 }}>
      <h1>Run: {runId}</h1>

      <div style={{ marginTop: 8, marginBottom: 12 }}>
        <div>
          <strong>Title:</strong> {run?.title ?? "Untitled"}
        </div>
        <div>
          <strong>Status:</strong> {run?.status ?? "unknown"}
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <button onClick={fetchLogs} disabled={simulating}>
          Refresh logs
        </button>

        <button onClick={startSimulation} disabled={simulating}>
          {simulating ? "Simulating…" : "Simulate Logs"}
        </button>

        {simulating && (
          <button onClick={stopSimulation}>
            Stop
          </button>
        )}
      </div>

      {error && (
        <p style={{ marginTop: 12, color: "red" }}>
          Error: {error}
        </p>
      )}

      <pre style={{ marginTop: 16, padding: 12, border: "1px solid #ddd" }}>
        {logs.length === 0
          ? "(no logs yet)"
          : logs
              .map(
                (l) =>
                  `${new Date(l.ts).toISOString()} [${l.level}] ${l.message}`
              )
              .join("\n")}
      </pre>
    </div>
  );
}
