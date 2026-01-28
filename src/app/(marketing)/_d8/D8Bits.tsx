import React from "react";

export function D8Grid({ children }: { children?: React.ReactNode }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
        gap: 12,
      }}
    >
      {children}
    </div>
  );
}

export function D8Card(props: { title: string; desc: string; badge?: string }) {
  return (
    <div
      style={{
        borderRadius: 18,
        padding: 14,
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.10)",
        boxShadow: "0 12px 40px rgba(0,0,0,0.35)",
      }}
    >
      {props.badge && (
        <div
          style={{
            display: "inline-flex",
            padding: "6px 10px",
            borderRadius: 999,
            background: "rgba(0,0,0,0.35)",
            border: "1px solid rgba(255,255,255,0.12)",
            color: "rgba(237,234,247,0.86)",
            fontSize: 11,
            fontWeight: 900,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
          }}
        >
          {props.badge}
        </div>
      )}

      <div
        style={{
          marginTop: props.badge ? 10 : 0,
          fontWeight: 900,
          color: "rgba(246,242,255,0.98)",
        }}
      >
        {props.title}
      </div>

      <div style={{ marginTop: 8, color: "rgba(237,234,247,0.72)", lineHeight: 1.55 }}>
        {props.desc}
      </div>
    </div>
  );
}

const D8Bits = { D8Grid, D8Card };
export default D8Bits;