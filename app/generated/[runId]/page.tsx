"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

type Generated = {
  projectId: string;
  runId: string;
  html: string;
  createdAt: string;
};

export default function GeneratedRunPage() {
  const params = useParams();
  const runId = String(params?.runId || "");

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<Generated | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setErr(null);

    try {
      const res = await fetch(`/api/generated/run/${runId}`, { cache: "no-store" });
      const json = await res.json();

      if (!json?.ok) throw new Error("Failed to load generated output");
      setData(json.data || null);
      setLoading(false);
    } catch (e: any) {
      setErr(e?.message || "Failed to load");
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [runId]);

  return (
    <main style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12 }}>
        <div>
          <h1 style={{ margin: 0 }}>Generated Run</h1>
          <p style={{ marginTop: 8, color: "#666" }}>
            Run: <code>{runId}</code>
          </p>
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          <a href="/generated" style={linkStyle}>Latest Generated</a>
          <a href="/runs/latest" style={linkStyle}>Latest Run</a>
          <a href="/projects" style={linkStyle}>Projects</a>
        </div>
      </div>

      <div style={{ marginTop: 12 }}>
        <button onClick={load} style={buttonStyle}>Refresh</button>
      </div>

      {loading && <p style={{ marginTop: 16 }}>Loading…</p>}
      {err && <p style={{ marginTop: 16, color: "crimson" }}>{err}</p>}

      {!loading && !err && !data && (
        <div style={cardStyle}>
          <b>No generated page found for this run yet.</b>
          <div style={{ marginTop: 8, color: "#666", fontSize: 13 }}>
            Execute the run first, then refresh.
          </div>
        </div>
      )}

      {!loading && !err && data && (
        <div style={{ marginTop: 16 }}>
          <div style={cardStyle}>
            <div style={{ fontSize: 13, color: "#666" }}>
              Project: <code>{data.projectId}</code>
            </div>
            <div style={{ marginTop: 6, fontSize: 13, color: "#666" }}>
              Created: {new Date(data.createdAt).toLocaleString()}
            </div>
          </div>

          <div style={{ marginTop: 12, border: "1px solid #ddd", borderRadius: 12, overflow: "hidden" }}>
            <iframe
              title="Generated Site"
              srcDoc={data.html}
              style={{ width: "100%", height: "70vh", border: "0" }}
            />
          </div>
        </div>
      )}
    </main>
  );
}

const linkStyle: React.CSSProperties = {
  color: "#111",
  textDecoration: "underline",
  fontSize: 14,
};

const buttonStyle: React.CSSProperties = {
  padding: "0.6rem 1rem",
  borderRadius: 10,
  border: "1px solid #ddd",
  background: "#fff",
  cursor: "pointer",
  fontSize: 14,
};

const cardStyle: React.CSSProperties = {
  marginTop: 12,
  border: "1px solid #ddd",
  borderRadius: 12,
  padding: "1rem",
  background: "#fff",
};
