"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

type DockItem = {
  id: string;
  label: string;
  icon: string; // emoji placeholder; swap later for your icon system
};

const DOCK: DockItem[] = [
  { id: "deploy", label: "Deploy", icon: "🚀" },
  { id: "domains", label: "Domains", icon: "🌐" },
  { id: "ssl", label: "SSL", icon: "🛡️" },
  { id: "monitor", label: "Monitor", icon: "📊" },
  { id: "monitor2", label: "Monitor", icon: "💬" },
  { id: "fix", label: "Fix", icon: "🛠️" },
  { id: "automate", label: "Automate", icon: "⚡" },
  { id: "integrate", label: "Integrate", icon: "✏️" },
  { id: "settings", label: "Settings", icon: "⚙️" },
];

function getQueryFlag(name: string): boolean {
  try {
    const u = new URL(window.location.href);
    return u.searchParams.get(name) === "1" || u.searchParams.get(name) === "true";
  } catch {
    return false;
  }
}

function isFullscreen(): boolean {
  return !!(document.fullscreenElement);
}

async function enterFullscreen(el: HTMLElement) {
  // Fullscreen API is user-gesture gated; button/tap triggers it.
  const anyEl = el as any;
  if (anyEl.requestFullscreen) return anyEl.requestFullscreen();
  if (anyEl.webkitRequestFullscreen) return anyEl.webkitRequestFullscreen();
}

async function exitFullscreen() {
  const d: any = document as any;
  if (document.exitFullscreen) return document.exitFullscreen();
  if (d.webkitExitFullscreen) return d.webkitExitFullscreen();
}

