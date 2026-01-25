"use client";

import React, { useEffect, useMemo, useState } from "react";

export default function HomeClient() {
  const stamp = useMemo(() => new Date().toISOString(), []);
  const [probeOk, setProbeOk] = useState<null | boolean>(null);

  useEffect(() => {
    fetch(`/api/__probe__?ts=${Date.now()}`, { cache: "no-store" })
      .then((r) => setProbeOk(r.ok))
      .catch(() => setProbeOk(false));
  }, []);

  const live = probeOk === null ? "Checking…" : probeOk ? "LIVE_OK" : "WARN";

  return (
    <>
      <style>{`
        :root{
          --bg:#070A0F;
          --ink:rgba(255,255,255,.96);
          --muted:rgba(255,255,255,.74);
          --line:rgba(255,255,255,.14);
          --glass:rgba(0,0,0,.30);
          --shadow: 0 22px 70px rgba(0,0,0,.55);
          --radius: 24px;
          --max: 1160px;
        }
        *{ box-sizing:border-box; }
        html, body { margin:0; padding:0; background: var(--bg); color: var(--ink); }
        a{ color:inherit; text-decoration:none; }

        .page{
          min-height: 100vh;
          font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
          background: var(--bg);
        }

        /* VERY OBVIOUS NEW BACKGROUND */
        .bg{
          position: fixed;
          inset: 0;
          pointer-events: none;
          overflow:hidden;
        }
        .bg::before{
          content:"";
          position:absolute;
          inset:-12%;
          filter: blur(18px) saturate(1.15) contrast(1.08);
          opacity: .95;
          background:
            radial-gradient(900px 620px at 18% 28%, rgba(255,255,255,.16), transparent 62%),
            radial-gradient(820px 560px at 70% 32%, rgba(92,255,230,.18), transparent 62%),
            radial-gradient(760px 520px at 62% 84%, rgba(145,125,255,.22), transparent 66%),
            linear-gradient(120deg, rgba(255,255,255,.06), rgba(255,255,255,.02) 42%, rgba(0,0,0,.16));
        }
        .bg::after{
          content:"";
          position:absolute;
          inset:0;
          background: radial-gradient(60% 55% at 44% 38%, rgba(0,0,0,.12), rgba(0,0,0,.64) 62%, rgba(0,0,0,.90) 100%);
        }

        .container{
          width: min(var(--max), calc(100% - 56px));
          margin: 0 auto;
          position: relative;
          z-index: 10;
        }

        /* BIG, UNMISSABLE MARKER */
        .marker{
          margin-top: 18px;
          padding: 14px 16px;
          border-radius: 16px;
          border: 2px dashed rgba(255,255,255,.45);
          background: rgba(255,255,255,.10);
          backdrop-filter: blur(12px);
          font-weight: 950;
          letter-spacing: 0.10em;
          text-transform: uppercase;
        }
        .marker small{
          display:block;
          margin-top: 6px;
          font-weight: 800;
          letter-spacing: 0.02em;
          text-transform:none;
          color: rgba(255,255,255,.74);
        }

        .hero{
          padding: 56px 0 64px;
        }
        .h1{
          margin: 18px 0 0;
          font-size: 60px;
          line-height: 1.02;
          letter-spacing: -0.05em;
          font-weight: 1000;
        }
        .sub{
          margin-top: 14px;
          max-width: 68ch;
          font-size: 18px;
          line-height: 1.6;
          color: rgba(255,255,255,.74);
        }
        .ctaRow{
          margin-top: 22px;
          display:flex;
          gap: 12px;
          flex-wrap:wrap;
          align-items:center;
        }
        .btn{
          height: 50px;
          padding: 0 18px;
          border-radius: 999px;
          border: 1px solid rgba(255,255,255,.14);
          background: rgba(255,255,255,.10);
          color: rgba(255,255,255,.92);
          font-weight: 1000;
          box-shadow: 0 18px 60px rgba(0,0,0,.42);
          display:inline-flex;
          align-items:center;
          justify-content:center;
        }
        .btnPrimary{
          background: rgba(255,255,255,.92);
          color: #0b1220;
          border: none;
        }

        .glass{
          margin-top: 18px;
          border-radius: var(--radius);
          border: 1px solid rgba(255,255,255,.14);
          background: rgba(0,0,0,.28);
          backdrop-filter: blur(16px);
          box-shadow: var(--shadow);
          padding: 16px;
          color: rgba(255,255,255,.86);
        }
        .glass b{ color: rgba(255,255,255,.96); }
      `}</style>

      <div className="page">
        <div className="bg" aria-hidden="true"></div>

        <div className="container">
          <div className="marker">
            V31_MARKER_FORCE_DEPLOY
            <small>LIVE: {live} • HOME_STAMP: {stamp}</small>
          </div>

          <section className="hero">
            <div className="h1">Dominat8 — make it look expensive.</div>
            <div className="sub">
              This is a temporary “deploy truth serum”. If you do not see the marker box above, the new code is not what’s deployed.
            </div>

            <div className="ctaRow">
              <a className="btn btnPrimary" href="/app">Launch builder</a>
              <a className="btn" href="/pricing">See pricing</a>
            </div>

            <div className="glass">
              <b>Next:</b> Once we confirm deploy is real, I’ll remove the marker and do the final “wow” polish pass (background + hero + sections) in one clean overwrite.
            </div>
          </section>
        </div>
      </div>
    </>
  );
}