"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";

// ── Loop steps ──────────────────────────────────────────────────────────────────

const LOOP_STEPS = [
  { id: "prompt",   icon: "⌨",  label: "Prompt",    desc: "Describe your business in one sentence" },
  { id: "reason",   icon: "🧠",  label: "Reason",    desc: "Agentic loop plans architecture & content" },
  { id: "build",    icon: "⚡",  label: "Build",     desc: "Complete site generated in under 60s" },
  { id: "heal",     icon: "🔄",  label: "Self-Heal", desc: "Loop detects bugs and fixes them automatically" },
  { id: "audit",    icon: "🔍",  label: "Audit",     desc: "6 specialist agents sweep for issues" },
  { id: "ship",     icon: "🚀",  label: "Ship",      desc: "Deploy-ready React/TypeScript exported" },
];

const AGENTS = [
  { icon: "🔍", name: "SEO Sweep",         desc: "Title, meta, OG, structured data — full technical audit.", cost: "1 cr", plan: "free" },
  { icon: "📱", name: "Responsive Audit",  desc: "Tests at 320px, 768px, 1440px. Fixes layout breaks.",     cost: "1 cr", plan: "free" },
  { icon: "🔗", name: "Link Scanner",      desc: "Validates every CTA, anchor, button. No dead links.",       cost: "1 cr", plan: "starter" },
  { icon: "♿", name: "Accessibility",     desc: "WCAG 2.1 AA. Alt text, ARIA, contrast, keyboard nav.",      cost: "2 cr", plan: "starter" },
  { icon: "⚡", name: "Performance",       desc: "Core Web Vitals — LCP, CLS, FID risks found & explained.", cost: "2 cr", plan: "starter" },
  { icon: "🎨", name: "Design Fixer",      desc: "AI rewrites HTML to fix contrast, layout, typography.",     cost: "5 cr", plan: "pro" },
];

const PLANS = [
  { name: "Free",    price: "$0",  period: "",    credits: 5,   gens: 3,   highlight: false, cta: "Start free",   href: "/build" },
  { name: "Starter", price: "$9",  period: "/mo", credits: 25,  gens: 20,  highlight: false, cta: "Get Starter",  href: "/pricing" },
  { name: "Pro",     price: "$29", period: "/mo", credits: 150, gens: 100, highlight: true,  cta: "Get Pro",      href: "/pricing" },
  { name: "Agency",  price: "$99", period: "/mo", credits: 600, gens: 500, highlight: false, cta: "Get Agency",   href: "/pricing" },
];

// ── Component ───────────────────────────────────────────────────────────────────

