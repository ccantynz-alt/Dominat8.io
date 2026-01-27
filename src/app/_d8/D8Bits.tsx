import React from "react";

export function d8Clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export function D8Badge(props: { text: string; tone?: "default" | "good" | "soft" }) {
  const tone = props.tone ?? "default";
  const bg =
    tone === "good"
      ? "linear-gradient(90deg, rgba(34,197,94,0.25), rgba(34,197,94,0.10))"
      : tone === "soft"
      ? "linear-gradient(90deg, rgba(168,85,247,0.14), rgba(59,130,246,0.08))"
      : "rgba(255,255,255,0.04)";
  const bd =
    tone === "good"
      ? "1px solid rgba(34,197,94,0.35)"
      : tone === "soft"
      ? "1px solid rgba(255,255,255,0.12)"
      : "1px solid rgba(255,255,255,0.12)";

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "8px 10px",
        borderRadius: 999,
        background: bg,
        border: bd,
        color: "rgba(237,234,247,0.90)",
        fontSize: 11,
        fontWeight: 900,
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
      }}
    >
      {props.text}
    </span>
  );
}

export function D8Card(props: {
  title: string;
  body: string;
  kicker?: string;
  right?: React.ReactNode;
}) {
  return (
    <div
      style={{
        borderRadius: 18,
        padding: 14,
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.10)",
        boxShadow: "0 16px 55px rgba(0,0,0,0.45)",
        overflow: "hidden",
      }}
    >
      {props.kicker ? (
        <div
          style={{
            fontSize: 11,
            fontWeight: 900,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "rgba(237,234,247,0.75)",
          }}
        >
          {props.kicker}
        </div>
      ) : null}
      <div
        style={{
          marginTop: props.kicker ? 8 : 0,
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 900, color: "rgba(246,242,255,0.95)" }}>
            {props.title}
          </div>
          <div style={{ marginTop: 8, fontSize: 13, lineHeight: 1.55, color: "rgba(237,234,247,0.72)" }}>
            {props.body}
          </div>
        </div>
        {props.right ? <div style={{ flex: "0 0 auto" }}>{props.right}</div> : null}
      </div>
    </div>
  );
}