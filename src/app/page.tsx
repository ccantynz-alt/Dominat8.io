"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";

// ── Data ───────────────────────────────────────────────────────────────────────

const AGENTS = [
  { icon: "🔍", name: "SEO Sweep", desc: "Title, meta, OG, H1, structured data — full technical audit.", cost: "1 cr", plan: "Free" },
  { icon: "📱", name: "Responsive Audit", desc: "Tests at 320px, 768px, and 1440px. Fixes layout breaks.", cost: "1 cr", plan: "Free" },
  { icon: "🔗", name: "Link Scanner", desc: "Validates every CTA, anchor, and button. No dead links.", cost: "1 cr", plan: "Starter" },
  { icon: "♿", name: "Accessibility", desc: "WCAG 2.1 AA. Alt text, ARIA, contrast, keyboard nav.", cost: "2 cr", plan: "Starter" },
  { icon: "⚡", name: "Performance", desc: "Core Web Vitals — LCP, CLS, FID risks found and explained.", cost: "2 cr", plan: "Starter" },
  { icon: "🎨", name: "Design Fixer", desc: "AI rewrites the HTML to fix contrast, layout, and typography.", cost: "5 cr", plan: "Pro" },
];

const PLANS = [
  { name: "Free",    price: "$0",  period: "",    credits: 5,   gens: 3,   highlight: false, cta: "Start free" },
  { name: "Starter", price: "$9",  period: "/mo", credits: 25,  gens: 20,  highlight: false, cta: "Get Starter" },
  { name: "Pro",     price: "$29", period: "/mo", credits: 150, gens: 100, highlight: true,  cta: "Get Pro" },
  { name: "Agency",  price: "$99", period: "/mo", credits: 600, gens: 500, highlight: false, cta: "Get Agency" },
];

const STEPS = [
  { n: "01", title: "Describe your business", body: "One sentence. The AI figures out your industry, tone, and design direction automatically." },
  { n: "02", title: "Watch it generate", body: "Claude or GPT-4o streams a complete, production-ready website in under 30 seconds." },
  { n: "03", title: "Deploy AI agents", body: "Run any of 6 specialist agents to audit SEO, fix accessibility issues, and optimise performance." },
];

