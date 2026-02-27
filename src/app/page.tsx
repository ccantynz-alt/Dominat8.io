"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import { SiteNav } from "@/components/shared/SiteNav";
import { SiteFooter } from "@/components/shared/SiteFooter";

/* ═══════════════════════════════════════════════════════════════
   DATA
   ═══════════════════════════════════════════════════════════════ */

const HERO_PROMPTS = [
  "A modern SaaS landing page for my AI startup",
  "An e-commerce store for artisan coffee beans",
  "A portfolio website for a UX designer",
  "A restaurant site with online reservations",
];

const LOOP_STEPS = [
  { id: "prompt", icon: "⌨", label: "Prompt", desc: "Describe your business in plain English" },
  { id: "reason", icon: "🧠", label: "Reason", desc: "Claude plans architecture, content & layout" },
  { id: "build", icon: "⚡", label: "Build", desc: "Full site generated in under 60 seconds" },
  { id: "heal", icon: "🔄", label: "Self-Heal", desc: "Loop detects bugs & fixes automatically" },
  { id: "audit", icon: "🔍", label: "Audit", desc: "6 specialist agents sweep for issues" },
  { id: "ship", icon: "🚀", label: "Ship", desc: "Deploy-ready React + TypeScript exported" },
];

const AGENTS = [
  { icon: "🔍", name: "SEO Sweep", desc: "Title, meta, OG tags, structured data — full technical SEO audit.", cost: "1 cr", plan: "free" },
  { icon: "📱", name: "Responsive Audit", desc: "Tests at 320 / 768 / 1440px. Catches and fixes every layout break.", cost: "1 cr", plan: "free" },
  { icon: "🔗", name: "Link Scanner", desc: "Validates every CTA, anchor, and button. Zero dead links shipped.", cost: "1 cr", plan: "starter" },
  { icon: "♿", name: "Accessibility", desc: "WCAG 2.1 AA — alt text, ARIA roles, contrast ratios, keyboard nav.", cost: "2 cr", plan: "starter" },
  { icon: "⚡", name: "Performance", desc: "Core Web Vitals audit — LCP, CLS, FID risks identified & explained.", cost: "2 cr", plan: "starter" },
  { icon: "🎨", name: "Design Fixer", desc: "AI rewrites HTML/CSS to fix contrast, spacing, and typography issues.", cost: "5 cr", plan: "pro" },
];

const PLANS = [
  { name: "Free", price: "$0", period: "", credits: 5, gens: 3, highlight: false, cta: "Start free", href: "/build" },
  { name: "Starter", price: "$9", period: "/mo", credits: 25, gens: 20, highlight: false, cta: "Get Starter", href: "/pricing" },
  { name: "Pro", price: "$29", period: "/mo", credits: 150, gens: 100, highlight: true, cta: "Go Pro", href: "/pricing" },
  { name: "Agency", price: "$99", period: "/mo", credits: 600, gens: 500, highlight: false, cta: "Get Agency", href: "/pricing" },
];

const TRUST_LOGOS = ["Y Combinator", "Vercel", "Stripe", "OpenAI", "Anthropic", "Figma", "Linear", "Arc", "Notion", "Raycast"];

const TESTIMONIALS = [
  { name: "Sarah K.", role: "Founder, KiwiLegal", text: "I described my law firm and had a production-ready site in 40 seconds. Genuinely better than what my agency quoted $12k for.", avatar: "S" },
  { name: "Marcus T.", role: "CTO, Buildstack", text: "The self-heal loop is the real deal. Generated 50 client sites — every single one shipped clean. No manual fixes.", avatar: "M" },
  { name: "Priya R.", role: "Growth Lead", text: "We use Dominat8 for landing page experiments. 3 variants in 2 minutes. Our conversion rate is up 34% since switching.", avatar: "P" },
];

