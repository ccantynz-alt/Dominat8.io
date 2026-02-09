"use client";

import { useEffect, useState } from "react";

type Status = {
  ok: boolean;
  service: string;
  ts: string;
  stamp: string;
  sha: string;
  branch: string;
  vercel: { env: string; url: string; region: string };
};

export default function TVPage() {
  const [status, setStatus] = useState<Status | null>(null);
  const [err, setErr] = useState<string>("");

  async function load() {
    setErr("");
    try {
      const r = await fetch("/api/tv/status?ts=" + Date.now(), { cache: "no-store" });
      if (!r.ok) throw new Error("HTTP " + r.status);
      const j = (await r.json()) as Status;
      setStatus(j);
    } catch (e: any) {
      setErr(e?.message || String(e));
    }
  }

  useEffect(() => {
    load();
    const t = setInterval(load, 5000);
    return () => clearInterval(t);
  }, []);

  return (
    <main style={{ padding: 20, fontFamily: "system-ui" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
        <h1 style={{ margin: 0, fontSize: 20 }}>TV Cockpit</h1>
        <span
          style={{
            padding: "2px 8px",
            borderRadius: 999,
            fontSize: 12,
            border: "1px solid #999",
            opacity: 0.85,
          }}
        >
          {status?.ok ? "GREEN" : "UNKNOWN"}
        </span>
        <button onClick={load} style={{ padding: "6px 10px", cursor: "pointer" }}>
          Refresh
        </button>
      </div>

      {err ? (
        <div style={{ color: "crimson", marginBottom: 12 }}>Error: {err}</div>
      ) : null}

      <div style={{ border: "1px solid #ddd", borderRadius: 12, padding: 14, maxWidth: 900 }}>
        <div style={{ opacity: 0.7, marginBottom: 10 }}>Auto refresh: 5s</div>

        <div><b>ts:</b> {status?.ts || "..."}</div>
        <div><b>service:</b> {status?.service || "..."}</div>
        <div><b>stamp:</b> {status?.stamp || "..."}</div>
        <div><b>sha:</b> {status?.sha || "..."}</div>
        <div><b>branch:</b> {status?.branch || "..."}</div>

        <div style={{ marginTop: 10 }}>
          <div><b>vercel.env:</b> {status?.vercel?.env || "..."}</div>
          <div><b>vercel.url:</b> {status?.vercel?.url || "..."}</div>
          <div><b>vercel.region:</b> {status?.vercel?.region || "..."}</div>
        </div>

        <div style={{ marginTop: 14, opacity: 0.8 }}>
          Tip: This page is operational-only. Your public UI remains unchanged.
        </div>
      </div>
    </main>
  );
}