// ── Component ──────────────────────────────────────────────────────────────────

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { background: #060810; color: #e9eef7; font-family: 'Outfit', system-ui, sans-serif; -webkit-font-smoothing: antialiased; overflow-x: hidden; }

        /* ── Nav ── */
        .ln-nav { position: fixed; top: 0; left: 0; right: 0; z-index: 200; height: 58px; display: flex; align-items: center; justify-content: space-between; padding: 0 clamp(20px, 5vw, 48px); transition: all 200ms; }
        .ln-nav--scrolled { backdrop-filter: blur(24px); background: rgba(6,8,16,0.88); border-bottom: 1px solid rgba(255,255,255,0.07); }
        .ln-logo { font-size: 20px; font-weight: 900; color: #fff; text-decoration: none; letter-spacing: -0.04em; }
        .ln-logo span { color: rgba(61,240,255,0.90); }
        .ln-nav-links { display: flex; gap: 6px; align-items: center; }
        .ln-nav-link { padding: 6px 14px; border-radius: 8px; color: rgba(255,255,255,0.60); font-size: 14px; font-weight: 500; text-decoration: none; transition: color 120ms; }
        .ln-nav-link:hover { color: #fff; }
        .ln-nav-cta { padding: 7px 18px; border-radius: 10px; background: rgba(61,240,255,0.12); border: 1px solid rgba(61,240,255,0.35); color: rgba(61,240,255,0.95); font-size: 14px; font-weight: 600; text-decoration: none; transition: all 130ms; }
        .ln-nav-cta:hover { background: rgba(61,240,255,0.22); border-color: rgba(61,240,255,0.60); }

        /* ── Hero ── */
        .ln-hero { min-height: 100dvh; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: clamp(80px,15vh,140px) clamp(20px,5vw,64px) 80px; position: relative; overflow: hidden; }
        .ln-blob { position: absolute; border-radius: 50%; filter: blur(100px); opacity: 0.18; pointer-events: none; }
        .ln-blob-1 { width: 700px; height: 700px; background: radial-gradient(circle, #3DF0FF, transparent 70%); top: -200px; left: -200px; animation: drift1 30s ease-in-out infinite alternate; }
        .ln-blob-2 { width: 600px; height: 600px; background: radial-gradient(circle, #8B5CF6, transparent 70%); bottom: -150px; right: -100px; animation: drift2 25s ease-in-out infinite alternate; }
        @keyframes drift1 { to { transform: translate(80px, 60px); } }
        @keyframes drift2 { to { transform: translate(-60px, -80px); } }
        .ln-badge { display: inline-flex; align-items: center; gap: 6px; padding: 5px 14px; border-radius: 999px; border: 1px solid rgba(61,240,255,0.25); background: rgba(61,240,255,0.06); color: rgba(61,240,255,0.80); font-size: 12px; font-weight: 600; letter-spacing: 0.04em; margin-bottom: 28px; }
        .ln-badge-dot { width: 6px; height: 6px; border-radius: 50%; background: rgba(61,240,255,0.90); animation: pulse 2s ease-in-out infinite; }
        @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.3; } }
        .ln-h1 { font-size: clamp(48px, 8vw, 96px); font-weight: 900; letter-spacing: -0.05em; line-height: 0.95; margin-bottom: 24px; }
        .ln-h1-grad { background: linear-gradient(135deg, #fff 30%, rgba(61,240,255,0.90)); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; }
        .ln-sub { font-size: clamp(16px, 2vw, 20px); color: rgba(255,255,255,0.55); line-height: 1.65; max-width: 560px; margin: 0 auto 40px; font-weight: 400; }
        .ln-cta-row { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; margin-bottom: 48px; }
        .ln-cta-primary { padding: 14px 32px; border-radius: 14px; background: linear-gradient(135deg, rgba(61,240,255,0.25), rgba(61,240,255,0.10)); border: 1px solid rgba(61,240,255,0.50); color: rgba(61,240,255,0.97); font-size: 16px; font-weight: 700; text-decoration: none; transition: all 150ms; display: flex; align-items: center; gap: 8px; }
        .ln-cta-primary:hover { background: linear-gradient(135deg, rgba(61,240,255,0.35), rgba(61,240,255,0.18)); transform: translateY(-1px); box-shadow: 0 0 40px rgba(61,240,255,0.20); }
        .ln-cta-secondary { padding: 14px 28px; border-radius: 14px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12); color: rgba(255,255,255,0.75); font-size: 16px; font-weight: 600; text-decoration: none; transition: all 150ms; }
        .ln-cta-secondary:hover { background: rgba(255,255,255,0.10); color: #fff; }
        .ln-powered { display: flex; align-items: center; gap: 10px; color: rgba(255,255,255,0.30); font-size: 12px; font-weight: 500; letter-spacing: 0.04em; justify-content: center; }
        .ln-powered-chip { padding: 3px 10px; border-radius: 6px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.10); color: rgba(255,255,255,0.55); font-size: 11px; font-weight: 600; }

        /* ── Sections ── */
        .ln-section { padding: clamp(64px, 10vw, 120px) clamp(20px, 5vw, 64px); }
        .ln-section--dark { background: #060810; }
        .ln-section--surface { background: rgba(255,255,255,0.025); }
        .ln-section-inner { max-width: 1100px; margin: 0 auto; }
        .ln-section-label { font-size: 11px; font-weight: 700; letter-spacing: 0.10em; text-transform: uppercase; color: rgba(61,240,255,0.70); margin-bottom: 12px; }
        .ln-section-h2 { font-size: clamp(28px, 4vw, 48px); font-weight: 800; letter-spacing: -0.04em; line-height: 1.1; margin-bottom: 16px; }
        .ln-section-body { font-size: 16px; color: rgba(255,255,255,0.50); line-height: 1.70; max-width: 560px; margin-bottom: 48px; }

        /* ── Steps ── */
        .ln-steps { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
        @media (max-width: 768px) { .ln-steps { grid-template-columns: 1fr; } }
        .ln-step { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 18px; padding: 28px; }
        .ln-step-n { font-size: 11px; font-weight: 700; letter-spacing: 0.08em; color: rgba(61,240,255,0.55); margin-bottom: 14px; font-family: ui-monospace,monospace; }
        .ln-step-title { font-size: 18px; font-weight: 700; margin-bottom: 8px; letter-spacing: -0.02em; }
        .ln-step-body { font-size: 14px; color: rgba(255,255,255,0.50); line-height: 1.65; }

        /* ── Agent grid ── */
        .ln-agents { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
        @media (max-width: 900px) { .ln-agents { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 560px) { .ln-agents { grid-template-columns: 1fr; } }
        .ln-agent { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 22px; transition: all 200ms; }
        .ln-agent:hover { background: rgba(255,255,255,0.06); border-color: rgba(255,255,255,0.14); transform: translateY(-2px); }
        .ln-agent-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
        .ln-agent-icon { font-size: 22px; }
        .ln-agent-plan { font-size: 9px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; padding: 2px 7px; border-radius: 5px; }
        .ln-agent-plan--free { background: rgba(255,255,255,0.07); color: rgba(255,255,255,0.45); }
        .ln-agent-plan--starter { background: rgba(61,240,255,0.08); color: rgba(61,240,255,0.70); }
        .ln-agent-plan--pro { background: rgba(139,92,246,0.12); color: rgba(139,92,246,0.85); }
        .ln-agent-name { font-size: 15px; font-weight: 700; margin-bottom: 6px; letter-spacing: -0.02em; }
        .ln-agent-desc { font-size: 12px; color: rgba(255,255,255,0.45); line-height: 1.55; margin-bottom: 10px; }
        .ln-agent-cost { font-size: 10px; font-weight: 600; color: rgba(255,255,255,0.30); font-family: ui-monospace,monospace; }

        /* ── Pricing ── */
        .ln-pricing { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
        @media (max-width: 900px) { .ln-pricing { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 560px) { .ln-pricing { grid-template-columns: 1fr; } }
        .ln-plan { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 20px; padding: 28px 22px; display: flex; flex-direction: column; gap: 14px; }
        .ln-plan--highlight { background: rgba(139,92,246,0.08); border-color: rgba(139,92,246,0.35); }
        .ln-plan-name { font-size: 13px; font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase; color: rgba(255,255,255,0.55); }
        .ln-plan--highlight .ln-plan-name { color: rgba(139,92,246,0.90); }
        .ln-plan-price { display: flex; align-items: baseline; gap: 3px; }
        .ln-plan-amount { font-size: 36px; font-weight: 900; letter-spacing: -0.04em; }
        .ln-plan-period { font-size: 13px; color: rgba(255,255,255,0.35); font-weight: 400; }
        .ln-plan-features { display: flex; flex-direction: column; gap: 8px; flex: 1; }
        .ln-plan-feature { font-size: 13px; color: rgba(255,255,255,0.60); display: flex; align-items: center; gap: 7px; }
        .ln-plan-feature::before { content: "✓"; font-size: 11px; font-weight: 700; color: rgba(56,248,166,0.70); flex-shrink: 0; }
        .ln-plan-cta { display: block; text-align: center; padding: 11px; border-radius: 10px; font-size: 14px; font-weight: 700; text-decoration: none; transition: all 140ms; border: 1px solid rgba(255,255,255,0.14); background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.80); }
        .ln-plan-cta:hover { background: rgba(255,255,255,0.12); color: #fff; }
        .ln-plan--highlight .ln-plan-cta { background: rgba(139,92,246,0.20); border-color: rgba(139,92,246,0.45); color: rgba(139,92,246,0.95); }
        .ln-plan--highlight .ln-plan-cta:hover { background: rgba(139,92,246,0.32); }

        /* ── Footer ── */
        .ln-footer { border-top: 1px solid rgba(255,255,255,0.06); padding: 36px clamp(20px,5vw,64px); display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px; }
        .ln-footer-copy { font-size: 13px; color: rgba(255,255,255,0.30); }
        .ln-footer-links { display: flex; gap: 20px; }
        .ln-footer-link { font-size: 13px; color: rgba(255,255,255,0.35); text-decoration: none; transition: color 120ms; }
        .ln-footer-link:hover { color: rgba(255,255,255,0.70); }
      `}</style>

      {/* ── Nav ── */}
      <nav className={`ln-nav${scrolled ? " ln-nav--scrolled" : ""}`}>
        <a href="/" className="ln-logo">Dominat<span>8</span>.io</a>
        <div className="ln-nav-links">
          <a href="#how-it-works" className="ln-nav-link">How it works</a>
          <a href="#agents" className="ln-nav-link">Agents</a>
          <Link href="/pricing" className="ln-nav-link">Pricing</Link>
          <Link href="/build" className="ln-nav-cta">Start building →</Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="ln-hero" ref={heroRef}>
        <div className="ln-blob ln-blob-1" />
        <div className="ln-blob ln-blob-2" />
        <div className="ln-badge">
          <span className="ln-badge-dot" />
          Powered by Claude + GPT-4o
        </div>
        <h1 className="ln-h1">
          <span className="ln-h1-grad">Build websites.</span>
          <br />
          Let AI perfect them.
        </h1>
        <p className="ln-sub">
          One prompt generates a production-ready website. Six AI agents
          then audit, fix, and optimise every detail — SEO, accessibility,
          performance, design.
        </p>
        <div className="ln-cta-row">
          <Link href="/build" className="ln-cta-primary">
            ⚡ Build for free
          </Link>
          <a href="#how-it-works" className="ln-cta-secondary">
            See how it works
          </a>
        </div>
        <div className="ln-powered">
          <span>Generate with</span>
          <span className="ln-powered-chip">Claude Sonnet</span>
          <span>or</span>
          <span className="ln-powered-chip">GPT-4o</span>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="ln-section ln-section--surface" id="how-it-works">
        <div className="ln-section-inner">
          <div className="ln-section-label">How it works</div>
          <h2 className="ln-section-h2">From prompt to live site<br />in three steps</h2>
          <div className="ln-steps">
            {STEPS.map(s => (
              <div key={s.n} className="ln-step">
                <div className="ln-step-n">{s.n}</div>
                <div className="ln-step-title">{s.title}</div>
                <div className="ln-step-body">{s.body}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Agents ── */}
      <section className="ln-section ln-section--dark" id="agents">
        <div className="ln-section-inner">
          <div className="ln-section-label">AI Agents</div>
          <h2 className="ln-section-h2">Six specialist agents.<br />One goal: perfection.</h2>
          <p className="ln-section-body">
            Each agent is a domain expert. Run them individually or all at once.
            Results show in seconds — with actionable fixes and a score.
          </p>
          <div className="ln-agents">
            {AGENTS.map(a => (
              <div key={a.name} className="ln-agent">
                <div className="ln-agent-top">
                  <span className="ln-agent-icon">{a.icon}</span>
                  <span className={`ln-agent-plan ln-agent-plan--${a.plan.toLowerCase()}`}>{a.plan}</span>
                </div>
                <div className="ln-agent-name">{a.name}</div>
                <div className="ln-agent-desc">{a.desc}</div>
                <div className="ln-agent-cost">{a.cost} per run</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section className="ln-section ln-section--surface" id="pricing">
        <div className="ln-section-inner">
          <div className="ln-section-label">Pricing</div>
          <h2 className="ln-section-h2">Simple pricing.<br />Start free forever.</h2>
          <p className="ln-section-body">
            Every plan includes agent credits. Run out? Top up with credit packs — they never expire.
          </p>
          <div className="ln-pricing">
            {PLANS.map(p => (
              <div key={p.name} className={`ln-plan${p.highlight ? " ln-plan--highlight" : ""}`}>
                <div className="ln-plan-name">{p.name}</div>
                <div className="ln-plan-price">
                  <span className="ln-plan-amount">{p.price}</span>
                  <span className="ln-plan-period">{p.period}</span>
                </div>
                <div className="ln-plan-features">
                  <div className="ln-plan-feature">{p.gens} site generations/mo</div>
                  <div className="ln-plan-feature">{p.credits} agent credits/mo</div>
                  {p.name !== "Free" && <div className="ln-plan-feature">Buy extra credits</div>}
                  {(p.name === "Pro" || p.name === "Agency") && <div className="ln-plan-feature">Design Fixer agent</div>}
                  {p.name === "Agency" && <div className="ln-plan-feature">White-label output</div>}
                  {p.name === "Agency" && <div className="ln-plan-feature">5 team seats + SLA</div>}
                </div>
                <Link href={p.name === "Free" ? "/build" : "/pricing"} className="ln-plan-cta">
                  {p.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="ln-section ln-section--dark" style={{ textAlign: "center" }}>
        <div className="ln-section-inner" style={{ maxWidth: 640 }}>
          <h2 className="ln-section-h2" style={{ marginBottom: 16 }}>Ready to Dominat8?</h2>
          <p className="ln-section-body" style={{ margin: "0 auto 36px" }}>
            Free to start. No credit card required. Your first 3 sites are on us.
          </p>
          <Link href="/build" className="ln-cta-primary" style={{ display: "inline-flex", margin: "0 auto" }}>
            ⚡ Build your first site free
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="ln-footer">
        <div className="ln-footer-copy">© 2026 Dominat8.io · All rights reserved</div>
        <div className="ln-footer-links">
          <Link href="/pricing" className="ln-footer-link">Pricing</Link>
          <Link href="/privacy" className="ln-footer-link">Privacy</Link>
          <Link href="/terms" className="ln-footer-link">Terms</Link>
        </div>
      </footer>
    </>
  );
}
