// app/projects/[projectId]/runs/[runId]/page.tsx
"use client";

import React, { useEffect, useState } from "react";

export default function RunDetailsPage({ params }: { params: { projectId: string; runId: string } }) {
  const { projectId, runId } = params;

  const [html, setHtml] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [publishUrl, setPublishUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/projects/${projectId}/runs/${runId}`, { cache: "no-store" });
      const data = await res.json();
      if (!res.ok || !data?.ok) throw new Error(data?.error || "Failed to load run");
      setHtml(data.html || "");
    } catch (e: any) {
      setError(e?.message || "Failed to load run");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function publish() {
    setPublishing(true);
    setError(null);
    try {
      const res = await fetch(`/api/projects/${projectId}/publish`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ runId }),
      });
      const data = await res.json();
      if (!res.ok || !data?.ok) throw new Error(data?.error || "Failed to publish");
      setPublishUrl(data.publishUrl || `/p/${projectId}`);
    } catch (e: any) {
      setError(e?.message || "Failed to publish");
    } finally {
      setPublishing(false);
    }
  }

  return (
    <main style={{ padding: 24, maxWidth: 1100, margin: "0 auto", fontFamily: "sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 900 }}>Run</h1>
          <div style={{ opacity: 0.75 }}>{runId}</div>
        </div>

        <button
          onClick={publish}
          disabled={publishing}
          style={{
            padding: "10px 12px",
            borderRadius: 10,
            border: "1px solid #ddd",
            cursor: publishing ? "not-allowed" : "pointer",
            fontWeight: 800,
          }}
        >
          {publishing ? "Publishing…" : "Publish"}
        </button>
      </div>

      {publishUrl ? (
        <div style={{ marginTop: 12, padding: 12, border: "1px solid #bde5bd", background: "#f3fff3", borderRadius: 12 }}>
          ✅ Published! Open:{" "}
          <a href={publishUrl} target="_blank" rel="noreferrer">
            {publishUrl}
          </a>
        </div>
      ) : null}

      {error ? (
        <div style={{ marginTop: 12, padding: 12, border: "1px solid #f99", background: "#fff5f5", borderRadius: 12 }}>
          <b>Error:</b> {error}
        </div>
      ) : null}

      <h2 style={{ marginTop: 18 }}>Preview</h2>

      {loading ? (
        <p>Loading…</p>
      ) : (
        <div style={{ border: "1px solid #eee", borderRadius: 12, overflow: "hidden" }}>
          <iframe
            title="preview"
            srcDoc={html}
            style={{ width: "100%", height: 700, border: "0" }}
          />
        </div>
      )}
    </main>
  );
}
