"use client";

import React, { useEffect, useMemo, useState } from "react";

function clamp(n: number, a: number, b: number) { return Math.max(a, Math.min(b, n)); }

function useParallax() {
  const [p, setP] = useState({ x: 0, y: 0 });
  useEffect(() => {
    let raf = 0;
    function onMove(e: PointerEvent) {
      const w = window.innerWidth || 1, h = window.innerHeight || 1;
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

function Icon({ name }: { name: "spark" | "shield" | "rocket" | "grid" | "check" }) {
  const common = { width: 18, height: 18, viewBox: "0 0 24 24", fill: "none" as const };
  if (name === "shield") {
    return (
      <svg {...common} aria-hidden="true">
        <path d="M12 3l8 4v6c0 5-3.5 8.4-8 9-4.5-.6-8-4-8-9V7l8-4z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
        <path d="M9.5 12l1.7 1.7L15 9.9" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
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
  if (name === "grid") {
    return (
      <svg {...common} aria-hidden="true">
        <path d="M4 4h7v7H4V4zM13 4h7v7h-7V4zM4 13h7v7H4v-7zM13 13h7v7h-7v-7z" stroke="currentColor" strokeWidth="1.6" />
      </svg>
    );
  }
  if (name === "check") {
    return (
      <svg {...common} aria-hidden="true">
        <path d="M20 7L10 17l-4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  return (
    <svg {...common} aria-hidden="true">
      <path d="M12 2l1.2 5.2L18 9l-4.8 1.8L12 16l-1.2-5.2L6 9l4.8-1.8L12 2z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
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
          --bg:#070A10;
          --ink: rgba(255,255,255,.96);
          --muted: rgba(255,255,255,.72);
          --muted2: rgba(255,255,255,.58);
          --line: rgba(255,255,255,.14);
          --glass: rgba(0,0,0,.30);
          --glass2: rgba(0,0,0,.40);
          --shadow: 0 28px 90px rgba(0,0,0,.60);
          --shadow2: 0 14px 40px rgba(0,0,0,.45);
          --r: 22px;
          --r2: 28px;
          --max: 1160px;
        }

        *{ box-sizing:border-box; }
        html, body { margin:0; padding:0; background: var(--bg); color: var(--ink); }
        a{ color:inherit; text-decoration:none; }
        ::selection{ background: rgba(255,255,255,.18); }

        .page{
          min-height: 100vh;
          font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
          background: var(--bg);
        }

        /* FULL-PAGE “BACKGROUND IMAGE” FEEL */
        .bg{
          position: fixed;
          inset: 0;
          pointer-events:none;
          overflow:hidden;
        }
        .bg .photo{
          position:absolute;
          inset:-14%;
          transform: translate3d(calc(var(--px) * 18px), calc(var(--py) * 14px), 0) scale(1.09);
          filter: blur(22px) saturate(1.18) contrast(1.08);
          opacity: .95;
          background:
            radial-gradient(980px 640px at 18% 24%, rgba(255,255,255,.16), transparent 62%),
            radial-gradient(820px 620px at 72% 32%, rgba(92,255,230,.18), transparent 62%),
            radial-gradient(860px 560px at 66% 86%, rgba(145,125,255,.22), transparent 66%),
            radial-gradient(700px 520px at 30% 86%, rgba(255,255,255,.09), transparent 70%),
            linear-gradient(120deg, rgba(255,255,255,.06), rgba(255,255,255,.02) 42%, rgba(0,0,0,.18));
        }
        .bg .vignette{
          position:absolute;
          inset:0;
          background:
            radial-gradient(60% 55% at 44% 34%, rgba(0,0,0,.10), rgba(0,0,0,.64) 62%, rgba(0,0,0,.92) 100%);
        }
        .bg .grain{
          position:absolute; inset:0;
          opacity:.12;
          background-image: repeating-linear-gradient(0deg, rgba(255,255,255,.06), rgba(255,255,255,.06) 1px, transparent 1px, transparent 2px);
          mix-blend-mode: overlay;
          filter: blur(.6px);
        }
        .bg .grid{
          position:absolute; inset:0;
          opacity:.10;
          background:
            linear-gradient(rgba(255,255,255,.10) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,.10) 1px, transparent 1px);
          background-size: 72px 72px;
          mask-image: radial-gradient(55% 55% at 40% 25%, black, transparent 70%);
        }

        .wrap{ position: relative; z-index: 10; }
        .container{ width: min(var(--max), calc(100% - 56px)); margin: 0 auto; }

        /* NAV (clean, expensive) */
        .navBar{
          position: sticky;
          top: 0;
          z-index: 40;
          backdrop-filter: blur(16px);
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
          display:flex;
          align-items:center;
          gap: 10px;
          font-weight: 1000;
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
        .links{
          display:none;
          gap: 22px;
          color: rgba(255,255,255,.70);
          font-weight: 900;
          font-size: 14px;
        }
        .links a:hover{ color: rgba(255,255,255,.92); }
        .right{
          display:flex;
          align-items:center;
          gap: 12px;
        }
        .chip{
          height: 40px;
          padding: 0 14px;
          border-radius: 999px;
          border: 1px solid rgba(255,255,255,.14);
          background: rgba(255,255,255,.08);
          color: rgba(255,255,255,.86);
          font-weight: 950;
          font-size: 13px;
          box-shadow: 0 12px 34px rgba(0,0,0,.26);
          display:inline-flex;
          align-items:center;
          justify-content:center;
        }
        .chip:hover{ background: rgba(255,255,255,.10); }
        .chipPrimary{
          background: rgba(255,255,255,.92);
          color: #0b1220;
          border: none;
        }
        .chipPrimary:hover{ background: rgba(255,255,255,.98); }

        /* HERO */
        .hero{ padding: 76px 0 30px; }
        .heroGrid{
          display:grid;
          grid-template-columns: 1fr;
          gap: 18px;
          align-items:start;
          min-height: calc(84vh - 76px);
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
          font-weight: 1000;
          letter-spacing: .12em;
          text-transform: uppercase;
          backdrop-filter: blur(12px);
        }
        .h1{
          margin: 18px 0 0;
          font-size: 62px;
          line-height: 1.01;
          letter-spacing: -0.055em;
          font-weight: 1100;
          color: rgba(255,255,255,.96);
        }
        .grad{
          background: linear-gradient(90deg, rgba(145,125,255,.96), rgba(92,255,230,.92), rgba(255,255,255,.92));
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }
        .sub{
          margin: 18px 0 0;
          font-size: 18px;
          line-height: 1.6;
          color: rgba(255,255,255,.74);
          max-width: 66ch;
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
          border: 1px solid rgba(255,255,255,.14);
          background: rgba(255,255,255,.10);
          color: rgba(255,255,255,.92);
          font-weight: 1000;
          box-shadow: 0 18px 60px rgba(0,0,0,.42);
          display:inline-flex;
          align-items:center;
          justify-content:center;
        }
        .btn:hover{ background: rgba(255,255,255,.12); }
        .btnPrimary{
          background: rgba(255,255,255,.92);
          color: #0b1220;
          border: none;
        }
        .btnPrimary:hover{ background: rgba(255,255,255,.98); }

        /* “Credibility strip” */
        .cred{
          margin-top: 18px;
          border-radius: var(--r);
          border: 1px solid rgba(255,255,255,.12);
          background: rgba(0,0,0,.20);
          backdrop-filter: blur(14px);
          padding: 12px 14px;
          display:flex;
          flex-wrap:wrap;
          gap: 10px 14px;
          align-items:center;
          color: rgba(255,255,255,.70);
          font-size: 12px;
        }
        .cred b{ color: rgba(255,255,255,.90); font-weight: 1000; }
        .credDot{
          width: 8px; height: 8px; border-radius: 999px;
          background: rgba(92,255,230,.90);
          box-shadow: 0 0 22px rgba(92,255,230,.26);
        }
        .sep{ opacity:.35; }

        /* Right card: “Product preview” */
        .panel{
          border-radius: var(--r2);
          border: 1px solid rgba(255,255,255,.14);
          background: rgba(0,0,0,.26);
          backdrop-filter: blur(16px);
          box-shadow: var(--shadow);
          overflow:hidden;
        }
        .panelTop{
          display:flex;
          align-items:center;
          justify-content:space-between;
          padding: 16px;
          border-bottom: 1px solid rgba(255,255,255,.10);
        }
        .panelTitle{ font-weight: 1000; letter-spacing: -0.02em; }
        .mini{
          display:inline-flex;
          align-items:center;
          gap: 8px;
          padding: 7px 10px;
          border-radius: 999px;
          border: 1px solid rgba(255,255,255,.14);
          background: rgba(255,255,255,.08);
          color: rgba(255,255,255,.88);
          font-size: 12px;
          font-weight: 950;
        }
        .panelBody{ padding: 16px; display:grid; gap: 10px; }
        .row{
          border-radius: 16px;
          border: 1px solid rgba(255,255,255,.10);
          background: rgba(0,0,0,.20);
          padding: 12px;
          display:flex;
          gap: 12px;
          align-items:flex-start;
        }
        .rowIcon{
          width: 36px; height: 36px;
          border-radius: 14px;
          display:grid; place-items:center;
          background: rgba(255,255,255,.08);
          border: 1px solid rgba(255,255,255,.12);
          color: rgba(255,255,255,.90);
        }
        .rowTitle{ font-weight: 1000; letter-spacing: -0.01em; }
        .rowText{
          margin-top: 2px;
          font-size: 13px;
          line-height: 1.45;
          color: rgba(255,255,255,.68);
        }

        /* FEATURES */
        .section{ padding: 14px 0 72px; }
        .kicker{
          font-size: 12px;
          letter-spacing: .18em;
          font-weight: 1000;
          text-transform: uppercase;
          color: rgba(255,255,255,.62);
        }
        .h2{
          margin: 10px 0 0;
          font-size: 34px;
          letter-spacing: -0.03em;
          font-weight: 1100;
        }
        .cards{
          margin-top: 18px;
          display:grid;
          grid-template-columns: 1fr;
          gap: 14px;
        }
        .card{
          border-radius: var(--r);
          border: 1px solid rgba(255,255,255,.12);
          background: rgba(0,0,0,.22);
          backdrop-filter: blur(14px);
          box-shadow: var(--shadow2);
          padding: 16px;
        }
        .cardTop{ display:flex; gap: 10px; align-items:center; }
        .cardIcon{
          width: 36px; height: 36px;
          border-radius: 14px;
          display:grid; place-items:center;
          background: rgba(255,255,255,.08);
          border: 1px solid rgba(255,255,255,.12);
          color: rgba(255,255,255,.90);
        }
        .cardTitle{ font-weight: 1100; letter-spacing: -0.01em; }
        .cardBody{
          margin-top: 10px;
          color: rgba(255,255,255,.70);
          font-size: 14px;
          line-height: 1.55;
        }
        .list{
          margin-top: 10px;
          display:grid;
          gap: 8px;
          color: rgba(255,255,255,.70);
          font-size: 13px;
        }
        .li{ display:flex; gap: 8px; align-items:flex-start; }
        .li i{ margin-top: 1px; color: rgba(92,255,230,.92); }

        /* Bottom CTA */
        .ctaBox{
          margin-top: 18px;
          border-radius: var(--r2);
          border: 1px solid rgba(255,255,255,.14);
          background:
            radial-gradient(820px 260px at 18% 30%, rgba(145,125,255,.20), transparent 72%),
            radial-gradient(760px 260px at 74% 60%, rgba(92,255,230,.14), transparent 72%),
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
        .ctaTitle{ font-weight: 1100; letter-spacing: -0.02em; font-size: 18px; }
        .ctaSub{ margin-top: 4px; color: rgba(255,255,255,.70); font-size: 13px; }

        @media (min-width: 980px){
          .links{ display:flex; }
          .heroGrid{ grid-template-columns: 1.12fr .88fr; gap: 22px; align-items:stretch; }
          .h1{ font-size: 78px; }
          .cards{ grid-template-columns: repeat(3, 1fr); }
        }
        @media (max-width: 520px){
          .container{ width: calc(100% - 28px); }
          .h1{ font-size: 44px; }
        }
        @media (prefers-reduced-motion: reduce){
          .bg .photo{ transform:none !important; }
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
          <div className="grid" />
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

                <div className="links">
                  <a href="/templates">Gallery</a>
                  <a href="/use-cases">Use cases</a>
                  <a href="/pricing">Pricing</a>
                  <a href="/contact">Support</a>
                </div>

                <div className="right">
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
                    Build a <span className="grad">world-class</span> website — without the busywork.
                  </h1>

                  <p className="sub">
                    Dominat8 assembles structure, copy, layout, SEO, sitemap, and publish flow — then gives you clean controls to refine and ship with confidence.
                  </p>

                  <div className="ctaRow">
                    <a className="btn btnPrimary" href="/app">Generate my site</a>
                    <a className="btn" href="/templates">Explore examples</a>
                  </div>

                  <div className="cred">
                    <span className="credDot" />
                    <span><b>{live}</b></span>
                    <span className="sep">•</span>
                    <span>Deploy proof: <b>{stamp}</b></span>
                    <span className="sep">•</span>
                    <span><b>SEO</b> + <b>Sitemap</b> + <b>Publish</b> in one flow</span>
                    <span className="sep">•</span>
                    <span>No drama. <b>Just ship.</b></span>
                  </div>
                </div>

                <div className="panel" aria-label="Product preview">
                  <div className="panelTop">
                    <div className="panelTitle">What you get</div>
                    <div className="mini"><Icon name="shield" /> Control-first</div>
                  </div>
                  <div className="panelBody">
                    <div className="row">
                      <div className="rowIcon"><Icon name="spark" /></div>
                      <div>
                        <div className="rowTitle">Premium structure + copy</div>
                        <div className="rowText">A clear homepage rhythm, pricing/FAQ, and a clean brand voice that reads like a real product.</div>
                      </div>
                    </div>

                    <div className="row">
                      <div className="rowIcon"><Icon name="grid" /></div>
                      <div>
                        <div className="rowTitle">Pages that match</div>
                        <div className="rowText">Consistent spacing, typography, and layout decisions — no “template soup”.</div>
                      </div>
                    </div>

                    <div className="row">
                      <div className="rowIcon"><Icon name="rocket" /></div>
                      <div>
                        <div className="rowTitle">Publish-ready outputs</div>
                        <div className="rowText">SEO plan, metadata, sitemap.xml, robots.txt, and deploy proof markers baked in.</div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              <div className="section">
                <div className="kicker">Features</div>
                <div className="h2">Designed to look expensive — and convert.</div>

                <div className="cards">
                  <div className="card">
                    <div className="cardTop">
                      <div className="cardIcon"><Icon name="spark" /></div>
                      <div className="cardTitle">Finish-for-me pipeline</div>
                    </div>
                    <div className="cardBody">
                      A structured build flow that produces real outputs — not vague “ideas”.
                      <div className="list">
                        <div className="li"><i><Icon name="check" /></i><span>Brand brief → hero → sections</span></div>
                        <div className="li"><i><Icon name="check" /></i><span>Pricing/FAQ/contact pages</span></div>
                        <div className="li"><i><Icon name="check" /></i><span>SEO + sitemap + publish</span></div>
                      </div>
                    </div>
                  </div>

                  <div className="card">
                    <div className="cardTop">
                      <div className="cardIcon"><Icon name="shield" /></div>
                      <div className="cardTitle">Proof you can trust</div>
                    </div>
                    <div className="cardBody">
                      The difference between “looks updated” and “is updated” is lethal. We bake proof into the product.
                      <div className="list">
                        <div className="li"><i><Icon name="check" /></i><span>Route + deploy markers</span></div>
                        <div className="li"><i><Icon name="check" /></i><span>No-store probe checks</span></div>
                        <div className="li"><i><Icon name="check" /></i><span>Deterministic outputs</span></div>
                      </div>
                    </div>
                  </div>

                  <div className="card">
                    <div className="cardTop">
                      <div className="cardIcon"><Icon name="rocket" /></div>
                      <div className="cardTitle">Launch-ready look</div>
                    </div>
                    <div className="cardBody">
                      Premium layout decisions: cinematic background, glass hierarchy, and spacing that reads “subscription SaaS”.
                      <div className="list">
                        <div className="li"><i><Icon name="check" /></i><span>Clean nav + hero rhythm</span></div>
                        <div className="li"><i><Icon name="check" /></i><span>Cards that feel expensive</span></div>
                        <div className="li"><i><Icon name="check" /></i><span>Single clear CTA</span></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="ctaBox">
                  <div>
                    <div className="ctaTitle">Ready to generate your flagship site?</div>
                    <div className="ctaSub">Launch the builder, answer a few prompts, and publish with confidence.</div>
                  </div>
                  <div className="ctaRow" style={{ marginTop: 0 }}>
                    <a className="btn btnPrimary" href="/app">Launch builder</a>
                    <a className="btn" href="/pricing">See pricing</a>
                  </div>
                </div>

              </div>
            </div>
          </section>

          <div style={{ height: 26 }} />
        </div>
      </div>
    </>
  );
}