// app/projects/[projectId]/RunDemoPanel.tsx
"use client";

import React, { useState } from "react";

export default function RunDemoPanel({ projectId }: { projectId: string }) {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function runAndGenerateDemo() {
    setBusy(true);
    setMsg(null);

    try {
      // 1) Create run
      const runRes = await fetch(`/api/projects/${projectId}/runs`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({}),
      });
      const runData = await runRes.json();
      if (!runRes.ok || !runData?.ok) throw new Error(runData?.error || "Failed to create run");

      const runId = runData?.run?.id;
      if (!runId) throw new Error("Run created but no runId returned");

      // 2) Complete run (demo) -> writes HTML to KV and sets outputKey
      const genRes = await fetch(
        `/api/projects/${projectId}/runs/${runId}/complete-demo`,
        { method: "POST" }
      );
      const genData = await genRes.json();
      if (!genRes.ok || !genData?.ok) throw new Error(genData?.error || "Failed to generate demo output");

      setMsg(`✅ Run complete. Latest run is ${runId}. Now click Publish.`);
    } catch (e: any) {
      setMsg(`❌ ${e?.message || "Failed"}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ border: "1px solid #e5e5e5", borderRadius: 12, padding: 16, marginTop: 16 }}>
      <div style={{ fontWeight: 700, marginBottom: 8 }}>Run (Demo Generator)</div>

      <button
        onClick={runAndGenerateDemo}
        disabled={busy}
        style={{
          padding: "10px 12px",
          borderRadius: 10,
          border: "1px solid #ddd",
          cursor: busy ? "not-allowed" : "pointer",
          fontWeight: 600,
          marginRight: 8,
        }}
      >
        {busy ? "Running…" : "Create Run + Generate Demo Output"}
      </button>

      {msg ? <div style={{ marginTop: 10, fontSize: 14 }}>{msg}</div> : null}
    </div>
  );
}
