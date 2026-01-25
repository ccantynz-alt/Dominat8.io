import React from "react";

export type GlowPillProps = {
  label: string;
  tone?: "emerald" | "blue" | "slate";
};

export default function GlowPill({ label, tone = "emerald" }: GlowPillProps) {
  const toneClass =
    tone === "blue"
      ? "bg-blue-50 text-blue-700 ring-blue-200"
      : tone === "slate"
      ? "bg-slate-100 text-slate-700 ring-slate-200"
      : "bg-emerald-50 text-emerald-700 ring-emerald-200";

  return (
    <span
      className={
        "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs ring-1 " +
        toneClass
      }
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {label}
    </span>
  );
}
