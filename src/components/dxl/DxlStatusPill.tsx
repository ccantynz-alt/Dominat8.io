"use client";

import React from "react";

type ProbeOk = {
  ok?: boolean;
  stamp?: string;
  mode?: string;
  vercel?: any;
  git?: any;
};

function safeText(s: unknown): string {
  if (typeof s === "string") return s;
  if (s === null || s === undefined) return "";
  try { return String(s); } catch { return ""; }
}

export default function DxlStatusPill() {
  const [state, setState] = React.useState<{
    status: "init" | "ok" | "warn";
    line1: string;
    line2: string;
  }>({ status: "init", line1: "System", line2: "Checking…" });

  React.useEffect(() => {
    let alive = true;

    async function run() {
      try {
        const ts = Date.now();
        const res = await fetch(`/api/__probe__?ts=${ts}`, {
          method: "GET",
          cache: "no-store",
          headers: { "x-dxl": "DXL04_20260128" },
        });

        if (!alive) return;

        if (!res.ok) {
          setState({ status: "warn", line1: "System", line2: `Limited (${res.status})` });
          return;
        }

        const j = (await res.json()) as ProbeOk;

        const stamp = safeText(j?.stamp) || "LIVE_OK";
        const mode = safeText(j?.mode) || "ready";

        setState({ status: "ok", line1: "System ready", line2: `${stamp} · ${mode}` });
      } catch {
        if (!alive) return;
        setState({ status: "warn", line1: "System", line2: "Offline / Limited" });
      }
    }

    run();

    const id = window.setInterval(run, 45_000);
    return () => {
      alive = false;
      window.clearInterval(id);
    };
  }, []);

  // Allow user to hide for the session
  const [hidden, setHidden] = React.useState(false);
  if (hidden) return null;

  const cls =
    state.status === "ok"
      ? "dxl-pill dxl-pill--ok"
      : state.status === "warn"
      ? "dxl-pill dxl-pill--warn"
      : "dxl-pill";

  return (
    <div className={cls} role="status" aria-live="polite">
      <div className="dxl-pill__dot" />
      <div className="dxl-pill__text">
        <div className="dxl-pill__l1">{state.line1}</div>
        <div className="dxl-pill__l2">{state.line2}</div>
      </div>

      <button
        type="button"
        className="dxl-pill__x"
        aria-label="Hide system status"
        onClick={() => setHidden(true)}
        title="Hide"
      >
        ×
      </button>
    </div>
  );
}