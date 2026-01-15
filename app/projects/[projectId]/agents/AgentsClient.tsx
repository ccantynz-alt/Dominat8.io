"use client";

import { useMemo, useState } from "react";

export default function AgentsClient({ projectId }: { projectId: string }) {
  const [running, setRunning] = useState(false);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const endpoint = useMemo(
    () => `/api/projects/${projectId}/agents/finish-for-me`,
    [projectId]
  );

  async function run() {
    setRunning(true);
    setOutput("");
    setError("");

    try {
      const res = await fetch(endpoint, { method: "POST" });
      const text = await res.text();

      if (!res.ok) {
        setError(`HTTP ${res.status}\n\n${text}`);
        return;
      }

      setOutput(text);
    } catch (e: any) {
      setError(String(e));
    } finally {
      setRunning(false);
    }
  }

  return (
    <main style={{ padding: 32, fontFamily: "system-ui" }}>
      <h1>Agents</h1>
      <p>
        Project ID: <code>{projectId}</code>
      </p>

      <button
        onClick={run}
        disabled={running}
        style={{
          padding: "10px 16px",
          fontWeight: 700,
          borderRadius: 8,
          border: "1px solid #ccc",
          cursor: running ? "not-allowed" : "pointer",
        }}
      >
        {running ? "Running…" : "Run Finish-for-me"}
      </button>

      <pre style={{ marginTop: 20, whiteSpace: "pre-wrap" }}>
        {error || output || "No output yet"}
      </pre>
    </main>
  );
}
