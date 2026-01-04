"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function LatestGeneratedPage() {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [html, setHtml] = useState<string>("");
  const [runId, setRunId] = useState<string | null>(null);
  const [projectId, setProjectId] = useState<string | null>(null);

  async function load() {
    try {
      setLoading(true);
      setErr(null);

      const res = await fetch("/api/generated/latest", { cache: "no-store" });
      const json = await res.json().catch(() => ({}));

      if (!res.ok || !json?.ok || !json?.data?.html) {
        throw new Error(json?.error || "No latest generated page yet.");
      }

      setHtml(String(json.data.html));
      setRunId(json.data.runId ? String(json.data.runId) : null);
      setProjectId(json.data.projectId ? String(json.data.projectId) : null);
    } catch (e: any) {
      setErr(e?.message || "Failed to load latest generated");
      setHtml("");
      setRunId(null);
      setProjectId(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 16px" }}>
      <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 10 }}>
        Latest Generated
      </h1>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 14 }}>
        <button
          onClick={load}
          style={{
            padding: "10px 12px",
            borderRadius: 10,
            border: "1px solid #111",
            background: "#111",
            color: "#fff",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Refresh
        </button>

        {runId ? (
          <Link
            href={`/generated/${runId}`}
            style={{
              padding: "10px 12px",
              borderRadius: 10,
              border: "1px solid #111",
              textDecoration: "none",
              color: "#000",
              background: "#fff",
              fontWeight: 700,
            }}
          >
            Open Run Page
          </Link>
        ) : null}

        {projectId ? (
          <Link
            href={`/projects/${projectId}`}
            style={{
              padding: "10px 12px",
              borderRadius: 10,
              border: "1px solid #111",
              textDecoration: "none",
              color: "#000",
              background: "#fff",
              fontWeight: 700,
            }}
          >
            Open Project
          </Link>
        ) : null}
      </div>

      {loading ? (
        <div style={{ padding: 16, border: "1px solid #e5e5e5", borderRadius: 12 }}>
          Loading...
        </div>
      ) : err ? (
        <div style={{ padding: 16, border: "1px solid #ffb3b3", background: "#ffe5e5", borderRadius: 12 }}>
          {err}
        </div>
      ) : (
        <div style={{ border: "1px solid #e5e5e5", borderRadius: 12, overflow: "hidden" }}>
          <iframe
            title="latest-generated"
            srcDoc={html}
            style={{ width: "100%", height: "75vh", border: 0 }}
          />
        </div>
      )}
    </div>
  );
}
