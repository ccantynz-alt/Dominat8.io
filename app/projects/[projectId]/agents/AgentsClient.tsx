"use client";

import { useMemo, useState } from "react";

type AgentResult = {
  ok: boolean;
  agent: string;
  projectId: string;
  summary?: any;
  issues?: { code: string; severity: string; message: string }[];
  pages?: string[];
  auditedAt?: string;
};

export default function AgentsClient({ projectId }: { projectId: string }) {
  const [running, setRunning] = useState<string | null>(null);
  const [result, setResult] = useState<AgentResult | null>(null);
  const [error, setError] = useState<string>("");

  function endpoint(agent: string) {
    return `/api/projects/${projectId}/agents/${agent}`;
  }

  async function run(agent: string) {
    setRunning(agent);
    setResult(null);
    setError("");

    try {
      const res = await fetch(endpoint(agent), { method: "POST" });
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
    <main style={{ padding: 32, fontFamily: "system-ui" }}>
      <h1>Agents</h1>
      <p>
        Project ID: <code>{projectId}</code>
      </p>

      <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
        <button onClick={() => run("finish-for-me")} disabled={!!running}>
          {running === "finish-for-me" ? "Running…" : "Finish-for-me"}
        </button>

        <button onClick={() => run("audit")} disabled={!!running}>
          {running === "audit" ? "Running…" : "Audit"}
        </button>

        <button disabled>SEO (next)</button>
      </div>

      {error && (
        <pre style={{ color: "red", whiteSpace: "pre-wrap" }}>{error}</pre>
      )}

      {result && (
        <section style={{ marginTop: 20 }}>
          <h2>Agent Result: {result.agent}</h2>

          {result.summary && (
            <pre>{JSON.stringify(result.summary, null, 2)}</pre>
          )}

          {result.issues && (
            <ul>
              {result.issues.map((i, idx) => (
                <li key={idx}>
                  <strong>{i.severity.toUpperCase()}</strong>: {i.message}
                </li>
              ))}
            </ul>
          )}

          {result.pages && (
            <pre>{JSON.stringify(result.pages, null, 2)}</pre>
          )}
        </section>
      )}
    </main>
  );
}
