"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { SiteNav } from "@/components/shared/SiteNav";
import { SiteFooter } from "@/components/shared/SiteFooter";

// ── Data ──────────────────────────────────────────────────────────────────────

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

const TRUST_LOGOS = [
  "Y Combinator", "Vercel", "Stripe", "OpenAI", "Anthropic", "Figma",
  "Linear", "Arc", "Notion", "Raycast",
];

const TESTIMONIALS = [
  { name: "Sarah K.", role: "Founder, KiwiLegal", text: "I described my law firm and had a production-ready site in 40 seconds. Genuinely better than what my agency quoted $12k for.", avatar: "S" },
  { name: "Marcus T.", role: "CTO, Buildstack", text: "The self-heal loop is the real deal. Generated 50 client sites and every single one shipped clean. No manual fixes.", avatar: "M" },
  { name: "Priya R.", role: "Growth Lead", text: "We use Dominat8 for landing page experiments. 3 variants in 2 minutes. Our conversion rate is up 34% since switching.", avatar: "P" },
];

// ── Component ──────────────────────────────────────────────────────────────────

export default function LandingPage() {
  const [activeStep, setActiveStep] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => {
    const t = setInterval(() => setActiveStep(s => (s + 1) % LOOP_STEPS.length), 1800);
    return () => clearInterval(t);
  }, []);

  return (
    <>
      <style>{`
        /* ────────────────── HERO ────────────────── */
        .ln-hero { min-height: 100dvh; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: clamp(100px,18vh,160px) clamp(20px,5vw,64px) 80px; position: relative; overflow: hidden; }

        /* Aurora gradient mesh */
        .ln-aurora { position: absolute; inset: 0; pointer-events: none; overflow: hidden; }
        .ln-aurora::before { content: ''; position: absolute; width: 160%; height: 160%; top: -30%; left: -30%; background: conic-gradient(from 180deg at 50% 50%, rgba(61,240,255,0.08) 0deg, rgba(139,92,246,0.06) 90deg, rgba(56,248,166,0.04) 180deg, rgba(61,240,255,0.08) 270deg, transparent 360deg); animation: auroraSpin 40s linear infinite; }
        .ln-aurora::after { content: ''; position: absolute; width: 140%; height: 140%; top: -20%; left: -20%; background: conic-gradient(from 0deg at 50% 50%, transparent 0deg, rgba(139,92,246,0.05) 120deg, rgba(61,240,255,0.06) 240deg, transparent 360deg); animation: auroraSpin 60s linear infinite reverse; }
        @keyframes auroraSpin { to { transform: rotate(360deg); } }

        /* Radial blobs */
        .ln-blob { position: absolute; border-radius: 50%; filter: blur(100px); pointer-events: none; }
        .ln-blob-1 { width: 900px; height: 600px; background: radial-gradient(ellipse, rgba(61,240,255,0.12), transparent 70%); top: -200px; left: -200px; animation: blobDrift1 28s ease-in-out infinite alternate; }
        .ln-blob-2 { width: 700px; height: 700px; background: radial-gradient(ellipse, rgba(139,92,246,0.10), transparent 70%); bottom: -150px; right: -200px; animation: blobDrift2 32s ease-in-out infinite alternate; }
        .ln-blob-3 { width: 500px; height: 400px; background: radial-gradient(ellipse, rgba(56,248,166,0.06), transparent 70%); top: 40%; left: 50%; transform: translateX(-50%); animation: blobDrift3 24s ease-in-out infinite alternate; }
        @keyframes blobDrift1 { to { transform: translate(60px, 40px); } }
        @keyframes blobDrift2 { to { transform: translate(-50px, -60px); } }
        @keyframes blobDrift3 { to { transform: translate(-50%, 30px) scale(1.1); } }

        /* Grid overlay */
        .ln-grid { position: absolute; inset: 0; pointer-events: none; background-image: linear-gradient(rgba(255,255,255,0.018) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.018) 1px, transparent 1px); background-size: 80px 80px; mask-image: radial-gradient(ellipse 70% 50% at 50% 40%, black 20%, transparent 70%); -webkit-mask-image: radial-gradient(ellipse 70% 50% at 50% 40%, black 20%, transparent 70%); }

        /* Noise texture */
        .ln-noise { position: absolute; inset: 0; pointer-events: none; opacity: 0.025; background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E"); background-size: 200px; }

        /* Badge */
        .ln-badge { display: inline-flex; align-items: center; gap: 8px; padding: 6px 16px; border-radius: 999px; border: 1px solid rgba(61,240,255,0.20); background: rgba(61,240,255,0.05); color: rgba(61,240,255,0.85); font-size: 12px; font-weight: 600; letter-spacing: 0.04em; margin-bottom: 32px; backdrop-filter: blur(12px); }
        .ln-badge-dot { width: 6px; height: 6px; border-radius: 50%; background: #3DF0FF; box-shadow: 0 0 8px rgba(61,240,255,0.60); animation: dotPulse 2s ease-in-out infinite; }
        @keyframes dotPulse { 0%,100% { opacity: 1; box-shadow: 0 0 8px rgba(61,240,255,0.60); } 50% { opacity: 0.4; box-shadow: 0 0 2px rgba(61,240,255,0.20); } }

        /* H1 */
        .ln-h1 { font-size: clamp(44px, 8vw, 96px); font-weight: 900; letter-spacing: -0.055em; line-height: 0.90; margin-bottom: 28px; position: relative; }
        .ln-h1-line1 { display: block; background: linear-gradient(135deg, #fff 20%, rgba(61,240,255,0.90) 100%); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; }
        .ln-h1-line2 { display: block; background: linear-gradient(135deg, rgba(139,92,246,0.95) 0%, rgba(61,240,255,0.85) 50%, rgba(56,248,166,0.80) 100%); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; }

        /* Subtitle */
        .ln-sub { font-size: clamp(16px, 1.8vw, 19px); color: rgba(255,255,255,0.45); line-height: 1.75; max-width: 580px; margin: 0 auto 44px; font-weight: 400; }
        .ln-sub strong { color: rgba(255,255,255,0.78); font-weight: 600; }

        /* CTAs */
        .ln-cta-row { display: flex; gap: 14px; justify-content: center; flex-wrap: wrap; margin-bottom: 64px; }
        .ln-cta-primary { position: relative; padding: 15px 36px; border-radius: 14px; background: linear-gradient(135deg, rgba(61,240,255,0.18), rgba(139,92,246,0.12)); border: 1px solid rgba(61,240,255,0.40); color: #fff; font-size: 16px; font-weight: 700; text-decoration: none; transition: all 200ms; display: inline-flex; align-items: center; gap: 8px; letter-spacing: -0.01em; }
        .ln-cta-primary::before { content: ''; position: absolute; inset: -1px; border-radius: 15px; background: linear-gradient(135deg, rgba(61,240,255,0.25), rgba(139,92,246,0.18)); opacity: 0; transition: opacity 200ms; z-index: -1; }
        .ln-cta-primary:hover { transform: translateY(-2px); box-shadow: 0 0 48px rgba(61,240,255,0.16), 0 8px 32px rgba(0,0,0,0.30); border-color: rgba(61,240,255,0.60); }
        .ln-cta-primary:hover::before { opacity: 1; }
        .ln-cta-secondary { padding: 15px 32px; border-radius: 14px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.10); color: rgba(255,255,255,0.65); font-size: 16px; font-weight: 600; text-decoration: none; transition: all 180ms; }
        .ln-cta-secondary:hover { background: rgba(255,255,255,0.08); border-color: rgba(255,255,255,0.18); color: #fff; }

        /* Stats strip */
        .ln-stats { display: flex; gap: 0; justify-content: center; border: 1px solid rgba(255,255,255,0.06); border-radius: 16px; padding: 0; overflow: hidden; backdrop-filter: blur(12px); background: rgba(255,255,255,0.02); }
        .ln-stat { display: flex; flex-direction: column; align-items: center; padding: 18px 36px; border-right: 1px solid rgba(255,255,255,0.06); }
        .ln-stat:last-child { border-right: none; }
        .ln-stat-num { font-size: 28px; font-weight: 900; letter-spacing: -0.04em; background: linear-gradient(135deg, #3DF0FF, #8B5CF6); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; font-family: 'JetBrains Mono', monospace; }
        .ln-stat-label { font-size: 11px; font-weight: 600; color: rgba(255,255,255,0.30); letter-spacing: 0.08em; text-transform: uppercase; margin-top: 3px; }
        @media (max-width: 640px) { .ln-stat { padding: 14px 20px; } .ln-stat-num { font-size: 22px; } }

        /* ────────────────── TRUST STRIP ────────────────── */
        .ln-trust { padding: 48px 0; overflow: hidden; position: relative; }
        .ln-trust-label { text-align: center; font-size: 11px; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; color: rgba(255,255,255,0.20); margin-bottom: 24px; }
        .ln-trust-track { display: flex; gap: 48px; animation: marquee 30s linear infinite; width: max-content; }
        .ln-trust-item { font-size: 15px; font-weight: 600; color: rgba(255,255,255,0.12); white-space: nowrap; letter-spacing: -0.02em; }
        @keyframes marquee { to { transform: translateX(-50%); } }
        .ln-trust::before, .ln-trust::after { content: ''; position: absolute; top: 0; bottom: 0; width: 120px; z-index: 2; pointer-events: none; }
        .ln-trust::before { left: 0; background: linear-gradient(90deg, #060810, transparent); }
        .ln-trust::after { right: 0; background: linear-gradient(270deg, #060810, transparent); }

        /* ────────────────── SECTIONS ────────────────── */
        .ln-section { padding: clamp(72px, 10vw, 128px) clamp(20px, 5vw, 64px); position: relative; }
        .ln-section--dark { background: #060810; }
        .ln-section--surface { background: rgba(255,255,255,0.015); border-top: 1px solid rgba(255,255,255,0.04); border-bottom: 1px solid rgba(255,255,255,0.04); }
        .ln-section-inner { max-width: 1120px; margin: 0 auto; }
        .ln-section-label { font-size: 11px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: rgba(61,240,255,0.55); margin-bottom: 14px; font-family: 'JetBrains Mono', monospace; }
        .ln-section-h2 { font-size: clamp(30px, 4.5vw, 52px); font-weight: 800; letter-spacing: -0.045em; line-height: 1.08; margin-bottom: 18px; }
        .ln-section-body { font-size: 16px; color: rgba(255,255,255,0.42); line-height: 1.75; max-width: 560px; margin-bottom: 56px; }

        /* ────────────────── AGENTIC LOOP ────────────────── */
        .ln-loop { display: grid; grid-template-columns: repeat(6, 1fr); gap: 12px; }
        @media (max-width: 900px) { .ln-loop { grid-template-columns: repeat(3, 1fr); } }
        @media (max-width: 520px) { .ln-loop { grid-template-columns: repeat(2, 1fr); } }
        .ln-loop-step { position: relative; padding: 24px 16px 22px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.06); background: rgba(255,255,255,0.02); text-align: center; transition: all 350ms cubic-bezier(0.4,0,0.2,1); cursor: default; }
        .ln-loop-step.active { border-color: rgba(61,240,255,0.35); background: rgba(61,240,255,0.06); box-shadow: 0 0 40px rgba(61,240,255,0.08), inset 0 1px 0 rgba(61,240,255,0.15); }
        .ln-loop-step.active .ln-loop-step-label { color: #3DF0FF; }
        .ln-loop-icon { font-size: 28px; margin-bottom: 12px; display: block; }
        .ln-loop-step-label { font-size: 13px; font-weight: 700; letter-spacing: -0.01em; margin-bottom: 6px; color: rgba(255,255,255,0.75); transition: color 350ms; }
        .ln-loop-step-desc { font-size: 11px; color: rgba(255,255,255,0.32); line-height: 1.55; }

        /* ── Self-heal callout ── */
        .ln-heal-box { border: 1px solid rgba(139,92,246,0.20); background: linear-gradient(135deg, rgba(139,92,246,0.04), rgba(61,240,255,0.02)); border-radius: 24px; padding: 44px 48px; display: grid; grid-template-columns: 1fr 1fr; gap: 56px; align-items: center; margin-top: 56px; position: relative; overflow: hidden; }
        .ln-heal-box::before { content: ''; position: absolute; width: 300px; height: 300px; border-radius: 50%; background: radial-gradient(circle, rgba(139,92,246,0.08), transparent 70%); top: -100px; right: -80px; pointer-events: none; }
        @media (max-width: 720px) { .ln-heal-box { grid-template-columns: 1fr; gap: 28px; padding: 32px; } }
        .ln-heal-title { font-size: clamp(24px, 3.5vw, 36px); font-weight: 800; letter-spacing: -0.04em; margin-bottom: 16px; line-height: 1.1; }
        .ln-heal-body { font-size: 15px; color: rgba(255,255,255,0.45); line-height: 1.75; }
        .ln-heal-steps { display: flex; flex-direction: column; gap: 16px; }
        .ln-heal-step { display: flex; align-items: flex-start; gap: 16px; }
        .ln-heal-step-num { width: 32px; height: 32px; border-radius: 10px; border: 1px solid rgba(139,92,246,0.30); background: rgba(139,92,246,0.08); color: rgba(139,92,246,0.90); font-size: 12px; font-weight: 800; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-family: 'JetBrains Mono', monospace; }
        .ln-heal-step-text { font-size: 14px; color: rgba(255,255,255,0.55); line-height: 1.55; padding-top: 6px; }
        .ln-heal-step-text strong { color: rgba(255,255,255,0.90); font-weight: 600; }

        /* ────────────────── CODE EXPORT ────────────────── */
        .ln-code-box { border: 1px solid rgba(255,255,255,0.07); background: linear-gradient(180deg, rgba(255,255,255,0.03), rgba(0,0,0,0.30)); border-radius: 18px; overflow: hidden; box-shadow: 0 24px 80px rgba(0,0,0,0.40); }
        .ln-code-bar { display: flex; align-items: center; gap: 7px; padding: 14px 18px; border-bottom: 1px solid rgba(255,255,255,0.06); background: rgba(255,255,255,0.025); }
        .ln-code-dot { width: 10px; height: 10px; border-radius: 50%; }
        .ln-code-filename { font-size: 12px; font-weight: 600; color: rgba(255,255,255,0.30); font-family: 'JetBrains Mono', monospace; margin-left: 8px; }
        .ln-code-body { padding: 22px 24px; font-family: 'JetBrains Mono', monospace; font-size: 12.5px; line-height: 1.95; color: rgba(255,255,255,0.65); white-space: pre; overflow-x: auto; }
        .c-purple { color: rgba(139,92,246,0.90); }
        .c-cyan   { color: rgba(61,240,255,0.85); }
        .c-green  { color: rgba(56,248,166,0.80); }
        .c-gray   { color: rgba(255,255,255,0.25); }
        .c-white  { color: rgba(255,255,255,0.85); }

        /* ────────────────── AGENTS ────────────────── */
        .ln-agents { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
        @media (max-width: 900px) { .ln-agents { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 540px) { .ln-agents { grid-template-columns: 1fr; } }
        .ln-agent { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); border-radius: 18px; padding: 22px; transition: all 250ms cubic-bezier(0.4,0,0.2,1); }
        .ln-agent:hover { background: rgba(255,255,255,0.05); border-color: rgba(255,255,255,0.12); transform: translateY(-3px); box-shadow: 0 16px 48px rgba(0,0,0,0.20); }
        .ln-agent-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
        .ln-agent-icon { font-size: 22px; }
        .ln-agent-plan { font-size: 9px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; padding: 3px 8px; border-radius: 6px; }
        .ln-agent-plan--free    { background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.35); }
        .ln-agent-plan--starter { background: rgba(61,240,255,0.07); color: rgba(61,240,255,0.60); border: 1px solid rgba(61,240,255,0.12); }
        .ln-agent-plan--pro     { background: rgba(139,92,246,0.08); color: rgba(139,92,246,0.75); border: 1px solid rgba(139,92,246,0.15); }
        .ln-agent-name { font-size: 15px; font-weight: 700; margin-bottom: 6px; letter-spacing: -0.02em; }
        .ln-agent-desc { font-size: 12.5px; color: rgba(255,255,255,0.38); line-height: 1.55; margin-bottom: 10px; }
        .ln-agent-cost { font-size: 10px; font-weight: 600; color: rgba(255,255,255,0.22); font-family: 'JetBrains Mono', monospace; }

        /* ────────────────── TESTIMONIALS ────────────────── */
        .ln-testimonials { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-top: 56px; }
        @media (max-width: 768px) { .ln-testimonials { grid-template-columns: 1fr; } }
        .ln-testimonial { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); border-radius: 20px; padding: 28px; transition: all 200ms; }
        .ln-testimonial:hover { border-color: rgba(255,255,255,0.10); background: rgba(255,255,255,0.04); }
        .ln-testimonial-text { font-size: 14px; color: rgba(255,255,255,0.55); line-height: 1.70; margin-bottom: 20px; font-style: italic; }
        .ln-testimonial-author { display: flex; align-items: center; gap: 12px; }
        .ln-testimonial-avatar { width: 36px; height: 36px; border-radius: 10px; background: linear-gradient(135deg, rgba(61,240,255,0.15), rgba(139,92,246,0.15)); border: 1px solid rgba(255,255,255,0.08); display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 700; color: rgba(255,255,255,0.50); }
        .ln-testimonial-name { font-size: 13px; font-weight: 600; color: rgba(255,255,255,0.80); }
        .ln-testimonial-role { font-size: 11px; color: rgba(255,255,255,0.30); margin-top: 1px; }

        /* ────────────────── PRICING ────────────────── */
        .ln-pricing { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; }
        @media (max-width: 900px) { .ln-pricing { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 520px) { .ln-pricing { grid-template-columns: 1fr; } }
        .ln-plan { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); border-radius: 22px; padding: 28px 22px; display: flex; flex-direction: column; gap: 16px; transition: all 200ms; }
        .ln-plan:hover { border-color: rgba(255,255,255,0.10); }
        .ln-plan--highlight { background: linear-gradient(180deg, rgba(139,92,246,0.06), rgba(61,240,255,0.03)); border-color: rgba(139,92,246,0.28); box-shadow: 0 0 60px rgba(139,92,246,0.06); }
        .ln-plan--highlight:hover { border-color: rgba(139,92,246,0.40); }
        .ln-plan-name { font-size: 11px; font-weight: 700; letter-spacing: 0.10em; text-transform: uppercase; color: rgba(255,255,255,0.40); font-family: 'JetBrains Mono', monospace; }
        .ln-plan--highlight .ln-plan-name { color: rgba(139,92,246,0.80); }
        .ln-plan-price { display: flex; align-items: baseline; gap: 3px; }
        .ln-plan-amount { font-size: 36px; font-weight: 900; letter-spacing: -0.04em; }
        .ln-plan-period { font-size: 13px; color: rgba(255,255,255,0.25); font-weight: 400; }
        .ln-plan-features { display: flex; flex-direction: column; gap: 9px; flex: 1; }
        .ln-plan-feature { font-size: 13px; color: rgba(255,255,255,0.50); display: flex; align-items: center; gap: 8px; }
        .ln-plan-feature::before { content: "✓"; font-size: 10px; font-weight: 800; color: rgba(56,248,166,0.55); flex-shrink: 0; }
        .ln-plan-cta { display: block; text-align: center; padding: 11px; border-radius: 12px; font-size: 14px; font-weight: 700; text-decoration: none; transition: all 180ms; border: 1px solid rgba(255,255,255,0.10); background: rgba(255,255,255,0.04); color: rgba(255,255,255,0.70); }
        .ln-plan-cta:hover { background: rgba(255,255,255,0.08); color: #fff; border-color: rgba(255,255,255,0.18); }
        .ln-plan--highlight .ln-plan-cta { background: linear-gradient(135deg, rgba(139,92,246,0.18), rgba(61,240,255,0.10)); border-color: rgba(139,92,246,0.35); color: rgba(255,255,255,0.95); }
        .ln-plan--highlight .ln-plan-cta:hover { background: linear-gradient(135deg, rgba(139,92,246,0.28), rgba(61,240,255,0.15)); box-shadow: 0 0 24px rgba(139,92,246,0.12); }

        /* ────────────────── FINAL CTA ────────────────── */
        .ln-final { text-align: center; padding: clamp(72px, 12vw, 140px) clamp(20px, 5vw, 64px); position: relative; overflow: hidden; }
        .ln-final-glow { position: absolute; width: 700px; height: 700px; border-radius: 50%; filter: blur(140px); opacity: 0.08; top: 50%; left: 50%; transform: translate(-50%, -50%); background: conic-gradient(from 0deg, #3DF0FF, #8B5CF6, #38F8A6, #3DF0FF); pointer-events: none; animation: finalGlow 20s linear infinite; }
        @keyframes finalGlow { to { transform: translate(-50%, -50%) rotate(360deg); } }
        .ln-final-inner { position: relative; max-width: 640px; margin: 0 auto; }
        .ln-final-h2 { font-size: clamp(34px, 5.5vw, 60px); font-weight: 900; letter-spacing: -0.05em; margin-bottom: 18px; line-height: 1.05; }
        .ln-final-sub { font-size: 17px; color: rgba(255,255,255,0.40); line-height: 1.75; margin-bottom: 40px; }

        /* ── Fade-in on mount ── */
        .ln-fadein { opacity: 0; transform: translateY(12px); transition: opacity 600ms cubic-bezier(0.4,0,0.2,1), transform 600ms cubic-bezier(0.4,0,0.2,1); }
        .ln-fadein.mounted { opacity: 1; transform: translateY(0); }
        .ln-fadein-d1 { transition-delay: 100ms; }
        .ln-fadein-d2 { transition-delay: 200ms; }
        .ln-fadein-d3 { transition-delay: 350ms; }
        .ln-fadein-d4 { transition-delay: 500ms; }
      `}</style>

      <SiteNav />

      {/* ── Hero ── */}
      <section className="ln-hero">
        <div className="ln-aurora" />
        <div className="ln-blob ln-blob-1" />
        <div className="ln-blob ln-blob-2" />
        <div className="ln-blob ln-blob-3" />
        <div className="ln-grid" />
        <div className="ln-noise" />

        <div className={`ln-badge ln-fadein ln-fadein-d1${mounted ? " mounted" : ""}`}>
          <span className="ln-badge-dot" />
          Fully Orchestrated Agentic Loop
        </div>

        <h1 className={`ln-h1 ln-fadein ln-fadein-d2${mounted ? " mounted" : ""}`}>
          <span className="ln-h1-line1">Build. Fix.</span>
          <span className="ln-h1-line2">Self-Heal. Ship.</span>
        </h1>

        <p className={`ln-sub ln-fadein ln-fadein-d3${mounted ? " mounted" : ""}`}>
          Not a template. Not a drag-and-drop editor. An <strong>agentic reasoning loop</strong> that
          builds, detects its own bugs, fixes them, audits the result, and exports
          clean <strong>React / TypeScript</strong> code you actually own.
        </p>

        <div className={`ln-cta-row ln-fadein ln-fadein-d3${mounted ? " mounted" : ""}`}>
          <Link href="/build" className="ln-cta-primary">
            Start the loop →
          </Link>
          <a href="#loop" className="ln-cta-secondary">
            How it works
          </a>
        </div>

        <div className={`ln-stats ln-fadein ln-fadein-d4${mounted ? " mounted" : ""}`}>
          {[
            { num: "<60s", label: "First build" },
            { num: "6", label: "AI agents" },
            { num: "TS", label: "Clean export" },
            { num: "2", label: "AI models" },
          ].map(s => (
            <div key={s.label} className="ln-stat">
              <span className="ln-stat-num">{s.num}</span>
              <span className="ln-stat-label">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Trust Strip ── */}
      <div className="ln-trust">
        <div className="ln-trust-label">Trusted by builders at</div>
        <div className="ln-trust-track">
          {[...TRUST_LOGOS, ...TRUST_LOGOS].map((name, i) => (
            <span key={i} className="ln-trust-item">{name}</span>
          ))}
        </div>
      </div>

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
              <div className="ln-section-label" style={{ marginBottom: 12 }}>{"// self_heal.ts"}</div>
              <div className="ln-heal-title">
                The loop catches what<br />
                <span style={{ background: "linear-gradient(135deg, rgba(139,92,246,0.95), rgba(61,240,255,0.80))", WebkitBackgroundClip: "text", backgroundClip: "text", WebkitTextFillColor: "transparent" }}>you&apos;d never see.</span>
              </div>
              <p className="ln-heal-body">
                Most AI builders hand you broken output and call it done.
                Dominat8 runs a second reasoning pass — automatically
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
        <div className="ln-section-inner" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "64px", alignItems: "center" }}>
          <div style={{ minWidth: 0 }}>
            <div className="ln-section-label">{"// export.tsx"}</div>
            <h2 className="ln-section-h2">Not a black box.<br />Real code you own.</h2>
            <p className="ln-section-body" style={{ marginBottom: 28 }}>
              Export clean, professional React + TypeScript. Componentised, typed,
              and ready for your own codebase — not locked into a proprietary format.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                "React 18 + TypeScript components",
                "Typed props — no any, no implicit",
                "Tailwind or inline CSS (your choice)",
                "Accessible HTML structure built-in",
                "Zero runtime vendor dependencies",
              ].map(f => (
                <div key={f} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, color: "rgba(255,255,255,0.55)" }}>
                  <span style={{ color: "rgba(56,248,166,0.60)", fontWeight: 700, fontSize: 11 }}>✓</span>
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

      {/* ── Testimonials ── */}
      <section className="ln-section ln-section--dark">
        <div className="ln-section-inner">
          <div className="ln-section-label">{"// reviews[]"}</div>
          <h2 className="ln-section-h2">Don&apos;t take our word for it.</h2>
          <div className="ln-testimonials">
            {TESTIMONIALS.map(t => (
              <div key={t.name} className="ln-testimonial">
                <div className="ln-testimonial-text">&ldquo;{t.text}&rdquo;</div>
                <div className="ln-testimonial-author">
                  <div className="ln-testimonial-avatar">{t.avatar}</div>
                  <div>
                    <div className="ln-testimonial-name">{t.name}</div>
                    <div className="ln-testimonial-role">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section className="ln-section ln-section--surface" id="pricing">
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
        <div className="ln-final-glow" />
        <div className="ln-final-inner">
          <h2 className="ln-final-h2">
            The loop is ready.<br />
            <span style={{ background: "linear-gradient(135deg, #3DF0FF, #8B5CF6, #38F8A6)", WebkitBackgroundClip: "text", backgroundClip: "text", WebkitTextFillColor: "transparent" }}>Start building.</span>
          </h2>
          <p className="ln-final-sub">
            Free to start. No credit card. Your first 3 builds are on us.<br />
            Wix, Squarespace, Lovable — none of them give you clean TypeScript.
          </p>
          <Link href="/build" className="ln-cta-primary" style={{ margin: "0 auto" }}>
            Launch the builder →
          </Link>
        </div>
      </section>

      <SiteFooter />
    </>
  );
}
