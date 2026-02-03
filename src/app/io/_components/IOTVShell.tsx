import React from "react";
import { unstable_noStore as noStore } from "next/cache";

export default function IOTVShell() {
  noStore();

  const stamp = `IO_TV_SHELL_LOCKED_20260203`;

  return (
    <main
      style={{
        minHeight: "100vh",
        width: "100%",
        background: "#05070b",
        color: "#e9eef7",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <div
        style={{
          width: "min(1180px, 100%)",
          borderRadius: 22,
          border: "1px solid rgba(255,255,255,0.10)",
          background:
            "radial-gradient(1200px 500px at 20% -10%, rgba(130,180,255,0.20), transparent 60%)," +
            "radial-gradient(900px 500px at 90% 0%, rgba(255,220,140,0.15), transparent 55%)," +
            "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))",
          boxShadow: "0 30px 80px rgba(0,0,0,0.55)",
          overflow: "hidden",
        }}
      >
        <div style={{ padding: 22, display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Chip label="Systems Online" tone="ok" />
          <Chip label="Cache: No-Store" tone="sys" />
          <Chip label="Proof: /api/__d8__/stamp" tone="sys" />
          <Chip label={`TV: ${stamp}`} tone="sys" />
        </div>

        <div style={{ padding: 22, paddingTop: 6 }}>
          <h1 style={{ margin: 0, fontSize: 34, letterSpacing: -0.6 }}>
            Dominat8 IO — TV / Cockpit
          </h1>
          <p style={{ marginTop: 10, marginBottom: 0, opacity: 0.82, fontSize: 16, lineHeight: 1.5 }}>
            This is the safe, server-rendered TV shell. It is locked to <b>dominat8.io</b> by host-truth middleware.
            Marketing will never render on .io — even if client enhancements break.
          </p>

          <div style={{ marginTop: 18, display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 12 }}>
            <Card title="Invariant" body=".io never shows marketing. Ever." />
            <Card title="Build Safety" body="TV client is stubbed; syntax corruption can’t red-build you." />
            <Card title="Automation Ready" body="Repair loop can iterate under a stable shell." />
          </div>

          <div style={{ marginTop: 18 }}>
            <a
              href="/api/__d8__/stamp"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                height: 44,
                padding: "0 16px",
                borderRadius: 14,
                border: "1px solid rgba(255,255,255,0.14)",
                background: "rgba(255,255,255,0.06)",
                color: "#e9eef7",
                textDecoration: "none",
              }}
            >
              Open Proof Endpoint
            </a>
          </div>
        </div>

        <div style={{ height: 10 }} />
      </div>
    </main>
  );
}

function Chip(props: { label: string; tone: "ok" | "sys" }) {
  const bg = props.tone === "ok" ? "rgba(80,220,140,0.14)" : "rgba(160,190,255,0.10)";
  const bd = props.tone === "ok" ? "rgba(80,220,140,0.24)" : "rgba(160,190,255,0.18)";
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        height: 30,
        padding: "0 10px",
        borderRadius: 999,
        background: bg,
        border: `1px solid ${bd}`,
        fontSize: 12,
        opacity: 0.95,
      }}
    >
      {props.label}
    </span>
  );
}

function Card(props: { title: string; body: string }) {
  return (
    <div
      style={{
        borderRadius: 18,
        border: "1px solid rgba(255,255,255,0.10)",
        background: "rgba(0,0,0,0.20)",
        padding: 14,
      }}
    >
      <div style={{ fontSize: 13, opacity: 0.78, marginBottom: 6 }}>{props.title}</div>
      <div style={{ fontSize: 14, lineHeight: 1.5 }}>{props.body}</div>
    </div>
  );
}