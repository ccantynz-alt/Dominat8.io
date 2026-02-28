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
  { id: "prompt", num: "01", label: "Prompt", desc: "Describe your business in plain English", icon: "chat" },
  { id: "reason", num: "02", label: "Reason", desc: "Claude plans architecture, content & layout", icon: "brain" },
  { id: "build", num: "03", label: "Build", desc: "Full site generated in under 60 seconds", icon: "code" },
  { id: "heal", num: "04", label: "Self-Heal", desc: "Loop detects bugs & fixes automatically", icon: "shield" },
  { id: "audit", num: "05", label: "Audit", desc: "6 specialist agents sweep for issues", icon: "scan" },
  { id: "ship", num: "06", label: "Ship", desc: "Deploy-ready React + TypeScript exported", icon: "rocket" },
];

const AGENTS = [
  { icon: "S", name: "SEO Sweep", desc: "Title, meta, OG tags, structured data — full technical SEO audit.", cost: "1 cr", plan: "free", color: "#4ADE80" },
  { icon: "R", name: "Responsive Audit", desc: "Tests at 320 / 768 / 1440px. Catches and fixes every layout break.", cost: "1 cr", plan: "free", color: "#60A5FA" },
  { icon: "L", name: "Link Scanner", desc: "Validates every CTA, anchor, and button. Zero dead links shipped.", cost: "1 cr", plan: "starter", color: "#F0B35A" },
  { icon: "A", name: "Accessibility", desc: "WCAG 2.1 AA — alt text, ARIA roles, contrast ratios, keyboard nav.", cost: "2 cr", plan: "starter", color: "#C084FC" },
  { icon: "P", name: "Performance", desc: "Core Web Vitals audit — LCP, CLS, FID risks identified & explained.", cost: "2 cr", plan: "starter", color: "#E8715A" },
  { icon: "D", name: "Design Fixer", desc: "AI rewrites HTML/CSS to fix contrast, spacing, and typography issues.", cost: "5 cr", plan: "pro", color: "#FF7A63" },
];

const PLANS = [
  { name: "Free", price: "$0", period: "", credits: 5, gens: 3, highlight: false, cta: "Start free", href: "/build" },
  { name: "Starter", price: "$9", period: "/mo", credits: 25, gens: 20, highlight: false, cta: "Get Starter", href: "/pricing" },
  { name: "Pro", price: "$29", period: "/mo", credits: 150, gens: 100, highlight: true, cta: "Go Pro", href: "/pricing" },
  { name: "Agency", price: "$99", period: "/mo", credits: 600, gens: 500, highlight: false, cta: "Get Agency", href: "/pricing" },
];

const TRUST_LOGOS = ["Y Combinator", "Vercel", "Stripe", "OpenAI", "Anthropic", "Figma", "Linear", "Arc", "Notion", "Raycast"];

const TESTIMONIALS = [
  { name: "Sarah K.", role: "Founder, KiwiLegal", text: "I described my law firm and had a production-ready site in 40 seconds. Genuinely better than what my agency quoted $12k for.", avatar: "S", stars: 5 },
  { name: "Marcus T.", role: "CTO, Buildstack", text: "The self-heal loop is the real deal. Generated 50 client sites — every single one shipped clean. No manual fixes.", avatar: "M", stars: 5 },
  { name: "Priya R.", role: "Growth Lead", text: "We use Dominat8 for landing page experiments. 3 variants in 2 minutes. Our conversion rate is up 34% since switching.", avatar: "P", stars: 5 },
];

const FAQ_DATA = [
  { q: "How is this different from Wix or Squarespace?", a: "Those are drag-and-drop builders. Dominat8 generates a complete, custom site from a single text description — no templates, no manual editing, no design skills needed." },
  { q: "Do I own the code?", a: "100%. Every site you generate is yours — download the HTML, host it anywhere, modify anything. No lock-in, no vendor dependency." },
  { q: "What tech stack does it output?", a: "Clean React 18 + TypeScript with Tailwind CSS. Fully responsive, SEO-optimised, and ready to deploy to any modern hosting platform." },
  { q: "What are agent credits?", a: "Credits let you run specialist AI agents (SEO, accessibility, performance, etc.) that audit and fix your generated site. Free plan includes 5 credits." },
  { q: "Can I use it for client work?", a: "Absolutely. The Agency plan includes white-label output, API access, and bulk generation — perfect for agencies and freelancers." },
  { q: "Is there a money-back guarantee?", a: "Yes — 14-day money-back guarantee on all paid plans. No questions asked." },
];

