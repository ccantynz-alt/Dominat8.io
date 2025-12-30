"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RunCreator({ projectId }: { projectId: string }) {
  const router = useRouter();

  const [prompt, setPrompt] = useState("Build a modern landing page. Clean minimal styling.");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onCreateRun() {
    setErr(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/runs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.ok) {
        throw new Error(data?.error || `Failed to create run (HTTP ${res.status})`);
      }

      router.refresh();
    } catch (e: any) {
      setErr(e?.message ?? String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ marginTop: 18, marginBottom: 18 }}>
      <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>Create a run</h2>

      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        rows={4}
        style={{
          width: "100%",
          padding: 12,
          borderRadius: 10,
          border: "1px solid #ddd",
          fontFamily: "inherit",
        }}
      />

      <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
        <button
          onClick={onCreateRun}
          disabled={loading || !prompt.trim()}
          style={{
            padding: "10px 14px",
            borderRadius: 10,
            border: "1px solid #111",
            background: loading ? "#eee" : "#111",
            color: loading ? "#111" : "#fff",
            cursor: loading ? "not-allowed" : "pointer",
            fontWeight: 700,
          }}
        >
          {loading ? "Creating..." : "Create run"}
        </button>
      </div>

      {err ? (
        <div
          style={{
            marginTop: 12,
            padding: 12,
            borderRadius: 10,
            background: "#fff3f3",
            border: "1px solid #ffd1d1",
            color: "#8a0000",
            whiteSpace: "pre-wrap",
          }}
        >
          {err}
        </div>
      ) : null}
    </div>
  );
}
