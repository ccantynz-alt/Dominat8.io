"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";

/* ═══════════════════════════════════════════════════════════════════════════════
   DATA
   ═══════════════════════════════════════════════════════════════════════════════ */

const LOOP_STEPS = [
  { id: "prompt", icon: "⌨", label: "Prompt", desc: "Describe your business in a single sentence" },
  { id: "reason", icon: "🧠", label: "Reason", desc: "Agentic loop plans architecture & content" },
  { id: "build",  icon: "⚡", label: "Build",  desc: "Complete site generated in under 60 seconds" },
  { id: "heal",   icon: "🔄", label: "Self-Heal", desc: "Loop detects bugs and fixes automatically" },
  { id: "audit",  icon: "🔍", label: "Audit",  desc: "Six specialist agents sweep for issues" },
  { id: "ship",   icon: "🚀", label: "Ship",   desc: "Deploy-ready React + TypeScript exported" },
];

const AGENTS = [
  { icon: "🔍", name: "SEO Sweep",        desc: "Title, meta, OG, structured data — full technical audit.", cost: "1 cr", plan: "free" },
  { icon: "📱", name: "Responsive Audit", desc: "Tests at 320 px, 768 px, 1 440 px. Fixes layout breaks.", cost: "1 cr", plan: "free" },
  { icon: "🔗", name: "Link Scanner",     desc: "Validates every CTA, anchor and button. No dead links.",    cost: "1 cr", plan: "starter" },
  { icon: "♿", name: "Accessibility",    desc: "WCAG 2.1 AA. Alt text, ARIA, contrast, keyboard nav.",      cost: "2 cr", plan: "starter" },
  { icon: "⚡", name: "Performance",      desc: "Core Web Vitals — LCP, CLS, FID risks found & explained.", cost: "2 cr", plan: "starter" },
  { icon: "🎨", name: "Design Fixer",     desc: "AI rewrites HTML to fix contrast, layout, typography.",     cost: "5 cr", plan: "pro" },
];

const PLANS = [
  { name: "Free",    price: "$0",   period: "",    credits: 5,   gens: 3,   highlight: false, cta: "Start free",  href: "/build" },
  { name: "Starter", price: "$9",   period: "/mo", credits: 25,  gens: 20,  highlight: false, cta: "Get Starter", href: "/pricing" },
  { name: "Pro",     price: "$29",  period: "/mo", credits: 150, gens: 100, highlight: true,  cta: "Go Pro",      href: "/pricing" },
  { name: "Agency",  price: "$99",  period: "/mo", credits: 600, gens: 500, highlight: false, cta: "Get Agency",  href: "/pricing" },
];

/* ═══════════════════════════════════════════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════════════════════════════════════════ */