export default function LandingPage() {
  const [scrolled, setScrolled]   = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setActiveStep(s => (s + 1) % LOOP_STEPS.length), 1800);
    return () => clearInterval(t);
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { background: #060810; color: #e9eef7; font-family: 'Outfit', system-ui, sans-serif; -webkit-font-smoothing: antialiased; overflow-x: hidden; }

        /* ── Nav ── */
        .ln-nav { position: fixed; top: 0; left: 0; right: 0; z-index: 200; height: 58px; display: flex; align-items: center; justify-content: space-between; padding: 0 clamp(20px, 5vw, 48px); transition: all 200ms; }
        .ln-nav--scrolled { backdrop-filter: blur(24px); background: rgba(6,8,16,0.90); border-bottom: 1px solid rgba(255,255,255,0.07); }
        .ln-logo { font-size: 20px; font-weight: 900; color: #fff; text-decoration: none; letter-spacing: -0.04em; }
        .ln-logo span { color: rgba(61,240,255,0.90); }
        .ln-nav-links { display: flex; gap: 6px; align-items: center; }
        .ln-nav-link { padding: 6px 14px; border-radius: 8px; color: rgba(255,255,255,0.55); font-size: 14px; font-weight: 500; text-decoration: none; transition: color 120ms; }
        .ln-nav-link:hover { color: #fff; }
        .ln-nav-ext { padding: 6px 14px; border-radius: 8px; color: rgba(255,255,255,0.35); font-size: 13px; font-weight: 500; text-decoration: none; transition: color 120ms; }
        .ln-nav-ext:hover { color: rgba(255,255,255,0.70); }
        .ln-nav-cta { padding: 7px 18px; border-radius: 10px; background: rgba(61,240,255,0.12); border: 1px solid rgba(61,240,255,0.35); color: rgba(61,240,255,0.95); font-size: 14px; font-weight: 600; text-decoration: none; transition: all 130ms; }
        .ln-nav-cta:hover { background: rgba(61,240,255,0.22); border-color: rgba(61,240,255,0.60); }
        @media (max-width: 640px) { .ln-nav-ext, .ln-nav-link { display: none; } }

        /* ── Hero ── */
        .ln-hero { min-height: 100dvh; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: clamp(80px,15vh,140px) clamp(20px,5vw,64px) 80px; position: relative; overflow: hidden; }
        .ln-blob { position: absolute; border-radius: 50%; filter: blur(110px); opacity: 0.15; pointer-events: none; }
        .ln-blob-1 { width: 800px; height: 800px; background: radial-gradient(circle, #3DF0FF, transparent 70%); top: -280px; left: -220px; animation: drift1 32s ease-in-out infinite alternate; }
        .ln-blob-2 { width: 700px; height: 700px; background: radial-gradient(circle, #8B5CF6, transparent 70%); bottom: -200px; right: -150px; animation: drift2 26s ease-in-out infinite alternate; }
        @keyframes drift1 { to { transform: translate(80px, 60px); } }
        @keyframes drift2 { to { transform: translate(-60px, -80px); } }

        /* ── Fog ── */
        .ln-fog-wisp { position: absolute; border-radius: 50%; pointer-events: none; }
        .ln-fog-1 { width: 160%; height: 160px; top: 10%; left: -30%; background: radial-gradient(ellipse at 50% 50%, rgba(255,255,255,0.30), rgba(220,230,255,0.12) 48%, transparent 72%); filter: blur(22px); animation: fogDrift1 60s ease-in-out infinite alternate; }
        .ln-fog-2 { width: 140%; height: 130px; bottom: 16%; right: -30%; background: radial-gradient(ellipse at 50% 50%, rgba(235,240,255,0.25), rgba(220,228,255,0.08) 50%, transparent 70%); filter: blur(18px); animation: fogDrift2 76s ease-in-out infinite alternate; }
        .ln-fog-3 { width: 120%; height: 110px; top: 52%; left: -10%; background: radial-gradient(ellipse at 50% 50%, rgba(245,248,255,0.20), transparent 66%); filter: blur(16px); animation: fogDrift3 50s ease-in-out infinite alternate; }
        @keyframes fogDrift1 { 0% { transform: translate(0,0) scaleY(1); } 100% { transform: translate(9%,22px) scaleY(1.07); } }
        @keyframes fogDrift2 { 0% { transform: translate(0,0) scaleX(1); } 100% { transform: translate(-7%,-18px) scaleX(1.05); } }
        @keyframes fogDrift3 { 0% { transform: translate(0,0); } 100% { transform: translate(6%,-15px); } }

        .ln-badge { display: inline-flex; align-items: center; gap: 6px; padding: 5px 14px; border-radius: 999px; border: 1px solid rgba(61,240,255,0.25); background: rgba(61,240,255,0.06); color: rgba(61,240,255,0.80); font-size: 12px; font-weight: 600; letter-spacing: 0.04em; margin-bottom: 28px; }
        .ln-badge-dot { width: 6px; height: 6px; border-radius: 50%; background: rgba(61,240,255,0.90); animation: pulse 2s ease-in-out infinite; }
        @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.3; } }

        .ln-h1 { font-size: clamp(42px, 7.5vw, 90px); font-weight: 900; letter-spacing: -0.055em; line-height: 0.92; margin-bottom: 24px; }
        .ln-h1-grad { background: linear-gradient(135deg, #fff 30%, rgba(61,240,255,0.90)); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; }
        .ln-h1-heal { background: linear-gradient(135deg, rgba(139,92,246,0.95), rgba(61,240,255,0.80)); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; }

        .ln-sub { font-size: clamp(16px, 1.8vw, 19px); color: rgba(255,255,255,0.50); line-height: 1.70; max-width: 600px; margin: 0 auto 40px; font-weight: 400; }
        .ln-sub strong { color: rgba(255,255,255,0.80); font-weight: 600; }

        .ln-cta-row { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; margin-bottom: 56px; }
        .ln-cta-primary { padding: 14px 32px; border-radius: 14px; background: linear-gradient(135deg, rgba(61,240,255,0.22), rgba(61,240,255,0.08)); border: 1px solid rgba(61,240,255,0.48); color: rgba(61,240,255,0.97); font-size: 16px; font-weight: 700; text-decoration: none; transition: all 150ms; display: inline-flex; align-items: center; gap: 8px; }
        .ln-cta-primary:hover { background: linear-gradient(135deg, rgba(61,240,255,0.32), rgba(61,240,255,0.15)); transform: translateY(-1px); box-shadow: 0 0 40px rgba(61,240,255,0.18); }
        .ln-cta-secondary { padding: 14px 28px; border-radius: 14px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.11); color: rgba(255,255,255,0.70); font-size: 16px; font-weight: 600; text-decoration: none; transition: all 150ms; }
        .ln-cta-secondary:hover { background: rgba(255,255,255,0.09); color: #fff; }

        /* ── Stat strip ── */
        .ln-stats { display: flex; gap: 0; justify-content: center; border-top: 1px solid rgba(255,255,255,0.06); border-bottom: 1px solid rgba(255,255,255,0.06); padding: 20px 0; flex-wrap: wrap; }
        .ln-stat { display: flex; flex-direction: column; align-items: center; padding: 8px 32px; border-right: 1px solid rgba(255,255,255,0.07); }
        .ln-stat:last-child { border-right: none; }
        .ln-stat-num { font-size: 26px; font-weight: 900; letter-spacing: -0.04em; color: rgba(61,240,255,0.90); font-family: 'JetBrains Mono', monospace; }
        .ln-stat-label { font-size: 11px; font-weight: 600; color: rgba(255,255,255,0.35); letter-spacing: 0.06em; text-transform: uppercase; margin-top: 2px; }

        /* ── Sections ── */
        .ln-section { padding: clamp(64px, 10vw, 120px) clamp(20px, 5vw, 64px); }
        .ln-section--dark { background: #060810; }
        .ln-section--surface { background: rgba(255,255,255,0.022); }
        .ln-section-inner { max-width: 1100px; margin: 0 auto; }
        .ln-section-label { font-size: 11px; font-weight: 700; letter-spacing: 0.10em; text-transform: uppercase; color: rgba(61,240,255,0.65); margin-bottom: 12px; font-family: 'JetBrains Mono', monospace; }
        .ln-section-h2 { font-size: clamp(28px, 4vw, 48px); font-weight: 800; letter-spacing: -0.04em; line-height: 1.1; margin-bottom: 16px; }
        .ln-section-body { font-size: 16px; color: rgba(255,255,255,0.45); line-height: 1.75; max-width: 580px; margin-bottom: 52px; }

        /* ── Agentic loop ── */
        .ln-loop { display: grid; grid-template-columns: repeat(6, 1fr); gap: 10px; }
        @media (max-width: 900px) { .ln-loop { grid-template-columns: repeat(3, 1fr); } }
        @media (max-width: 520px) { .ln-loop { grid-template-columns: repeat(2, 1fr); } }
        .ln-loop-step { position: relative; padding: 22px 16px 20px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.07); background: rgba(255,255,255,0.03); text-align: center; transition: all 300ms; }
        .ln-loop-step.active { border-color: rgba(61,240,255,0.45); background: rgba(61,240,255,0.07); box-shadow: 0 0 30px rgba(61,240,255,0.10); }
        .ln-loop-step.active .ln-loop-step-label { color: rgba(61,240,255,0.95); }
        .ln-loop-icon { font-size: 26px; margin-bottom: 10px; display: block; }
        .ln-loop-step-label { font-size: 13px; font-weight: 700; letter-spacing: -0.01em; margin-bottom: 6px; color: rgba(255,255,255,0.80); transition: color 300ms; }
        .ln-loop-step-desc { font-size: 11px; color: rgba(255,255,255,0.38); line-height: 1.50; }
        .ln-loop-connector { display: none; } /* arrow between steps on desktop */

        /* ── Self-heal callout ── */
        .ln-heal-box { border: 1px solid rgba(139,92,246,0.25); background: rgba(139,92,246,0.06); border-radius: 20px; padding: 36px 40px; display: grid; grid-template-columns: 1fr 1fr; gap: 48px; align-items: center; margin-top: 48px; }
        @media (max-width: 720px) { .ln-heal-box { grid-template-columns: 1fr; gap: 24px; padding: 28px; } }
        .ln-heal-title { font-size: clamp(22px, 3vw, 32px); font-weight: 800; letter-spacing: -0.04em; margin-bottom: 14px; }
        .ln-heal-body { font-size: 15px; color: rgba(255,255,255,0.50); line-height: 1.70; }
        .ln-heal-steps { display: flex; flex-direction: column; gap: 14px; }
        .ln-heal-step { display: flex; align-items: flex-start; gap: 14px; }
        .ln-heal-step-num { width: 28px; height: 28px; border-radius: 8px; border: 1px solid rgba(139,92,246,0.35); background: rgba(139,92,246,0.10); color: rgba(139,92,246,0.90); font-size: 11px; font-weight: 800; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-family: 'JetBrains Mono', monospace; }
        .ln-heal-step-text { font-size: 14px; color: rgba(255,255,255,0.60); line-height: 1.55; padding-top: 4px; }
        .ln-heal-step-text strong { color: rgba(255,255,255,0.90); font-weight: 600; }

        /* ── Code export ── */
        .ln-code-box { border: 1px solid rgba(255,255,255,0.08); background: rgba(0,0,0,0.40); border-radius: 16px; overflow: hidden; }
        .ln-code-bar { display: flex; align-items: center; gap: 7px; padding: 12px 16px; border-bottom: 1px solid rgba(255,255,255,0.06); background: rgba(255,255,255,0.03); }
        .ln-code-dot { width: 10px; height: 10px; border-radius: 50%; }
        .ln-code-filename { font-size: 12px; font-weight: 600; color: rgba(255,255,255,0.35); font-family: 'JetBrains Mono', monospace; margin-left: 8px; }
        .ln-code-body { padding: 20px 22px; font-family: 'JetBrains Mono', monospace; font-size: 12.5px; line-height: 1.90; color: rgba(255,255,255,0.70); white-space: pre; overflow-x: auto; }
        .c-purple { color: rgba(139,92,246,0.90); }
        .c-cyan   { color: rgba(61,240,255,0.85); }
        .c-green  { color: rgba(56,248,166,0.80); }
        .c-gray   { color: rgba(255,255,255,0.30); }
        .c-white  { color: rgba(255,255,255,0.85); }

        /* ── Agent grid ── */
        .ln-agents { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
        @media (max-width: 900px) { .ln-agents { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 540px) { .ln-agents { grid-template-columns: 1fr; } }
        .ln-agent { background: rgba(255,255,255,0.025); border: 1px solid rgba(255,255,255,0.07); border-radius: 16px; padding: 20px; transition: all 200ms; }
        .ln-agent:hover { background: rgba(255,255,255,0.05); border-color: rgba(255,255,255,0.13); transform: translateY(-2px); }
        .ln-agent-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
        .ln-agent-icon { font-size: 20px; }
        .ln-agent-plan { font-size: 9px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; padding: 2px 7px; border-radius: 5px; }
        .ln-agent-plan--free    { background: rgba(255,255,255,0.07); color: rgba(255,255,255,0.40); }
        .ln-agent-plan--starter { background: rgba(61,240,255,0.08); color: rgba(61,240,255,0.65); }
        .ln-agent-plan--pro     { background: rgba(139,92,246,0.12); color: rgba(139,92,246,0.80); }
        .ln-agent-name { font-size: 14px; font-weight: 700; margin-bottom: 5px; letter-spacing: -0.02em; }
        .ln-agent-desc { font-size: 12px; color: rgba(255,255,255,0.40); line-height: 1.55; margin-bottom: 8px; }
        .ln-agent-cost { font-size: 10px; font-weight: 600; color: rgba(255,255,255,0.25); font-family: 'JetBrains Mono', monospace; }

        /* ── Pricing ── */
        .ln-pricing { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; }
        @media (max-width: 900px) { .ln-pricing { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 520px) { .ln-pricing { grid-template-columns: 1fr; } }
        .ln-plan { background: rgba(255,255,255,0.025); border: 1px solid rgba(255,255,255,0.07); border-radius: 20px; padding: 26px 20px; display: flex; flex-direction: column; gap: 14px; }
        .ln-plan--highlight { background: rgba(139,92,246,0.07); border-color: rgba(139,92,246,0.32); }
        .ln-plan-name { font-size: 11px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: rgba(255,255,255,0.45); font-family: 'JetBrains Mono', monospace; }
        .ln-plan--highlight .ln-plan-name { color: rgba(139,92,246,0.85); }
        .ln-plan-price { display: flex; align-items: baseline; gap: 3px; }
        .ln-plan-amount { font-size: 34px; font-weight: 900; letter-spacing: -0.04em; }
        .ln-plan-period { font-size: 13px; color: rgba(255,255,255,0.30); font-weight: 400; }
        .ln-plan-features { display: flex; flex-direction: column; gap: 8px; flex: 1; }
        .ln-plan-feature { font-size: 13px; color: rgba(255,255,255,0.55); display: flex; align-items: center; gap: 7px; }
        .ln-plan-feature::before { content: "✓"; font-size: 10px; font-weight: 800; color: rgba(56,248,166,0.65); flex-shrink: 0; }
        .ln-plan-cta { display: block; text-align: center; padding: 10px; border-radius: 10px; font-size: 14px; font-weight: 700; text-decoration: none; transition: all 140ms; border: 1px solid rgba(255,255,255,0.12); background: rgba(255,255,255,0.05); color: rgba(255,255,255,0.75); }
        .ln-plan-cta:hover { background: rgba(255,255,255,0.10); color: #fff; }
        .ln-plan--highlight .ln-plan-cta { background: rgba(139,92,246,0.18); border-color: rgba(139,92,246,0.40); color: rgba(139,92,246,0.95); }
        .ln-plan--highlight .ln-plan-cta:hover { background: rgba(139,92,246,0.28); }

        /* ── Final CTA ── */
        .ln-final { text-align: center; padding: clamp(64px, 10vw, 120px) clamp(20px, 5vw, 64px); position: relative; overflow: hidden; }
        .ln-final-blob { position: absolute; width: 600px; height: 600px; border-radius: 50%; filter: blur(120px); opacity: 0.10; top: 50%; left: 50%; transform: translate(-50%, -50%); background: radial-gradient(circle, #3DF0FF, #8B5CF6); pointer-events: none; }
        .ln-final-inner { position: relative; max-width: 640px; margin: 0 auto; }
        .ln-final-h2 { font-size: clamp(32px, 5vw, 56px); font-weight: 900; letter-spacing: -0.05em; margin-bottom: 16px; }
        .ln-final-sub { font-size: 16px; color: rgba(255,255,255,0.45); line-height: 1.70; margin-bottom: 36px; }

        /* ── Footer ── */
        .ln-footer { border-top: 1px solid rgba(255,255,255,0.06); padding: 32px clamp(20px,5vw,64px); display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px; }
        .ln-footer-copy { font-size: 13px; color: rgba(255,255,255,0.28); }
        .ln-footer-links { display: flex; gap: 20px; }
        .ln-footer-link { font-size: 13px; color: rgba(255,255,255,0.32); text-decoration: none; transition: color 120ms; }
        .ln-footer-link:hover { color: rgba(255,255,255,0.65); }
      `}</style>

      {/* ── Nav ── */}
      <nav className={`ln-nav${scrolled ? " ln-nav--scrolled" : ""}`}>
        <a href="/" className="ln-logo">Dominat<span>8</span>.io</a>
        <div className="ln-nav-links">
          <a href="https://dominat8.com" target="_blank" rel="noopener noreferrer" className="ln-nav-ext">dominat8.com ↗</a>
          <a href="#loop" className="ln-nav-link">The Loop</a>
          <a href="#agents" className="ln-nav-link">Agents</a>
          <Link href="/pricing" className="ln-nav-link">Pricing</Link>
          <Link href="/video" className="ln-nav-link">🎵 Video</Link>
          <Link href="/build" className="ln-nav-cta">Launch builder →</Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="ln-hero">
        <div className="ln-blob ln-blob-1" />
        <div className="ln-blob ln-blob-2" />
        <div className="ln-fog-wisp ln-fog-1" />
        <div className="ln-fog-wisp ln-fog-2" />
        <div className="ln-fog-wisp ln-fog-3" />

        <div className="ln-badge">
          <span className="ln-badge-dot" />
          Fully Orchestrated Agentic Loop
        </div>

        <h1 className="ln-h1">
          <span className="ln-h1-grad">Build. Fix.</span>
          <br />
          <span className="ln-h1-heal">Self-Heal. Ship.</span>
        </h1>

        <p className="ln-sub">
          Not a template. Not a drag-and-drop editor. An <strong>agentic reasoning loop</strong> that
          builds, detects its own bugs, fixes them, audits the result, and exports
          clean <strong>React / TypeScript</strong> code you actually own.
        </p>

        <div className="ln-cta-row">
          <Link href="/build" className="ln-cta-primary">
            ⚡ Start the loop
          </Link>
          <a href="#loop" className="ln-cta-secondary">
            How it works
          </a>
        </div>

        {/* ── Stat strip ── */}
        <div className="ln-stats">
          <div className="ln-stat">
            <span className="ln-stat-num">&lt;60s</span>
            <span className="ln-stat-label">First build</span>
          </div>
          <div className="ln-stat">
            <span className="ln-stat-num">6</span>
            <span className="ln-stat-label">AI agents</span>
          </div>
          <div className="ln-stat">
            <span className="ln-stat-num">TS</span>
            <span className="ln-stat-label">Clean export</span>
          </div>
          <div className="ln-stat">
            <span className="ln-stat-num">2</span>
            <span className="ln-stat-label">AI models</span>
          </div>
        </div>
      </section>

      {/* ── Agentic Loop ── */}
      <section className="ln-section ln-section--surface" id="loop">
        <div className="ln-section-inner">
          <div className="ln-section-label">{"// agentic_loop.ts"}</div>
          <h2 className="ln-section-h2">Multi-step reasoning.<br />Not just a prompt.</h2>
          <p className="ln-section-body">
            Every build runs through a six-stage orchestrated loop. Claude plans the architecture,
            constructs the site, then the loop detects errors and self-corrects — before
            you see the result.
          </p>

          <div className="ln-loop">
            {LOOP_STEPS.map((step, i) => (
              <div key={step.id} className={`ln-loop-step${i === activeStep ? " active" : ""}`}>
                <span className="ln-loop-icon">{step.icon}</span>
                <div className="ln-loop-step-label">{step.label}</div>
                <div className="ln-loop-step-desc">{step.desc}</div>
              </div>
            ))}
          </div>

          {/* Self-heal callout */}
          <div className="ln-heal-box">
            <div>
              <div className="ln-section-label" style={{ marginBottom: 10 }}>{"// self_heal.ts"}</div>
              <div className="ln-heal-title">
                The loop catches what<br />
                <span style={{ color: "rgba(139,92,246,0.90)" }}>you&apos;d never see.</span>
              </div>
              <p className="ln-heal-body">
                Most AI builders hand you broken output and call it done.
                Dominat8.io runs a second reasoning pass — automatically
                finding layout regressions, JS errors, and broken interactions,
                then fixing them before the result is rendered.
              </p>
            </div>
            <div className="ln-heal-steps">
              {[
                ["01", "Generate", "Claude builds the full site from your prompt"],
                ["02", "Inspect",  "Loop evaluates output for known failure patterns"],
                ["03", "Patch",    "Targeted fixes applied — no full regeneration"],
                ["04", "Verify",   "Pass/fail check before result is shown to you"],
              ].map(([n, title, body]) => (
                <div key={n} className="ln-heal-step">
                  <div className="ln-heal-step-num">{n}</div>
                  <div className="ln-heal-step-text"><strong>{title}</strong> — {body}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Code Export ── */}
      <section className="ln-section ln-section--dark">
        <div className="ln-section-inner" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "56px", alignItems: "center" }}>
          <div style={{ minWidth: 0 }}>
            <div className="ln-section-label">{"// export.tsx"}</div>
            <h2 className="ln-section-h2">Not a black box.<br />Real code you own.</h2>
            <p className="ln-section-body" style={{ marginBottom: 24 }}>
              Export clean, professional React + TypeScript. Componentised, typed,
              and ready for your own codebase — not locked into a proprietary format.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                "React 18 + TypeScript components",
                "Typed props — no any, no implicit",
                "Tailwind or inline CSS (your choice)",
                "Accessible HTML structure built-in",
                "Zero runtime vendor dependencies",
              ].map(f => (
                <div key={f} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, color: "rgba(255,255,255,0.60)" }}>
                  <span style={{ color: "rgba(56,248,166,0.70)", fontWeight: 700, fontSize: 11 }}>✓</span>
                  {f}
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="ln-code-box">
              <div className="ln-code-bar">
                <span className="ln-code-dot" style={{ background: "#FF5F57" }} />
                <span className="ln-code-dot" style={{ background: "#FFBD2E" }} />
                <span className="ln-code-dot" style={{ background: "#28CA41" }} />
                <span className="ln-code-filename">HeroSection.tsx</span>
              </div>
              <div className="ln-code-body">
{`<span class="c-purple">import</span> <span class="c-white">React</span> <span class="c-purple">from</span> <span class="c-green">'react'</span>

<span class="c-purple">interface</span> <span class="c-cyan">HeroProps</span> <span class="c-white">{</span>
  <span class="c-cyan">headline</span><span class="c-white">:</span> <span class="c-purple">string</span>
  <span class="c-cyan">subtext</span><span class="c-white">:</span> <span class="c-purple">string</span>
  <span class="c-cyan">cta</span><span class="c-white">:</span> <span class="c-white">{ label:</span> <span class="c-purple">string</span><span class="c-white">; href:</span> <span class="c-purple">string</span> <span class="c-white">}</span>
<span class="c-white">}</span>

<span class="c-purple">export</span> <span class="c-purple">function</span> <span class="c-cyan">HeroSection</span><span class="c-white">({</span>
  <span class="c-white">headline, subtext, cta</span>
<span class="c-white">}:</span> <span class="c-cyan">HeroProps</span><span class="c-white">) {</span>
  <span class="c-purple">return</span> <span class="c-white">(</span>
    <span class="c-gray">&lt;</span><span class="c-cyan">section</span> <span class="c-green">className</span><span class="c-gray">=</span><span class="c-green">"hero"</span><span class="c-gray">&gt;</span>
      <span class="c-gray">&lt;</span><span class="c-cyan">h1</span><span class="c-gray">&gt;</span><span class="c-white">{headline}</span><span class="c-gray">&lt;/</span><span class="c-cyan">h1</span><span class="c-gray">&gt;</span>
      <span class="c-gray">&lt;</span><span class="c-cyan">p</span><span class="c-gray">&gt;</span><span class="c-white">{subtext}</span><span class="c-gray">&lt;/</span><span class="c-cyan">p</span><span class="c-gray">&gt;</span>
      <span class="c-gray">&lt;</span><span class="c-cyan">a</span> <span class="c-green">href</span><span class="c-gray">=</span><span class="c-white">{cta.href}</span><span class="c-gray">&gt;</span>
        <span class="c-white">{cta.label}</span>
      <span class="c-gray">&lt;/</span><span class="c-cyan">a</span><span class="c-gray">&gt;</span>
    <span class="c-gray">&lt;/</span><span class="c-cyan">section</span><span class="c-gray">&gt;</span>
  <span class="c-white">)</span>
<span class="c-white">}</span>`}
              </div>
            </div>
          </div>
        </div>
        <style>{`@media (max-width: 768px) { .ln-section-inner > * { grid-column: 1 / -1; } .ln-section-inner { grid-template-columns: 1fr !important; } }`}</style>
      </section>

      {/* ── Agents ── */}
      <section className="ln-section ln-section--surface" id="agents">
        <div className="ln-section-inner">
          <div className="ln-section-label">{"// agents[]"}</div>
          <h2 className="ln-section-h2">Six specialist agents.<br />The audit layer.</h2>
          <p className="ln-section-body">
            After the self-heal loop, run any combination of domain-expert agents.
            Each returns a scored report and actionable fixes — not vague suggestions.
          </p>
          <div className="ln-agents">
            {AGENTS.map(a => (
              <div key={a.name} className="ln-agent">
                <div className="ln-agent-top">
                  <span className="ln-agent-icon">{a.icon}</span>
                  <span className={`ln-agent-plan ln-agent-plan--${a.plan}`}>{a.plan}</span>
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
      <section className="ln-section ln-section--dark" id="pricing">
        <div className="ln-section-inner">
          <div className="ln-section-label">{"// plans[]"}</div>
          <h2 className="ln-section-h2">Start free.<br />Scale when you ship.</h2>
          <p className="ln-section-body">
            Credits never expire. Run out? Buy a top-up pack — no subscription needed.
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
                  <div className="ln-plan-feature">{p.gens} builds/mo</div>
                  <div className="ln-plan-feature">{p.credits} agent credits/mo</div>
                  {p.name !== "Free" && <div className="ln-plan-feature">Top-up credit packs</div>}
                  {(p.name === "Pro" || p.name === "Agency") && <div className="ln-plan-feature">Design Fixer agent</div>}
                  {p.name === "Agency" && <div className="ln-plan-feature">White-label export</div>}
                  {p.name === "Agency" && <div className="ln-plan-feature">5 team seats + SLA</div>}
                </div>
                <Link href={p.href} className="ln-plan-cta">{p.cta}</Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="ln-final">
        <div className="ln-final-blob" />
        <div className="ln-final-inner">
          <h2 className="ln-final-h2">
            The loop is ready.<br />
            <span style={{ color: "rgba(61,240,255,0.85)" }}>Start building.</span>
          </h2>
          <p className="ln-final-sub">
            Free to start. No credit card. Your first 3 builds are on us.
            Wix, Squarespace, Lovable — none of them give you clean TypeScript.
          </p>
          <Link href="/build" className="ln-cta-primary" style={{ margin: "0 auto" }}>
            ⚡ Launch the builder
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="ln-footer">
        <div className="ln-footer-copy">© 2026 Dominat8.io · Builder by <a href="https://dominat8.com" target="_blank" rel="noopener noreferrer" style={{ color: "rgba(255,255,255,0.45)", textDecoration: "none" }}>Dominat8.com</a></div>
        <div className="ln-footer-links">
          <Link href="/pricing" className="ln-footer-link">Pricing</Link>
          <Link href="/dashboard" className="ln-footer-link">Dashboard</Link>
          <Link href="/privacy" className="ln-footer-link">Privacy</Link>
          <Link href="/terms" className="ln-footer-link">Terms</Link>
        </div>
      </footer>
    </>
  );
}
