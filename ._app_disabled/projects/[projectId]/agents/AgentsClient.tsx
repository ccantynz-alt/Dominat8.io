"use client";

import { useState } from "react";

type Issue = { code: string; severity: string; message: string };

type AgentResult = {
  ok: boolean;
  agent: string;
  projectId: string;
  summary?: { totalIssues?: number; blocking?: number };
  issues?: Issue[];
  pages?: string[];
  error?: string;
};

export default function AgentsClient({ projectId }: { projectId: string }) {
  const [running, setRunning] = useState<string | null>(null);
  const [result, setResult] = useState<AgentResult | null>(null);
  const [error, setError] = useState("");

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
        // Try parse JSON error body
        try {
          const j = JSON.parse(text);
          if (j?.error === "PRO_REQUIRED") {
            setError(`PRO REQUIRED\n\nUpgrade to run: ${agent}`);
          } else {
            setError(`HTTP ${res.status}\n\n${text}`);
          }
        } catch {
          setError(`HTTP ${res.status}\n\n${text}`);
        }
        return;
      }

      setResult(JSON.parse(text));
    } catch (e: any) {
      setError(String(e));
    } finally {
      setRunning(null);
    }
  }

  const showUpgrade = error.startsWith("PRO REQUIRED");

  return (
    <main style={{ padding: 32, fontFamily: "system-ui, sans-serif" }}>
      <h1>Agents</h1>
      <p>
        Project ID: <code>{projectId}</code>
      </p>

      <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
        <button onClick={() => run("finish-for-me")} disabled={!!running}>
          {running === "finish-for-me" ? "Running…" : "Finish-for-me"}
        </button>

        <button onClick={() => run("audit")} disabled={!!running}>
          {running === "audit" ? "Running…" : "Audit (Free)"}
        </button>

        <button onClick={() => run("seo")} disabled={!!running}>
          {running === "seo" ? "Running…" : "SEO (Pro)"}
        </button>
      </div>

      {error && (
        <div
          style={{
            padding: 12,
            borderRadius: 10,
            border: "1px solid rgba(255,0,0,0.25)",
            background: "rgba(255,0,0,0.06)",
            marginBottom: 16,
            whiteSpace: "pre-wrap",
          }}
        >
          {error}
          {showUpgrade && (
            <div style={{ marginTop: 10 }}>
              <a href="/upgrade" style={{ fontWeight: 800 }}>
                Go to Upgrade →
              </a>
            </div>
          )}
        </div>
      )}

      {result && (
        <section>
          <h2>Result: {result.agent}</h2>
          {result.summary && <pre>{JSON.stringify(result.summary, null, 2)}</pre>}
          {result.issues && (
            <ul>
              {result.issues.map((i, idx) => (
                <li key={idx}>
                  <strong>{i.severity.toUpperCase()}</strong>: {i.message}{" "}
                  <code>({i.code})</code>
                </li>
              ))}
            </ul>
          )}
          {result.pages && <pre>{JSON.stringify(result.pages, null, 2)}</pre>}
        </section>
      )}
    </main>
  );
}