/* ═══════════════════════════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════════════════════════ */

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const [typedText, setTypedText] = useState("");
  const [promptIdx, setPromptIdx] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const typingRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const t = setInterval(() => setActiveStep(s => (s + 1) % LOOP_STEPS.length), 2400);
    return () => clearInterval(t);
  }, []);

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

  useEffect(() => {
    if (!mounted) return;
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add("visible"); observer.unobserve(e.target); }
      }),
      { threshold: 0.08 }
    );
    document.querySelectorAll(".rv").forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, [mounted]);

  const toggleFaq = useCallback((i: number) => {
    setOpenFaq(prev => prev === i ? null : i);
  }, []);

  const hf = (d: number) => `hf hf-d${d}${mounted ? " m" : ""}`;

  return (
    <>
      <style>{`
/* ═══ ANIMATIONS ═══ */
.rv{opacity:0;transform:translateY(48px);transition:opacity 900ms cubic-bezier(.16,1,.3,1),transform 900ms cubic-bezier(.16,1,.3,1);}
.rv.visible{opacity:1;transform:translateY(0);}
.rv-d1{transition-delay:120ms}.rv-d2{transition-delay:240ms}.rv-d3{transition-delay:360ms}
.rv-d4{transition-delay:480ms}.rv-d5{transition-delay:600ms}
.hf{opacity:0;transform:translateY(24px);transition:opacity 700ms cubic-bezier(.16,1,.3,1),transform 700ms cubic-bezier(.16,1,.3,1);}
.hf.m{opacity:1;transform:translateY(0);}
.hf-d1{transition-delay:100ms}.hf-d2{transition-delay:220ms}.hf-d3{transition-delay:380ms}.hf-d4{transition-delay:520ms}.hf-d5{transition-delay:680ms}

/* ═══ HERO ═══ */
.hero{min-height:100dvh;display:flex;align-items:center;position:relative;overflow:hidden;padding:clamp(120px,18vh,200px) clamp(24px,5vw,64px) 100px;}
.hero-inner{max-width:1280px;margin:0 auto;display:grid;grid-template-columns:1.1fr .9fr;gap:clamp(48px,7vw,100px);align-items:center;width:100%;}
@media(max-width:960px){.hero-inner{grid-template-columns:1fr;text-align:center;}}

/* Mesh background */
.mesh{position:absolute;inset:0;pointer-events:none;overflow:hidden;}
.mesh-orb{position:absolute;border-radius:50%;filter:blur(120px);pointer-events:none;animation:meshFloat 20s ease-in-out infinite alternate;will-change:transform;}
.mesh-1{width:1200px;height:900px;background:radial-gradient(ellipse,rgba(240,179,90,.14),transparent 65%);top:-400px;left:-300px;}
.mesh-2{width:1000px;height:800px;background:radial-gradient(ellipse,rgba(232,113,90,.10),transparent 65%);bottom:-300px;right:-250px;animation-delay:-7s;animation-duration:26s;}
.mesh-3{width:700px;height:600px;background:radial-gradient(ellipse,rgba(155,138,255,.07),transparent 65%);top:25%;left:35%;animation-delay:-12s;animation-duration:30s;}
.mesh-4{width:500px;height:400px;background:radial-gradient(ellipse,rgba(240,179,90,.06),transparent 70%);top:60%;left:15%;animation-delay:-5s;animation-duration:22s;}
.mesh-5{width:600px;height:500px;background:radial-gradient(ellipse,rgba(232,113,90,.05),transparent 70%);top:10%;right:10%;animation-delay:-15s;animation-duration:28s;}
@keyframes meshFloat{0%{transform:translate(0,0) scale(1)}50%{transform:translate(40px,30px) scale(1.08)}100%{transform:translate(-30px,-20px) scale(.95)}}
.grain{position:absolute;inset:0;pointer-events:none;opacity:.03;background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");background-size:200px;}
.dots{position:absolute;inset:0;pointer-events:none;background-image:radial-gradient(circle,rgba(245,240,235,.04) 1px,transparent 1px);background-size:28px 28px;mask-image:radial-gradient(ellipse 65% 55% at 50% 40%,black 20%,transparent 70%);-webkit-mask-image:radial-gradient(ellipse 65% 55% at 50% 40%,black 20%,transparent 70%);}

/* Hero spotlight behind headline */
.hero-spotlight{position:absolute;width:800px;height:400px;top:30%;left:20%;background:radial-gradient(ellipse,rgba(240,179,90,.12),transparent 60%);filter:blur(80px);pointer-events:none;animation:spotPulse 6s ease-in-out infinite;}
@keyframes spotPulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.7;transform:scale(1.05)}}
@media(max-width:960px){.hero-spotlight{left:50%;transform:translateX(-50%);top:20%;width:600px;height:300px;}}

.h-badge{display:inline-flex;align-items:center;gap:10px;padding:7px 20px;border-radius:999px;border:1px solid rgba(240,179,90,.22);background:rgba(240,179,90,.06);color:rgba(240,179,90,.90);font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;margin-bottom:32px;font-family:'JetBrains Mono',monospace;backdrop-filter:blur(12px);}
.h-badge-dot{width:7px;height:7px;border-radius:50%;background:#F0B35A;box-shadow:0 0 12px rgba(240,179,90,.70),0 0 24px rgba(240,179,90,.30);animation:dotPulse 2s ease-in-out infinite;}
@keyframes dotPulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.4;transform:scale(.8)}}

.h-h1{font-size:clamp(52px,8.5vw,100px);font-weight:900;letter-spacing:-.065em;line-height:.88;margin:0 0 32px;font-family:'Outfit',system-ui,sans-serif;}
.h-h1-l1{display:block;color:#F5F0EB;}
.h-h1-l2{display:block;background:linear-gradient(135deg,#F0B35A 0%,#E8715A 45%,#FF7A63 80%,#F0B35A 100%);background-size:200% 200%;-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;animation:gradShift 8s ease-in-out infinite;}
@keyframes gradShift{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}

.h-sub{font-size:clamp(16px,1.8vw,19px);color:rgba(245,240,235,.48);line-height:1.75;max-width:520px;margin:0 0 44px;font-weight:400;}
.h-sub strong{color:rgba(245,240,235,.80);font-weight:600;}
@media(max-width:960px){.h-sub{margin-left:auto;margin-right:auto;}}

.h-ctas{display:flex;gap:14px;flex-wrap:wrap;}
@media(max-width:960px){.h-ctas{justify-content:center;}}
.cta-primary{padding:18px 40px;border-radius:16px;background:linear-gradient(135deg,#F0B35A,#E8A040);border:none;color:#0F0D15;font-size:16px;font-weight:800;text-decoration:none;transition:all 280ms cubic-bezier(.16,1,.3,1);display:inline-flex;align-items:center;gap:8px;letter-spacing:-.01em;font-family:'Inter',system-ui,sans-serif;position:relative;overflow:hidden;}
.cta-primary::after{content:'';position:absolute;inset:0;background:linear-gradient(90deg,transparent 30%,rgba(255,255,255,.18) 50%,transparent 70%);transform:translateX(-120%);transition:none;}
.cta-primary:hover{transform:translateY(-3px);box-shadow:0 12px 48px rgba(240,179,90,.35),0 4px 16px rgba(240,179,90,.20),0 0 0 1px rgba(240,179,90,.15);}
.cta-primary:hover::after{transform:translateX(120%);transition:transform 600ms;}
.cta-secondary{padding:18px 36px;border-radius:16px;background:rgba(245,240,235,.04);border:1px solid rgba(245,240,235,.10);color:rgba(245,240,235,.60);font-size:16px;font-weight:600;text-decoration:none;transition:all 250ms;font-family:'Inter',system-ui,sans-serif;}
.cta-secondary:hover{background:rgba(245,240,235,.08);border-color:rgba(245,240,235,.20);color:#F5F0EB;transform:translateY(-2px);}

/* Demo card */
.demo-card{background:rgba(245,240,235,.025);border:1px solid rgba(245,240,235,.08);border-radius:24px;overflow:hidden;box-shadow:0 60px 140px rgba(0,0,0,.55),0 20px 40px rgba(0,0,0,.30),inset 0 1px 0 rgba(245,240,235,.06);transform:perspective(1400px) rotateY(-4deg) rotateX(2deg);animation:cardFloat 12s ease-in-out infinite;transition:transform 500ms cubic-bezier(.16,1,.3,1);}
.demo-card:hover{transform:perspective(1400px) rotateY(-1deg) rotateX(0deg) translateY(-8px);box-shadow:0 80px 160px rgba(0,0,0,.60),0 24px 48px rgba(0,0,0,.35),inset 0 1px 0 rgba(245,240,235,.08);}
@keyframes cardFloat{0%,100%{transform:perspective(1400px) rotateY(-4deg) rotateX(2deg) translateY(0)}50%{transform:perspective(1400px) rotateY(-4deg) rotateX(2deg) translateY(-12px)}}
@media(max-width:960px){.demo-card{transform:none;animation:none;}}
.demo-bar{display:flex;align-items:center;gap:7px;padding:14px 18px;border-bottom:1px solid rgba(245,240,235,.06);background:rgba(245,240,235,.02);}
.demo-dot{width:9px;height:9px;border-radius:50%;}
.demo-url{font-size:11px;font-weight:500;color:rgba(245,240,235,.22);font-family:'JetBrains Mono',monospace;margin-left:12px;padding:4px 12px;border-radius:8px;background:rgba(245,240,235,.03);border:1px solid rgba(245,240,235,.05);}
.demo-prompt{padding:24px;border-bottom:1px solid rgba(245,240,235,.05);}
.demo-prompt-label{font-size:10px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:rgba(240,179,90,.50);margin-bottom:12px;font-family:'JetBrains Mono',monospace;}
.demo-prompt-input{min-height:24px;font-size:15px;color:rgba(245,240,235,.72);font-family:'Inter',sans-serif;line-height:1.5;}
.demo-cursor{display:inline-block;width:2px;height:19px;background:rgba(240,179,90,.80);margin-left:2px;vertical-align:text-bottom;animation:cursorBlink 1s steps(1) infinite;}
@keyframes cursorBlink{0%,100%{opacity:1}50%{opacity:0}}
.demo-preview{padding:20px;position:relative;}
.demo-gen{display:flex;align-items:center;gap:8px;margin-bottom:14px;font-size:11px;font-weight:600;color:rgba(240,179,90,.55);font-family:'JetBrains Mono',monospace;}
.demo-gen-dot{width:5px;height:5px;border-radius:50%;background:rgba(240,179,90,.65);animation:genPulse 1.2s ease-in-out infinite;}
.demo-gen-dot:nth-child(2){animation-delay:.15s}.demo-gen-dot:nth-child(3){animation-delay:.3s}
@keyframes genPulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.3;transform:scale(.6)}}
.demo-mock{border-radius:14px;border:1px solid rgba(245,240,235,.06);overflow:hidden;background:rgba(0,0,0,.35);}
.demo-mock-nav{height:32px;background:rgba(245,240,235,.03);border-bottom:1px solid rgba(245,240,235,.05);display:flex;align-items:center;padding:0 12px;gap:16px;}
.demo-mock-logo{width:12px;height:12px;border-radius:3px;background:linear-gradient(135deg,rgba(240,179,90,.35),rgba(232,113,90,.25));}
.demo-mock-links{display:flex;gap:10px;}
.demo-mock-link{width:24px;height:3px;border-radius:2px;background:rgba(245,240,235,.09);}
.demo-mock-hero{height:90px;background:linear-gradient(135deg,rgba(240,179,90,.10),rgba(232,113,90,.07),rgba(155,138,255,.05));display:flex;flex-direction:column;align-items:center;justify-content:center;gap:7px;padding:14px;}
.demo-mock-hl{width:55%;height:6px;border-radius:3px;background:rgba(245,240,235,.20);}
.demo-mock-sl{width:35%;height:3px;border-radius:2px;background:rgba(245,240,235,.09);}
.demo-mock-btn{width:20%;height:10px;border-radius:5px;background:linear-gradient(135deg,rgba(240,179,90,.35),rgba(232,113,90,.22));margin-top:6px;}
.demo-mock-cards{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;padding:10px 12px 12px;}
.demo-mock-card{height:44px;border-radius:8px;background:rgba(245,240,235,.035);border:1px solid rgba(245,240,235,.045);}

/* Stats */
.stats-strip{display:grid;grid-template-columns:repeat(4,1fr);border:1px solid rgba(245,240,235,.08);border-radius:24px;overflow:hidden;background:rgba(245,240,235,.02);backdrop-filter:blur(12px);margin-top:72px;max-width:920px;margin-left:auto;margin-right:auto;}
.stat{display:flex;flex-direction:column;align-items:center;padding:32px clamp(16px,3vw,40px);border-right:1px solid rgba(245,240,235,.06);position:relative;}
.stat:last-child{border-right:none;}
.stat::after{content:'';position:absolute;bottom:0;left:50%;transform:translateX(-50%);width:60%;height:1px;background:linear-gradient(90deg,transparent,rgba(240,179,90,.12),transparent);}
.stat-num{font-size:clamp(28px,3.5vw,40px);font-weight:900;letter-spacing:-.04em;background:linear-gradient(135deg,#F0B35A,#E8715A);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;font-family:'Outfit',system-ui,sans-serif;}
.stat-label{font-size:11px;font-weight:600;color:rgba(245,240,235,.30);letter-spacing:.08em;text-transform:uppercase;margin-top:6px;}
@media(max-width:640px){.stats-strip{grid-template-columns:1fr 1fr;}.stat{padding:20px 16px;}.stat:nth-child(2){border-right:none;}.stat:nth-child(1),.stat:nth-child(2){border-bottom:1px solid rgba(245,240,235,.06);}}

/* ═══ DIVIDER ═══ */
.glow-divider{height:1px;margin:0 auto;max-width:90%;background:linear-gradient(90deg,transparent 5%,rgba(240,179,90,.18) 30%,rgba(232,113,90,.14) 50%,rgba(155,138,255,.10) 70%,transparent 95%);position:relative;}
.glow-divider::after{content:'';position:absolute;left:50%;top:-20px;transform:translateX(-50%);width:400px;height:40px;background:radial-gradient(ellipse,rgba(240,179,90,.06),transparent 70%);pointer-events:none;}

/* ═══ TRUST STRIP ═══ */
.trust{padding:72px 0;overflow:hidden;position:relative;}
.trust-label{text-align:center;font-size:11px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:rgba(245,240,235,.20);margin-bottom:32px;font-family:'JetBrains Mono',monospace;}
.trust-track{display:flex;gap:20px;animation:marquee 40s linear infinite;width:max-content;align-items:center;}
.trust-item{font-size:14px;font-weight:700;color:rgba(245,240,235,.18);white-space:nowrap;letter-spacing:-.01em;padding:10px 24px;border-radius:12px;border:1px solid rgba(245,240,235,.04);background:rgba(245,240,235,.015);transition:all 300ms;font-family:'Inter',system-ui,sans-serif;}
.trust-item:hover{color:rgba(245,240,235,.35);border-color:rgba(245,240,235,.08);background:rgba(245,240,235,.03);}
@keyframes marquee{to{transform:translateX(-50%)}}
.trust::before,.trust::after{content:'';position:absolute;top:0;bottom:0;width:160px;z-index:2;pointer-events:none;}
.trust::before{left:0;background:linear-gradient(90deg,#08070B,transparent)}
.trust::after{right:0;background:linear-gradient(270deg,#08070B,transparent)}

/* ═══ SECTIONS ═══ */
.sec{padding:clamp(100px,14vw,180px) clamp(24px,5vw,64px);position:relative;}
.sec--alt{background:rgba(245,240,235,.012);border-top:1px solid rgba(245,240,235,.05);border-bottom:1px solid rgba(245,240,235,.05);}
.sec-inner{max-width:1200px;margin:0 auto;}
.sec-label{font-size:11px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:rgba(240,179,90,.60);margin-bottom:16px;font-family:'JetBrains Mono',monospace;}
.sec-h2{font-size:clamp(38px,5.5vw,68px);font-weight:900;letter-spacing:-.055em;line-height:1;margin:0 0 20px;font-family:'Outfit',system-ui,sans-serif;}
.sec-body{font-size:17px;color:rgba(245,240,235,.45);line-height:1.8;max-width:580px;margin:0 0 64px;}

/* ═══ HOW IT WORKS — LOOP STEPS ═══ */
.loop{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;}
@media(max-width:960px){.loop{grid-template-columns:repeat(3,1fr)}}
@media(max-width:640px){.loop{grid-template-columns:repeat(2,1fr)}}
.loop-step{position:relative;padding:32px 24px 28px;border-radius:20px;border:1px solid rgba(245,240,235,.06);background:rgba(245,240,235,.02);text-align:left;transition:all 500ms cubic-bezier(.16,1,.3,1);cursor:default;overflow:hidden;}
.loop-step::before{content:'';position:absolute;inset:0;border-radius:20px;opacity:0;transition:opacity 500ms;background:radial-gradient(circle at 50% 0%,rgba(240,179,90,.08),transparent 65%);}
.loop-step.active{border-color:rgba(240,179,90,.30);background:rgba(240,179,90,.04);box-shadow:0 0 60px rgba(240,179,90,.06),0 20px 40px rgba(0,0,0,.15);}
.loop-step.active::before{opacity:1;}
.loop-step.active .loop-num{color:#F0B35A;border-color:rgba(240,179,90,.45);background:rgba(240,179,90,.12);box-shadow:0 0 20px rgba(240,179,90,.15);}
.loop-step.active .loop-label{color:#F0B35A;}
.loop-num{width:36px;height:36px;border-radius:12px;border:1px solid rgba(245,240,235,.10);background:rgba(245,240,235,.03);display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:800;color:rgba(245,240,235,.30);margin-bottom:16px;font-family:'JetBrains Mono',monospace;transition:all 500ms cubic-bezier(.16,1,.3,1);}
.loop-label{font-size:15px;font-weight:700;letter-spacing:-.01em;margin-bottom:8px;color:rgba(245,240,235,.78);transition:color 500ms;font-family:'Outfit',system-ui,sans-serif;}
.loop-desc{font-size:13px;color:rgba(245,240,235,.35);line-height:1.65;}

/* Self-heal card */
.heal{border:1px solid rgba(232,113,90,.18);background:linear-gradient(135deg,rgba(232,113,90,.04),rgba(240,179,90,.025));border-radius:28px;padding:60px 64px;display:grid;grid-template-columns:1fr 1fr;gap:64px;align-items:center;margin-top:72px;position:relative;overflow:hidden;}
.heal::before{content:'';position:absolute;width:500px;height:500px;border-radius:50%;background:radial-gradient(circle,rgba(240,179,90,.08),transparent 65%);top:-200px;right:-150px;pointer-events:none;}
.heal::after{content:'';position:absolute;width:300px;height:300px;border-radius:50%;background:radial-gradient(circle,rgba(232,113,90,.05),transparent 70%);bottom:-100px;left:-80px;pointer-events:none;}
@media(max-width:768px){.heal{grid-template-columns:1fr;gap:32px;padding:36px 28px;}}
.heal-title{font-size:clamp(28px,3.8vw,44px);font-weight:900;letter-spacing:-.045em;margin-bottom:18px;line-height:1.05;font-family:'Outfit',system-ui,sans-serif;}
.heal-body{font-size:15px;color:rgba(245,240,235,.45);line-height:1.8;}
.heal-steps{display:flex;flex-direction:column;gap:24px;}
.heal-step{display:flex;align-items:flex-start;gap:18px;}
.heal-step-num{width:40px;height:40px;border-radius:14px;border:1px solid rgba(240,179,90,.24);background:rgba(240,179,90,.07);color:rgba(240,179,90,.90);font-size:13px;font-weight:800;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-family:'JetBrains Mono',monospace;box-shadow:0 0 24px rgba(240,179,90,.08);}
.heal-step-text{font-size:14.5px;color:rgba(245,240,235,.52);line-height:1.65;padding-top:9px;}
.heal-step-text strong{color:rgba(245,240,235,.88);font-weight:600;}

/* ═══ CODE SECTION ═══ */
.code-split{display:grid;grid-template-columns:1fr 1.1fr;gap:72px;align-items:center;}
@media(max-width:768px){.code-split{grid-template-columns:1fr;gap:48px;}}
.code-box{border:1px solid rgba(245,240,235,.08);background:linear-gradient(180deg,rgba(245,240,235,.03),rgba(0,0,0,.35));border-radius:22px;overflow:hidden;box-shadow:0 48px 100px rgba(0,0,0,.55),0 16px 32px rgba(0,0,0,.30);position:relative;}
.code-box::before{content:'';position:absolute;inset:-1px;border-radius:22px;padding:1px;background:linear-gradient(180deg,rgba(245,240,235,.10),rgba(245,240,235,.03));-webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;mask-composite:exclude;pointer-events:none;}
.code-bar{display:flex;align-items:center;gap:8px;padding:16px 20px;border-bottom:1px solid rgba(245,240,235,.06);background:rgba(245,240,235,.02);}
.code-dot{width:10px;height:10px;border-radius:50%;}
.code-fname{font-size:12px;font-weight:600;color:rgba(245,240,235,.28);font-family:'JetBrains Mono',monospace;margin-left:10px;}
.code-body{padding:28px;font-family:'JetBrains Mono',monospace;font-size:12.5px;line-height:2.1;color:rgba(245,240,235,.58);white-space:pre;overflow-x:auto;}
.code-body .kw{color:rgba(155,138,255,.88);}
.code-body .fn{color:rgba(240,179,90,.85);}
.code-body .str{color:rgba(74,222,128,.78);}
.code-body .cm{color:rgba(245,240,235,.22);}
.code-body .tp{color:rgba(232,113,90,.75);}
.code-features{display:flex;flex-direction:column;gap:20px;margin-top:40px;}
.code-feat{display:flex;align-items:center;gap:14px;font-size:15px;color:rgba(245,240,235,.55);line-height:1.5;}
.code-feat-dot{width:8px;height:8px;border-radius:50%;background:linear-gradient(135deg,#F0B35A,#E8715A);flex-shrink:0;box-shadow:0 0 12px rgba(240,179,90,.30);}

/* ═══ AGENTS ═══ */
.agents{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;}
@media(max-width:960px){.agents{grid-template-columns:repeat(2,1fr)}}
@media(max-width:520px){.agents{grid-template-columns:1fr;}}
.agent{padding:32px 26px;border-radius:22px;border:1px solid rgba(245,240,235,.06);background:rgba(245,240,235,.02);transition:all 350ms cubic-bezier(.16,1,.3,1);position:relative;overflow:hidden;}
.agent::before{content:'';position:absolute;top:0;left:50%;transform:translateX(-50%);width:200px;height:120px;border-radius:50%;opacity:0;transition:opacity 350ms;pointer-events:none;}
.agent:hover{border-color:rgba(240,179,90,.22);background:rgba(240,179,90,.03);transform:translateY(-6px);box-shadow:0 24px 60px rgba(0,0,0,.30),0 0 0 1px rgba(240,179,90,.08);}
.agent:hover::before{opacity:1;}
.agent-icon{width:44px;height:44px;border-radius:14px;display:flex;align-items:center;justify-content:center;font-size:15px;font-weight:800;margin-bottom:18px;font-family:'JetBrains Mono',monospace;position:relative;transition:all 350ms;}
.agent:hover .agent-icon{box-shadow:0 0 28px var(--agent-glow,rgba(240,179,90,.20));}
.agent-name{font-size:16px;font-weight:700;margin-bottom:10px;letter-spacing:-.01em;font-family:'Outfit',system-ui,sans-serif;}
.agent-desc{font-size:13.5px;color:rgba(245,240,235,.42);line-height:1.7;margin-bottom:16px;}
.agent-meta{display:flex;gap:12px;align-items:center;}
.agent-cost{font-size:11px;font-weight:700;color:rgba(240,179,90,.75);font-family:'JetBrains Mono',monospace;padding:4px 12px;border-radius:8px;background:rgba(240,179,90,.07);border:1px solid rgba(240,179,90,.14);}
.agent-plan{font-size:10px;font-weight:600;color:rgba(245,240,235,.28);letter-spacing:.08em;text-transform:uppercase;}

/* ═══ PRICING ═══ */
.plans{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;}
@media(max-width:960px){.plans{grid-template-columns:1fr 1fr;}}
@media(max-width:520px){.plans{grid-template-columns:1fr;}}
.plan{padding:32px 26px;border-radius:24px;border:1px solid rgba(245,240,235,.06);background:rgba(245,240,235,.02);transition:all 350ms cubic-bezier(.16,1,.3,1);text-align:center;position:relative;overflow:hidden;}
.plan:hover{border-color:rgba(245,240,235,.14);transform:translateY(-4px);box-shadow:0 20px 50px rgba(0,0,0,.25);}
.plan--pro{border-color:rgba(240,179,90,.28);background:linear-gradient(180deg,rgba(240,179,90,.05),rgba(232,113,90,.02));box-shadow:0 0 80px rgba(240,179,90,.06);}
.plan--pro::before{content:'';position:absolute;top:-80px;left:50%;transform:translateX(-50%);width:300px;height:200px;background:radial-gradient(ellipse,rgba(240,179,90,.10),transparent 70%);pointer-events:none;}
.plan--pro:hover{border-color:rgba(240,179,90,.45);box-shadow:0 0 100px rgba(240,179,90,.12),0 20px 50px rgba(0,0,0,.25);transform:translateY(-6px);}
.plan-badge{font-size:10px;font-weight:800;letter-spacing:.10em;text-transform:uppercase;color:#0F0D15;background:linear-gradient(135deg,#F0B35A,#E8A040);padding:4px 14px;border-radius:999px;display:inline-block;margin-bottom:16px;font-family:'JetBrains Mono',monospace;}
.plan-name{font-size:11px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:rgba(245,240,235,.38);margin-bottom:14px;font-family:'JetBrains Mono',monospace;}
.plan--pro .plan-name{color:rgba(240,179,90,.75);}
.plan-price{font-size:48px;font-weight:900;letter-spacing:-.05em;margin-bottom:4px;font-family:'Outfit',system-ui,sans-serif;}
.plan--pro .plan-price{background:linear-gradient(135deg,#F0B35A,#E8715A);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;}
.plan-period{font-size:13px;color:rgba(245,240,235,.28);margin-bottom:20px;}
.plan-detail{font-size:13px;color:rgba(245,240,235,.40);line-height:1.6;margin-bottom:4px;}
.plan-cta{display:block;width:100%;padding:14px;border-radius:14px;border:1px solid rgba(245,240,235,.10);background:rgba(245,240,235,.04);color:rgba(245,240,235,.65);font-size:14px;font-weight:700;text-decoration:none;margin-top:22px;transition:all 250ms;text-align:center;font-family:'Inter',system-ui,sans-serif;}
.plan-cta:hover{background:rgba(245,240,235,.08);color:#F5F0EB;border-color:rgba(245,240,235,.22);transform:translateY(-1px);}
.plan--pro .plan-cta{background:linear-gradient(135deg,#F0B35A,#E8A040);border:none;color:#0F0D15;font-weight:800;position:relative;overflow:hidden;}
.plan--pro .plan-cta::after{content:'';position:absolute;inset:0;background:linear-gradient(90deg,transparent 30%,rgba(255,255,255,.15) 50%,transparent 70%);transform:translateX(-120%);}
.plan--pro .plan-cta:hover{box-shadow:0 8px 32px rgba(240,179,90,.35);}
.plan--pro .plan-cta:hover::after{transform:translateX(120%);transition:transform 500ms;}

/* ═══ TESTIMONIALS ═══ */
.testi{display:grid;grid-template-columns:repeat(3,1fr);gap:18px;}
@media(max-width:768px){.testi{grid-template-columns:1fr;}}
.testi-card{padding:32px;border-radius:24px;border:1px solid rgba(245,240,235,.07);background:rgba(245,240,235,.025);transition:all 350ms cubic-bezier(.16,1,.3,1);position:relative;}
.testi-card::before{content:'';position:absolute;top:0;left:32px;right:32px;height:2px;border-radius:1px;background:linear-gradient(90deg,transparent,rgba(240,179,90,.25),transparent);opacity:0;transition:opacity 350ms;}
.testi-card:hover{border-color:rgba(245,240,235,.13);transform:translateY(-4px);box-shadow:0 24px 60px rgba(0,0,0,.25);}
.testi-card:hover::before{opacity:1;}
.testi-stars{display:flex;gap:3px;margin-bottom:18px;}
.testi-star{color:rgba(240,179,90,.80);font-size:14px;}
.testi-text{font-size:15px;color:rgba(245,240,235,.58);line-height:1.78;margin-bottom:24px;}
.testi-author{display:flex;align-items:center;gap:14px;}
.testi-avatar{width:42px;height:42px;border-radius:14px;background:linear-gradient(135deg,rgba(240,179,90,.20),rgba(232,113,90,.14));display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:800;color:rgba(240,179,90,.90);font-family:'Outfit',system-ui,sans-serif;border:1px solid rgba(240,179,90,.15);}
.testi-name{font-size:14px;font-weight:700;letter-spacing:-.01em;}
.testi-role{font-size:12px;color:rgba(245,240,235,.32);margin-top:3px;}

/* ═══ FAQ ACCORDION ═══ */
.faq-list{display:flex;flex-direction:column;gap:8px;max-width:800px;margin:0 auto;}
.faq-item{border-radius:18px;border:1px solid rgba(245,240,235,.06);background:rgba(245,240,235,.02);overflow:hidden;transition:all 300ms;}
.faq-item:hover{border-color:rgba(245,240,235,.10);}
.faq-item--open{border-color:rgba(240,179,90,.18);background:rgba(240,179,90,.02);}
.faq-q{display:flex;align-items:center;justify-content:space-between;padding:22px 28px;cursor:pointer;font-size:15px;font-weight:700;letter-spacing:-.01em;font-family:'Outfit',system-ui,sans-serif;color:rgba(245,240,235,.80);transition:color 200ms;-webkit-user-select:none;user-select:none;}
.faq-item--open .faq-q{color:#F0B35A;}
.faq-q:hover{color:rgba(245,240,235,.95);}
.faq-icon{width:28px;height:28px;border-radius:8px;background:rgba(245,240,235,.04);border:1px solid rgba(245,240,235,.08);display:flex;align-items:center;justify-content:center;font-size:16px;color:rgba(245,240,235,.40);transition:all 300ms;flex-shrink:0;}
.faq-item--open .faq-icon{background:rgba(240,179,90,.10);border-color:rgba(240,179,90,.25);color:#F0B35A;transform:rotate(45deg);}
.faq-a{overflow:hidden;transition:max-height 400ms cubic-bezier(.16,1,.3,1),opacity 300ms;max-height:0;opacity:0;}
.faq-a--open{max-height:300px;opacity:1;}
.faq-a-inner{padding:0 28px 24px;font-size:14px;color:rgba(245,240,235,.45);line-height:1.8;}

/* ═══ FINAL CTA ═══ */
.final-cta{text-align:center;padding:clamp(100px,14vw,160px) clamp(24px,5vw,64px);position:relative;overflow:hidden;}
.final-cta-mesh{position:absolute;inset:0;pointer-events:none;}
.final-cta-orb{position:absolute;border-radius:50%;filter:blur(100px);pointer-events:none;}
.final-cta-orb-1{width:600px;height:400px;background:radial-gradient(ellipse,rgba(240,179,90,.10),transparent 65%);top:-100px;left:30%;animation:meshFloat 20s ease-in-out infinite alternate;}
.final-cta-orb-2{width:500px;height:350px;background:radial-gradient(ellipse,rgba(232,113,90,.07),transparent 65%);bottom:-50px;right:25%;animation:meshFloat 24s ease-in-out infinite alternate-reverse;}
.final-h2{font-size:clamp(40px,6.5vw,80px);font-weight:900;letter-spacing:-.06em;line-height:.95;margin:0 0 20px;font-family:'Outfit',system-ui,sans-serif;position:relative;}
.final-sub{font-size:18px;color:rgba(245,240,235,.42);margin:0 auto 44px;max-width:520px;line-height:1.7;position:relative;}
.final-btn{display:inline-flex;align-items:center;gap:10px;padding:20px 52px;border-radius:18px;background:linear-gradient(135deg,#F0B35A,#E8A040);border:none;color:#0F0D15;font-size:17px;font-weight:800;text-decoration:none;transition:all 280ms cubic-bezier(.16,1,.3,1);font-family:'Inter',system-ui,sans-serif;position:relative;overflow:hidden;}
.final-btn::after{content:'';position:absolute;inset:0;background:linear-gradient(90deg,transparent 30%,rgba(255,255,255,.18) 50%,transparent 70%);transform:translateX(-120%);transition:none;}
.final-btn:hover{transform:translateY(-4px);box-shadow:0 16px 56px rgba(240,179,90,.35),0 4px 16px rgba(240,179,90,.20);}
.final-btn:hover::after{transform:translateX(120%);transition:transform 600ms;}
      `}</style>

      <SiteNav />

      {/* ═══════ HERO ═══════ */}
      <section className="hero">
        <div className="mesh">
          <div className="mesh-orb mesh-1" />
          <div className="mesh-orb mesh-2" />
          <div className="mesh-orb mesh-3" />
          <div className="mesh-orb mesh-4" />
          <div className="mesh-orb mesh-5" />
          <div className="hero-spotlight" />
          <div className="dots" />
          <div className="grain" />
        </div>

        <div className="hero-inner">
          <div>
            <div className={hf(1)}><div className="h-badge"><span className="h-badge-dot" /> NOW IN PUBLIC BETA</div></div>
            <h1 className={`h-h1 ${hf(2)}`}>
              <span className="h-h1-l1">Describe it.</span>
              <span className="h-h1-l2">We build it.</span>
            </h1>
            <p className={`h-sub ${hf(3)}`}>
              The world&apos;s first <strong>agentic AI website builder</strong>. Tell us about your business in plain English — get a production-ready, fully-responsive site in under <strong>30 seconds</strong>.
            </p>
            <div className={`h-ctas ${hf(4)}`}>
              <Link href="/build" className="cta-primary">Start building free <span style={{ fontSize: 18 }}>&rarr;</span></Link>
              <Link href="/gallery" className="cta-secondary">See examples</Link>
            </div>
          </div>

          <div className={hf(5)}>
            <div className="demo-card">
              <div className="demo-bar">
                <div className="demo-dot" style={{ background: "#FF5F57" }} />
                <div className="demo-dot" style={{ background: "#FEBC2E" }} />
                <div className="demo-dot" style={{ background: "#28C840" }} />
                <span className="demo-url">dominat8.io/build</span>
              </div>
              <div className="demo-prompt">
                <div className="demo-prompt-label">Your prompt</div>
                <div className="demo-prompt-input">{typedText}<span className="demo-cursor" /></div>
              </div>
              <div className="demo-preview">
                <div className="demo-gen"><span className="demo-gen-dot" /><span className="demo-gen-dot" /><span className="demo-gen-dot" /> Generating&hellip;</div>
                <div className="demo-mock">
                  <div className="demo-mock-nav">
                    <div className="demo-mock-logo" />
                    <div className="demo-mock-links"><div className="demo-mock-link" /><div className="demo-mock-link" /><div className="demo-mock-link" /></div>
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

        <div className="stats-strip rv">
          {[
            { num: "50,000+", label: "Sites generated" },
            { num: "< 30s", label: "Average build" },
            { num: "180+", label: "Countries" },
            { num: "4.9/5", label: "Satisfaction" },
          ].map((s, i) => (
            <div key={i} className="stat">
              <div className="stat-num">{s.num}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════ TRUST STRIP ═══════ */}
      <div className="glow-divider" />
      <div className="trust">
        <div className="trust-label">Trusted by teams at</div>
        <div className="trust-track">
          {[...TRUST_LOGOS, ...TRUST_LOGOS].map((name, i) => (
            <span key={i} className="trust-item">{name}</span>
          ))}
        </div>
      </div>
      <div className="glow-divider" />

      {/* ═══════ HOW IT WORKS ═══════ */}
      <section className="sec">
        <div className="sec-inner">
          <div className="rv">
            <div className="sec-label">How it works</div>
            <h2 className="sec-h2">Six steps. Zero friction.</h2>
            <p className="sec-body">Our agentic loop doesn&apos;t just generate — it reasons, builds, detects errors, self-heals, audits, and ships. Every site comes out clean.</p>
          </div>

          <div className="loop rv rv-d1">
            {LOOP_STEPS.map((step, i) => (
              <div key={step.id} className={`loop-step${activeStep === i ? " active" : ""}`}>
                <div className="loop-num">{step.num}</div>
                <div className="loop-label">{step.label}</div>
                <div className="loop-desc">{step.desc}</div>
              </div>
            ))}
          </div>

          <div className="heal rv rv-d2">
            <div>
              <div className="heal-title">Self-healing architecture.</div>
              <p className="heal-body">Other builders ship broken code. Ours detects rendering failures, accessibility violations, and layout bugs — then rewrites the code to fix them before you ever see the output.</p>
            </div>
            <div className="heal-steps">
              {[
                { n: "1", text: "<strong>Render check</strong> — headless browser validates every page loads without errors" },
                { n: "2", text: "<strong>Layout scan</strong> — checks responsive breakpoints at 320, 768, 1440px" },
                { n: "3", text: "<strong>Auto-patch</strong> — rewrites failing CSS/HTML and re-validates until clean" },
              ].map(s => (
                <div key={s.n} className="heal-step">
                  <div className="heal-step-num">{s.n}</div>
                  <div className="heal-step-text" dangerouslySetInnerHTML={{ __html: s.text }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ CODE EXPORT ═══════ */}
      <div className="glow-divider" />
      <section className="sec sec--alt">
        <div className="sec-inner">
          <div className="code-split">
            <div className="rv">
              <div className="sec-label">Your code</div>
              <h2 className="sec-h2">Clean React + TypeScript. Yours to keep.</h2>
              <p className="sec-body">Every generated site is fully ownable — download the source, host it anywhere, modify anything. No lock-in.</p>
              <div className="code-features">
                {[
                  "React 18 + TypeScript — no jQuery, no junk",
                  "Responsive from day one — tested at every breakpoint",
                  "SEO metadata, OG tags, structured data included",
                  "One-click deploy to Dominat8 CDN or export",
                ].map(f => (
                  <div key={f} className="code-feat"><span className="code-feat-dot" />{f}</div>
                ))}
              </div>
            </div>
            <div className="rv rv-d2">
              <div className="code-box">
                <div className="code-bar">
                  <div className="code-dot" style={{ background: "#FF5F57" }} />
                  <div className="code-dot" style={{ background: "#FEBC2E" }} />
                  <div className="code-dot" style={{ background: "#28C840" }} />
                  <span className="code-fname">HeroSection.tsx</span>
                </div>
                <div className="code-body" dangerouslySetInnerHTML={{ __html: `<span class="kw">import</span> { <span class="fn">Button</span> } <span class="kw">from</span> <span class="str">"@/ui"</span>;\n\n<span class="kw">export default</span> <span class="kw">function</span> <span class="fn">Hero</span>() {\n  <span class="kw">return</span> (\n    <span class="tp">&lt;section</span> className=<span class="str">"hero"</span><span class="tp">&gt;</span>\n      <span class="tp">&lt;h1</span> className=<span class="str">"text-6xl font-black"</span><span class="tp">&gt;</span>\n        Your Business Name\n      <span class="tp">&lt;/h1&gt;</span>\n      <span class="tp">&lt;p</span> className=<span class="str">"text-xl opacity-60"</span><span class="tp">&gt;</span>\n        Built in 30 seconds with AI\n      <span class="tp">&lt;/p&gt;</span>\n      <span class="tp">&lt;Button</span> size=<span class="str">"lg"</span> variant=<span class="str">"primary"</span><span class="tp">&gt;</span>\n        Get Started\n      <span class="tp">&lt;/Button&gt;</span>\n    <span class="tp">&lt;/section&gt;</span>\n  );\n}` }} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ SPECIALIST AGENTS ═══════ */}
      <div className="glow-divider" />
      <section className="sec">
        <div className="sec-inner">
          <div className="rv">
            <div className="sec-label">Specialist agents</div>
            <h2 className="sec-h2">6 agents. Every angle covered.</h2>
            <p className="sec-body">After generation, run specialist AI agents that audit SEO, accessibility, performance, responsive layout, links, and design — then fix what they find.</p>
          </div>
          <div className="agents rv rv-d1">
            {AGENTS.map(a => (
              <div key={a.name} className="agent" style={{ "--agent-glow": `${a.color}33` } as React.CSSProperties}>
                <div className="agent-icon" style={{ background: `linear-gradient(135deg,${a.color}1A,${a.color}0D)`, border: `1px solid ${a.color}2E`, color: `${a.color}DD` }}>
                  {a.icon}
                </div>
                <div className="agent-name">{a.name}</div>
                <div className="agent-desc">{a.desc}</div>
                <div className="agent-meta">
                  <span className="agent-cost">{a.cost}</span>
                  <span className="agent-plan">{a.plan} plan</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ PRICING ═══════ */}
      <div className="glow-divider" />
      <section className="sec sec--alt">
        <div className="sec-inner">
          <div className="rv" style={{ textAlign: "center", maxWidth: 640, margin: "0 auto 56px" }}>
            <div className="sec-label" style={{ textAlign: "center" }}>Pricing</div>
            <h2 className="sec-h2" style={{ textAlign: "center" }}>Simple, honest pricing.</h2>
            <p className="sec-body" style={{ textAlign: "center", margin: "0 auto" }}>Start free. Upgrade when you&apos;re ready. No hidden fees, ever.</p>
          </div>
          <div className="plans rv rv-d1">
            {PLANS.map(p => (
              <div key={p.name} className={`plan${p.highlight ? " plan--pro" : ""}`}>
                {p.highlight && <div className="plan-badge">Most Popular</div>}
                <div className="plan-name">{p.name}</div>
                <div className="plan-price">{p.price}</div>
                <div className="plan-period">{p.period || "forever"}</div>
                <div className="plan-detail">{p.gens} AI generations</div>
                <div className="plan-detail">{p.credits} agent credits</div>
                <Link href={p.href} className="plan-cta">{p.cta}</Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ TESTIMONIALS ═══════ */}
      <div className="glow-divider" />
      <section className="sec">
        <div className="sec-inner">
          <div className="rv" style={{ textAlign: "center", maxWidth: 640, margin: "0 auto 56px" }}>
            <div className="sec-label" style={{ textAlign: "center" }}>Testimonials</div>
            <h2 className="sec-h2" style={{ textAlign: "center" }}>Loved by builders.</h2>
          </div>
          <div className="testi rv rv-d1">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="testi-card">
                <div className="testi-stars">
                  {Array.from({ length: t.stars }).map((_, j) => (
                    <span key={j} className="testi-star">&#9733;</span>
                  ))}
                </div>
                <div className="testi-text">&ldquo;{t.text}&rdquo;</div>
                <div className="testi-author">
                  <div className="testi-avatar">{t.avatar}</div>
                  <div>
                    <div className="testi-name">{t.name}</div>
                    <div className="testi-role">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ FAQ ═══════ */}
      <div className="glow-divider" />
      <section className="sec sec--alt">
        <div className="sec-inner">
          <div className="rv" style={{ textAlign: "center", maxWidth: 640, margin: "0 auto 56px" }}>
            <div className="sec-label" style={{ textAlign: "center" }}>FAQ</div>
            <h2 className="sec-h2" style={{ textAlign: "center" }}>Questions? Answered.</h2>
          </div>
          <div className="faq-list rv rv-d1">
            {FAQ_DATA.map((faq, i) => (
              <div key={i} className={`faq-item${openFaq === i ? " faq-item--open" : ""}`}>
                <div className="faq-q" onClick={() => toggleFaq(i)}>
                  <span>{faq.q}</span>
                  <span className="faq-icon">+</span>
                </div>
                <div className={`faq-a${openFaq === i ? " faq-a--open" : ""}`}>
                  <div className="faq-a-inner">{faq.a}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ FINAL CTA ═══════ */}
      <div className="final-cta rv">
        <div className="final-cta-mesh">
          <div className="final-cta-orb final-cta-orb-1" />
          <div className="final-cta-orb final-cta-orb-2" />
        </div>
        <h2 className="final-h2">Ready to build?</h2>
        <p className="final-sub">Your first 3 sites are free. No credit card required. Describe your business and watch it appear.</p>
        <Link href="/build" className="final-btn">Start building free <span style={{ fontSize: 20 }}>&rarr;</span></Link>
      </div>

      <SiteFooter />
    </>
  );
}
