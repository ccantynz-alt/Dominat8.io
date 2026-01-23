import React from "react";

type Props = {
  tone?: "draft" | "live" | "neutral";
  children: React.ReactNode;
};

export function Badge({ tone = "neutral", children }: Props) {
  const map: Record<string, React.CSSProperties> = {
    draft: { background: "rgba(245,158,11,0.14)", color: "rgb(180,83,9)", border: "1px solid rgba(245,158,11,0.25)" },
    live: { background: "rgba(34,197,94,0.14)", color: "rgb(21,128,61)", border: "1px solid rgba(34,197,94,0.25)" },
    neutral: { background: "rgba(0,0,0,0.06)", color: "rgba(0,0,0,0.75)", border: "1px solid rgba(0,0,0,0.08)" },
  };

  return (
    <span
      style={{
        ...map[tone],
        fontSize: 12,
        padding: "4px 10px",
        borderRadius: 999,
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        lineHeight: 1,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
}
