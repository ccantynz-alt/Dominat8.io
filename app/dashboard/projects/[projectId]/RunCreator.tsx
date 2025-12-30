"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Run = {
  id: string;
  status: string;
  createdAt: string;
  prompt?: string;
};

export default function RunCreator({ projectId }: { projectId: string }) {
  const router = useRouter();

  const [prompt, setPrompt] = useState(
    "Build a modern landing page website with pricing, FAQ, and a contact form. Use clean, minimal styling."
  );
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [lastRun, setLastRun] = useState<Run | null>(null);

  async function onCreateRun() {
    setErr(null);
    setLastRun(null);
    setLoading(true);

    try {
      const res = await fetch(`/api/projects/${projectId}/runs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.ok) {
        throw new Error(
          data?.error || `Failed to create run (HTTP ${res.status})`
        );
      }

      setLastRun(data.run ?? null);

      // Revalidate server components & refresh list
      router.refresh();
    } catch (e: any) {
      setErr(e?.message ?? String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ marginTop: 18 }}>
      <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>
        Create a run
      </h2>

      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        rows={5}
        placeholder="What should the agent build?"
        style={{
          width: "100%",
          padding: 12,
          borderRadius: 10,
          border: "1px solid #ddd",
          fontFamily: "inherit",
          lineHeight: 1.4,
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
            fontWeight: 600,
          }}
        >
          {loading ? "Creating..." : "Create run"}
        </button>

        <button
          onClick={() => {
            setErr(null);
            setLastRun(null);
            setPrompt("");
          }}
          disabled={loading}
          style={{
            padding: "10px 14px",
            borderRadius: 10,
            border: "1px solid #ddd",
            background: "#fff",
            cursor: loading ? "not-allowed" : "pointer",
            fontWeight: 600,
          }}
        >
          Clear
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

      {lastRun ? (
        <div
          style={{
            marginTop: 12,
            padding: 12,
            borderRadius: 10,
            background: "#f5fff7",
            border: "1px solid #c8f2d0",
            color: "#0b5a1a",
          }}
        >
          Created run: <span style={{ fontFamily: "monospace" }}>{lastRun.id}</span>{" "}
          <span style={{ color: "#2b6a39" }}>({lastRun.status})</span>
        </div>
      ) : null}
    </div>
  );
}
