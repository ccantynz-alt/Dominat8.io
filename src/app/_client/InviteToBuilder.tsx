"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

type Mode = "invite" | "build";

function safeOneLine(s: string) {
  const t = (s || "").replace(/\s+/g, " ").trim();
  if (!t) return "";
  return t.length > 80 ? t.slice(0, 77) + "…" : t;
}

export default function InviteToBuilder() {
  const [mode, setMode] = useState<Mode>("invite");
  const [prompt, setPrompt] = useState<string>("");
  const [note, setNote] = useState<string>("");

  const inputRef = useRef<HTMLInputElement | null>(null);

  const promptShort = useMemo(() => safeOneLine(prompt), [prompt]);

  useEffect(() => {
    if (mode === "invite") {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [mode]);

  function enterBuild() {
    if (mode === "build") return;

    const msg = promptShort ? `LIVE PREVIEW • ${promptShort}` : "LIVE PREVIEW";
    setNote("Assembling…");
    setMode("build");

    // Simulated resolve beats (keep, even after you wire real data)
    setTimeout(() => setNote(msg), 520);
    setTimeout(() => setNote(msg + " • You can change anything"), 900);
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    enterBuild();
  }

  return (
    <div className={"d8-root " + (mode === "build" ? "is-build" : "is-invite")}>
      {/* Ambient background */}
      <div className="d8-bg transition-fast" aria-hidden="true" />
      <div className="d8-grain" aria-hidden="true" />

      {/* Full-page Builder (mounted always; revealed on build) */}
      <div className="d8-builder transition-slow" aria-hidden={mode !== "build"}>
        <div className="d8-builder-inner">
          <div className="d8-topline">
            <div className="d8-badge">{note || "LIVE PREVIEW"}</div>
          </div>

          <div className="d8-panels">
            <div className="d8-panel transition-slow">
              <div className="d8-panel-title">Work</div>

              <div className="d8-row">
                <div className="d8-dot" />
                <div className="d8-row-main">
                  <div className="d8-row-name">
                    {promptShort ? `Draft: ${promptShort}` : "Draft: (waiting for prompt)"}
                  </div>
                  <div className="d8-row-sub">
                    {promptShort ? "Selecting structure + layout" : "Type a prompt to begin"}
                  </div>
                </div>
                <div className="d8-bar">
                  <span className="d8-bar-fill w1" />
                </div>
              </div>

              <div className="d8-row">
                <div className="d8-dot dot2" />
                <div className="d8-row-main">
                  <div className="d8-row-name">Preview</div>
                  <div className="d8-row-sub">Generating sections</div>
                </div>
                <div className="d8-bar">
                  <span className="d8-bar-fill w2" />
                </div>
              </div>

              <div className="d8-row">
                <div className="d8-dot dot3" />
                <div className="d8-row-main">
                  <div className="d8-row-name">Assets</div>
                  <div className="d8-row-sub">Optimizing</div>
                </div>
                <div className="d8-bar">
                  <span className="d8-bar-fill w3" />
                </div>
              </div>
            </div>

            <div className="d8-panel transition-slow">
              <div className="d8-panel-title">
                {promptShort ? `Preview • ${promptShort}` : "Preview"}
              </div>

              <div className="d8-preview">
                <div className="d8-preview-title">
                  {promptShort ? promptShort : "Your site will appear here"}
                </div>

                <div className="d8-skel sk1" />
                <div className="d8-skel sk2" />
                <div className="d8-skel sk3" />
                <div className="d8-skel sk4" />
              </div>
            </div>
          </div>

          {/* Tool strip appears late via CSS (opacity/translate) */}
          <div className="d8-tools transition-slow">
            {["Refine", "Style", "Sections", "Images", "Domains", "Publish", "Monitor", "Settings"].map((t) => (
              <button key={t} className="d8-tool" type="button">
                <span className="d8-tool-ico" />
                <span className="d8-tool-lbl">{t}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Invitation prompt */}
      <div className="d8-invite transition-slow">
        <div className="d8-title">What would you like to build?</div>

        <form className="d8-form" onSubmit={onSubmit}>
          <div className="d8-inputwrap transition-fast">
            <span className="d8-rocket" aria-hidden="true">🚀</span>
            <input
              ref={inputRef}
              className="d8-input"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe your project…"
              spellCheck={false}
            />
            <button className="d8-go" type="submit" onClick={enterBuild}>
              GENERATE
            </button>
          </div>

          <div className="d8-hint">
            Press <b>Enter</b> to start. Your prompt will appear in the Builder preview.
          </div>
        </form>
      </div>

      <style jsx>{`
        .d8-root {
          min-height: 100vh;
          position: relative;
          overflow: hidden;
          background: #07070b;
          color: rgba(255,255,255,0.92);
          font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
        }

        .transition-fast {
          transition:
            opacity 200ms ease,
            transform 350ms cubic-bezier(0.22, 1, 0.36, 1),
            filter 350ms ease;
          will-change: opacity, transform, filter;
        }
        .transition-slow {
          transition:
            opacity 300ms ease,
            transform 650ms cubic-bezier(0.22, 1, 0.36, 1),
            filter 650ms ease;
          will-change: opacity, transform, filter;
        }

        /* Background */
        .d8-bg {
          position: absolute;
          inset: 0;
          background:
            radial-gradient(1200px 600px at 15% 10%, rgba(99,102,241,0.18), transparent 60%),
            radial-gradient(900px 500px at 85% 5%, rgba(251,191,36,0.10), transparent 55%),
            radial-gradient(900px 700px at 55% 80%, rgba(56,189,248,0.08), transparent 55%),
            linear-gradient(180deg, #07070b 0%, #05050a 100%);
          filter: blur(0px);
          transform: scale(1);
        }
        .d8-grain {
          position: absolute;
          inset: 0;
          pointer-events: none;
          opacity: 0.08;
          background-image:
            repeating-linear-gradient(0deg, rgba(255,255,255,0.02) 0px, rgba(255,255,255,0.02) 1px, transparent 1px, transparent 2px);
          mix-blend-mode: overlay;
        }

        /* Invite */
        .d8-invite {
          position: relative;
          z-index: 5;
          min-height: 100vh;
          display: grid;
          place-items: center;
          padding: 42px 18px;
          transform: translateY(0);
          opacity: 1;
          filter: blur(0);
          text-align: center;
        }
        .d8-title {
          font-size: clamp(28px, 4vw, 46px);
          letter-spacing: -0.6px;
          font-weight: 650;
          margin-bottom: 18px;
          color: rgba(255,255,255,0.94);
        }
        .d8-form {
          width: min(860px, 100%);
          margin: 0 auto;
        }
        .d8-inputwrap {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px;
          border-radius: 999px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.10);
          backdrop-filter: blur(10px);
          box-shadow: 0 30px 90px rgba(0,0,0,0.40);
        }
        .d8-rocket { opacity: 0.9; }
        .d8-input {
          flex: 1;
          background: transparent;
          border: 0;
          outline: none;
          color: rgba(255,255,255,0.92);
          font-size: 16px;
          padding: 12px 10px;
        }
        .d8-input::placeholder { color: rgba(255,255,255,0.55); }

        .d8-go {
          border: 0;
          cursor: pointer;
          border-radius: 999px;
          padding: 10px 16px;
          color: rgba(255,255,255,0.92);
          background: rgba(99,102,241,0.90);
          box-shadow: 0 14px 36px rgba(99,102,241,0.22);
        }
        .d8-hint {
          margin-top: 14px;
          color: rgba(255,255,255,0.60);
          font-size: 13px;
        }

        /* Builder hidden by default */
        .d8-builder {
          position: absolute;
          inset: 0;
          z-index: 3;
          opacity: 0;
          filter: blur(18px);
          transform: scale(0.98);
          pointer-events: none;
        }
        .d8-builder-inner {
          height: 100%;
          padding: 28px 18px 22px;
          display: grid;
          grid-template-rows: auto 1fr auto;
          gap: 16px;
        }
        .d8-topline {
          display: flex;
          justify-content: center;
        }
        .d8-badge {
          padding: 8px 12px;
          border-radius: 999px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.10);
          color: rgba(255,255,255,0.72);
          font-size: 12px;
          letter-spacing: 0.2px;
          max-width: min(980px, 92vw);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .d8-panels {
          width: min(1100px, 100%);
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1.1fr 0.9fr;
          gap: 14px;
        }
        .d8-panel {
          border-radius: 18px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.10);
          backdrop-filter: blur(12px);
          padding: 16px;
          box-shadow: 0 30px 90px rgba(0,0,0,0.35);
        }
        .d8-panel-title {
          font-size: 13px;
          color: rgba(255,255,255,0.70);
          margin-bottom: 12px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .d8-row {
          display: grid;
          grid-template-columns: 18px 1fr 160px;
          gap: 12px;
          align-items: center;
          padding: 10px 0;
          border-top: 1px solid rgba(255,255,255,0.06);
        }
        .d8-row:first-of-type { border-top: 0; }
        .d8-dot {
          width: 10px; height: 10px; border-radius: 999px;
          background: rgba(99,102,241,0.9);
          box-shadow: 0 0 18px rgba(99,102,241,0.35);
        }
        .dot2 { background: rgba(56,189,248,0.85); box-shadow: 0 0 18px rgba(56,189,248,0.25); }
        .dot3 { background: rgba(251,191,36,0.70); box-shadow: 0 0 18px rgba(251,191,36,0.18); }

        .d8-row-name { font-size: 14px; overflow:hidden; text-overflow: ellipsis; white-space: nowrap; }
        .d8-row-sub { font-size: 12px; color: rgba(255,255,255,0.55); margin-top: 2px; overflow:hidden; text-overflow: ellipsis; white-space: nowrap; }

        .d8-bar {
          height: 10px;
          border-radius: 999px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.08);
          overflow: hidden;
        }
        .d8-bar-fill {
          display: block;
          height: 100%;
          border-radius: 999px;
          background: rgba(255,255,255,0.22);
          animation: d8bar 1.1s ease-in-out infinite alternate;
        }
        .w1 { width: 65%; }
        .w2 { width: 45%; animation-delay: 120ms; }
        .w3 { width: 30%; animation-delay: 240ms; }
        @keyframes d8bar {
          from { opacity: 0.55; }
          to   { opacity: 0.95; }
        }

        .d8-preview {
          border-radius: 14px;
          border: 1px solid rgba(255,255,255,0.08);
          background: rgba(0,0,0,0.25);
          height: 320px;
          padding: 14px;
          display: grid;
          gap: 10px;
          align-content: start;
        }
        .d8-preview-title {
          font-size: 14px;
          color: rgba(255,255,255,0.85);
          padding: 6px 6px 10px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .d8-skel {
          border-radius: 10px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.08);
          height: 44px;
        }
        .sk1 { height: 64px; }
        .sk2 { height: 44px; width: 85%; }
        .sk3 { height: 44px; width: 75%; }
        .sk4 { height: 120px; }

        .d8-tools {
          width: min(1100px, 100%);
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          gap: 10px;
          padding: 10px;
          border-radius: 18px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.10);
          backdrop-filter: blur(14px);
          opacity: 0;
          transform: translateY(10px);
        }
        .d8-tool {
          flex: 1;
          border: 0;
          cursor: pointer;
          background: transparent;
          color: rgba(255,255,255,0.75);
          padding: 10px 10px;
          border-radius: 14px;
          display: grid;
          place-items: center;
          gap: 6px;
        }
        .d8-tool:hover { background: rgba(255,255,255,0.06); }
        .d8-tool-ico {
          width: 26px; height: 26px;
          border-radius: 10px;
          background: rgba(255,255,255,0.10);
          border: 1px solid rgba(255,255,255,0.12);
        }
        .d8-tool-lbl { font-size: 12px; opacity: 0.85; }

        /* Mode transitions */
        .is-build .d8-invite {
          transform: translateY(-12px);
          opacity: 0.0;
          filter: blur(2px);
          pointer-events: none;
        }
        .is-build .d8-bg {
          transform: scale(0.985);
          filter: blur(2px);
        }
        .is-build .d8-builder {
          opacity: 1;
          filter: blur(0);
          transform: scale(1);
          pointer-events: auto;
        }

        /* Delay controls reveal */
        .is-build .d8-tools {
          opacity: 1;
          transform: translateY(0);
          transition-delay: 650ms;
        }

        @media (max-width: 900px) {
          .d8-panels { grid-template-columns: 1fr; }
          .d8-preview { height: 240px; }
        }
      `}</style>
    </div>
  );
}
