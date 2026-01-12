"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function LatestRunPage() {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [runId, setRunId] = useState<string | null>(null);
  const [run, setRun] = useState<any>(null);

  async function load() {
    try {
      setLoading(true);
      setErr(null);

      const res = await fetch("/api/runs/latest", { cache: "no-store" });
      const json = await res.json().catch(() => ({}));

      if (!res.ok || !json?.ok || !json?.runId) {
        throw new Error(json?.error || "No latest run yet.");
      }

      setRunId(json.runId);
      setRun(json.run);
    } catch (e: any) {
      setErr(e?.message || "Failed to load latest run");
      setRunId(null);
      setRun(null);
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
        Latest Run
      </h1>

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
          marginBottom: 16,
        }}
      >
        Refresh
      </button>

      {loading ? (
        <div style={{ padding: 16, border: "1px solid #e5e5e5", borderRadius: 12 }}>
          Loading...
        </div>
      ) : err ? (
        <div style={{ padding: 16, border: "1px solid #ffb3b3", background: "#ffe5e5", borderRadius: 12 }}>
          {err}
        </div>
      ) : (
        <div style={{ padding: 16, border: "1px solid #e5e5e5", borderRadius: 12 }}>
          <div><strong>Run ID:</strong> {runId}</div>
          <div style={{ marginTop: 6 }}><strong>Status:</strong> {run?.status}</div>
          <div style={{ marginTop: 6 }}><strong>Project:</strong> {run?.projectId}</div>

          <div style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap" }}>
            {runId ? (
              <Link
                href={`/generated/${runId}`}
                style={{
                  padding: "8px 12px",
                  borderRadius: 10,
                  border: "1px solid #111",
                  textDecoration: "none",
                  color: "#000",
                  background: "#fff",
                  fontWeight: 700,
                }}
              >
                View Generated
              </Link>
            ) : null}

            {run?.projectId ? (
              <Link
                href={`/projects/${run.projectId}`}
                style={{
                  padding: "8px 12px",
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
        </div>
      )}
    </div>
  );
}
