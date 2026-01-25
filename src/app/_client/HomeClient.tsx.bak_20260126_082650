"use client";

import React, { useEffect, useMemo, useState } from "react";

const SESSION_KEY = "d8_home_demo_v1_played";

function useOncePerSession(): [boolean, () => void] {
  const [shouldPlay, setShouldPlay] = useState(false);
  useEffect(() => {
    try {
      const played = window.sessionStorage.getItem(SESSION_KEY);
      setShouldPlay(played !== "1");
    } catch {
      setShouldPlay(true);
    }
  }, []);
  const mark = () => {
    try { window.sessionStorage.setItem(SESSION_KEY, "1"); } catch {}
    setShouldPlay(false);
  };
  return [shouldPlay, mark];
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function Demo({ play, onDone }: { play: boolean; onDone: () => void }) {
  const [progress, setProgress] = useState(0);
  const [headline, setHeadline] = useState("");
  const full = "Grow your business with a website that converts.";

  useEffect(() => {
    let timers: number[] = [];
    const add = (fn: () => void, ms: number) => {
      const id = window.setTimeout(fn, ms);
      timers.push(id);
    };

    // Reset
    setProgress(play ? 0 : 100);
    setHeadline(play ? "" : full);

    if (!play) return;

    // Type
    add(() => setHeadline(full.slice(0, 6)), 250);
    add(() => setHeadline(full.slice(0, 14)), 450);
    add(() => setHeadline(full.slice(0, 22)), 650);
    add(() => setHeadline(full.slice(0, 30)), 900);
    add(() => setHeadline(full), 1200);

    // Progress (finish ~4.5s)
    const steps: Array<[number, number]> = [
      [300, 18], [800, 35], [1400, 55], [2200, 72], [3100, 86], [4200, 100]
    ];
    steps.forEach(([ms, v]) => add(() => setProgress(v), ms));

    add(() => onDone(), 4700);

    return () => { timers.forEach((id) => window.clearTimeout(id)); };
  }, [play, onDone]);

  const p = clamp(progress, 0, 100);

  const card: React.CSSProperties = {
    borderRadius: 18,
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(0,0,0,0.35)",
    boxShadow: "0 25px 60px rgba(0,0,0,0.45)",
    overflow: "hidden",
    backdropFilter: "blur(14px)",
  };

  const bar: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "12px 14px",
    borderBottom: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(0,0,0,0.35)",
  };

  const dot = (c: string): React.CSSProperties => ({
    width: 10, height: 10, borderRadius: 999, background: c, opacity: 0.85
  });

  const pill: React.CSSProperties = {
    marginLeft: "auto",
    marginRight: "auto",
    padding: "6px 12px",
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.06)",
    color: "rgba(255,255,255,0.72)",
    fontSize: 11,
    letterSpacing: 0.6,
  };

  const body: React.CSSProperties = { padding: 16 };

  const block: React.CSSProperties = {
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.06)",
    padding: 14,
    marginBottom: 10,
  };

  const label: React.CSSProperties = {
    fontSize: 11,
    letterSpacing: 2.6,
    textTransform: "uppercase",
    color: "rgba(255,255,255,0.62)",
  };

  const line: React.CSSProperties = {
    height: 6,
    borderRadius: 999,
    background: "rgba(255,255,255,0.16)",
    marginTop: 10,
  };

  const progressWrap: React.CSSProperties = {
    height: 8,
    borderRadius: 999,
    background: "rgba(255,255,255,0.10)",
    overflow: "hidden",
    marginTop: 10,
  };

  const progressFill: React.CSSProperties = {
    height: "100%",
    width: p + "%",
    background: "rgba(255,255,255,0.35)",
    transition: "width 250ms ease",
  };

  const badge: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "8px 10px",
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(255,255,255,0.06)",
    color: "rgba(255,255,255,0.86)",
    fontSize: 12,
    marginRight: 8,
    marginTop: 8,
  };

  return (
    <div style={card}>
      <div style={bar}>
        <span style={dot("rgba(255,95,86,1)")} />
        <span style={dot("rgba(255,189,46,1)")} />
        <span style={dot("rgba(39,201,63,1)")} />
        <div style={pill}>dominat8.com / preview</div>
      </div>

      <div style={body}>
        <div style={block}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={label}>Generating homepage</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.62)" }}>{p}%</div>
          </div>
          <div style={progressWrap}><div style={progressFill} /></div>
          <div style={{ marginTop: 12, fontSize: 16, fontWeight: 700, color: "rgba(255,255,255,0.94)", lineHeight: 1.35 }}>
            {headline || (play ? " " : full)}
          </div>
          <div style={{ marginTop: 8, fontSize: 12, color: "rgba(255,255,255,0.62)" }}>
            Sections assemble automatically — no coding, no templates, no fuss.
          </div>
        </div>

        <div style={block}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.92)" }}>Hero</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.62)" }}>Headline + CTA</div>
          </div>
          <div style={line} />
          <div style={{ ...line, width: "72%", opacity: 0.8 }} />
          <div style={{ marginTop: 12, width: 120, height: 34, borderRadius: 999, background: "rgba(255,255,255,0.14)" }} />
        </div>

        <div style={block}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.92)" }}>Features</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.62)" }}>Trust + clarity</div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginTop: 12 }}>
            <div style={{ height: 46, borderRadius: 12, background: "rgba(255,255,255,0.10)" }} />
            <div style={{ height: 46, borderRadius: 12, background: "rgba(255,255,255,0.10)" }} />
            <div style={{ height: 46, borderRadius: 12, background: "rgba(255,255,255,0.10)" }} />
          </div>
        </div>

        <div style={block}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.92)" }}>Ready to launch</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.62)" }}>Auto-complete</div>
          </div>
          <div>
            <span style={badge}>✓ SEO Ready</span>
            <span style={badge}>✓ Sitemap Generated</span>
            <span style={badge}>✓ Published</span>
          </div>
        </div>

        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.55)" }}>
          LIVE_MARKER: HOME_EMERGENCY_20260126_082428
        </div>
      </div>
    </div>
  );
}

