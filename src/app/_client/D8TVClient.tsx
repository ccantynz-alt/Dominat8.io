"use client";

import React, { useEffect, useState } from "react";

function hostIsIo(): boolean {
  try {
    if (typeof window === "undefined") return false;
    const h = (window.location && window.location.host) ? window.location.host : "";
    return h.toLowerCase().includes("dominat8.io");
  } catch {
    return false;
  }
}

async function tryFullscreen(el: HTMLElement): Promise<boolean> {
  try {
    const anyEl = el as any;
    const req =
      anyEl.requestFullscreen ||
      anyEl.webkitRequestFullscreen ||
      anyEl.msRequestFullscreen;
    if (req) {
      await req.call(el);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

export default function D8TVClient() {
  const envOn = (process.env.NEXT_PUBLIC_D8_TV === "1");
  const [enabled, setEnabled] = useState(false);
  const [full, setFull] = useState(false);

  useEffect(() => {
    // Enable TV on dominat8.io OR if env flag is set
    const on = envOn || hostIsIo();
    setEnabled(on);
    try {
      if (on) (document.documentElement as any).dataset.d8tv = "1";
      else delete (document.documentElement as any).dataset.d8tv;
    } catch {}
  }, [envOn]);

  if (!enabled) return null;

  const css = `
* { -webkit-font-smoothing: antialiased; }
html, body { height: 100%; }
body { margin: 0; }
button { transition: transform 120ms ease, filter 120ms ease; }
button:active { transform: scale(0.98); }
button:hover { filter: brightness(1.05); }
button, input { touch-action: manipulation; }
.d8tv_wrap { position: fixed; inset: 0; display: flex; flex-direction: column; }
.d8tv_topbar { padding: 10px; display: flex; gap: 8px; align-items: center; }
.d8tv_stage { flex: 1; display: flex; }
.d8tv_iframe { flex: 1; border: 0; width: 100%; height: 100%; }
`;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <div className="d8tv_wrap" id="d8tv_root">
        <div className="d8tv_topbar">
          <button
            type="button"
            onClick={async () => {
              const root = document.getElementById("d8tv_root");
              if (!root) return;
              const ok = await tryFullscreen(root);
              setFull(ok);
            }}
          >
            {full ? "Fullscreen ✓" : "Go Fullscreen"}
          </button>
          <div style={{ opacity: 0.7, fontSize: 12 }}>
            D8TV ON (env:{String(envOn)} host:{String(hostIsIo())})
          </div>
        </div>

        <div className="d8tv_stage">
          <iframe className="d8tv_iframe" src="/" title="D8TV Stage" />
        </div>
      </div>
    </>
  );
}