export default function LandingPage() {
  const [scrolled, setScrolled]         = useState(false);
  const [activeStep, setActiveStep]     = useState(0);
  const [scrollPct, setScrollPct]       = useState(0);
  const heroRef = useRef<HTMLElement>(null);

  /* ── Mouse glow (updates CSS custom properties on :root) ── */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      document.documentElement.style.setProperty("--mx", e.clientX + "px");
      document.documentElement.style.setProperty("--my", e.clientY + "px");
    };
    window.addEventListener("mousemove", handler, { passive: true });
    return () => window.removeEventListener("mousemove", handler);
  }, []);

  /* ── Scroll: nav glass, progress bar ── */
  useEffect(() => {
    const handler = () => {
      setScrolled(window.scrollY > 20);
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setScrollPct(max > 0 ? Math.min(window.scrollY / max, 1) : 0);
    };
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  /* ── Loop step cycling ── */
  useEffect(() => {
    const t = setInterval(() => setActiveStep(s => (s + 1) % LOOP_STEPS.length), 2000);
    return () => clearInterval(t);
  }, []);

  /* ── Scroll-reveal observer ── */
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => entries.forEach(entry => {
        if (entry.isIntersecting) {
          (entry.target as HTMLElement).style.opacity = "1";
          (entry.target as HTMLElement).style.transform = "translateY(0)";
          observer.unobserve(entry.target);
        }
      }),
      { threshold: 0.08, rootMargin: "0px 0px -60px 0px" },
    );
    const els = document.querySelectorAll(".rv");
    els.forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  /* ── 3-D tilt handler ── */
  const tilt = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    e.currentTarget.style.transform =
      `perspective(800px) rotateX(${-y * 8}deg) rotateY(${x * 8}deg) translateZ(8px)`;
  }, []);
  const tiltReset = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    e.currentTarget.style.transform = "";
  }, []);

  /* ═════════════════════════════════════════════════════════════════════════════
     RENDER
     ═════════════════════════════════════════════════════════════════════════════ */
  return (
    <>
      {/* ── STYLES ─────────────────────────────────────────────────────────── */}
      <style>{`
        /* ── Fonts ── */
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600&display=swap');

        /* ── Reset ── */
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body {
          background: #06060a;
          color: #d0d0e0;
          font-family: 'Outfit', system-ui, -apple-system, sans-serif;
          -webkit-font-smoothing: antialiased;
          overflow-x: hidden;
        }

        /* ── Noise grain overlay ── */
        .d8-noise {
          position: fixed; inset: 0; z-index: 9999; pointer-events: none;
          opacity: 0.028; mix-blend-mode: overlay;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
        }

        /* ── Mouse glow ── */
        .d8-glow {
          position: fixed;
          left: var(--mx, 50vw); top: var(--my, 50vh);
          width: 900px; height: 900px; border-radius: 50%;
          background: radial-gradient(circle, rgba(124,90,255,0.07), rgba(80,70,228,0.03) 40%, transparent 70%);
          pointer-events: none; transform: translate(-50%,-50%);
          z-index: 0; transition: left 80ms linear, top 80ms linear;
        }

        /* ── Scroll progress ── */
        .d8-progress {
          position: fixed; top: 0; left: 0; right: 0; height: 2px; z-index: 300;
          background: linear-gradient(90deg, #7C5AFF, #5046E4, #34D399);
          transform-origin: left; will-change: transform;
        }

        /* ── Scroll-reveal base ── */
        .rv {
          opacity: 0;
          transform: translateY(36px);
          transition: opacity 0.9s cubic-bezier(0.16,1,0.3,1), transform 0.9s cubic-bezier(0.16,1,0.3,1);
        }
        .rv-d1 { transition-delay: 0.08s; }
        .rv-d2 { transition-delay: 0.16s; }
        .rv-d3 { transition-delay: 0.24s; }
        .rv-d4 { transition-delay: 0.32s; }
        .rv-d5 { transition-delay: 0.40s; }

        /* ══════════════════════════════════════════════════════════════════════
           GLASS SYSTEM
           ══════════════════════════════════════════════════════════════════════ */
        .glass {
          background: linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.015));
          backdrop-filter: blur(24px) saturate(1.6);
          -webkit-backdrop-filter: blur(24px) saturate(1.6);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 24px;
          box-shadow:
            inset 0 1px 0 0 rgba(255,255,255,0.06),
            0 20px 50px -12px rgba(0,0,0,0.5),
            0 0 0 0.5px rgba(255,255,255,0.03);
          transition: all 0.4s cubic-bezier(0.16,1,0.3,1);
        }
        .glass:hover {
          border-color: rgba(124,90,255,0.22);
          box-shadow:
            inset 0 1px 0 0 rgba(255,255,255,0.09),
            0 0 0 1px rgba(124,90,255,0.06),
            0 0 40px -4px rgba(124,90,255,0.10),
            0 24px 60px -12px rgba(0,0,0,0.6);
        }
        .glass-sm {
          background: linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01));
          backdrop-filter: blur(16px) saturate(1.4);
          -webkit-backdrop-filter: blur(16px) saturate(1.4);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 16px;
          box-shadow: inset 0 1px 0 0 rgba(255,255,255,0.05), 0 8px 32px -8px rgba(0,0,0,0.4);
          transition: all 0.4s cubic-bezier(0.16,1,0.3,1);
        }
        .glass-sm:hover {
          border-color: rgba(124,90,255,0.20);
          box-shadow:
            inset 0 1px 0 0 rgba(255,255,255,0.07),
            0 0 30px -4px rgba(124,90,255,0.08),
            0 12px 40px -8px rgba(0,0,0,0.5);
          transform: translateY(-3px);
        }

        /* ══════════════════════════════════════════════════════════════════════
           NAV
           ══════════════════════════════════════════════════════════════════════ */
        .d8-nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 200;
          height: 60px; display: flex; align-items: center;
          justify-content: space-between;
          padding: 0 clamp(20px,5vw,48px);
          transition: all 0.3s cubic-bezier(0.16,1,0.3,1);
        }
        .d8-nav--glass {
          background: rgba(6,6,10,0.65);
          backdrop-filter: blur(32px) saturate(1.8);
          -webkit-backdrop-filter: blur(32px) saturate(1.8);
          border-bottom: 1px solid rgba(255,255,255,0.06);
          box-shadow: 0 4px 30px rgba(0,0,0,0.3);
        }
        .d8-logo { font-size: 21px; font-weight: 900; color: #fff; text-decoration: none; letter-spacing: -0.04em; }
        .d8-logo b {
          background: linear-gradient(135deg, #9B7FFF, #7C5AFF);
          -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent;
        }
        .d8-nav-links { display: flex; gap: 4px; align-items: center; }
        .d8-nav-a { padding: 7px 14px; border-radius: 10px; color: rgba(255,255,255,0.50); font-size: 14px; font-weight: 500; text-decoration: none; transition: all 0.15s; }
        .d8-nav-a:hover { color: #fff; background: rgba(255,255,255,0.04); }
        .d8-nav-ext { padding: 7px 14px; border-radius: 10px; color: rgba(255,255,255,0.30); font-size: 13px; font-weight: 500; text-decoration: none; transition: color 0.15s; }
        .d8-nav-ext:hover { color: rgba(255,255,255,0.65); }
        .d8-nav-cta {
          padding: 8px 20px; border-radius: 12px;
          background: linear-gradient(135deg, rgba(124,90,255,0.18), rgba(124,90,255,0.08));
          border: 1px solid rgba(124,90,255,0.30);
          color: rgba(155,127,255,0.95); font-size: 14px; font-weight: 600;
          text-decoration: none; transition: all 0.2s;
          box-shadow: 0 0 20px -4px rgba(124,90,255,0.15);
        }
        .d8-nav-cta:hover {
          background: linear-gradient(135deg, rgba(124,90,255,0.28), rgba(124,90,255,0.14));
          border-color: rgba(124,90,255,0.50);
          box-shadow: 0 0 30px -2px rgba(124,90,255,0.25);
        }
        @media (max-width: 680px) { .d8-nav-ext, .d8-nav-a { display: none; } }

        /* ══════════════════════════════════════════════════════════════════════
           HERO
           ══════════════════════════════════════════════════════════════════════ */
        .d8-hero {
          min-height: 100dvh; position: relative; overflow: hidden;
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          text-align: center; padding: clamp(100px,18vh,160px) clamp(20px,5vw,64px) 80px;
        }

        /* Mesh gradient background */
        .d8-mesh {
          position: absolute; inset: 0; z-index: -2;
          background:
            radial-gradient(ellipse 80% 50% at 15% 80%, rgba(124,90,255,0.14), transparent),
            radial-gradient(ellipse 60% 70% at 85% 15%, rgba(80,70,228,0.11), transparent),
            radial-gradient(ellipse 70% 60% at 55% 55%, rgba(52,211,153,0.05), transparent),
            radial-gradient(ellipse 50% 40% at 80% 75%, rgba(109,187,255,0.06), transparent);
          animation: meshShift 25s ease-in-out infinite alternate;
        }
        @keyframes meshShift {
          0%   { filter: hue-rotate(0deg); }
          50%  { filter: hue-rotate(8deg); }
          100% { filter: hue-rotate(-5deg); }
        }

        /* Floating orbs */
        .d8-orb { position: absolute; border-radius: 50%; pointer-events: none; }
        .d8-orb-1 {
          width: 700px; height: 700px; top: -20%; left: -15%;
          background: radial-gradient(circle, rgba(124,90,255,0.18), transparent 65%);
          filter: blur(80px); animation: orbFloat1 30s ease-in-out infinite alternate;
        }
        .d8-orb-2 {
          width: 500px; height: 500px; bottom: -10%; right: -10%;
          background: radial-gradient(circle, rgba(80,70,228,0.15), transparent 65%);
          filter: blur(70px); animation: orbFloat2 24s ease-in-out infinite alternate;
        }
        .d8-orb-3 {
          width: 400px; height: 400px; top: 30%; right: 20%;
          background: radial-gradient(circle, rgba(52,211,153,0.08), transparent 65%);
          filter: blur(90px); animation: orbFloat3 35s ease-in-out infinite alternate;
        }
        @keyframes orbFloat1 { to { transform: translate(60px,40px) scale(1.08); } }
        @keyframes orbFloat2 { to { transform: translate(-50px,-60px) scale(0.92); } }
        @keyframes orbFloat3 { to { transform: translate(-30px,50px) scale(1.1); } }

        /* Badge */
        .d8-badge {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 6px 16px; border-radius: 999px; margin-bottom: 32px;
          background: rgba(124,90,255,0.06);
          border: 1px solid rgba(124,90,255,0.18);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
        }
        .d8-badge-dot {
          width: 7px; height: 7px; border-radius: 50%;
          background: #7C5AFF;
          box-shadow: 0 0 12px rgba(124,90,255,0.6);
          animation: dotPulse 2s ease-in-out infinite;
        }
        @keyframes dotPulse { 0%,100%{opacity:1;box-shadow:0 0 12px rgba(124,90,255,0.6)} 50%{opacity:0.4;box-shadow:0 0 4px rgba(124,90,255,0.2)} }
        .d8-badge-text { font-size: 12px; font-weight: 600; letter-spacing: 0.05em; color: rgba(155,127,255,0.80); }

        /* Headline */
        .d8-h1 {
          font-size: clamp(48px, 8vw, 96px); font-weight: 900;
          letter-spacing: -0.055em; line-height: 0.90; margin-bottom: 28px;
        }
        .d8-h1-line1 {
          display: block;
          background: linear-gradient(135deg, #fff 20%, rgba(200,200,255,0.90) 60%, rgba(155,127,255,0.85));
          -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent;
        }
        .d8-h1-line2 {
          display: block;
          background: linear-gradient(135deg, rgba(124,90,255,0.95), rgba(80,70,228,0.80), rgba(52,211,153,0.70));
          -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent;
          background-size: 200% 100%; animation: gradientFlow 6s ease-in-out infinite alternate;
        }
        @keyframes gradientFlow { 0%{background-position:0% 50%} 100%{background-position:100% 50%} }

        /* Subheading */
        .d8-sub {
          font-size: clamp(16px,1.9vw,20px); color: rgba(255,255,255,0.44);
          line-height: 1.75; max-width: 580px; margin: 0 auto 44px; font-weight: 400;
        }
        .d8-sub strong { color: rgba(255,255,255,0.80); font-weight: 600; }

        /* CTA row */
        .d8-ctas { display: flex; gap: 14px; justify-content: center; flex-wrap: wrap; margin-bottom: 64px; }
        .d8-cta-main {
          padding: 15px 36px; border-radius: 16px;
          background: linear-gradient(135deg, #7C5AFF, #5C3FD6);
          border: 1px solid rgba(155,127,255,0.35);
          color: #fff; font-size: 16px; font-weight: 700;
          text-decoration: none; display: inline-flex; align-items: center; gap: 10px;
          box-shadow: 0 0 40px -8px rgba(124,90,255,0.40), 0 8px 32px -4px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.15);
          transition: all 0.2s cubic-bezier(0.16,1,0.3,1);
          position: relative; overflow: hidden;
        }
        .d8-cta-main::before {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.15), transparent 50%);
          opacity: 0; transition: opacity 0.3s;
        }
        .d8-cta-main:hover {
          transform: translateY(-2px);
          box-shadow: 0 0 60px -6px rgba(124,90,255,0.50), 0 12px 40px -4px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.20);
        }
        .d8-cta-main:hover::before { opacity: 1; }
        .d8-cta-ghost {
          padding: 15px 32px; border-radius: 16px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.10);
          color: rgba(255,255,255,0.65); font-size: 16px; font-weight: 600;
          text-decoration: none; transition: all 0.2s;
          backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
        }
        .d8-cta-ghost:hover { background: rgba(255,255,255,0.08); color: #fff; border-color: rgba(255,255,255,0.18); }

        /* Stat strip */
        .d8-stats {
          display: flex; gap: 0; flex-wrap: wrap; justify-content: center;
          background: linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01));
          backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 20px; overflow: hidden;
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.04);
        }
        .d8-stat {
          display: flex; flex-direction: column; align-items: center;
          padding: 18px 36px; position: relative;
        }
        .d8-stat + .d8-stat::before {
          content: ''; position: absolute; left: 0; top: 20%; height: 60%;
          width: 1px; background: rgba(255,255,255,0.06);
        }
        .d8-stat-num {
          font-size: 28px; font-weight: 900; letter-spacing: -0.04em;
          font-family: 'JetBrains Mono', monospace;
          background: linear-gradient(180deg, #fff, rgba(200,200,230,0.80));
          -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent;
        }
        .d8-stat-lbl { font-size: 11px; font-weight: 600; color: rgba(255,255,255,0.30); letter-spacing: 0.06em; text-transform: uppercase; margin-top: 3px; }

        /* ══════════════════════════════════════════════════════════════════════
           SECTIONS — SHARED
           ══════════════════════════════════════════════════════════════════════ */
        .d8-section { padding: clamp(80px,12vw,140px) clamp(20px,5vw,64px); position: relative; }
        .d8-section-alt { background: rgba(255,255,255,0.015); }
        .d8-inner { max-width: 1120px; margin: 0 auto; }
        .d8-label {
          font-size: 11px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase;
          color: rgba(124,90,255,0.60); font-family: 'JetBrains Mono', monospace; margin-bottom: 14px;
        }
        .d8-h2 {
          font-size: clamp(30px,4.5vw,52px); font-weight: 800;
          letter-spacing: -0.045em; line-height: 1.08; margin-bottom: 18px;
          background: linear-gradient(180deg, #fff, rgba(200,200,230,0.85));
          -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent;
        }
        .d8-body { font-size: 16px; color: rgba(255,255,255,0.42); line-height: 1.78; max-width: 560px; margin-bottom: 56px; }

        /* ══════════════════════════════════════════════════════════════════════
           LOOP
           ══════════════════════════════════════════════════════════════════════ */
        .d8-loop { display: grid; grid-template-columns: repeat(6,1fr); gap: 12px; }
        @media (max-width:900px) { .d8-loop { grid-template-columns: repeat(3,1fr); } }
        @media (max-width:520px) { .d8-loop { grid-template-columns: repeat(2,1fr); } }
        .d8-loop-card {
          padding: 24px 16px 22px; border-radius: 20px; text-align: center;
          background: linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01));
          border: 1px solid rgba(255,255,255,0.06);
          backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.04);
          transition: all 0.4s cubic-bezier(0.16,1,0.3,1);
          cursor: default;
        }
        .d8-loop-card.active {
          border-color: rgba(124,90,255,0.40);
          background: linear-gradient(180deg, rgba(124,90,255,0.10), rgba(124,90,255,0.03));
          box-shadow:
            inset 0 1px 0 rgba(124,90,255,0.15),
            0 0 40px -8px rgba(124,90,255,0.15),
            0 8px 32px -8px rgba(0,0,0,0.3);
        }
        .d8-loop-icon { font-size: 28px; margin-bottom: 12px; display: block; }
        .d8-loop-label {
          font-size: 13px; font-weight: 700; letter-spacing: -0.01em; margin-bottom: 6px;
          color: rgba(255,255,255,0.80); transition: color 0.3s;
        }
        .d8-loop-card.active .d8-loop-label { color: rgba(155,127,255,0.95); }
        .d8-loop-desc { font-size: 11px; color: rgba(255,255,255,0.35); line-height: 1.55; }

        /* Self-heal box */
        .d8-heal {
          margin-top: 56px; border-radius: 28px; padding: 44px 48px;
          display: grid; grid-template-columns: 1fr 1fr; gap: 56px; align-items: center;
          background: linear-gradient(135deg, rgba(124,90,255,0.06), rgba(80,70,228,0.03));
          border: 1px solid rgba(124,90,255,0.12);
          backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.04), 0 20px 60px -12px rgba(0,0,0,0.3);
        }
        @media (max-width:720px) { .d8-heal { grid-template-columns: 1fr; gap: 28px; padding: 32px; } }
        .d8-heal-title { font-size: clamp(22px,3vw,34px); font-weight: 800; letter-spacing: -0.04em; margin-bottom: 16px; color: #fff; }
        .d8-heal-body { font-size: 15px; color: rgba(255,255,255,0.45); line-height: 1.75; }
        .d8-heal-steps { display: flex; flex-direction: column; gap: 16px; }
        .d8-heal-step { display: flex; align-items: flex-start; gap: 16px; }
        .d8-heal-num {
          width: 32px; height: 32px; border-radius: 10px; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          background: linear-gradient(135deg, rgba(124,90,255,0.15), rgba(124,90,255,0.06));
          border: 1px solid rgba(124,90,255,0.25);
          color: rgba(155,127,255,0.90); font-size: 12px; font-weight: 800;
          font-family: 'JetBrains Mono', monospace;
        }
        .d8-heal-text { font-size: 14px; color: rgba(255,255,255,0.55); line-height: 1.6; padding-top: 5px; }
        .d8-heal-text strong { color: rgba(255,255,255,0.90); font-weight: 600; }

        /* ══════════════════════════════════════════════════════════════════════
           CODE EXPORT
           ══════════════════════════════════════════════════════════════════════ */
        .d8-code-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 56px; align-items: center; }
        @media (max-width:768px) { .d8-code-grid { grid-template-columns: 1fr; } }
        .d8-terminal {
          border-radius: 20px; overflow: hidden;
          background: rgba(0,0,0,0.50);
          border: 1px solid rgba(255,255,255,0.08);
          backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
          box-shadow:
            inset 0 1px 0 rgba(255,255,255,0.04),
            0 20px 60px -12px rgba(0,0,0,0.5);
        }
        .d8-terminal-bar {
          display: flex; align-items: center; gap: 8px;
          padding: 14px 18px; border-bottom: 1px solid rgba(255,255,255,0.06);
          background: rgba(255,255,255,0.025);
        }
        .d8-terminal-dot { width: 11px; height: 11px; border-radius: 50%; }
        .d8-terminal-file {
          font-size: 12px; font-weight: 600; color: rgba(255,255,255,0.30);
          font-family: 'JetBrains Mono', monospace; margin-left: 10px;
        }
        .d8-terminal-body {
          padding: 22px 24px; font-family: 'JetBrains Mono', monospace;
          font-size: 12.5px; line-height: 1.95; color: rgba(255,255,255,0.65);
          white-space: pre; overflow-x: auto;
        }
        .c-kw  { color: rgba(124,90,255,0.90); }
        .c-typ { color: rgba(109,187,255,0.85); }
        .c-str { color: rgba(52,211,153,0.80); }
        .c-pn  { color: rgba(255,255,255,0.30); }
        .c-id  { color: rgba(255,255,255,0.85); }
        .d8-check-list { display: flex; flex-direction: column; gap: 12px; }
        .d8-check {
          display: flex; align-items: center; gap: 12px;
          font-size: 14px; color: rgba(255,255,255,0.55);
        }
        .d8-check-icon {
          width: 22px; height: 22px; border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          background: rgba(52,211,153,0.10); border: 1px solid rgba(52,211,153,0.20);
          color: rgba(52,211,153,0.85); font-size: 10px; font-weight: 800; flex-shrink: 0;
        }

        /* ══════════════════════════════════════════════════════════════════════
           AGENTS
           ══════════════════════════════════════════════════════════════════════ */
        .d8-agents { display: grid; grid-template-columns: repeat(3,1fr); gap: 14px; }
        @media (max-width:900px) { .d8-agents { grid-template-columns: repeat(2,1fr); } }
        @media (max-width:540px) { .d8-agents { grid-template-columns: 1fr; } }
        .d8-agent {
          padding: 24px; cursor: default;
          transition: all 0.4s cubic-bezier(0.16,1,0.3,1);
        }
        .d8-agent-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
        .d8-agent-icon { font-size: 22px; }
        .d8-agent-plan {
          font-size: 9px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase;
          padding: 3px 8px; border-radius: 6px;
        }
        .plan-free    { background: rgba(255,255,255,0.05); color: rgba(255,255,255,0.35); }
        .plan-starter { background: rgba(124,90,255,0.08); color: rgba(155,127,255,0.70); }
        .plan-pro     { background: rgba(80,70,228,0.12); color: rgba(124,90,255,0.85); }
        .d8-agent-name { font-size: 15px; font-weight: 700; margin-bottom: 6px; letter-spacing: -0.02em; color: rgba(255,255,255,0.90); }
        .d8-agent-desc { font-size: 12.5px; color: rgba(255,255,255,0.38); line-height: 1.6; margin-bottom: 10px; }
        .d8-agent-cost { font-size: 10px; font-weight: 600; color: rgba(255,255,255,0.22); font-family: 'JetBrains Mono', monospace; }

        /* ══════════════════════════════════════════════════════════════════════
           PRICING
           ══════════════════════════════════════════════════════════════════════ */
        .d8-pricing { display: grid; grid-template-columns: repeat(4,1fr); gap: 16px; }
        @media (max-width:900px) { .d8-pricing { grid-template-columns: repeat(2,1fr); } }
        @media (max-width:520px) { .d8-pricing { grid-template-columns: 1fr; } }
        .d8-plan {
          padding: 30px 24px; display: flex; flex-direction: column; gap: 16px;
          cursor: default;
        }
        .d8-plan--pop {
          background: linear-gradient(180deg, rgba(124,90,255,0.10), rgba(124,90,255,0.03)) !important;
          border-color: rgba(124,90,255,0.28) !important;
          box-shadow:
            inset 0 1px 0 rgba(124,90,255,0.12),
            0 0 50px -8px rgba(124,90,255,0.15),
            0 24px 60px -12px rgba(0,0,0,0.4) !important;
        }
        .d8-plan-name {
          font-size: 11px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase;
          color: rgba(255,255,255,0.40); font-family: 'JetBrains Mono', monospace;
        }
        .d8-plan--pop .d8-plan-name { color: rgba(155,127,255,0.80); }
        .d8-plan-price { display: flex; align-items: baseline; gap: 3px; }
        .d8-plan-amt { font-size: 38px; font-weight: 900; letter-spacing: -0.04em; color: #fff; }
        .d8-plan-per { font-size: 13px; color: rgba(255,255,255,0.28); font-weight: 400; }
        .d8-plan-feats { display: flex; flex-direction: column; gap: 10px; flex: 1; }
        .d8-plan-feat {
          font-size: 13px; color: rgba(255,255,255,0.50); display: flex; align-items: center; gap: 9px;
        }
        .d8-plan-feat::before {
          content: ''; width: 16px; height: 16px; border-radius: 6px; flex-shrink: 0;
          background: rgba(52,211,153,0.10); border: 1px solid rgba(52,211,153,0.18);
          display: flex; align-items: center; justify-content: center;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 10 10'%3E%3Cpath d='M2 5l2 2 4-4' stroke='rgba(52,211,153,0.8)' stroke-width='1.5' fill='none' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
          background-repeat: no-repeat; background-position: center;
        }
        .d8-plan-cta {
          display: block; text-align: center; padding: 12px; border-radius: 14px;
          font-size: 14px; font-weight: 700; text-decoration: none;
          transition: all 0.2s;
          background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.10);
          color: rgba(255,255,255,0.70);
        }
        .d8-plan-cta:hover { background: rgba(255,255,255,0.08); color: #fff; }
        .d8-plan--pop .d8-plan-cta {
          background: linear-gradient(135deg, #7C5AFF, #5C3FD6);
          border-color: rgba(155,127,255,0.30); color: #fff;
          box-shadow: 0 0 30px -6px rgba(124,90,255,0.35);
        }
        .d8-plan--pop .d8-plan-cta:hover {
          box-shadow: 0 0 45px -4px rgba(124,90,255,0.45);
          transform: translateY(-1px);
        }

        /* ══════════════════════════════════════════════════════════════════════
           FINAL CTA
           ══════════════════════════════════════════════════════════════════════ */
        .d8-final {
          text-align: center; position: relative; overflow: hidden;
          padding: clamp(80px,12vw,140px) clamp(20px,5vw,64px);
        }
        .d8-final-mesh {
          position: absolute; inset: 0;
          background:
            radial-gradient(ellipse 60% 60% at 50% 50%, rgba(124,90,255,0.12), transparent),
            radial-gradient(ellipse 40% 40% at 30% 70%, rgba(80,70,228,0.08), transparent);
          animation: meshShift 20s ease-in-out infinite alternate;
        }
        .d8-final-inner { position: relative; max-width: 640px; margin: 0 auto; }
        .d8-final-h2 {
          font-size: clamp(34px,5.5vw,60px); font-weight: 900; letter-spacing: -0.05em;
          margin-bottom: 18px; line-height: 1.05;
        }
        .d8-final-sub { font-size: 16px; color: rgba(255,255,255,0.42); line-height: 1.75; margin-bottom: 40px; }

        /* ══════════════════════════════════════════════════════════════════════
           FOOTER
           ══════════════════════════════════════════════════════════════════════ */
        .d8-footer {
          padding: 36px clamp(20px,5vw,64px);
          display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px;
          border-top: 1px solid rgba(255,255,255,0.05);
          background: rgba(255,255,255,0.01);
        }
        .d8-footer-copy { font-size: 13px; color: rgba(255,255,255,0.24); }
        .d8-footer-copy a { color: rgba(255,255,255,0.38); text-decoration: none; transition: color 0.15s; }
        .d8-footer-copy a:hover { color: rgba(255,255,255,0.60); }
        .d8-footer-links { display: flex; gap: 22px; }
        .d8-footer-a { font-size: 13px; color: rgba(255,255,255,0.28); text-decoration: none; transition: color 0.15s; }
        .d8-footer-a:hover { color: rgba(255,255,255,0.60); }

        /* ══════════════════════════════════════════════════════════════════════
           RESPONSIVE MOBILE
           ══════════════════════════════════════════════════════════════════════ */
        @media (max-width:520px) {
          .d8-stat { padding: 14px 20px; }
          .d8-stat-num { font-size: 22px; }
          .d8-heal { padding: 24px; }
          .d8-glow { display: none; }
        }
      `}</style>

      {/* ── Global layers ── */}
      <div className="d8-noise" />
      <div className="d8-glow" />
      <div className="d8-progress" style={{ transform: `scaleX(${scrollPct})` }} />

      {/* ══════════════════════════════════════════════════════════════════════
         NAV
         ══════════════════════════════════════════════════════════════════════ */}
      <nav className={`d8-nav${scrolled ? " d8-nav--glass" : ""}`}>
        <a href="/" className="d8-logo">Dominat<b>8</b>.io</a>
        <div className="d8-nav-links">
          <a href="https://dominat8.com" target="_blank" rel="noopener noreferrer" className="d8-nav-ext">dominat8.com</a>
          <a href="#loop" className="d8-nav-a">The Loop</a>
          <a href="#agents" className="d8-nav-a">Agents</a>
          <Link href="/pricing" className="d8-nav-a">Pricing</Link>
          <Link href="/build" className="d8-nav-cta">Launch builder</Link>
        </div>
      </nav>

      {/* ══════════════════════════════════════════════════════════════════════
         HERO
         ══════════════════════════════════════════════════════════════════════ */}
      <section className="d8-hero" ref={heroRef}>
        <div className="d8-mesh" />
        <div className="d8-orb d8-orb-1" />
        <div className="d8-orb d8-orb-2" />
        <div className="d8-orb d8-orb-3" />

        <div className="d8-badge rv">
          <span className="d8-badge-dot" />
          <span className="d8-badge-text">Fully Orchestrated Agentic Loop</span>
        </div>

        <h1 className="d8-h1 rv rv-d1">
          <span className="d8-h1-line1">Build. Fix.</span>
          <span className="d8-h1-line2">Self-Heal. Ship.</span>
        </h1>

        <p className="d8-sub rv rv-d2">
          Not a template. Not a drag-and-drop editor. An <strong>agentic reasoning loop</strong> that
          builds, detects its own bugs, fixes them, audits the result, and exports
          clean <strong>React / TypeScript</strong> you actually own.
        </p>

        <div className="d8-ctas rv rv-d3">
          <Link href="/build" className="d8-cta-main">
            Start the loop
          </Link>
          <a href="#loop" className="d8-cta-ghost">How it works</a>
        </div>

        <div className="d8-stats rv rv-d4">
          {[
            ["<60s", "First build"],
            ["6", "AI agents"],
            ["TS", "Clean export"],
            ["2", "AI models"],
          ].map(([num, lbl]) => (
            <div key={lbl} className="d8-stat">
              <span className="d8-stat-num">{num}</span>
              <span className="d8-stat-lbl">{lbl}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
         AGENTIC LOOP
         ══════════════════════════════════════════════════════════════════════ */}
      <section className="d8-section d8-section-alt" id="loop">
        <div className="d8-inner">
          <div className="d8-label rv">{"// agentic_loop.ts"}</div>
          <h2 className="d8-h2 rv rv-d1">Multi-step reasoning.<br />Not just a prompt.</h2>
          <p className="d8-body rv rv-d2">
            Every build runs through a six-stage orchestrated loop. Claude plans the architecture,
            constructs the site, then the loop detects errors and self-corrects — before
            you ever see the result.
          </p>

          <div className="d8-loop rv rv-d3">
            {LOOP_STEPS.map((step, i) => (
              <div
                key={step.id}
                className={`d8-loop-card${i === activeStep ? " active" : ""}`}
                onMouseMove={tilt}
                onMouseLeave={tiltReset}
              >
                <span className="d8-loop-icon">{step.icon}</span>
                <div className="d8-loop-label">{step.label}</div>
                <div className="d8-loop-desc">{step.desc}</div>
              </div>
            ))}
          </div>

          <div className="d8-heal rv">
            <div>
              <div className="d8-label" style={{ marginBottom: 10 }}>{"// self_heal.ts"}</div>
              <div className="d8-heal-title">
                The loop catches what<br />
                <span style={{ background: "linear-gradient(135deg, #9B7FFF, #7C5AFF)", WebkitBackgroundClip: "text", backgroundClip: "text", WebkitTextFillColor: "transparent" }}>you&apos;d never see.</span>
              </div>
              <p className="d8-heal-body">
                Most AI builders hand you broken output and call it done.
                Dominat8.io runs a second reasoning pass — automatically
                finding layout regressions, JS errors, and broken interactions,
                then fixing them before the result is rendered.
              </p>
            </div>
            <div className="d8-heal-steps">
              {[
                ["01", "Generate", "Claude builds the full site from your prompt"],
                ["02", "Inspect",  "Loop evaluates output for known failure patterns"],
                ["03", "Patch",    "Targeted fixes applied — no full regeneration"],
                ["04", "Verify",   "Pass/fail check before result is shown to you"],
              ].map(([n, title, body]) => (
                <div key={n} className="d8-heal-step">
                  <div className="d8-heal-num">{n}</div>
                  <div className="d8-heal-text"><strong>{title}</strong> — {body}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
         CODE EXPORT
         ══════════════════════════════════════════════════════════════════════ */}
      <section className="d8-section">
        <div className="d8-inner">
          <div className="d8-code-grid">
            <div>
              <div className="d8-label rv">{"// export.tsx"}</div>
              <h2 className="d8-h2 rv rv-d1">Not a black box.<br />Real code you own.</h2>
              <p className="d8-body rv rv-d2" style={{ marginBottom: 28 }}>
                Export clean, professional React + TypeScript. Componentised, typed,
                and ready for your own codebase — not locked into a proprietary format.
              </p>
              <div className="d8-check-list rv rv-d3">
                {[
                  "React 18 + TypeScript components",
                  "Typed props — no any, no implicit",
                  "Tailwind or inline CSS (your choice)",
                  "Accessible HTML structure built-in",
                  "Zero runtime vendor dependencies",
                ].map(f => (
                  <div key={f} className="d8-check">
                    <span className="d8-check-icon">&#10003;</span>
                    {f}
                  </div>
                ))}
              </div>
            </div>
            <div className="rv rv-d2">
              <div className="d8-terminal">
                <div className="d8-terminal-bar">
                  <span className="d8-terminal-dot" style={{ background: "#FF5F57" }} />
                  <span className="d8-terminal-dot" style={{ background: "#FFBD2E" }} />
                  <span className="d8-terminal-dot" style={{ background: "#28CA41" }} />
                  <span className="d8-terminal-file">HeroSection.tsx</span>
                </div>
                <div className="d8-terminal-body" dangerouslySetInnerHTML={{ __html:
`<span class="c-kw">import</span> <span class="c-id">React</span> <span class="c-kw">from</span> <span class="c-str">'react'</span>

<span class="c-kw">interface</span> <span class="c-typ">HeroProps</span> <span class="c-id">{</span>
  <span class="c-typ">headline</span><span class="c-id">:</span> <span class="c-kw">string</span>
  <span class="c-typ">subtext</span><span class="c-id">:</span> <span class="c-kw">string</span>
  <span class="c-typ">cta</span><span class="c-id">:</span> <span class="c-id">{ label:</span> <span class="c-kw">string</span><span class="c-id">; href:</span> <span class="c-kw">string</span> <span class="c-id">}</span>
<span class="c-id">}</span>

<span class="c-kw">export function</span> <span class="c-typ">HeroSection</span><span class="c-id">({</span>
  <span class="c-id">headline, subtext, cta</span>
<span class="c-id">}:</span> <span class="c-typ">HeroProps</span><span class="c-id">) {</span>
  <span class="c-kw">return</span> <span class="c-id">(</span>
    <span class="c-pn">&lt;</span><span class="c-typ">section</span> <span class="c-str">className</span><span class="c-pn">=</span><span class="c-str">"hero"</span><span class="c-pn">&gt;</span>
      <span class="c-pn">&lt;</span><span class="c-typ">h1</span><span class="c-pn">&gt;</span><span class="c-id">{headline}</span><span class="c-pn">&lt;/</span><span class="c-typ">h1</span><span class="c-pn">&gt;</span>
      <span class="c-pn">&lt;</span><span class="c-typ">p</span><span class="c-pn">&gt;</span><span class="c-id">{subtext}</span><span class="c-pn">&lt;/</span><span class="c-typ">p</span><span class="c-pn">&gt;</span>
      <span class="c-pn">&lt;</span><span class="c-typ">a</span> <span class="c-str">href</span><span class="c-pn">=</span><span class="c-id">{cta.href}</span><span class="c-pn">&gt;</span>
        <span class="c-id">{cta.label}</span>
      <span class="c-pn">&lt;/</span><span class="c-typ">a</span><span class="c-pn">&gt;</span>
    <span class="c-pn">&lt;/</span><span class="c-typ">section</span><span class="c-pn">&gt;</span>
  <span class="c-id">)</span>
<span class="c-id">}</span>` }} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
         AGENTS
         ══════════════════════════════════════════════════════════════════════ */}
      <section className="d8-section d8-section-alt" id="agents">
        <div className="d8-inner">
          <div className="d8-label rv">{"// agents[]"}</div>
          <h2 className="d8-h2 rv rv-d1">Six specialist agents.<br />The audit layer.</h2>
          <p className="d8-body rv rv-d2">
            After the self-heal loop, run any combination of domain-expert agents.
            Each returns a scored report and actionable fixes — not vague suggestions.
          </p>
          <div className="d8-agents rv rv-d3">
            {AGENTS.map(a => (
              <div
                key={a.name}
                className="d8-agent glass-sm"
                onMouseMove={tilt}
                onMouseLeave={tiltReset}
              >
                <div className="d8-agent-top">
                  <span className="d8-agent-icon">{a.icon}</span>
                  <span className={`d8-agent-plan plan-${a.plan}`}>{a.plan}</span>
                </div>
                <div className="d8-agent-name">{a.name}</div>
                <div className="d8-agent-desc">{a.desc}</div>
                <div className="d8-agent-cost">{a.cost} per run</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
         PRICING
         ══════════════════════════════════════════════════════════════════════ */}
      <section className="d8-section" id="pricing">
        <div className="d8-inner">
          <div className="d8-label rv">{"// plans[]"}</div>
          <h2 className="d8-h2 rv rv-d1">Start free.<br />Scale when you ship.</h2>
          <p className="d8-body rv rv-d2">
            Credits never expire. Run out? Buy a top-up pack — no subscription needed.
          </p>
          <div className="d8-pricing rv rv-d3">
            {PLANS.map(p => (
              <div
                key={p.name}
                className={`d8-plan glass${p.highlight ? " d8-plan--pop" : ""}`}
                onMouseMove={tilt}
                onMouseLeave={tiltReset}
              >
                <div className="d8-plan-name">{p.name}</div>
                <div className="d8-plan-price">
                  <span className="d8-plan-amt">{p.price}</span>
                  <span className="d8-plan-per">{p.period}</span>
                </div>
                <div className="d8-plan-feats">
                  <div className="d8-plan-feat">{p.gens} builds / mo</div>
                  <div className="d8-plan-feat">{p.credits} agent credits / mo</div>
                  {p.name !== "Free"    && <div className="d8-plan-feat">Top-up credit packs</div>}
                  {(p.name === "Pro" || p.name === "Agency") && <div className="d8-plan-feat">Design Fixer agent</div>}
                  {p.name === "Agency"  && <div className="d8-plan-feat">White-label export</div>}
                  {p.name === "Agency"  && <div className="d8-plan-feat">5 team seats + SLA</div>}
                </div>
                <Link href={p.href} className="d8-plan-cta">{p.cta}</Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
         FINAL CTA
         ══════════════════════════════════════════════════════════════════════ */}
      <section className="d8-final">
        <div className="d8-final-mesh" />
        <div className="d8-final-inner">
          <h2 className="d8-final-h2 rv">
            <span style={{
              background: "linear-gradient(180deg, #fff, rgba(200,200,230,0.85))",
              WebkitBackgroundClip: "text", backgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>The loop is ready.</span>
            <br />
            <span style={{
              background: "linear-gradient(135deg, #9B7FFF, #7C5AFF, #5046E4)",
              WebkitBackgroundClip: "text", backgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>Start building.</span>
          </h2>
          <p className="d8-final-sub rv rv-d1">
            Free to start. No credit card. Your first 3 builds are on us.
            Wix, Squarespace, Lovable — none of them give you clean TypeScript.
          </p>
          <div className="rv rv-d2">
            <Link href="/build" className="d8-cta-main" style={{ margin: "0 auto" }}>
              Launch the builder
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
         FOOTER
         ══════════════════════════════════════════════════════════════════════ */}
      <footer className="d8-footer">
        <div className="d8-footer-copy">
          &copy; 2026 Dominat8.io &middot; Builder by{" "}
          <a href="https://dominat8.com" target="_blank" rel="noopener noreferrer">Dominat8.com</a>
        </div>
        <div className="d8-footer-links">
          <Link href="/pricing"   className="d8-footer-a">Pricing</Link>
          <Link href="/gallery"   className="d8-footer-a">Gallery</Link>
          <Link href="/dashboard" className="d8-footer-a">Dashboard</Link>
          <Link href="/privacy"   className="d8-footer-a">Privacy</Link>
          <Link href="/terms"     className="d8-footer-a">Terms</Link>
        </div>
      </footer>
    </>
  );
}
