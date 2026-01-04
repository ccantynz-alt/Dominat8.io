"use client";

import { useEffect, useState } from "react";

export default function GeneratedRunPage({ params }: { params: { runId: string } }) {
  const runId = params.runId;

  const [html, setHtml] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  async function load() {
    try {
      setErr(null);
      setLoading(true);

      const res = await fetch(`/api/generated/run/${runId}`, { cache: "no-store" });
      const json = await res.json().catch(() => ({}));

      if (!res.ok || !json?.ok || !json?.data?.html) {
        const msg = json?.error || "No generated page found for this run yet.";
        throw new Error(msg);
      }

      setHtml(String(json.data.html));
    } catch (e: any) {
      setErr(e?.message || "Failed to load generated run");
      setHtml("");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [runId]);

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 16px" }}>
      <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>Generated Run</h1>
      <div style={{ marginBottom: 12, opacity: 0.85 }}>Run: {runId}</div>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 14 }}>
        <button
          onClick={load}
          style={{
            padding: "10px 12px",
            borderRadius: 10,
            border: "1px solid #111",
            background: "#111",
            color: "#fff",
            cursor: "pointer",
            fontWeight: 700,
          }}
        >
          Refresh
        </button>

        <a
          href={`/api/generated/run/${runId}/download`}
          style={{
            padding: "10px 12px",
            borderRadius: 10,
            border: "1px solid #111",
            background: "#fff",
            color: "#000",
            textDecoration: "none",
            fontWeight: 700,
            display: "inline-block",
          }}
        >
          Download HTML
        </a>
      </div>

      {loading ? (
        <div style={{ padding: 16, border: "1px solid #e5e5e5", borderRadius: 12 }}>
          Loading...
        </div>
      ) : err ? (
        <div
          style={{
            padding: 16,
            border: "1px solid #ffb3b3",
            background: "#ffe5e5",
            borderRadius: 12,
          }}
        >
          <strong>No generated page found for this run yet.</strong>
          <div style={{ marginTop: 8, opacity: 0.85 }}>{err}</div>
          <div style={{ marginTop: 10, opacity: 0.85 }}>Execute the run first, then refresh.</div>
        </div>
      ) : (
        <div style={{ border: "1px solid #e5e5e5", borderRadius: 12, overflow: "hidden" }}>
          <iframe title={`generated-${runId}`} srcDoc={html} style={{ width: "100%", height: "75vh", border: "0" }} />
        </div>
      )}
    </div>
  );
}