export default function HomeClient() {
  const [shouldPlay, markPlayed] = useOncePerSession();

  const shell: React.CSSProperties = {
    minHeight: "72vh",
    padding: "64px 22px",
    color: "white",
    fontFamily: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial",
    background:
      "radial-gradient(1200px 600px at 20% 10%, rgba(255,255,255,0.10), transparent 60%)," +
      "radial-gradient(900px 500px at 90% 30%, rgba(255,255,255,0.08), transparent 55%)," +
      "linear-gradient(180deg, #050608 0%, #07080b 55%, #06070a 100%)",
  };

  const wrap: React.CSSProperties = {
    maxWidth: 1180,
    margin: "0 auto",
    display: "grid",
    gap: 34,
    alignItems: "center",
    gridTemplateColumns: "1.05fr 0.95fr",
  };

  const left: React.CSSProperties = {};
  const tag: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: 10,
    padding: "10px 14px",
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(255,255,255,0.06)",
    color: "rgba(255,255,255,0.78)",
    fontSize: 12,
    letterSpacing: 2.2,
    textTransform: "uppercase",
  };

  const h1: React.CSSProperties = {
    marginTop: 18,
    fontSize: 46,
    lineHeight: 1.06,
    letterSpacing: -1.2,
    fontWeight: 800,
  };

  const p: React.CSSProperties = {
    marginTop: 16,
    fontSize: 16,
    lineHeight: 1.65,
    color: "rgba(255,255,255,0.72)",
    maxWidth: 560,
  };

  const row: React.CSSProperties = { marginTop: 22, display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" };

  const primary: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "12px 16px",
    borderRadius: 14,
    background: "white",
    color: "black",
    fontWeight: 800,
    textDecoration: "none",
    boxShadow: "0 14px 30px rgba(0,0,0,0.35)",
  };

  const secondary: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "12px 16px",
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.16)",
    background: "rgba(255,255,255,0.06)",
    color: "rgba(255,255,255,0.92)",
    fontWeight: 700,
    textDecoration: "none",
  };

  const small: React.CSSProperties = { fontSize: 12, color: "rgba(255,255,255,0.60)" };

  const cards: React.CSSProperties = {
    marginTop: 24,
    display: "grid",
    gap: 12,
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    maxWidth: 640,
  };

  const infoCard: React.CSSProperties = {
    borderRadius: 16,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.06)",
    padding: 14,
  };

  const title: React.CSSProperties = { fontSize: 13, fontWeight: 800 };
  const sub: React.CSSProperties = { marginTop: 6, fontSize: 12, color: "rgba(255,255,255,0.62)" };

  const right: React.CSSProperties = { minWidth: 0 };

  // Mobile fallback: stack columns
  const mobileCss = 
@media (max-width: 980px) {
  .d8-wrap { grid-template-columns: 1fr !important; }
  .d8-h1 { font-size: 38px !important; }
  .d8-cards { grid-template-columns: 1fr !important; max-width: 520px !important; }
}
;

  return (
    <section style={shell}>
      <style>{mobileCss}</style>

      <div style={wrap} className="d8-wrap">
        <div style={left}>
          <div style={tag}>AI Website Automation</div>

          <h1 style={h1} className="d8-h1">
            Your site, built for you.
            <span style={{ display: "block", color: "rgba(255,255,255,0.78)", fontWeight: 800 }}>
              From idea to published — fast.
            </span>
          </h1>

          <p style={p}>
            Dominat8 assembles a conversion-focused website automatically: structure, sections, and launch-ready output — without the usual setup.
          </p>

          <div style={row}>
            <a href="/builder" style={primary}>Start building</a>
            <a href="/templates" style={secondary}>View examples</a>
            <span style={small}>No credit card required</span>
          </div>

          <div style={cards} className="d8-cards">
            <div style={infoCard}>
              <div style={title}>Fast</div>
              <div style={sub}>Assembles pages in minutes</div>
            </div>
            <div style={infoCard}>
              <div style={title}>Structured</div>
              <div style={sub}>Designed to convert</div>
            </div>
            <div style={infoCard}>
              <div style={title}>Launch-ready</div>
              <div style={sub}>SEO + sitemap included</div>
            </div>
          </div>

          <div style={{ marginTop: 14, fontSize: 11, color: "rgba(255,255,255,0.50)" }}>
            LIVE_MARKER: HOME_EMERGENCY_20260126_082428
          </div>
        </div>

        <div style={right}>
          <Demo play={shouldPlay} onDone={markPlayed} />
        </div>
      </div>
    </section>
  );
}