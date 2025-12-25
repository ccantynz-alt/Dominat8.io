"use client";

import { useEffect, useMemo, useState } from "react";

type Run = {
  id: string;
  projectId?: string;
  createdAt?: number;
  createdBy?: string;
  status?: string;
  title?: string;
};

type LogEntry =
  | { t?: number; level?: string; msg?: string }
  | string
  | number
  | boolean
  | null
  | Record<string, unknown>;

function safeJsonParse(text: string) {
  try {
    return { ok: true as const, value: JSON.parse(text) };
  } catch {
    return { ok: false as const, value: text };
  }
}

async function fetchJsonDebug(url: string, init?: RequestInit) {
  const res = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });

  const text = await res.text();
  const parsed = safeJsonParse(text);

  return {
    status: res.status,
    ok: res.ok,
    rawText: text,
    json: parsed.ok ? parsed.value : null,
    parsedOk: parsed.ok,
  };
}

export default function RunPage({ params }: { params: { runId: string } }) {
  const runId = params.runId;

  const [run, setRun] = useState<Run | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loadRunError, setLoadRunError] = useState<string | null>(null);
  const [loadLogsError, setLoadLogsError] = useState<string | null>(null);

  const [debugRun, setDebugRun] = useState<any>(null);
  const [debugLogs, setDebugLogs] = useState<any>(null);
  const [debugAppend, setDebugAppend] = useState<any>(null);

  const title = useMemo(() => run?.title ?? "Untitled", [run]);
  const status = useMemo(() => run?.status ?? "unknown", [run]);

  async function loadRun() {
    setLoadRunError(null);
    setRun(null);
    setDebugRun(null);

    const r = await fetchJsonDebug(`/api/runs/${encodeURIComponent(runId)}`);
    setDebugRun(r);

    if (!r.ok) {
      setLoadRunError(
        `Failed to load run (HTTP ${r.status}). See debug section below.`
      );
      return;
    }

    // Expected shape: { ok: true, run: {...} }
    const payload = r.json;
    const runObj = payload?.run ?? null;

    if (!runObj || typeof runObj !== "object") {
      setLoadRunError(
        `Run payload missing "run" object (HTTP ${r.status}). See debug section below.`
      );
      return;
    }

    setRun(runObj as Run);
  }

  async function loadLogs() {
    setLoadLogsError(null);
    setLogs([]);
    setDebugLogs(null);

    const r = await fetchJsonDebug(
      `/api/runs/${encodeURIComponent(runId)}/logs`
    );
    setDebugLogs(r);

    if (!r.ok) {
      setLoadLogsError(
        `Failed to load logs (HTTP ${r.status}). See debug section below.`
      );
      return;
    }

    const payload = r.json;
    const logsArr = payload?.logs;

    if (!Array.isArray(logsArr)) {
      setLoadLogsError(
        `Logs payload missing "logs" array (HTTP ${r.status}). See debug section below.`
      );
      return;
    }

    setLogs(logsArr as LogEntry[]);
  }

  async function simulateLogs() {
    setDebugAppend(null);

    // Append a few logs with delays so you can see them show up
    const messages = [
      "Starting simulated work…",
      "Thinking…",
      "Still working…",
      "Done ✅",
    ];

    for (const msg of messages) {
      const r = await fetchJsonDebug(
        `/api/runs/${encodeURIComponent(runId)}/logs/append`,
        {
          method: "POST",
          body: JSON.stringify({ msg, level: "info" }),
        }
      );

      setDebugAppend(r);

      // If append fails, stop early and show debug
      if (!r.ok) return;

      // small delay between log writes
      await new Promise((resolve) => setTimeout(resolve, 600));
    }

    await loadLogs();
  }

  useEffect(() => {
    // On first load, load run + logs
    loadRun();
    loadLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [runId]);

  return (
    <div style={{ padding: 16, fontFamily: "system-ui, Arial, sans-serif" }}>
      <h1 style={{ margin: 0, marginBottom: 12 }}>Run: {runId}</h1>

      <div style={{ marginBottom: 12 }}>
        <div>
          <b>Title:</b> {title}
        </div>
        <div>
          <b>Status:</b> {status}
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <button onClick={loadLogs}>Refresh logs</button>
        <button onClick={simulateLogs}>Simulate Logs</button>
        <button onClick={loadRun}>Reload run</button>
      </div>

      {loadRunError ? (
        <div style={{ color: "red", marginBottom: 12 }}>
          <b>Error:</b> {loadRunError}
        </div>
      ) : null}

      <div
        style={{
          border: "1px solid #ddd",
          borderRadius: 6,
          padding: 12,
          marginBottom: 12,
        }}
      >
        <b>Logs</b>
        <div style={{ marginTop: 8 }}>
          {loadLogsError ? (
            <div style={{ color: "red", marginBottom: 8 }}>
              <b>Error:</b> {loadLogsError}
            </div>
          ) : null}

          {logs.length === 0 ? (
            <div style={{ opacity: 0.7 }}>(no logs yet)</div>
          ) : (
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              {logs.map((l, idx) => (
                <li key={idx}>
                  <code>
                    {typeof l === "object"
                      ? JSON.stringify(l)
                      : String(l)}
                  </code>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* DEBUG PANEL */}
      <div
        style={{
          border: "1px solid #ddd",
          borderRadius: 6,
          padding: 12,
          background: "#fafafa",
        }}
      >
        <b>Debug (helps us fix it fast)</b>

        <div style={{ marginTop: 12 }}>
          <div style={{ fontWeight: 600 }}>GET /api/runs/{runId}</div>
          <pre style={{ whiteSpace: "pre-wrap" }}>
            {debugRun ? JSON.stringify(debugRun, null, 2) : "(not loaded yet)"}
          </pre>
        </div>

        <div style={{ marginTop: 12 }}>
          <div style={{ fontWeight: 600 }}>GET /api/runs/{runId}/logs</div>
          <pre style={{ whiteSpace: "pre-wrap" }}>
            {debugLogs ? JSON.stringify(debugLogs, null, 2) : "(not loaded yet)"}
          </pre>
        </div>

        <div style={{ marginTop: 12 }}>
          <div style={{ fontWeight: 600 }}>
            POST /api/runs/{runId}/logs/append (last attempt)
          </div>
          <pre style={{ whiteSpace: "pre-wrap" }}>
            {debugAppend
              ? JSON.stringify(debugAppend, null, 2)
              : "(click Simulate Logs to test)"}
          </pre>
        </div>
      </div>
    </div>
  );
}
