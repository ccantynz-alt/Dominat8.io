"use client";

import React, { useEffect, useMemo, useState } from "react";

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

function useParallax() {
  const [p, setP] = useState({ x: 0, y: 0 });

  useEffect(() => {
    let raf = 0;
    function onMove(e: PointerEvent) {
      const w = window.innerWidth || 1;
      const h = window.innerHeight || 1;
      const dx = ((e.clientX / w) - 0.5) * 2;
      const dy = ((e.clientY / h) - 0.5) * 2;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setP({ x: clamp(dx, -1, 1), y: clamp(dy, -1, 1) }));
    }
    function onLeave() {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setP({ x: 0, y: 0 }));
    }
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("blur", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove as any);
      window.removeEventListener("blur", onLeave as any);
    };
  }, []);

  return p;
}

function Icon({ name }: { name: "spark" | "shield" | "wand" | "rocket" }) {
  const common = { width: 18, height: 18, viewBox: "0 0 24 24", fill: "none" as const };
  if (name === "shield") {
    return (
      <svg {...common} aria-hidden="true">
        <path d="M12 3l8 4v6c0 5-3.5 8.4-8 9-4.5-.6-8-4-8-9V7l8-4z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
        <path d="M9.5 12l1.7 1.7L15 9.9" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (name === "wand") {
    return (
      <svg {...common} aria-hidden="true">
        <path d="M4 20l10-10" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        <path d="M9 5l3 3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        <path d="M14 2l2 2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        <path d="M12 8l4 4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        <path d="M18 10l2 2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      </svg>
    );
  }
  if (name === "rocket") {
    return (
      <svg {...common} aria-hidden="true">
        <path d="M14 4c3 1 6 4 6 7-3 0-6-3-7-6l1-1z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M13 5c-5 1-8 6-8 11 5 0 10-3 11-8" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M9 15l-2 5 5-2" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      </svg>
    );
  }
  return (
    <svg {...common} aria-hidden="true">
      <path d="M12 2l1.2 5.2L18 9l-4.8 1.8L12 16l-1.2-5.2L6 9l4.8-1.8L12 2z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <path d="M4 15l.7 3 3 .7-3 .7-.7 3-.7-3-3-.7 3-.7.7-3z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" opacity="0.95" />
    </svg>
  );
}

export default function HomeClient() {
  const stamp = useMemo(() => new Date().toISOString(), []);
  const [probeOk, setProbeOk] = useState<null | boolean>(null);
  const p = useParallax();

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
          --muted2:rgba(255,255,255,.58);
          --line:rgba(255,255,255,.14);
          --glass:rgba(0,0,0,.26);
          --glass2:rgba(0,0,0,.36);
          --shadow: 0 22px 70px rgba(0,0,0,.55);
          --shadow2: 0 12px 34px rgba(0,0,0,.45);
          --radius: 22px;
          --radius2: 28px;
          --max: 1160px;
        }

        *{ box-sizing:border-box; }
        html, body { margin:0; padding:0; background: var(--bg); color: var(--ink); }
        a{ color:inherit; text-decoration:none; }
        ::selection{ background: rgba(255,255,255,.18); }

        .page{
          min-height: 100vh;
          font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji";
          background: var(--bg);
        }

        /* FULL-PAGE “BACKGROUND IMAGE” LOOK (no external assets) */
        .bg{
          position: fixed;
          inset: 0;
          pointer-events: none;
          overflow: hidden;
        }

        /* soft photo field */
        .bg .photo{
          position:absolute;
          inset:-12%;
          transform: translate3d(calc(var(--px) * 18px), calc(var(--py) * 14px), 0) scale(1.08);
          filter: blur(22px) saturate(1.15) contrast(1.08);
          opacity: .92;
          background:
            radial-gradient(900px 580px at 18% 28%, rgba(255,255,255,.14), transparent 64%),
            radial-gradient(720px 560px at 72% 36%, rgba(255,255,255,.12), transparent 62%),
            radial-gradient(760px 520px at 62% 82%, rgba(255,255,255,.09), transparent 64%),
            radial-gradient(520px 420px at 28% 78%, rgba(120,92,255,.18), transparent 70%),
            linear-gradient(120deg, rgba(255,255,255,.06), rgba(255,255,255,.02) 40%, rgba(0,0,0,.14));
        }

        /* hero spotlight */
        .bg .spot{
          position:absolute;
          left: -140px;
          top: -160px;
          width: 700px;
          height: 700px;
          border-radius: 999px;
          background: radial-gradient(circle at 40% 40%, rgba(140,120,255,.34), transparent 62%);
          filter: blur(14px);
          opacity: .55;
          transform: translate3d(calc(var(--px) * -16px), calc(var(--py) * -10px), 0);
        }

        /* right “subject” glow */
        .bg .subject{
          position:absolute;
          right: -160px;
          bottom: -220px;
          width: 740px;
          height: 740px;
          border-radius: 999px;
          background:
            radial-gradient(circle at 40% 35%, rgba(255,255,255,.14), transparent 60%),
            radial-gradient(circle at 55% 62%, rgba(0,255,210,.10), transparent 66%);
          filter: blur(4px);
          opacity: .66;
          transform: translate3d(calc(var(--px) * -18px), calc(var(--py) * -14px), 0);
        }

        /* vignette */
        .bg .vignette{
          position:absolute; inset:0;
          background:
            radial-gradient(60% 55% at 44% 38%, rgba(0,0,0,.18), rgba(0,0,0,.62) 62%, rgba(0,0,0,.88) 100%);
        }

        /* grain for “photo” realism */
        .bg .grain{
          position:absolute; inset:0;
          opacity:.12;
          background-image:
            repeating-linear-gradient(0deg, rgba(255,255,255,.06), rgba(255,255,255,.06) 1px, transparent 1px, transparent 2px);
          mix-blend-mode: overlay;
          filter: blur(.6px);
        }

        .wrap{
          position: relative;
          z-index: 10;
        }

        .container{
          width: min(var(--max), calc(100% - 56px));
          margin: 0 auto;
        }

        /* TOP NAV (premium, not SiteGround copy) */
        .navBar{
          position: sticky;
          top: 0;
          z-index: 40;
          backdrop-filter: blur(14px);
          background: rgba(0,0,0,.22);
          border-bottom: 1px solid rgba(255,255,255,.10);
        }
        .nav{
          height: 76px;
          display:flex;
          align-items:center;
          justify-content:space-between;
          gap: 16px;
        }
        .brand{
          display:flex; align-items:center; gap: 10px;
          font-weight: 950;
          letter-spacing: -0.03em;
        }
        .logo{
          width: 36px; height: 36px;
          border-radius: 14px;
          background: rgba(255,255,255,.10);
          border: 1px solid rgba(255,255,255,.14);
          box-shadow: 0 18px 60px rgba(0,0,0,.45);
          display:grid; place-items:center;
        }
        .logoDot{
          width: 10px; height: 10px; border-radius: 999px;
          background: rgba(255,255,255,.92);
          box-shadow: 0 0 30px rgba(255,255,255,.18);
        }
        .navLinks{
          display:none;
          gap: 22px;
          color: rgba(255,255,255,.72);
          font-weight: 850;
          font-size: 14px;
        }
        .navLinks a:hover{ color: rgba(255,255,255,.92); }

        .navRight{
          display:flex; align-items:center; gap: 12px;
        }
        .chip{
          display:inline-flex; align-items:center; gap: 10px;
          height: 40px;
          padding: 0 14px;
          border-radius: 999px;
          border: 1px solid rgba(255,255,255,.14);
          background: rgba(255,255,255,.08);
          color: rgba(255,255,255,.86);
          font-weight: 900;
          font-size: 13px;
          box-shadow: 0 12px 34px rgba(0,0,0,.26);
        }
        .chip:hover{ background: rgba(255,255,255,.10); }
        .chipPrimary{
          background: rgba(255,255,255,.92);
          color: #0b1220;
          border: none;
        }
        .chipPrimary:hover{ background: rgba(255,255,255,.98); }

        /* HERO */
        .hero{
          padding: 72px 0 42px;
        }
        .heroGrid{
          display:grid;
          grid-template-columns: 1fr;
          gap: 28px;
          align-items:start;
          min-height: calc(86vh - 76px);
        }

        .pill{
          display:inline-flex;
          align-items:center;
          gap: 10px;
          padding: 9px 12px;
          border-radius: 999px;
          border: 1px solid rgba(255,255,255,.14);
          background: rgba(0,0,0,.22);
          color: rgba(255,255,255,.80);
          font-size: 12px;
          font-weight: 950;
          letter-spacing: .12em;
          text-transform: uppercase;
          backdrop-filter: blur(12px);
        }

        .h1{
          margin: 18px 0 0;
          font-size: 58px;
          line-height: 1.01;
          letter-spacing: -0.05em;
          font-weight: 1000;
          color: rgba(255,255,255,.96);
        }
        .gradientWord{
          background: linear-gradient(90deg, rgba(145,125,255,.95), rgba(92,255,230,.90), rgba(255,255,255,.92));
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }
        .sub{
          margin: 18px 0 0;
          font-size: 18px;
          line-height: 1.6;
          color: rgba(255,255,255,.74);
          max-width: 64ch;
        }

        .ctaRow{
          margin-top: 26px;
          display:flex;
          flex-wrap:wrap;
          gap: 12px;
          align-items:center;
        }
        .btn{
          height: 50px;
          padding: 0 18px;
          border-radius: 999px;
          display:inline-flex;
          align-items:center;
          justify-content:center;
          font-weight: 1000;
          letter-spacing: .02em;
          border: 1px solid rgba(255,255,255,.14);
          background: rgba(255,255,255,.10);
          color: rgba(255,255,255,.92);
          box-shadow: 0 18px 60px rgba(0,0,0,.42);
        }
        .btn:hover{ background: rgba(255,255,255,.12); }
        .btnPrimary{
          background: rgba(255,255,255,.92);
          color: #0b1220;
          border: none;
        }
        .btnPrimary:hover{ background: rgba(255,255,255,.98); }

        /* Right panel: “Preview” glass card */
        .glass{
          border-radius: var(--radius2);
          border: 1px solid rgba(255,255,255,.14);
          background: rgba(0,0,0,.26);
          backdrop-filter: blur(16px);
          box-shadow: var(--shadow);
          overflow:hidden;
        }
        .glassTop{
          display:flex;
          align-items:center;
          justify-content:space-between;
          padding: 16px 16px 14px;
          border-bottom: 1px solid rgba(255,255,255,.10);
        }
        .glassTitle{
          font-weight: 950;
          letter-spacing: -0.02em;
        }
        .statusPill{
          display:inline-flex;
          align-items:center;
          gap: 8px;
          padding: 7px 10px;
          border-radius: 999px;
          border: 1px solid rgba(255,255,255,.14);
          background: rgba(255,255,255,.08);
          font-size: 12px;
          font-weight: 950;
          color: rgba(255,255,255,.88);
        }
        .dot{
          width: 8px; height: 8px; border-radius: 999px;
          background: rgba(92,255,230,.88);
          box-shadow: 0 0 22px rgba(92,255,230,.28);
        }

        .glassBody{
          padding: 16px;
          display:grid;
          gap: 10px;
        }
        .step{
          display:flex;
          gap: 12px;
          align-items:flex-start;
          padding: 12px 12px;
          border-radius: 16px;
          border: 1px solid rgba(255,255,255,.10);
          background: rgba(0,0,0,.22);
        }
        .stepIcon{
          width: 36px; height: 36px;
          border-radius: 14px;
          display:grid; place-items:center;
          background: rgba(255,255,255,.08);
          border: 1px solid rgba(255,255,255,.12);
          color: rgba(255,255,255,.88);
        }
        .stepTitle{
          font-weight: 950;
          letter-spacing: -0.01em;
        }
        .stepText{
          margin-top: 2px;
          font-size: 13px;
          line-height: 1.45;
          color: rgba(255,255,255,.68);
        }

        /* Proof strip */
        .proofStrip{
          margin-top: 18px;
          padding: 12px 14px;
          border-radius: 18px;
          border: 1px solid rgba(255,255,255,.12);
          background: rgba(0,0,0,.20);
          backdrop-filter: blur(12px);
          color: rgba(255,255,255,.70);
          font-size: 12px;
          display:flex;
          flex-wrap:wrap;
          gap: 10px 14px;
          align-items:center;
        }
        .proofStrip b{ color: rgba(255,255,255,.86); font-weight: 1000; }

        /* Feature grid */
        .section{
          padding: 26px 0 64px;
        }
        .sectionTitle{
          font-size: 12px;
          letter-spacing: .18em;
          font-weight: 950;
          text-transform: uppercase;
          color: rgba(255,255,255,.62);
        }
        .sectionH2{
          margin: 10px 0 0;
          font-size: 32px;
          letter-spacing: -0.03em;
          font-weight: 1000;
        }

        .cards{
          margin-top: 18px;
          display:grid;
          grid-template-columns: 1fr;
          gap: 14px;
        }
        .card{
          border-radius: var(--radius);
          border: 1px solid rgba(255,255,255,.12);
          background: rgba(0,0,0,.22);
          backdrop-filter: blur(14px);
          box-shadow: var(--shadow2);
          padding: 16px;
        }
        .cardTop{
          display:flex;
          align-items:center;
          gap: 10px;
        }
        .cardIcon{
          width: 36px; height: 36px;
          border-radius: 14px;
          display:grid; place-items:center;
          background: rgba(255,255,255,.08);
          border: 1px solid rgba(255,255,255,.12);
          color: rgba(255,255,255,.88);
        }
        .cardTitle{
          font-weight: 1000;
          letter-spacing: -0.01em;
        }
        .cardBody{
          margin-top: 10px;
          color: rgba(255,255,255,.70);
          font-size: 14px;
          line-height: 1.55;
        }

        /* Bottom CTA */
        .bigCta{
          margin-top: 18px;
          border-radius: var(--radius2);
          border: 1px solid rgba(255,255,255,.14);
          background:
            radial-gradient(800px 260px at 20% 30%, rgba(145,125,255,.20), transparent 70%),
            radial-gradient(760px 260px at 72% 60%, rgba(92,255,230,.14), transparent 70%),
            rgba(0,0,0,.24);
          backdrop-filter: blur(16px);
          box-shadow: var(--shadow);
          padding: 18px;
          display:flex;
          gap: 14px;
          align-items:center;
          justify-content:space-between;
          flex-wrap:wrap;
        }
        .bigCtaTitle{
          font-weight: 1000;
          letter-spacing: -0.02em;
          font-size: 18px;
        }
        .bigCtaSub{
          margin-top: 4px;
          color: rgba(255,255,255,.70);
          font-size: 13px;
        }

        @media (min-width: 980px){
          .navLinks{ display:flex; }
          .heroGrid{ grid-template-columns: 1.15fr .85fr; gap: 28px; align-items:stretch; }
          .h1{ font-size: 76px; }
          .cards{ grid-template-columns: repeat(3, 1fr); }
        }

        @media (max-width: 520px){
          .container{ width: calc(100% - 28px); }
          .h1{ font-size: 44px; }
        }

        @media (prefers-reduced-motion: reduce){
          .bg .photo, .bg .spot, .bg .subject{ transform:none !important; }
        }
      `}</style>

      <div
        className="page"
        style={
          {
            ["--px" as any]: String(p.x),
            ["--py" as any]: String(p.y),
          } as React.CSSProperties
        }
      >
        <div className="bg" aria-hidden="true">
          <div className="photo" />
          <div className="spot" />
          <div className="subject" />
          <div className="vignette" />
          <div className="grain" />
        </div>

        <div className="wrap">
          <div className="navBar">
            <div className="container">
              <div className="nav">
                <a className="brand" href="/">
                  <span className="logo"><span className="logoDot" /></span>
                  <span>Dominat8</span>
                </a>

                <div className="navLinks">
                  <a href="/templates">Gallery</a>
                  <a href="/use-cases">Use cases</a>
                  <a href="/pricing">Pricing</a>
                  <a href="/contact">Support</a>
                </div>

                <div className="navRight">
                  <a className="chip" href="/pricing">See pricing</a>
                  <a className="chip chipPrimary" href="/app">Launch builder</a>
                </div>
              </div>
            </div>
          </div>

          <section className="hero">
            <div className="container">
              <div className="heroGrid">
                <div>
                  <span className="pill">AI WEBSITE AUTOMATION BUILDER</span>

                  <h1 className="h1">
                    Build a <span className="gradientWord">world-class</span> website in minutes.
                  </h1>

                  <p className="sub">
                    Dominat8 assembles your structure, copy, layout, SEO plan, sitemap, and publish flow —
                    with the “finish-for-me” feeling you want, but with controls you can trust.
                  </p>

                  <div className="ctaRow">
                    <a className="btn btnPrimary" href="/app">Generate my site</a>
                    <a className="btn" href="/pricing">See pricing</a>
                  </div>

                  <div className="proofStrip">
                    <span><b>{live}</b></span>
                    <span>•</span>
                    <span><b>ROUTE_PROOF</b></span>
                    <span>•</span>
                    <span>HOME_STAMP: <b>{stamp}</b></span>
                  </div>
                </div>

                <div className="glass" aria-label="Preview panel">
                  <div className="glassTop">
                    <div className="glassTitle">Pipeline Preview</div>
                    <div className="statusPill"><span className="dot" /> Ready</div>
                  </div>

                  <div className="glassBody">
                    <div className="step">
                      <div className="stepIcon"><Icon name="spark" /></div>
                      <div>
                        <div className="stepTitle">Brand + Offer</div>
                        <div className="stepText">Positioning, tone, hero promise, CTA, trust layer.</div>
                      </div>
                    </div>

                    <div className="step">
                      <div className="stepIcon"><Icon name="wand" /></div>
                      <div>
                        <div className="stepTitle">Pages + Layout</div>
                        <div className="stepText">Homepage, pricing, FAQ, contact, templates — consistent rhythm.</div>
                      </div>
                    </div>

                    <div className="step">
                      <div className="stepIcon"><Icon name="shield" /></div>
                      <div>
                        <div className="stepTitle">SEO + Sitemap</div>
                        <div className="stepText">Metadata, sitemap.xml, robots.txt — publish-ready.</div>
                      </div>
                    </div>

                    <div className="step">
                      <div className="stepIcon"><Icon name="rocket" /></div>
                      <div>
                        <div className="stepTitle">Publish</div>
                        <div className="stepText">Domain-ready output + deploy verification markers.</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="section">
                <div className="sectionTitle">Features</div>
                <div className="sectionH2">Designed to look expensive — and ship fast.</div>

                <div className="cards">
                  <div className="card">
                    <div className="cardTop">
                      <div className="cardIcon"><Icon name="spark" /></div>
                      <div className="cardTitle">Finish-for-me pipeline</div>
                    </div>
                    <div className="cardBody">
                      Structured steps with guardrails. You stay in control while the system does the heavy lifting.
                    </div>
                  </div>

                  <div className="card">
                    <div className="cardTop">
                      <div className="cardIcon"><Icon name="shield" /></div>
                      <div className="cardTitle">Proof you can trust</div>
                    </div>
                    <div className="cardBody">
                      Live markers, deploy proof, and deterministic outputs — so you know what’s real and what’s cached.
                    </div>
                  </div>

                  <div className="card">
                    <div className="cardTop">
                      <div className="cardIcon"><Icon name="rocket" /></div>
                      <div className="cardTitle">Publish-ready outputs</div>
                    </div>
                    <div className="cardBody">
                      SEO plan, sitemap, robots, page structure, and a clean handoff — ready for a custom domain.
                    </div>
                  </div>
                </div>

                <div className="bigCta">
                  <div>
                    <div className="bigCtaTitle">Ready to generate your flagship site?</div>
                    <div className="bigCtaSub">Launch the builder, answer a few prompts, and publish with confidence.</div>
                  </div>
                  <div className="ctaRow" style={{ marginTop: 0 }}>
                    <a className="btn btnPrimary" href="/app">Launch builder</a>
                    <a className="btn" href="/templates">Explore templates</a>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <div style={{ height: 28 }} />
        </div>
      </div>
    </>
  );
}