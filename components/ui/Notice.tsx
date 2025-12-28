"use client";

import React from "react";

export function Notice({
  title,
  children,
  tone = "neutral",
}: {
  title?: string;
  children: React.ReactNode;
  tone?: "neutral" | "success" | "warning";
}) {
  const styles: Record<string, React.CSSProperties> = {
    neutral: { background: "rgba(0,0,0,0.04)", border: "1px solid rgba(0,0,0,0.08)" },
    success: { background: "rgba(34,197,94,0.10)", border: "1px solid rgba(34,197,94,0.22)" },
    warning: { background: "rgba(245,158,11,0.10)", border: "1px solid rgba(245,158,11,0.22)" },
  };

  return (
    <div style={{ ...styles[tone], borderRadius: 16, padding: 14 }}>
      {title ? <div style={{ fontWeight: 700, marginBottom: 6 }}>{title}</div> : null}
      <div style={{ color: "rgba(0,0,0,0.78)", lineHeight: 1.5 }}>{children}</div>
    </div>
  );
}