export default function D8TVClient() {
  const envOn = (process.env.NEXT_PUBLIC_D8_TV === "1");
  const [enabled, setEnabled] = useState(false);
  const [full, setFull] = useState(false);
  const [dock, setDock] = useState<string>("deploy");
  const [text, setText] = useState<string>("");

  const rootRef = useRef<HTMLDivElement | null>(null);
  const swipeRef = useRef<{x:number;y:number;t:number} | null>(null);

  // Enable rules:
  //  - NEXT_PUBLIC_D8_TV=1  (for .com deployment)
  //  - URL: ?tv=1
  //  - localStorage: d8_tv=1 (sticky)
  useEffect(() => {
    let on = false;
    try {
      const sticky = window.localStorage.getItem("d8_tv") === "1";
      const q = getQueryFlag("tv");
      on = envOn || q || sticky;
    } catch {
      on = envOn || getQueryFlag("tv");
    }
    setEnabled(on);
  }, [envOn]);

  // Track fullscreen changes
  useEffect(() => {
    const onFs = () => setFull(isFullscreen());
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, []);

  // Keyboard shortcuts (Apple-like quick control)
  useEffect(() => {
    if (!enabled) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        // Exit TV mode (and fullscreen)
        try { window.localStorage.setItem("d8_tv", "0"); } catch {}
        setEnabled(false);
        if (isFullscreen()) exitFullscreen();
      }
      if (e.key.toLowerCase() === "f") {
        const el = rootRef.current;
        if (!el) return;
        if (isFullscreen()) exitFullscreen();
        else enterFullscreen(el);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [enabled]);

  // Touch / pointer swipe (left/right) to cycle dock sections
  useEffect(() => {
    if (!enabled) return;

    const el = rootRef.current;
    if (!el) return;

    const ids = DOCK.map(d => d.id);

    const onPointerDown = (e: PointerEvent) => {
      // only left click / touch
      if (e.pointerType === "mouse" && e.button !== 0) return;
      swipeRef.current = { x: e.clientX, y: e.clientY, t: Date.now() };
    };

    const onPointerUp = (e: PointerEvent) => {
      if (!swipeRef.current) return;
      const s = swipeRef.current;
      swipeRef.current = null;

      const dx = e.clientX - s.x;
      const dy = e.clientY - s.y;
      const dt = Date.now() - s.t;

      // Swipe heuristic: quick-ish horizontal swipe
      if (dt < 600 && Math.abs(dx) > 70 && Math.abs(dx) > Math.abs(dy) * 1.2) {
        const idx = Math.max(0, ids.indexOf(dock));
        const next = dx < 0 ? Math.min(ids.length - 1, idx + 1) : Math.max(0, idx - 1);
        setDock(ids[next]);
      }
    };

    el.addEventListener("pointerdown", onPointerDown, { passive: true });
    el.addEventListener("pointerup", onPointerUp, { passive: true });

    return () => {
      el.removeEventListener("pointerdown", onPointerDown as any);
      el.removeEventListener("pointerup", onPointerUp as any);
    };
  }, [enabled, dock]);

  const title = useMemo(() => {
    const map: Record<string,string> = {
      deploy: "Deployments",
      domains: "Domains",
      ssl: "SSL",
      monitor: "Monitor",
      monitor2: "Monitor",
      fix: "Fix",
      automate: "Automate",
      integrate: "Integrate",
      settings: "Settings",
    };
    return map[dock] || "Deployments";
  }, [dock]);

  if (!enabled) return null;

  const toggleFull = async () => {
    const el = rootRef.current;
    if (!el) return;
    if (isFullscreen()) await exitFullscreen();
    else await enterFullscreen(el);
  };

  const exitTv = async () => {
    try { window.localStorage.setItem("d8_tv", "0"); } catch {}
    setEnabled(false);
    if (isFullscreen()) await exitFullscreen();
  };

  const stickyOn = () => {
    try { window.localStorage.setItem("d8_tv", "1"); } catch {}
  };

  return (
    <div ref={rootRef} style={styles.wrap} aria-label="D8 TV Mode">
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <div style={styles.glass}>
        <div style={styles.header}>
          <div style={styles.brand} onDoubleClick={stickyOn} title="Double-click to pin TV mode (local)">
            <span style={{opacity:0.9}}>Dominat8</span>
            <span style={{opacity:0.55}}>.com TV</span>
          </div>

          <div style={styles.h1}>What would you like to build?</div>

          <div style={styles.headerRight}>
            <button style={styles.btnGhost} onClick={toggleFull}>
              {full ? "Exit Fullscreen" : "Fullscreen"}
            </button>
            <button style={styles.btnGhost} onClick={exitTv}>Exit</button>
          </div>
        </div>

        <div style={styles.promptRow}>
          <div style={styles.prompt}>
            <span style={styles.rocket}>🚀</span>
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Describe your project..."
              style={styles.input}
            />
          </div>
          <button style={styles.btnPrimary} onClick={() => { /* hook your generator later */ }}>
            GENERATE
          </button>
        </div>

        <div style={styles.panel}>
          <div style={styles.panelTitle}>{title}</div>

          {/* Placeholder data (wire to your real deployment data later) */}
          <div style={styles.row}>
            <div style={styles.rowLeft}>
              <div style={styles.dot}>🚀</div>
              <div>
                <div style={styles.rowName}>www.horizonaid.tech</div>
                <div style={styles.rowSub}>Bot AI deployments</div>
              </div>
            </div>
            <div style={styles.rowRight}>
              <div style={styles.mini}>uptime for</div>
              <div style={styles.pill}>10 MINS ✓</div>
            </div>
          </div>

          <div style={styles.row}>
            <div style={styles.rowLeft}>
              <div style={styles.dot}>🟣</div>
              <div>
                <div style={styles.rowName}>akiraspacepro.io</div>
                <div style={styles.rowSub}>Web platform deploy</div>
              </div>
            </div>
            <div style={styles.rowRight}>
              <div style={styles.mini}>Deploying</div>
              <div style={styles.pillMuted}>70%</div>
            </div>
          </div>

          <div style={styles.row}>
            <div style={styles.rowLeft}>
              <div style={styles.dot}>🔵</div>
              <div>
                <div style={styles.rowName}>bloommetapro.com</div>
                <div style={styles.rowSub}>Bots upgrade deployment</div>
              </div>
            </div>
            <div style={styles.rowRight}>
              <div style={styles.mini}>Optimizing</div>
              <div style={styles.pillMuted}>54%</div>
            </div>
          </div>
        </div>

        <div style={styles.dock}>
          {DOCK.map((d) => (
            <button
              key={d.id}
              style={d.id === dock ? styles.dockItemOn : styles.dockItem}
              onClick={() => setDock(d.id)}
            >
              <div style={styles.dockIcon}>{d.icon}</div>
              <div style={styles.dockLabel}>{d.label}</div>
            </button>
          ))}
        </div>

        <div style={styles.hint}>
          Tip: Press <b>F</b> for fullscreen, <b>Esc</b> to exit TV. Swipe left/right to change sections.
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrap: {
    position: "fixed",
    inset: 0,
    zIndex: 99999,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 28,
    background: "rgba(0,0,0,0.55)",
    touchAction: "manipulation",
    userSelect: "none",
  },
  glass: {
    width: "min(1220px, 96vw)",
    borderRadius: 20,
    padding: 20,
    background: "rgba(10,14,20,0.74)",
    border: "1px solid rgba(255,255,255,0.08)",
    boxShadow: "0 20px 60px rgba(0,0,0,0.55)",
    backdropFilter: "blur(14px)",
  },
  header: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14 },
  brand: { fontSize: 14, letterSpacing: 0.2, opacity: 0.7, cursor: "default", minWidth: 140 },
  h1: { fontSize: 34, fontWeight: 650, textAlign: "center", flex: 1, opacity: 0.95 },
  headerRight: { display: "flex", gap: 10, minWidth: 220, justifyContent: "flex-end" },

  promptRow: { marginTop: 18, display: "flex", gap: 12, alignItems: "center" },
  prompt: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "12px 14px",
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(255,255,255,0.06)",
  },
  rocket: { opacity: 0.85 },
  input: {
    width: "100%",
    fontSize: 16,
    outline: "none",
    border: "none",
    background: "transparent",
    color: "rgba(255,255,255,0.92)",
  },

  btnPrimary: {
    padding: "12px 18px",
    borderRadius: 999,
    border: "1px solid rgba(120,180,255,0.45)",
    background: "rgba(60,130,255,0.85)",
    color: "white",
    fontWeight: 700,
    letterSpacing: 0.3,
    cursor: "pointer",
    minWidth: 140,
  },
  btnGhost: {
    padding: "10px 12px",
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.04)",
    color: "rgba(255,255,255,0.88)",
    fontWeight: 650,
    cursor: "pointer",
  },

  panel: {
    marginTop: 18,
    borderRadius: 16,
    padding: 14,
    border: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(255,255,255,0.04)",
  },
  panelTitle: { fontSize: 14, opacity: 0.7, marginBottom: 10 },

  row: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 10px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.06)",
    background: "rgba(0,0,0,0.18)",
    marginTop: 10,
  },
  rowLeft: { display: "flex", alignItems: "center", gap: 10 },
  dot: {
    width: 34,
    height: 34,
    borderRadius: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.08)",
  },
  rowName: { fontSize: 15, fontWeight: 650, opacity: 0.92 },
  rowSub: { fontSize: 12.5, opacity: 0.62, marginTop: 2 },
  rowRight: { display: "flex", alignItems: "center", gap: 10 },
  mini: { fontSize: 12, opacity: 0.55 },
  pill: {
    padding: "6px 10px",
    borderRadius: 999,
    background: "rgba(60,220,140,0.14)",
    border: "1px solid rgba(60,220,140,0.32)",
    color: "rgba(210,255,235,0.92)",
    fontWeight: 700,
    fontSize: 12,
  },
  pillMuted: {
    padding: "6px 10px",
    borderRadius: 999,
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.10)",
    color: "rgba(255,255,255,0.78)",
    fontWeight: 700,
    fontSize: 12,
  },

  dock: {
    marginTop: 16,
    display: "grid",
    gridTemplateColumns: "repeat(9, minmax(0, 1fr))",
    gap: 10,
    padding: 10,
    borderRadius: 16,
    border: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(0,0,0,0.18)",
  },
  dockItem: {
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.06)",
    background: "rgba(255,255,255,0.04)",
    padding: "12px 10px",
    cursor: "pointer",
  },
  dockItemOn: {
    borderRadius: 14,
    border: "1px solid rgba(120,180,255,0.28)",
    background: "rgba(60,130,255,0.16)",
    padding: "12px 10px",
    cursor: "pointer",
    boxShadow: "0 10px 30px rgba(40,120,255,0.12)",
  },
  dockIcon: { fontSize: 20, opacity: 0.95 },
  dockLabel: { marginTop: 6, fontSize: 12, opacity: 0.72, fontWeight: 650 },

  hint: { marginTop: 10, fontSize: 12, opacity: 0.6, textAlign: "center" },
};

const css = 
/* Touch + "Apple-like" smoothness */
* { -webkit-font-smoothing: antialiased; }
button { transition: transform 120ms ease, filter 120ms ease; }
button:active { transform: scale(0.98); }
button:hover { filter: brightness(1.05); }

/* Prevent iOS double-tap zoom weirdness on buttons */
button, input { touch-action: manipulation; }
;
