import React from "react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function DeployProbePage() {
  const marker = "DEPLOY_PROBE_FORCE__2026-01-25T00:00:00Z";
  return (
    <main style={{ padding: 24, fontFamily: "ui-sans-serif, system-ui, Segoe UI, Roboto, Arial" }}>
      <h1 style={{ margin: "0 0 10px", fontSize: 34 }}> DEPLOY PROBE FORCE</h1>
      <p style={{ margin: "0 0 18px", color: "rgba(0,0,0,0.70)" }}>
        If you see this page, deploy is reaching production.
      </p>
      <div style={{ padding: 16, border: "2px solid #111", borderRadius: 14, background: "#fff" }}>
        <div style={{ fontSize: 14, color: "rgba(0,0,0,0.70)" }}>Marker</div>
        <div style={{ fontSize: 20, fontWeight: 800, wordBreak: "break-word" }}>{marker}</div>
        <div style={{ marginTop: 12 }}>
          <a href="/api/__probe__" style={{ textDecoration: "underline" }}>/api/__probe__</a>
        </div>
      </div>
    </main>
  );
}
