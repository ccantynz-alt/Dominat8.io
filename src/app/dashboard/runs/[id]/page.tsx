"use client";

import { useEffect, useState } from "react";

export default function RunDetailPage({ params }: { params: { id: string } }) {
  const [run, setRun] = useState<any>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [err, setErr] = useState<string>("");

  async function load() {
    setErr("");
    const res = await fetch(`/api/runs/${params.id}`, { cache: "no-store" });
    const data = await res.json();

    if (!data.ok) {
      setErr(data.error ?? "Not found");
      return;
    }

    setRun(data.run);
    setLogs(data.logs ?? []);
  }

  useEffect(() => {
    load();
    const t = setInterval(load, 2500);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  if (err) return <div style={{ padding: 20 }}>{err}</div>;
  if (!run) return <div style={{ padding: 20 }}>Loading…</div>;

  return (
    <main
      style={{
        maxWidth: 980,
        margin: "40px auto",
        padding: "0 16px",
        fontFamily: "ui-sans-serif"
      }}
    >
      <a href="/dashboard" style={{ textDecoration: "none" }}>
        ← Back
      </a>

      <h1 style={{ fontSize: 24, fontWeight: 800, marginTop: 10 }}>{run.title}</h1>

      <div style={{ marginTop: 8, opacity: 0.85 }}>
        <div>
          <b>ID:</b> {run.id}
        </div>
        <div>
          <b>Kind:</b> {run.kind}
        </div>
        <div>
          <b>Status:</b> {run.status}
        </div>
        <div>
          <b>Updated:</b> {new Date(run.updatedAt).toLocaleString()}
        </div>
      </div>

      <h2 style={{ fontSize: 16, fontWeight: 800, marginTop: 18 }}>Logs</h2>

      <pre
        style={{
          marginTop: 10,
          padding: 12,
          border: "1px solid #e5e5e5",
          borderRadius: 12,
          background: "#fafafa",
          whiteSpace: "pre-wrap",
          lineHeight: 1.4
        }}
      >
        {logs.length ? logs.join("\n") : "No logs yet."}
      </pre>
    </main>
  );
}
