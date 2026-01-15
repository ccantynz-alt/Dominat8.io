"use client";

import { useMemo, useState } from "react";

type AgentIssue = { code: string; severity: string; message: string };

type AgentResult = {
  ok: boolean;
  agent: string;
  projectId: string;
  summary?: { totalIssues?: number; blocking?: number };
  issues?: AgentIssue[];
  pages?: string[];
  auditedAt?: string;
  updatedAt?: string;
};

export default function AgentsClient({ projectId }: { projectId: string }) {
  const [running, setRunning] = useState<string | null>(null);
  const [result, setResult] = useState<AgentResult | null>(null);
  const [error, setError] = useState<string>("");

  const finishForMeUrl = useMemo(
    () => `/api/projects/${projectId}/agents/finish-for-me`,
    [projectId]
  );

  const auditUrl = useMemo(
    () => `/api/projects/${projectId}/agents/audit`,
    [projectId]
  );

  async function runAgent(url: string, agentName: string) {
    setRunning(agentName);
    setResult(null);
    setError("");

    try {
      const res = await fetch(url, { method: "POST" });
      const text = await res.text();

      if (!res.ok) {
        setError(`HTTP ${res.status}\n\n${text}`);
        return;
      }

      setResult(JSON.parse(text));
    } catch (e: any) {
      setError(String(e));
    } finally {
      setRunning(null);
    }
  }

  return (
    <main style={{ padding: 32, fontFamily: "system-ui, sans-serif" }}>
      <h1 style={{ marginTop: 0 }}>Agents</h1>
      <p>
        Project ID: <code>{projectId}</code>
      </p>

      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        <button
          onClick={() => runAgent(finishForMeUrl, "finish-for-me")}
          disabled={!!running}
          style={{ padding: "10px 14px", fontWeight: 700 }}
        >
          {running === "finish-for-me" ? "Running…" : "Finish-for-me"}
        </button>

        <button
          onClick={() => runAgent(auditUrl, "audit")}
          disabled={!!running}
          style={{ padding: "10px 14px", fontWeight: 700 }}
        >
          {running === "audit" ? "Running…" : "Audit"}
        </button>

        <button disabled style={{ padding: "10px 14px", fontWeight: 700, opacity: 0.6 }}>
          SEO (next)
        </button>
      </div>

      {error && (
        <pre
          style={{
            whiteSpace: "pre-wrap",
            padding: 12,
            border: "1px solid rgba(255,0,0,0.35)",
            background: "rgba(255,0,0,0.06)",
            borderRadius: 10,
          }}
        >
          {error}
        </pre>
      )}

      {result && (
        <section style={{ marginTop: 18 }}>
          <h2 style={{ marginTop: 0 }}>Result: {result.agent}</h2>

          {result.summary && (
            <pre
              style={{
                whiteSpace: "pre-wrap",
                padding: 12,
                border: "1px solid rgba(0,0,0,0.12)",
                background: "rgba(0,0,0,0.03)",
                borderRadius: 10,
              }}
            >
              {JSON.stringify(result.summary, null, 2)}
            </pre>
          )}

          {result.issues && result.issues.length > 0 && (
            <ul style={{ lineHeight: 1.9 }}>
              {result.issues.map((i, idx) => (
                <li key={idx}>
                  <strong>{i.severity.toUpperCase()}</strong>: {i.message}{" "}
                  <span style={{ opacity: 0.7 }}>
                    (<code>{i.code}</code>)
                  </span>
                </li>
              ))}
            </ul>
          )}

          <details style={{ marginTop: 12 }}>
            <summary style={{ cursor: "pointer" }}>Raw JSON</summary>
            <pre
              style={{
                whiteSpace: "pre-wrap",
                padding: 12,
                border: "1px solid rgba(0,0,0,0.12)",
                background: "rgba(0,0,0,0.03)",
                borderRadius: 10,
                marginTop: 8,
              }}
            >
              {JSON.stringify(result, null, 2)}
            </pre>
          </details>
        </section>
      )}
    </main>
  );
}