/* ═══════════════════════════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════════════════════════ */

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  /* ── Typing animation ────────────────────────────────────── */
  const [typedText, setTypedText] = useState("");
  const [promptIdx, setPromptIdx] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const typingRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* ── Mount ─────────────────────────────────────────────────── */
  useEffect(() => { setMounted(true); }, []);

  /* ── Step rotation ─────────────────────────────────────────── */
  useEffect(() => {
    const t = setInterval(() => setActiveStep(s => (s + 1) % LOOP_STEPS.length), 2000);
    return () => clearInterval(t);
  }, []);

  /* ── Typing effect ─────────────────────────────────────────── */
  useEffect(() => {
    const prompt = HERO_PROMPTS[promptIdx];

    typingRef.current = setTimeout(() => {
      if (!isDeleting) {
        if (typedText.length < prompt.length) {
          setTypedText(prompt.slice(0, typedText.length + 1));
        } else {
          setTimeout(() => setIsDeleting(true), 2200);
        }
      } else {
        if (typedText.length > 0) {
          setTypedText(typedText.slice(0, -1));
        } else {
          setIsDeleting(false);
          setPromptIdx((promptIdx + 1) % HERO_PROMPTS.length);
        }
      }
    }, isDeleting ? 25 : 55);

    return () => { if (typingRef.current) clearTimeout(typingRef.current); };
  }, [typedText, isDeleting, promptIdx]);

  /* ── Scroll reveal (IntersectionObserver) ───────────────── */
  useEffect(() => {
    if (!mounted) return;
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add("visible"); observer.unobserve(e.target); }
      }),
      { threshold: 0.12 }
    );
    document.querySelectorAll(".reveal").forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, [mounted]);

  const fm = (delay: string) => `reveal${mounted ? "" : ""}` + (mounted ? "" : "");
  // Helper: join classNames for fade-in-on-mount + scroll-reveal
  const heroFade = (d: number) => `h-fade h-fade-d${d}${mounted ? " mounted" : ""}`;

  return (
    <>
      <style>{`
/* ═══════════════════════════════ REVEAL ═══════════════════════════════ */
.reveal{opacity:0;transform:translateY(32px);transition:opacity 900ms cubic-bezier(.16,1,.3,1),transform 900ms cubic-bezier(.16,1,.3,1);}
.reveal.visible{opacity:1;transform:translateY(0);}
.reveal-d1{transition-delay:80ms}.reveal-d2{transition-delay:160ms}.reveal-d3{transition-delay:240ms}
.reveal-d4{transition-delay:320ms}.reveal-d5{transition-delay:400ms}.reveal-d6{transition-delay:480ms}

/* Hero fade-in on mount */
.h-fade{opacity:0;transform:translateY(16px);transition:opacity 700ms cubic-bezier(.4,0,.2,1),transform 700ms cubic-bezier(.4,0,.2,1);}
.h-fade.mounted{opacity:1;transform:translateY(0);}
.h-fade-d1{transition-delay:100ms}.h-fade-d2{transition-delay:220ms}.h-fade-d3{transition-delay:380ms}.h-fade-d4{transition-delay:520ms}.h-fade-d5{transition-delay:680ms}

/* ═══════════════════════════════ HERO ═══════════════════════════════ */
.hero{min-height:100dvh;display:flex;align-items:center;position:relative;overflow:hidden;padding:clamp(100px,16vh,140px) clamp(20px,5vw,64px) 80px;}
.hero-inner{max-width:1200px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:clamp(40px,6vw,80px);align-items:center;width:100%;}
@media(max-width:900px){.hero-inner{grid-template-columns:1fr;text-align:center;}}

/* Aurora */
.aurora{position:absolute;inset:0;pointer-events:none;overflow:hidden;}
.aurora::before{content:'';position:absolute;width:180%;height:180%;top:-40%;left:-40%;background:conic-gradient(from 180deg at 50% 50%,rgba(61,240,255,.06) 0deg,rgba(139,92,246,.05) 90deg,rgba(56,248,166,.03) 180deg,rgba(61,240,255,.06) 270deg,transparent 360deg);animation:auroraSpin 45s linear infinite;}
.aurora::after{content:'';position:absolute;width:150%;height:150%;top:-25%;left:-25%;background:conic-gradient(from 0deg at 50% 50%,transparent 0deg,rgba(139,92,246,.04) 120deg,rgba(61,240,255,.05) 240deg,transparent 360deg);animation:auroraSpin 65s linear infinite reverse;}
@keyframes auroraSpin{to{transform:rotate(360deg)}}

/* Blobs */
.blob{position:absolute;border-radius:50%;filter:blur(120px);pointer-events:none;}
.blob-1{width:900px;height:600px;background:radial-gradient(ellipse,rgba(61,240,255,.10),transparent 70%);top:-200px;left:-200px;animation:bDrift1 30s ease-in-out infinite alternate;}
.blob-2{width:700px;height:700px;background:radial-gradient(ellipse,rgba(139,92,246,.08),transparent 70%);bottom:-150px;right:-200px;animation:bDrift2 34s ease-in-out infinite alternate;}
.blob-3{width:500px;height:400px;background:radial-gradient(ellipse,rgba(56,248,166,.05),transparent 70%);top:40%;left:50%;transform:translateX(-50%);animation:bDrift3 26s ease-in-out infinite alternate;}
@keyframes bDrift1{to{transform:translate(60px,40px)}}
@keyframes bDrift2{to{transform:translate(-50px,-60px)}}
@keyframes bDrift3{to{transform:translate(-50%,30px) scale(1.1)}}

/* Grid + Noise */
.grid-ov{position:absolute;inset:0;pointer-events:none;background-image:linear-gradient(rgba(255,255,255,.015) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.015) 1px,transparent 1px);background-size:80px 80px;mask-image:radial-gradient(ellipse 70% 50% at 50% 40%,black 20%,transparent 70%);-webkit-mask-image:radial-gradient(ellipse 70% 50% at 50% 40%,black 20%,transparent 70%);}
.noise{position:absolute;inset:0;pointer-events:none;opacity:.022;background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");background-size:200px;}

/* Hero badge */
.h-badge{display:inline-flex;align-items:center;gap:8px;padding:7px 18px;border-radius:999px;border:1px solid rgba(61,240,255,.18);background:rgba(61,240,255,.04);color:rgba(61,240,255,.80);font-size:12px;font-weight:600;letter-spacing:.04em;margin-bottom:28px;backdrop-filter:blur(12px);}
.h-badge-dot{width:6px;height:6px;border-radius:50%;background:#3DF0FF;box-shadow:0 0 8px rgba(61,240,255,.6);animation:dotPulse 2s ease-in-out infinite;}
@keyframes dotPulse{0%,100%{opacity:1;box-shadow:0 0 8px rgba(61,240,255,.6)}50%{opacity:.35;box-shadow:0 0 2px rgba(61,240,255,.2)}}

/* Hero H1 */
.h-h1{font-size:clamp(42px,7vw,84px);font-weight:900;letter-spacing:-.055em;line-height:.92;margin:0 0 24px;position:relative;}
.h-h1-l1{display:block;background:linear-gradient(135deg,#fff 20%,rgba(61,240,255,.90) 100%);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;}
.h-h1-l2{display:block;background:linear-gradient(135deg,rgba(139,92,246,.95) 0%,rgba(61,240,255,.85) 50%,rgba(56,248,166,.80) 100%);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;}

/* Hero sub */
.h-sub{font-size:clamp(15px,1.6vw,18px);color:rgba(255,255,255,.42);line-height:1.75;max-width:480px;margin:0 0 36px;font-weight:400;}
.h-sub strong{color:rgba(255,255,255,.75);font-weight:600;}

/* Hero CTAs */
.h-ctas{display:flex;gap:14px;flex-wrap:wrap;margin-bottom:0;}
@media(max-width:900px){.h-ctas{justify-content:center;}}
.cta-primary{position:relative;padding:16px 36px;border-radius:14px;background:linear-gradient(135deg,rgba(61,240,255,.16),rgba(139,92,246,.10));border:1px solid rgba(61,240,255,.35);color:#fff;font-size:16px;font-weight:700;text-decoration:none;transition:all 220ms;display:inline-flex;align-items:center;gap:8px;letter-spacing:-.01em;overflow:hidden;}
.cta-primary::after{content:'';position:absolute;top:0;left:-100%;width:100%;height:100%;background:linear-gradient(90deg,transparent,rgba(255,255,255,.08),transparent);animation:shimmerSlide 4s ease-in-out infinite;}
@keyframes shimmerSlide{0%{left:-100%}40%{left:100%}100%{left:100%}}
.cta-primary:hover{transform:translateY(-2px);box-shadow:0 0 48px rgba(61,240,255,.14),0 8px 32px rgba(0,0,0,.30);border-color:rgba(61,240,255,.55);}
.cta-secondary{padding:16px 32px;border-radius:14px;background:rgba(255,255,255,.035);border:1px solid rgba(255,255,255,.08);color:rgba(255,255,255,.60);font-size:16px;font-weight:600;text-decoration:none;transition:all 180ms;}
.cta-secondary:hover{background:rgba(255,255,255,.07);border-color:rgba(255,255,255,.16);color:#fff;}

/* ═══════════════════════ DEMO CARD ═══════════════════════ */
.demo-card{background:rgba(255,255,255,.025);border:1px solid rgba(255,255,255,.07);border-radius:20px;overflow:hidden;box-shadow:0 32px 80px rgba(0,0,0,.40),0 0 0 1px rgba(255,255,255,.03);transform:perspective(1400px) rotateY(-4deg) rotateX(2deg);animation:cardFloat 8s ease-in-out infinite;transition:transform 400ms;}
.demo-card:hover{transform:perspective(1400px) rotateY(-1deg) rotateX(0deg) translateY(-4px);}
@keyframes cardFloat{0%,100%{transform:perspective(1400px) rotateY(-4deg) rotateX(2deg) translateY(0)}50%{transform:perspective(1400px) rotateY(-4deg) rotateX(2deg) translateY(-12px)}}
@media(max-width:900px){.demo-card{transform:none;animation:none;}}

.demo-bar{display:flex;align-items:center;gap:7px;padding:12px 16px;border-bottom:1px solid rgba(255,255,255,.06);background:rgba(255,255,255,.02);}
.demo-dot{width:9px;height:9px;border-radius:50%;}
.demo-url{font-size:11px;font-weight:500;color:rgba(255,255,255,.22);font-family:'JetBrains Mono',monospace;margin-left:8px;letter-spacing:.01em;}

.demo-prompt{padding:20px;border-bottom:1px solid rgba(255,255,255,.04);}
.demo-prompt-label{font-size:10px;font-weight:700;letter-spacing:.10em;text-transform:uppercase;color:rgba(61,240,255,.40);margin-bottom:10px;font-family:'JetBrains Mono',monospace;}
.demo-prompt-input{min-height:20px;font-size:14px;color:rgba(255,255,255,.70);font-family:'Outfit',sans-serif;line-height:1.5;}
.demo-cursor{display:inline-block;width:2px;height:18px;background:rgba(61,240,255,.70);margin-left:1px;vertical-align:text-bottom;animation:cursorBlink 1s steps(1) infinite;}
@keyframes cursorBlink{0%,100%{opacity:1}50%{opacity:0}}

.demo-preview{padding:16px;position:relative;}
.demo-gen{display:flex;align-items:center;gap:8px;margin-bottom:12px;font-size:11px;font-weight:600;color:rgba(61,240,255,.50);font-family:'JetBrains Mono',monospace;}
.demo-gen-dot{width:5px;height:5px;border-radius:50%;background:rgba(61,240,255,.60);animation:genPulse 1.2s ease-in-out infinite;}
.demo-gen-dot:nth-child(2){animation-delay:.15s}.demo-gen-dot:nth-child(3){animation-delay:.3s}
@keyframes genPulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.3;transform:scale(.6)}}

/* Mini site preview mockup */
.demo-mock{border-radius:10px;border:1px solid rgba(255,255,255,.05);overflow:hidden;background:rgba(0,0,0,.30);}
.demo-mock-nav{height:28px;background:rgba(255,255,255,.03);border-bottom:1px solid rgba(255,255,255,.04);display:flex;align-items:center;padding:0 10px;gap:16px;}
.demo-mock-logo{width:10px;height:10px;border-radius:3px;background:linear-gradient(135deg,rgba(61,240,255,.25),rgba(139,92,246,.20));}
.demo-mock-links{display:flex;gap:8px;}
.demo-mock-link{width:20px;height:3px;border-radius:2px;background:rgba(255,255,255,.08);}
.demo-mock-hero{height:80px;background:linear-gradient(135deg,rgba(61,240,255,.06),rgba(139,92,246,.05));display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;padding:12px;}
.demo-mock-hl{width:60%;height:5px;border-radius:3px;background:rgba(255,255,255,.15);}
.demo-mock-sl{width:40%;height:3px;border-radius:2px;background:rgba(255,255,255,.07);}
.demo-mock-btn{width:24%;height:8px;border-radius:4px;background:linear-gradient(135deg,rgba(61,240,255,.20),rgba(139,92,246,.15));margin-top:4px;}
.demo-mock-cards{display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;padding:8px 10px 10px;}
.demo-mock-card{height:36px;border-radius:6px;background:rgba(255,255,255,.025);border:1px solid rgba(255,255,255,.04);}

/* ═══════════════════════ STATS STRIP ═══════════════════════ */
.stats-strip{display:flex;justify-content:center;gap:0;border:1px solid rgba(255,255,255,.06);border-radius:18px;overflow:hidden;backdrop-filter:blur(12px);background:rgba(255,255,255,.02);margin-top:56px;}
.stat{display:flex;flex-direction:column;align-items:center;padding:20px clamp(20px,4vw,44px);border-right:1px solid rgba(255,255,255,.06);}
.stat:last-child{border-right:none;}
.stat-num{font-size:clamp(24px,3vw,32px);font-weight:900;letter-spacing:-.04em;background:linear-gradient(135deg,#3DF0FF,#8B5CF6);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;font-family:'JetBrains Mono',monospace;}
.stat-label{font-size:11px;font-weight:600;color:rgba(255,255,255,.28);letter-spacing:.08em;text-transform:uppercase;margin-top:3px;}
@media(max-width:640px){.stat{padding:14px 16px}.stat-num{font-size:20px}}

/* ═══════════════════════ TRUST STRIP ═══════════════════════ */
.trust{padding:56px 0;overflow:hidden;position:relative;}
.trust-label{text-align:center;font-size:11px;font-weight:600;letter-spacing:.12em;text-transform:uppercase;color:rgba(255,255,255,.18);margin-bottom:24px;}
.trust-track{display:flex;gap:56px;animation:marquee 35s linear infinite;width:max-content;}
.trust-item{font-size:15px;font-weight:600;color:rgba(255,255,255,.10);white-space:nowrap;letter-spacing:-.02em;}
@keyframes marquee{to{transform:translateX(-50%)}}
.trust::before,.trust::after{content:'';position:absolute;top:0;bottom:0;width:120px;z-index:2;pointer-events:none;}
.trust::before{left:0;background:linear-gradient(90deg,#060810,transparent)}
.trust::after{right:0;background:linear-gradient(270deg,#060810,transparent)}

/* ═══════════════════════ SECTIONS ═══════════════════════ */
.sec{padding:clamp(80px,12vw,144px) clamp(20px,5vw,64px);position:relative;}
.sec--dark{background:#060810;}
.sec--surface{background:rgba(255,255,255,.012);border-top:1px solid rgba(255,255,255,.04);border-bottom:1px solid rgba(255,255,255,.04);}
.sec-inner{max-width:1120px;margin:0 auto;}
.sec-label{font-size:11px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:rgba(61,240,255,.50);margin-bottom:14px;font-family:'JetBrains Mono',monospace;}
.sec-h2{font-size:clamp(32px,5vw,56px);font-weight:800;letter-spacing:-.045em;line-height:1.08;margin:0 0 18px;}
.sec-body{font-size:16px;color:rgba(255,255,255,.40);line-height:1.75;max-width:560px;margin:0 0 56px;}

/* ═══════════════════════ AGENTIC LOOP ═══════════════════════ */
.loop{display:grid;grid-template-columns:repeat(6,1fr);gap:12px;}
@media(max-width:900px){.loop{grid-template-columns:repeat(3,1fr)}}
@media(max-width:520px){.loop{grid-template-columns:repeat(2,1fr)}}
.loop-step{position:relative;padding:24px 16px 22px;border-radius:16px;border:1px solid rgba(255,255,255,.06);background:rgba(255,255,255,.02);text-align:center;transition:all 400ms cubic-bezier(.4,0,.2,1);cursor:default;overflow:hidden;}
.loop-step::before{content:'';position:absolute;inset:0;border-radius:16px;padding:1px;background:linear-gradient(135deg,rgba(61,240,255,.30),rgba(139,92,246,.20));-webkit-mask:linear-gradient(#fff 0 0) content-box,linear-gradient(#fff 0 0);-webkit-mask-composite:xor;mask-composite:exclude;opacity:0;transition:opacity 400ms;}
.loop-step.active{border-color:transparent;background:rgba(61,240,255,.05);box-shadow:0 0 40px rgba(61,240,255,.06),inset 0 1px 0 rgba(61,240,255,.12);}
.loop-step.active::before{opacity:1;}
.loop-step.active .loop-label{color:#3DF0FF;}
.loop-icon{font-size:28px;margin-bottom:12px;display:block;}
.loop-label{font-size:13px;font-weight:700;letter-spacing:-.01em;margin-bottom:6px;color:rgba(255,255,255,.70);transition:color 400ms;}
.loop-desc{font-size:11px;color:rgba(255,255,255,.30);line-height:1.55;}

/* Self-heal callout */
.heal{border:1px solid rgba(139,92,246,.18);background:linear-gradient(135deg,rgba(139,92,246,.035),rgba(61,240,255,.015));border-radius:24px;padding:48px 52px;display:grid;grid-template-columns:1fr 1fr;gap:56px;align-items:center;margin-top:64px;position:relative;overflow:hidden;}
.heal::before{content:'';position:absolute;width:350px;height:350px;border-radius:50%;background:radial-gradient(circle,rgba(139,92,246,.07),transparent 70%);top:-120px;right:-100px;pointer-events:none;}
@media(max-width:720px){.heal{grid-template-columns:1fr;gap:28px;padding:32px;}}
.heal-title{font-size:clamp(24px,3.5vw,38px);font-weight:800;letter-spacing:-.04em;margin-bottom:16px;line-height:1.1;}
.heal-body{font-size:15px;color:rgba(255,255,255,.42);line-height:1.75;}
.heal-steps{display:flex;flex-direction:column;gap:18px;}
.heal-step{display:flex;align-items:flex-start;gap:16px;}
.heal-step-num{width:34px;height:34px;border-radius:10px;border:1px solid rgba(139,92,246,.28);background:rgba(139,92,246,.07);color:rgba(139,92,246,.85);font-size:12px;font-weight:800;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-family:'JetBrains Mono',monospace;}
.heal-step-text{font-size:14px;color:rgba(255,255,255,.52);line-height:1.55;padding-top:7px;}
.heal-step-text strong{color:rgba(255,255,255,.88);font-weight:600;}

/* ═══════════════════════ CODE EXPORT ═══════════════════════ */
.code-split{display:grid;grid-template-columns:1fr 1fr;gap:64px;align-items:center;}
@media(max-width:768px){.code-split{grid-template-columns:1fr;}}
.code-box{border:1px solid rgba(255,255,255,.06);background:linear-gradient(180deg,rgba(255,255,255,.025),rgba(0,0,0,.25));border-radius:18px;overflow:hidden;box-shadow:0 24px 80px rgba(0,0,0,.45);}
.code-bar{display:flex;align-items:center;gap:7px;padding:14px 18px;border-bottom:1px solid rgba(255,255,255,.05);background:rgba(255,255,255,.02);}
.code-dot{width:10px;height:10px;border-radius:50%;}
.code-fname{font-size:12px;font-weight:600;color:rgba(255,255,255,.28);font-family:'JetBrains Mono',monospace;margin-left:8px;}
.code-body{padding:24px;font-family:'JetBrains Mono',monospace;font-size:12.5px;line-height:2;color:rgba(255,255,255,.60);white-space:pre;overflow-x:auto;}
.code-body .kw{color:rgba(139,92,246,.85);}
.code-body .fn{color:rgba(61,240,255,.80);}
.code-body .str{color:rgba(56,248,166,.75);}
.code-body .cm{color:rgba(255,255,255,.22);}
.code-body .tp{color:rgba(61,240,255,.65);}
.code-features{display:flex;flex-direction:column;gap:14px;margin-top:32px;}
.code-feat{display:flex;align-items:center;gap:10px;font-size:14px;color:rgba(255,255,255,.52);}
.code-feat-check{color:rgba(56,248,166,.55);font-weight:700;font-size:11px;}

/* ═══════════════════════ AGENTS ═══════════════════════ */
.agents{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;}
@media(max-width:900px){.agents{grid-template-columns:repeat(2,1fr)}}
@media(max-width:540px){.agents{grid-template-columns:1fr}}
.agent{background:rgba(255,255,255,.02);border:1px solid rgba(255,255,255,.06);border-radius:20px;padding:24px;transition:all 280ms cubic-bezier(.4,0,.2,1);position:relative;overflow:hidden;}
.agent::before{content:'';position:absolute;inset:0;border-radius:20px;padding:1px;background:linear-gradient(135deg,rgba(61,240,255,.20),rgba(139,92,246,.15),rgba(56,248,166,.10));-webkit-mask:linear-gradient(#fff 0 0) content-box,linear-gradient(#fff 0 0);-webkit-mask-composite:xor;mask-composite:exclude;opacity:0;transition:opacity 280ms;}
.agent:hover{background:rgba(255,255,255,.045);transform:translateY(-4px);box-shadow:0 16px 48px rgba(0,0,0,.22);}
.agent:hover::before{opacity:1;}
.agent-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;}
.agent-icon{font-size:24px;}
.agent-plan{font-size:9px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;padding:4px 9px;border-radius:6px;}
.agent-plan--free{background:rgba(255,255,255,.05);color:rgba(255,255,255,.32);}
.agent-plan--starter{background:rgba(61,240,255,.06);color:rgba(61,240,255,.55);border:1px solid rgba(61,240,255,.10);}
.agent-plan--pro{background:rgba(139,92,246,.07);color:rgba(139,92,246,.70);border:1px solid rgba(139,92,246,.12);}
.agent-name{font-size:16px;font-weight:700;margin-bottom:8px;letter-spacing:-.02em;}
.agent-desc{font-size:13px;color:rgba(255,255,255,.36);line-height:1.6;margin-bottom:12px;}
.agent-cost{font-size:10px;font-weight:600;color:rgba(255,255,255,.20);font-family:'JetBrains Mono',monospace;}

/* ═══════════════════════ TESTIMONIALS ═══════════════════════ */
.testimonials{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-top:56px;}
@media(max-width:768px){.testimonials{grid-template-columns:1fr;}}
.testimonial{background:rgba(255,255,255,.02);border:1px solid rgba(255,255,255,.06);border-radius:22px;padding:30px;transition:all 250ms;position:relative;overflow:hidden;}
.testimonial::before{content:'';position:absolute;inset:0;border-radius:22px;padding:1px;background:linear-gradient(135deg,rgba(255,255,255,.08),rgba(61,240,255,.06),rgba(139,92,246,.04));-webkit-mask:linear-gradient(#fff 0 0) content-box,linear-gradient(#fff 0 0);-webkit-mask-composite:xor;mask-composite:exclude;opacity:0;transition:opacity 250ms;}
.testimonial:hover{background:rgba(255,255,255,.04);}
.testimonial:hover::before{opacity:1;}
.testimonial-stars{margin-bottom:16px;letter-spacing:2px;font-size:13px;}
.testimonial-text{font-size:14px;color:rgba(255,255,255,.52);line-height:1.75;margin-bottom:22px;}
.testimonial-author{display:flex;align-items:center;gap:12px;}
.testimonial-avatar{width:38px;height:38px;border-radius:11px;background:linear-gradient(135deg,rgba(61,240,255,.14),rgba(139,92,246,.14));border:1px solid rgba(255,255,255,.07);display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:700;color:rgba(255,255,255,.48);}
.testimonial-name{font-size:14px;font-weight:600;color:rgba(255,255,255,.78);}
.testimonial-role{font-size:11px;color:rgba(255,255,255,.28);margin-top:1px;}

/* ═══════════════════════ PRICING ═══════════════════════ */
.pricing{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;}
@media(max-width:900px){.pricing{grid-template-columns:repeat(2,1fr)}}
@media(max-width:520px){.pricing{grid-template-columns:1fr}}
.plan{background:rgba(255,255,255,.02);border:1px solid rgba(255,255,255,.06);border-radius:24px;padding:30px 24px;display:flex;flex-direction:column;gap:18px;transition:all 250ms;position:relative;overflow:hidden;}
.plan:hover{border-color:rgba(255,255,255,.10);}
.plan--hl{background:linear-gradient(180deg,rgba(139,92,246,.05),rgba(61,240,255,.02));border-color:transparent;box-shadow:0 0 60px rgba(139,92,246,.06);}
.plan--hl::before{content:'';position:absolute;inset:0;border-radius:24px;padding:1px;background:linear-gradient(135deg,rgba(139,92,246,.40),rgba(61,240,255,.25),rgba(56,248,166,.20));-webkit-mask:linear-gradient(#fff 0 0) content-box,linear-gradient(#fff 0 0);-webkit-mask-composite:xor;mask-composite:exclude;}
.plan--hl:hover{box-shadow:0 0 80px rgba(139,92,246,.10);}
.plan-pop{position:absolute;top:12px;right:12px;font-size:9px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;padding:4px 10px;border-radius:6px;background:linear-gradient(135deg,rgba(139,92,246,.20),rgba(61,240,255,.12));color:rgba(255,255,255,.80);border:1px solid rgba(139,92,246,.20);}
.plan-name{font-size:11px;font-weight:700;letter-spacing:.10em;text-transform:uppercase;color:rgba(255,255,255,.38);font-family:'JetBrains Mono',monospace;}
.plan--hl .plan-name{color:rgba(139,92,246,.75);}
.plan-price{display:flex;align-items:baseline;gap:3px;}
.plan-amount{font-size:40px;font-weight:900;letter-spacing:-.04em;}
.plan-period{font-size:13px;color:rgba(255,255,255,.23);font-weight:400;}
.plan-features{display:flex;flex-direction:column;gap:10px;flex:1;}
.plan-feat{font-size:13px;color:rgba(255,255,255,.48);display:flex;align-items:center;gap:8px;}
.plan-feat::before{content:"✓";font-size:10px;font-weight:800;color:rgba(56,248,166,.50);flex-shrink:0;}
.plan-cta{display:block;text-align:center;padding:12px;border-radius:13px;font-size:14px;font-weight:700;text-decoration:none;transition:all 200ms;border:1px solid rgba(255,255,255,.10);background:rgba(255,255,255,.035);color:rgba(255,255,255,.65);}
.plan-cta:hover{background:rgba(255,255,255,.07);color:#fff;border-color:rgba(255,255,255,.18);}
.plan--hl .plan-cta{background:linear-gradient(135deg,rgba(139,92,246,.16),rgba(61,240,255,.08));border-color:rgba(139,92,246,.30);color:rgba(255,255,255,.92);position:relative;overflow:hidden;}
.plan--hl .plan-cta::after{content:'';position:absolute;top:0;left:-100%;width:100%;height:100%;background:linear-gradient(90deg,transparent,rgba(255,255,255,.06),transparent);animation:shimmerSlide 4s ease-in-out infinite;}
.plan--hl .plan-cta:hover{background:linear-gradient(135deg,rgba(139,92,246,.25),rgba(61,240,255,.12));box-shadow:0 0 28px rgba(139,92,246,.12);}

/* ═══════════════════════ FINAL CTA ═══════════════════════ */
.final{text-align:center;padding:clamp(80px,14vw,160px) clamp(20px,5vw,64px);position:relative;overflow:hidden;}
.final-glow{position:absolute;width:800px;height:800px;border-radius:50%;filter:blur(150px);opacity:.07;top:50%;left:50%;transform:translate(-50%,-50%);background:conic-gradient(from 0deg,#3DF0FF,#8B5CF6,#38F8A6,#3DF0FF);pointer-events:none;animation:glowSpin 25s linear infinite;}
@keyframes glowSpin{to{transform:translate(-50%,-50%) rotate(360deg)}}
.final-inner{position:relative;max-width:660px;margin:0 auto;}
.final-h2{font-size:clamp(36px,6vw,64px);font-weight:900;letter-spacing:-.05em;margin:0 0 18px;line-height:1.05;}
.final-sub{font-size:17px;color:rgba(255,255,255,.38);line-height:1.75;margin-bottom:44px;}
      `}</style>

      <SiteNav />

      {/* ════════════════════ HERO ════════════════════ */}
      <section className="hero">
        <div className="aurora" />
        <div className="blob blob-1" />
        <div className="blob blob-2" />
        <div className="blob blob-3" />
        <div className="grid-ov" />
        <div className="noise" />

        <div className="hero-inner">
          {/* Left — Text */}
          <div>
            <div className={heroFade(1)}>
              <span className="h-badge">
                <span className="h-badge-dot" />
                The world&apos;s first agentic AI site builder
              </span>
            </div>

            <h1 className={`h-h1 ${heroFade(2)}`}>
              <span className="h-h1-l1">Describe it.</span>
              <span className="h-h1-l2">We build it.</span>
            </h1>

            <p className={`h-sub ${heroFade(3)}`}>
              Not a template. Not a drag-and-drop editor. An <strong>agentic reasoning loop</strong> that
              builds, self-heals, audits, and exports clean <strong>React + TypeScript</strong> you own.
            </p>

            <div className={`h-ctas ${heroFade(3)}`}>
              <Link href="/build" className="cta-primary">
                Start the loop <span style={{ fontSize: 18 }}>→</span>
              </Link>
              <a href="#loop" className="cta-secondary">
                How it works
              </a>
            </div>
          </div>

          {/* Right — Interactive Demo Card */}
          <div className={heroFade(4)}>
            <div className="demo-card">
              <div className="demo-bar">
                <span className="demo-dot" style={{ background: "#FF5F57" }} />
                <span className="demo-dot" style={{ background: "#FFBD2E" }} />
                <span className="demo-dot" style={{ background: "#28CA41" }} />
                <span className="demo-url">dominat8.io/build</span>
              </div>
              <div className="demo-prompt">
                <div className="demo-prompt-label">Describe your site</div>
                <div className="demo-prompt-input">
                  {typedText}<span className="demo-cursor" />
                </div>
              </div>
              <div className="demo-preview">
                <div className="demo-gen">
                  <span className="demo-gen-dot" />
                  <span className="demo-gen-dot" />
                  <span className="demo-gen-dot" />
                  <span style={{ marginLeft: 4 }}>Building...</span>
                </div>
                <div className="demo-mock">
                  <div className="demo-mock-nav">
                    <span className="demo-mock-logo" />
                    <div className="demo-mock-links">
                      <span className="demo-mock-link" />
                      <span className="demo-mock-link" />
                      <span className="demo-mock-link" />
                    </div>
                  </div>
                  <div className="demo-mock-hero">
                    <div className="demo-mock-hl" />
                    <div className="demo-mock-sl" />
                    <div className="demo-mock-btn" />
                  </div>
                  <div className="demo-mock-cards">
                    <div className="demo-mock-card" />
                    <div className="demo-mock-card" />
                    <div className="demo-mock-card" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats strip */}
        <div className={`stats-strip ${heroFade(5)}`} style={{ maxWidth: 700, margin: "56px auto 0" }}>
          {[
            { num: "<60s", label: "First build" },
            { num: "6", label: "AI agents" },
            { num: "50k+", label: "Sites built" },
            { num: "99.9%", label: "Uptime" },
          ].map(s => (
            <div key={s.label} className="stat">
              <span className="stat-num">{s.num}</span>
              <span className="stat-label">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ════════════════════ TRUST STRIP ════════════════════ */}
      <div className="trust">
        <div className="trust-label">Trusted by builders at</div>
        <div className="trust-track">
          {[...TRUST_LOGOS, ...TRUST_LOGOS].map((name, i) => (
            <span key={i} className="trust-item">{name}</span>
          ))}
        </div>
      </div>

      {/* ════════════════════ AGENTIC LOOP ════════════════════ */}
      <section className="sec sec--surface" id="loop">
        <div className="sec-inner">
          <div className="reveal">
            <div className="sec-label">{"// agentic_loop.ts"}</div>
            <h2 className="sec-h2">Six steps. Zero templates.<br />One agentic loop.</h2>
            <p className="sec-body">
              Every build runs through a six-stage orchestrated loop. Claude reasons about architecture,
              generates the site, then the loop self-corrects — before you see the result.
            </p>
          </div>

          <div className="loop reveal">
            {LOOP_STEPS.map((step, i) => (
              <div key={step.id} className={`loop-step reveal-d${i + 1}${i === activeStep ? " active" : ""}`}>
                <span className="loop-icon">{step.icon}</span>
                <div className="loop-label">{step.label}</div>
                <div className="loop-desc">{step.desc}</div>
              </div>
            ))}
          </div>

          {/* Self-heal callout */}
          <div className="heal reveal">
            <div>
              <div className="sec-label" style={{ marginBottom: 12 }}>{"// self_heal.ts"}</div>
              <div className="heal-title">
                The loop catches what<br />
                <span style={{ background: "linear-gradient(135deg,rgba(139,92,246,.95),rgba(61,240,255,.80))", WebkitBackgroundClip: "text", backgroundClip: "text", WebkitTextFillColor: "transparent" }}>you&apos;d never see.</span>
              </div>
              <p className="heal-body">
                Most AI builders hand you broken output and call it done.
                Dominat8 runs a second reasoning pass — automatically
                finding layout regressions, JS errors, and broken interactions,
                then fixing them before the result is rendered.
              </p>
            </div>
            <div className="heal-steps">
              {[
                ["01", "Generate", "Claude builds the full site from your prompt"],
                ["02", "Inspect", "Loop evaluates output for known failure patterns"],
                ["03", "Patch", "Targeted fixes applied — no full regeneration"],
                ["04", "Verify", "Pass/fail check before result is shown to you"],
              ].map(([n, title, body]) => (
                <div key={n} className="heal-step">
                  <div className="heal-step-num">{n}</div>
                  <div className="heal-step-text"><strong>{title}</strong> — {body}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════ CODE EXPORT ════════════════════ */}
      <section className="sec sec--dark">
        <div className="sec-inner">
          <div className="code-split">
            <div className="reveal">
              <div className="sec-label">{"// export.tsx"}</div>
              <h2 className="sec-h2">Not a black box.<br />Real code you own.</h2>
              <p className="sec-body" style={{ marginBottom: 28 }}>
                Export clean, professional React + TypeScript. Componentised, typed,
                and ready for your own codebase — not locked into a proprietary format.
              </p>
              <div className="code-features">
                {[
                  "React 18 + TypeScript components",
                  "Typed props — no any, no implicit",
                  "Tailwind or inline CSS (your choice)",
                  "Accessible HTML structure built-in",
                  "Zero runtime vendor dependencies",
                ].map(f => (
                  <div key={f} className="code-feat">
                    <span className="code-feat-check">✓</span>
                    {f}
                  </div>
                ))}
              </div>
            </div>
            <div className="reveal reveal-d2">
              <div className="code-box">
                <div className="code-bar">
                  <span className="code-dot" style={{ background: "#FF5F57" }} />
                  <span className="code-dot" style={{ background: "#FFBD2E" }} />
                  <span className="code-dot" style={{ background: "#28CA41" }} />
                  <span className="code-fname">HeroSection.tsx</span>
                </div>
                <div className="code-body">
                  <span className="kw">import</span> React <span className="kw">from</span> <span className="str">&apos;react&apos;</span>{"\n\n"}
                  <span className="kw">interface</span> <span className="fn">HeroProps</span> {"{"}{"\n"}
                  {"  "}<span className="fn">headline</span>: <span className="kw">string</span>{"\n"}
                  {"  "}<span className="fn">subtext</span>: <span className="kw">string</span>{"\n"}
                  {"  "}<span className="fn">cta</span>: {"{ "}label: <span className="kw">string</span>; href: <span className="kw">string</span>{" }"}{"\n"}
                  {"}"}{"\n\n"}
                  <span className="kw">export function</span> <span className="fn">HeroSection</span>({"{"}{"\n"}
                  {"  "}headline, subtext, cta{"\n"}
                  {"}"}: <span className="fn">HeroProps</span>) {"{"}{"\n"}
                  {"  "}<span className="kw">return</span> ({"\n"}
                  {"    "}<span className="cm">&lt;</span><span className="fn">section</span> <span className="str">className</span><span className="cm">=</span><span className="str">&quot;hero&quot;</span><span className="cm">&gt;</span>{"\n"}
                  {"      "}<span className="cm">&lt;</span><span className="fn">h1</span><span className="cm">&gt;</span>{"{"}headline{"}"}<span className="cm">&lt;/</span><span className="fn">h1</span><span className="cm">&gt;</span>{"\n"}
                  {"      "}<span className="cm">&lt;</span><span className="fn">p</span><span className="cm">&gt;</span>{"{"}subtext{"}"}<span className="cm">&lt;/</span><span className="fn">p</span><span className="cm">&gt;</span>{"\n"}
                  {"      "}<span className="cm">&lt;</span><span className="fn">a</span> <span className="str">href</span><span className="cm">=</span>{"{"}cta.href{"}"}<span className="cm">&gt;</span>{"\n"}
                  {"        "}{"{"}cta.label{"}"}{"\n"}
                  {"      "}<span className="cm">&lt;/</span><span className="fn">a</span><span className="cm">&gt;</span>{"\n"}
                  {"    "}<span className="cm">&lt;/</span><span className="fn">section</span><span className="cm">&gt;</span>{"\n"}
                  {"  "}){"\n"}
                  {"}"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════ AGENTS ════════════════════ */}
      <section className="sec sec--surface" id="agents">
        <div className="sec-inner">
          <div className="reveal">
            <div className="sec-label">{"// agents[]"}</div>
            <h2 className="sec-h2">Six specialist agents.<br />The audit layer.</h2>
            <p className="sec-body">
              After the self-heal loop, run any combination of domain-expert agents.
              Each returns a scored report with actionable fixes — not vague suggestions.
            </p>
          </div>
          <div className="agents reveal">
            {AGENTS.map((a, i) => (
              <div key={a.name} className={`agent reveal-d${i + 1}`}>
                <div className="agent-top">
                  <span className="agent-icon">{a.icon}</span>
                  <span className={`agent-plan agent-plan--${a.plan}`}>{a.plan}</span>
                </div>
                <div className="agent-name">{a.name}</div>
                <div className="agent-desc">{a.desc}</div>
                <div className="agent-cost">{a.cost} per run</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════ TESTIMONIALS ════════════════════ */}
      <section className="sec sec--dark">
        <div className="sec-inner">
          <div className="reveal">
            <div className="sec-label">{"// reviews[]"}</div>
            <h2 className="sec-h2">Don&apos;t take our word for it.</h2>
          </div>
          <div className="testimonials reveal">
            {TESTIMONIALS.map((t, i) => (
              <div key={t.name} className={`testimonial reveal-d${i + 1}`}>
                <div className="testimonial-stars">★★★★★</div>
                <div className="testimonial-text">&ldquo;{t.text}&rdquo;</div>
                <div className="testimonial-author">
                  <div className="testimonial-avatar">{t.avatar}</div>
                  <div>
                    <div className="testimonial-name">{t.name}</div>
                    <div className="testimonial-role">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════ PRICING ════════════════════ */}
      <section className="sec sec--surface" id="pricing">
        <div className="sec-inner">
          <div className="reveal">
            <div className="sec-label">{"// plans[]"}</div>
            <h2 className="sec-h2">Start free.<br />Scale when you ship.</h2>
            <p className="sec-body">
              Credits never expire. Run out? Buy a top-up pack — no subscription change needed.
            </p>
          </div>
          <div className="pricing reveal">
            {PLANS.map((p, i) => (
              <div key={p.name} className={`plan${p.highlight ? " plan--hl" : ""} reveal-d${i + 1}`}>
                {p.highlight && <span className="plan-pop">Most popular</span>}
                <div className="plan-name">{p.name}</div>
                <div className="plan-price">
                  <span className="plan-amount">{p.price}</span>
                  <span className="plan-period">{p.period}</span>
                </div>
                <div className="plan-features">
                  <div className="plan-feat">{p.gens} builds/mo</div>
                  <div className="plan-feat">{p.credits} agent credits/mo</div>
                  {p.name !== "Free" && <div className="plan-feat">Top-up credit packs</div>}
                  {(p.name === "Pro" || p.name === "Agency") && <div className="plan-feat">Design Fixer agent</div>}
                  {p.name === "Agency" && <div className="plan-feat">White-label export</div>}
                  {p.name === "Agency" && <div className="plan-feat">5 team seats + SLA</div>}
                </div>
                <Link href={p.href} className="plan-cta">{p.cta}</Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════ FINAL CTA ════════════════════ */}
      <section className="final">
        <div className="final-glow" />
        <div className="final-inner reveal">
          <h2 className="final-h2">
            The loop is ready.<br />
            <span style={{ background: "linear-gradient(135deg,#3DF0FF,#8B5CF6,#38F8A6)", WebkitBackgroundClip: "text", backgroundClip: "text", WebkitTextFillColor: "transparent" }}>Start building.</span>
          </h2>
          <p className="final-sub">
            Free to start. No credit card. Your first 3 builds are on us.<br />
            Wix, Squarespace, Lovable — none of them give you clean TypeScript.
          </p>
          <Link href="/build" className="cta-primary" style={{ margin: "0 auto" }}>
            Launch the builder <span style={{ fontSize: 18 }}>→</span>
          </Link>
        </div>
      </section>

      <SiteFooter />
    </>
  );
}
