"use client";

import React, { useEffect, useState } from "react";

const SESSION_KEY = "d8_home_demo_v1_played";

function useOncePerSession(): [boolean, () => void] {
  const [shouldPlay, setShouldPlay] = useState(false);
  useEffect(() => {
    try {
      const played = window.sessionStorage.getItem(SESSION_KEY);
      setShouldPlay(played !== "1");
    } catch { setShouldPlay(true); }
  }, []);
  const mark = () => {
    try { window.sessionStorage.setItem(SESSION_KEY, "1"); } catch {}
    setShouldPlay(false);
  };
  return [shouldPlay, mark];
}

function Demo({ play, onDone }: { play: boolean; onDone: () => void }) {
  const [p, setP] = useState(play ? 0 : 100);
  const full = "Grow your business with a website that converts.";
  const [h, setH] = useState(play ? "" : full);

  useEffect(() => {
    let timers: number[] = [];
    const add = (fn: () => void, ms: number) => { const id = window.setTimeout(fn, ms); timers.push(id); };

    setP(play ? 0 : 100);
    setH(play ? "" : full);

    if (!play) return;

    add(() => setH(full.slice(0, 8)), 220);
    add(() => setH(full.slice(0, 18)), 420);
    add(() => setH(full.slice(0, 28)), 680);
    add(() => setH(full), 980);

    const steps: Array<[number, number]> = [[250, 15],[600, 33],[1200, 55],[2100, 73],[3200, 88],[4300, 100]];
    steps.forEach(([ms, v]) => add(() => setP(v), ms));

    add(() => onDone(), 4700);

    return () => { timers.forEach((id) => window.clearTimeout(id)); };
  }, [play, onDone]);

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

  return (
    <div style={card}>
      <div style={bar}>
        <span style={dot("rgba(255,95,86,1)")} />
        <span style={dot("rgba(255,189,46,1)")} />
        <span style={dot("rgba(39,201,63,1)")} />
        <div style={pill}>dominat8.com / preview</div>
      </div>

      <div style={{ padding: 16 }}>
        <div style={{
          borderRadius: 14,
          border: "1px solid rgba(255,255,255,0.12)",
          background: "rgba(255,255,255,0.06)",
          padding: 14,
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontSize: 11, letterSpacing: 2.6, textTransform: "uppercase", color: "rgba(255,255,255,0.62)" }}>
              Generating homepage
            </div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.62)" }}>{p}%</div>
          </div>

          <div style={{ height: 8, borderRadius: 999, background: "rgba(255,255,255,0.10)", overflow: "hidden", marginTop: 10 }}>
            <div style={{ height: "100%", width: p + "%", background: "rgba(255,255,255,0.35)", transition: "width 250ms ease" }} />
          </div>

          <div style={{ marginTop: 12, fontSize: 16, fontWeight: 800, color: "rgba(255,255,255,0.94)", lineHeight: 1.35 }}>
            {h}
          </div>

          <div style={{ marginTop: 10, display: "flex", flexWrap: "wrap", gap: 8 }}>
            {["SEO Ready","Sitemap Generated","Published"].map((t) => (
              <span key={t} style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 10px",
                borderRadius: 999,
                border: "1px solid rgba(255,255,255,0.14)",
                background: "rgba(255,255,255,0.06)",
                color: "rgba(255,255,255,0.86)",
                fontSize: 12,
              }}>✓ {t}</span>
            ))}
          </div>

          <div style={{ marginTop: 12, fontSize: 12, color: "rgba(255,255,255,0.60)" }}>
            LIVE_PROOF: PROOF_20260126_082650
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HomeClient() {
  const [play, done] = useOncePerSession();

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

  return (
    <section style={shell}>
      <style>{@media (max-width: 980px){ .d8-wrap{ grid-template-columns: 1fr !important; } }}</style>

      <div style={wrap} className="d8-wrap">
        <div>
          <div style={{
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
          }}>AI Website Automation</div>

          <h1 style={{ marginTop: 18, fontSize: 46, lineHeight: 1.06, letterSpacing: -1.2, fontWeight: 900 }}>
            Your site, built for you.
            <span style={{ display: "block", color: "rgba(255,255,255,0.78)", fontWeight: 800 }}>
              From idea to published — fast.
            </span>
          </h1>

          <p style={{ marginTop: 16, fontSize: 16, lineHeight: 1.65, color: "rgba(255,255,255,0.72)", maxWidth: 560 }}>
            This is an emergency proof build: it should look polished even if Tailwind is broken.
          </p>

          <div style={{ marginTop: 20, display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
            <a href="/builder" style={{
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              padding: "12px 16px", borderRadius: 14, background: "white", color: "black",
              fontWeight: 900, textDecoration: "none", boxShadow: "0 14px 30px rgba(0,0,0,0.35)"
            }}>Start building</a>

            <a href="/templates" style={{
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              padding: "12px 16px", borderRadius: 14, border: "1px solid rgba(255,255,255,0.16)",
              background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.92)",
              fontWeight: 800, textDecoration: "none"
            }}>View examples</a>

            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.60)" }}>LIVE_PROOF: PROOF_20260126_082650</span>
          </div>
        </div>

        <div>
          <Demo play={play} onDone={done} />
        </div>
      </div>
    </section>
  );
}