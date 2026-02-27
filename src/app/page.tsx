"use client";

import React, { useEffect, useState, useRef } from "react";
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
  { id: "prompt", icon: "01", label: "Prompt", desc: "Describe your business in plain English" },
  { id: "reason", icon: "02", label: "Reason", desc: "Claude plans architecture, content & layout" },
  { id: "build", icon: "03", label: "Build", desc: "Full site generated in under 60 seconds" },
  { id: "heal", icon: "04", label: "Self-Heal", desc: "Loop detects bugs & fixes automatically" },
  { id: "audit", icon: "05", label: "Audit", desc: "6 specialist agents sweep for issues" },
  { id: "ship", icon: "06", label: "Ship", desc: "Deploy-ready React + TypeScript exported" },
];

const AGENTS = [
  { icon: "S", name: "SEO Sweep", desc: "Title, meta, OG tags, structured data — full technical SEO audit.", cost: "1 cr", plan: "free" },
  { icon: "R", name: "Responsive Audit", desc: "Tests at 320 / 768 / 1440px. Catches and fixes every layout break.", cost: "1 cr", plan: "free" },
  { icon: "L", name: "Link Scanner", desc: "Validates every CTA, anchor, and button. Zero dead links shipped.", cost: "1 cr", plan: "starter" },
  { icon: "A", name: "Accessibility", desc: "WCAG 2.1 AA — alt text, ARIA roles, contrast ratios, keyboard nav.", cost: "2 cr", plan: "starter" },
  { icon: "P", name: "Performance", desc: "Core Web Vitals audit — LCP, CLS, FID risks identified & explained.", cost: "2 cr", plan: "starter" },
  { icon: "D", name: "Design Fixer", desc: "AI rewrites HTML/CSS to fix contrast, spacing, and typography issues.", cost: "5 cr", plan: "pro" },
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
      { threshold: 0.1 }
    );
    document.querySelectorAll(".rv").forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, [mounted]);

  const hf = (d: number) => `hf hf-d${d}${mounted ? " m" : ""}`;

  return (
    <>
      <style>{`
.rv{opacity:0;transform:translateY(40px);transition:opacity 800ms cubic-bezier(.22,1,.36,1),transform 800ms cubic-bezier(.22,1,.36,1);}
.rv.visible{opacity:1;transform:translateY(0);}
.rv-d1{transition-delay:100ms}.rv-d2{transition-delay:200ms}.rv-d3{transition-delay:300ms}
.rv-d4{transition-delay:400ms}.rv-d5{transition-delay:500ms}
.hf{opacity:0;transform:translateY(20px);transition:opacity 600ms cubic-bezier(.22,1,.36,1),transform 600ms cubic-bezier(.22,1,.36,1);}
.hf.m{opacity:1;transform:translateY(0);}
.hf-d1{transition-delay:120ms}.hf-d2{transition-delay:260ms}.hf-d3{transition-delay:400ms}.hf-d4{transition-delay:560ms}.hf-d5{transition-delay:720ms}

.mesh{position:absolute;inset:0;pointer-events:none;overflow:hidden;}
.mesh-orb{position:absolute;border-radius:50%;filter:blur(140px);pointer-events:none;animation:meshFloat 20s ease-in-out infinite alternate;}
.mesh-1{width:1000px;height:700px;background:radial-gradient(ellipse,rgba(240,179,90,.09),transparent 70%);top:-300px;left:-200px;}
.mesh-2{width:800px;height:600px;background:radial-gradient(ellipse,rgba(232,113,90,.06),transparent 70%);bottom:-200px;right:-200px;animation-delay:-7s;animation-duration:25s;}
.mesh-3{width:600px;height:500px;background:radial-gradient(ellipse,rgba(155,138,255,.04),transparent 70%);top:30%;left:40%;animation-delay:-12s;animation-duration:30s;}
@keyframes meshFloat{0%{transform:translate(0,0) scale(1)}50%{transform:translate(40px,30px) scale(1.08)}100%{transform:translate(-30px,-20px) scale(.95)}}
.grain{position:absolute;inset:0;pointer-events:none;opacity:.025;background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");background-size:200px;}
.dots{position:absolute;inset:0;pointer-events:none;background-image:radial-gradient(circle,rgba(245,240,235,.03) 1px,transparent 1px);background-size:32px 32px;mask-image:radial-gradient(ellipse 60% 50% at 50% 40%,black 20%,transparent 70%);-webkit-mask-image:radial-gradient(ellipse 60% 50% at 50% 40%,black 20%,transparent 70%);}

.hero{min-height:100dvh;display:flex;align-items:center;position:relative;overflow:hidden;padding:clamp(100px,16vh,160px) clamp(20px,5vw,64px) 80px;}
.hero-inner{max-width:1200px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:clamp(40px,6vw,80px);align-items:center;width:100%;}
@media(max-width:900px){.hero-inner{grid-template-columns:1fr;text-align:center;}}

.h-badge{display:inline-flex;align-items:center;gap:9px;padding:6px 18px;border-radius:999px;border:1px solid rgba(240,179,90,.20);background:rgba(240,179,90,.06);color:rgba(240,179,90,.85);font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;margin-bottom:28px;font-family:'JetBrains Mono',monospace;}
.h-badge-dot{width:6px;height:6px;border-radius:50%;background:#F0B35A;box-shadow:0 0 10px rgba(240,179,90,.60);animation:dotPulse 2s ease-in-out infinite;}
@keyframes dotPulse{0%,100%{opacity:1}50%{opacity:.3}}
.h-h1{font-size:clamp(44px,7.5vw,88px);font-weight:900;letter-spacing:-.06em;line-height:.9;margin:0 0 28px;font-family:'Outfit',system-ui,sans-serif;}
.h-h1-l1{display:block;color:#F5F0EB;}
.h-h1-l2{display:block;background:linear-gradient(135deg,#F0B35A 0%,#E8715A 50%,#FF7A63 100%);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;}
.h-sub{font-size:clamp(15px,1.6vw,17px);color:rgba(245,240,235,.40);line-height:1.8;max-width:480px;margin:0 0 40px;font-weight:400;}
.h-sub strong{color:rgba(245,240,235,.72);font-weight:600;}
.h-ctas{display:flex;gap:12px;flex-wrap:wrap;}
@media(max-width:900px){.h-ctas{justify-content:center;}}
.cta-primary{padding:16px 36px;border-radius:16px;background:linear-gradient(135deg,#F0B35A,#E8A040);border:none;color:#0F0D15;font-size:15px;font-weight:800;text-decoration:none;transition:all 250ms;display:inline-flex;align-items:center;gap:8px;letter-spacing:-.01em;font-family:'Inter',system-ui,sans-serif;}
.cta-primary:hover{transform:translateY(-3px);box-shadow:0 8px 40px rgba(240,179,90,.30),0 0 0 1px rgba(240,179,90,.15);}
.cta-secondary{padding:16px 32px;border-radius:16px;background:rgba(245,240,235,.04);border:1px solid rgba(245,240,235,.10);color:rgba(245,240,235,.60);font-size:15px;font-weight:600;text-decoration:none;transition:all 200ms;font-family:'Inter',system-ui,sans-serif;}
.cta-secondary:hover{background:rgba(245,240,235,.08);border-color:rgba(245,240,235,.18);color:#F5F0EB;}

.demo-card{background:rgba(245,240,235,.025);border:1px solid rgba(245,240,235,.08);border-radius:24px;overflow:hidden;box-shadow:0 40px 100px rgba(0,0,0,.50),inset 0 1px 0 rgba(245,240,235,.05);transform:perspective(1400px) rotateY(-3deg) rotateX(2deg);animation:cardFloat 10s ease-in-out infinite;transition:transform 400ms;}
.demo-card:hover{transform:perspective(1400px) rotateY(-1deg) rotateX(0deg) translateY(-4px);}
@keyframes cardFloat{0%,100%{transform:perspective(1400px) rotateY(-3deg) rotateX(2deg) translateY(0)}50%{transform:perspective(1400px) rotateY(-3deg) rotateX(2deg) translateY(-10px)}}
@media(max-width:900px){.demo-card{transform:none;animation:none;}}
.demo-bar{display:flex;align-items:center;gap:7px;padding:12px 16px;border-bottom:1px solid rgba(245,240,235,.06);background:rgba(245,240,235,.02);}
.demo-dot{width:8px;height:8px;border-radius:50%;}
.demo-url{font-size:11px;font-weight:500;color:rgba(245,240,235,.20);font-family:'JetBrains Mono',monospace;margin-left:8px;}
.demo-prompt{padding:20px;border-bottom:1px solid rgba(245,240,235,.05);}
.demo-prompt-label{font-size:10px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:rgba(240,179,90,.45);margin-bottom:10px;font-family:'JetBrains Mono',monospace;}
.demo-prompt-input{min-height:20px;font-size:14px;color:rgba(245,240,235,.68);font-family:'Inter',sans-serif;line-height:1.5;}
.demo-cursor{display:inline-block;width:2px;height:18px;background:rgba(240,179,90,.70);margin-left:1px;vertical-align:text-bottom;animation:cursorBlink 1s steps(1) infinite;}
@keyframes cursorBlink{0%,100%{opacity:1}50%{opacity:0}}
.demo-preview{padding:16px;position:relative;}
.demo-gen{display:flex;align-items:center;gap:8px;margin-bottom:12px;font-size:11px;font-weight:600;color:rgba(240,179,90,.50);font-family:'JetBrains Mono',monospace;}
.demo-gen-dot{width:5px;height:5px;border-radius:50%;background:rgba(240,179,90,.60);animation:genPulse 1.2s ease-in-out infinite;}
.demo-gen-dot:nth-child(2){animation-delay:.15s}.demo-gen-dot:nth-child(3){animation-delay:.3s}
@keyframes genPulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.3;transform:scale(.6)}}
.demo-mock{border-radius:12px;border:1px solid rgba(245,240,235,.05);overflow:hidden;background:rgba(0,0,0,.30);}
.demo-mock-nav{height:28px;background:rgba(245,240,235,.03);border-bottom:1px solid rgba(245,240,235,.04);display:flex;align-items:center;padding:0 10px;gap:16px;}
.demo-mock-logo{width:10px;height:10px;border-radius:3px;background:linear-gradient(135deg,rgba(240,179,90,.30),rgba(232,113,90,.25));}
.demo-mock-links{display:flex;gap:8px;}
.demo-mock-link{width:20px;height:3px;border-radius:2px;background:rgba(245,240,235,.08);}
.demo-mock-hero{height:80px;background:linear-gradient(135deg,rgba(240,179,90,.08),rgba(232,113,90,.06));display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;padding:12px;}
.demo-mock-hl{width:60%;height:5px;border-radius:3px;background:rgba(245,240,235,.18);}
.demo-mock-sl{width:40%;height:3px;border-radius:2px;background:rgba(245,240,235,.08);}
.demo-mock-btn{width:24%;height:8px;border-radius:4px;background:linear-gradient(135deg,rgba(240,179,90,.30),rgba(232,113,90,.20));margin-top:4px;}
.demo-mock-cards{display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;padding:8px 10px 10px;}
.demo-mock-card{height:36px;border-radius:6px;background:rgba(245,240,235,.03);border:1px solid rgba(245,240,235,.04);}

.stats-strip{display:flex;justify-content:center;gap:0;border:1px solid rgba(245,240,235,.07);border-radius:20px;overflow:hidden;background:rgba(245,240,235,.02);margin-top:60px;}
.stat{display:flex;flex-direction:column;align-items:center;padding:24px clamp(20px,4vw,48px);border-right:1px solid rgba(245,240,235,.07);}
.stat:last-child{border-right:none;}
.stat-num{font-size:clamp(24px,3vw,34px);font-weight:900;letter-spacing:-.04em;background:linear-gradient(135deg,#F0B35A,#E8715A);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;font-family:'Outfit',system-ui,sans-serif;}
.stat-label{font-size:11px;font-weight:600;color:rgba(245,240,235,.25);letter-spacing:.08em;text-transform:uppercase;margin-top:4px;}
@media(max-width:640px){.stat{padding:16px 18px}.stat-num{font-size:22px}}

.trust{padding:60px 0;overflow:hidden;position:relative;}
.trust-label{text-align:center;font-size:11px;font-weight:600;letter-spacing:.14em;text-transform:uppercase;color:rgba(245,240,235,.15);margin-bottom:24px;}
.trust-track{display:flex;gap:56px;animation:marquee 35s linear infinite;width:max-content;}
.trust-item{font-size:15px;font-weight:600;color:rgba(245,240,235,.08);white-space:nowrap;letter-spacing:-.01em;}
@keyframes marquee{to{transform:translateX(-50%)}}
.trust::before,.trust::after{content:'';position:absolute;top:0;bottom:0;width:120px;z-index:2;pointer-events:none;}
.trust::before{left:0;background:linear-gradient(90deg,#08070B,transparent)}
.trust::after{right:0;background:linear-gradient(270deg,#08070B,transparent)}

.sec{padding:clamp(80px,12vw,144px) clamp(20px,5vw,64px);position:relative;}
.sec--alt{background:rgba(245,240,235,.012);border-top:1px solid rgba(245,240,235,.05);border-bottom:1px solid rgba(245,240,235,.05);}
.sec-inner{max-width:1120px;margin:0 auto;}
.sec-label{font-size:11px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:rgba(240,179,90,.55);margin-bottom:14px;font-family:'JetBrains Mono',monospace;}
.sec-h2{font-size:clamp(34px,5vw,60px);font-weight:900;letter-spacing:-.05em;line-height:1.05;margin:0 0 18px;font-family:'Outfit',system-ui,sans-serif;}
.sec-body{font-size:16px;color:rgba(245,240,235,.38);line-height:1.8;max-width:560px;margin:0 0 56px;}

.loop{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;}
@media(max-width:900px){.loop{grid-template-columns:repeat(3,1fr)}}
@media(max-width:520px){.loop{grid-template-columns:repeat(2,1fr)}}
.loop-step{position:relative;padding:28px 20px 24px;border-radius:18px;border:1px solid rgba(245,240,235,.06);background:rgba(245,240,235,.02);text-align:left;transition:all 400ms cubic-bezier(.22,1,.36,1);cursor:default;overflow:hidden;}
.loop-step.active{border-color:rgba(240,179,90,.25);background:rgba(240,179,90,.04);box-shadow:0 0 40px rgba(240,179,90,.05);}
.loop-step.active .loop-num{color:#F0B35A;border-color:rgba(240,179,90,.40);background:rgba(240,179,90,.10);}
.loop-step.active .loop-label{color:#F0B35A;}
.loop-num{width:32px;height:32px;border-radius:10px;border:1px solid rgba(245,240,235,.10);background:rgba(245,240,235,.03);display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:800;color:rgba(245,240,235,.30);margin-bottom:14px;font-family:'JetBrains Mono',monospace;transition:all 400ms;}
.loop-label{font-size:14px;font-weight:700;letter-spacing:-.01em;margin-bottom:6px;color:rgba(245,240,235,.75);transition:color 400ms;font-family:'Outfit',system-ui,sans-serif;}
.loop-desc{font-size:12px;color:rgba(245,240,235,.30);line-height:1.6;}

.heal{border:1px solid rgba(232,113,90,.16);background:linear-gradient(135deg,rgba(232,113,90,.03),rgba(240,179,90,.02));border-radius:28px;padding:52px 56px;display:grid;grid-template-columns:1fr 1fr;gap:56px;align-items:center;margin-top:64px;position:relative;overflow:hidden;}
.heal::before{content:'';position:absolute;width:400px;height:400px;border-radius:50%;background:radial-gradient(circle,rgba(240,179,90,.06),transparent 70%);top:-150px;right:-120px;pointer-events:none;}
@media(max-width:720px){.heal{grid-template-columns:1fr;gap:28px;padding:32px;}}
.heal-title{font-size:clamp(26px,3.5vw,40px);font-weight:900;letter-spacing:-.04em;margin-bottom:16px;line-height:1.05;font-family:'Outfit',system-ui,sans-serif;}
.heal-body{font-size:15px;color:rgba(245,240,235,.40);line-height:1.8;}
.heal-steps{display:flex;flex-direction:column;gap:20px;}
.heal-step{display:flex;align-items:flex-start;gap:16px;}
.heal-step-num{width:36px;height:36px;border-radius:12px;border:1px solid rgba(240,179,90,.22);background:rgba(240,179,90,.06);color:rgba(240,179,90,.85);font-size:12px;font-weight:800;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-family:'JetBrains Mono',monospace;}
.heal-step-text{font-size:14px;color:rgba(245,240,235,.50);line-height:1.6;padding-top:8px;}
.heal-step-text strong{color:rgba(245,240,235,.85);font-weight:600;}

.code-split{display:grid;grid-template-columns:1fr 1fr;gap:64px;align-items:center;}
@media(max-width:768px){.code-split{grid-template-columns:1fr;}}
.code-box{border:1px solid rgba(245,240,235,.07);background:linear-gradient(180deg,rgba(245,240,235,.025),rgba(0,0,0,.30));border-radius:20px;overflow:hidden;box-shadow:0 32px 80px rgba(0,0,0,.50);}
.code-bar{display:flex;align-items:center;gap:7px;padding:14px 18px;border-bottom:1px solid rgba(245,240,235,.06);background:rgba(245,240,235,.02);}
.code-dot{width:10px;height:10px;border-radius:50%;}
.code-fname{font-size:12px;font-weight:600;color:rgba(245,240,235,.25);font-family:'JetBrains Mono',monospace;margin-left:8px;}
.code-body{padding:24px;font-family:'JetBrains Mono',monospace;font-size:12px;line-height:2;color:rgba(245,240,235,.55);white-space:pre;overflow-x:auto;}
.code-body .kw{color:rgba(155,138,255,.85);}
.code-body .fn{color:rgba(240,179,90,.80);}
.code-body .str{color:rgba(74,222,128,.75);}
.code-body .cm{color:rgba(245,240,235,.20);}
.code-body .tp{color:rgba(232,113,90,.70);}
.code-features{display:flex;flex-direction:column;gap:16px;margin-top:36px;}
.code-feat{display:flex;align-items:center;gap:12px;font-size:14px;color:rgba(245,240,235,.50);}
.code-feat-dot{width:6px;height:6px;border-radius:50%;background:#F0B35A;flex-shrink:0;}

.agents{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;}
@media(max-width:900px){.agents{grid-template-columns:repeat(2,1fr)}}
@media(max-width:520px){.agents{grid-template-columns:1fr;}}
.agent{padding:28px 22px;border-radius:20px;border:1px solid rgba(245,240,235,.06);background:rgba(245,240,235,.02);transition:all 300ms cubic-bezier(.22,1,.36,1);position:relative;overflow:hidden;}
.agent:hover{border-color:rgba(240,179,90,.20);background:rgba(240,179,90,.03);transform:translateY(-4px);box-shadow:0 20px 50px rgba(0,0,0,.25);}
.agent-icon{width:40px;height:40px;border-radius:12px;background:linear-gradient(135deg,rgba(240,179,90,.12),rgba(232,113,90,.08));border:1px solid rgba(240,179,90,.18);display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:800;color:rgba(240,179,90,.85);margin-bottom:16px;font-family:'JetBrains Mono',monospace;}
.agent-name{font-size:15px;font-weight:700;margin-bottom:8px;letter-spacing:-.01em;font-family:'Outfit',system-ui,sans-serif;}
.agent-desc{font-size:13px;color:rgba(245,240,235,.38);line-height:1.65;margin-bottom:14px;}
.agent-meta{display:flex;gap:10px;align-items:center;}
.agent-cost{font-size:11px;font-weight:700;color:rgba(240,179,90,.70);font-family:'JetBrains Mono',monospace;padding:3px 10px;border-radius:8px;background:rgba(240,179,90,.06);border:1px solid rgba(240,179,90,.12);}
.agent-plan{font-size:10px;font-weight:600;color:rgba(245,240,235,.25);letter-spacing:.06em;text-transform:uppercase;}

.plans{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;}
@media(max-width:900px){.plans{grid-template-columns:1fr 1fr;}}
@media(max-width:520px){.plans{grid-template-columns:1fr;}}
.plan{padding:28px 22px;border-radius:22px;border:1px solid rgba(245,240,235,.06);background:rgba(245,240,235,.02);transition:all 300ms;text-align:center;position:relative;}
.plan:hover{border-color:rgba(245,240,235,.12);transform:translateY(-3px);}
.plan--pro{border-color:rgba(240,179,90,.25);background:linear-gradient(180deg,rgba(240,179,90,.04),rgba(232,113,90,.02));box-shadow:0 0 60px rgba(240,179,90,.06);}
.plan--pro:hover{border-color:rgba(240,179,90,.40);box-shadow:0 0 80px rgba(240,179,90,.10);}
.plan-name{font-size:11px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:rgba(245,240,235,.35);margin-bottom:12px;font-family:'JetBrains Mono',monospace;}
.plan--pro .plan-name{color:rgba(240,179,90,.70);}
.plan-price{font-size:40px;font-weight:900;letter-spacing:-.04em;margin-bottom:4px;font-family:'Outfit',system-ui,sans-serif;}
.plan-period{font-size:13px;color:rgba(245,240,235,.25);margin-bottom:16px;}
.plan-detail{font-size:12px;color:rgba(245,240,235,.35);line-height:1.5;margin-bottom:4px;}
.plan-cta{display:block;width:100%;padding:12px;border-radius:14px;border:1px solid rgba(245,240,235,.10);background:rgba(245,240,235,.04);color:rgba(245,240,235,.65);font-size:13px;font-weight:700;text-decoration:none;margin-top:18px;transition:all 200ms;text-align:center;font-family:'Inter',system-ui,sans-serif;}
.plan-cta:hover{background:rgba(245,240,235,.08);color:#F5F0EB;border-color:rgba(245,240,235,.20);}
.plan--pro .plan-cta{background:linear-gradient(135deg,#F0B35A,#E8A040);border:none;color:#0F0D15;}
.plan--pro .plan-cta:hover{box-shadow:0 4px 24px rgba(240,179,90,.30);}

.testi{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;}
@media(max-width:768px){.testi{grid-template-columns:1fr;}}
.testi-card{padding:28px;border-radius:22px;border:1px solid rgba(245,240,235,.07);background:rgba(245,240,235,.025);transition:all 280ms;}
.testi-card:hover{border-color:rgba(245,240,235,.12);transform:translateY(-3px);}
.testi-text{font-size:14px;color:rgba(245,240,235,.55);line-height:1.75;margin-bottom:20px;font-style:italic;}
.testi-author{display:flex;align-items:center;gap:12px;}
.testi-avatar{width:36px;height:36px;border-radius:10px;background:linear-gradient(135deg,rgba(240,179,90,.18),rgba(232,113,90,.12));display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:800;color:rgba(240,179,90,.85);font-family:'Outfit',system-ui,sans-serif;}
.testi-name{font-size:13px;font-weight:700;letter-spacing:-.01em;}
.testi-role{font-size:11px;color:rgba(245,240,235,.30);margin-top:2px;}

.final-cta{text-align:center;padding:clamp(80px,12vw,120px) clamp(20px,5vw,64px);position:relative;}
.final-h2{font-size:clamp(34px,5.5vw,64px);font-weight:900;letter-spacing:-.05em;line-height:1;margin:0 0 16px;font-family:'Outfit',system-ui,sans-serif;}
.final-sub{font-size:17px;color:rgba(245,240,235,.38);margin:0 auto 36px;max-width:480px;line-height:1.7;}
.final-btn{display:inline-flex;align-items:center;gap:8px;padding:18px 44px;border-radius:18px;background:linear-gradient(135deg,#F0B35A,#E8A040);border:none;color:#0F0D15;font-size:16px;font-weight:800;text-decoration:none;transition:all 250ms;font-family:'Inter',system-ui,sans-serif;}
.final-btn:hover{transform:translateY(-3px);box-shadow:0 8px 40px rgba(240,179,90,.30);}

.faq-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;}
@media(max-width:640px){.faq-grid{grid-template-columns:1fr;}}
.faq-item{padding:24px;border-radius:18px;border:1px solid rgba(245,240,235,.06);background:rgba(245,240,235,.02);}
.faq-q{font-size:14px;font-weight:700;margin-bottom:10px;letter-spacing:-.01em;font-family:'Outfit',system-ui,sans-serif;}
.faq-a{font-size:13px;color:rgba(245,240,235,.40);line-height:1.7;}
      `}</style>

      <SiteNav />

      <section className="hero">
        <div className="mesh">
          <div className="mesh-orb mesh-1" />
          <div className="mesh-orb mesh-2" />
          <div className="mesh-orb mesh-3" />
          <div className="dots" />
          <div className="grain" />
        </div>
        <div className="hero-inner">
          <div>
            <div className={hf(1)}><div className="h-badge"><span className="h-badge-dot" /> NOW IN PUBLIC BETA</div></div>
            <h1 className={`h-h1 ${hf(2)}`}><span className="h-h1-l1">Describe it.</span><span className="h-h1-l2">We build it.</span></h1>
            <p className={`h-sub ${hf(3)}`}>The world&apos;s first <strong>agentic AI website builder</strong>. Tell us about your business in plain English — get a production-ready, fully-responsive site in under <strong>30 seconds</strong>.</p>
            <div className={`h-ctas ${hf(4)}`}><Link href="/build" className="cta-primary">Start building free</Link><Link href="/gallery" className="cta-secondary">See examples</Link></div>
          </div>
          <div className={hf(5)}>
            <div className="demo-card">
              <div className="demo-bar"><div className="demo-dot" style={{ background: "#FF5F57" }} /><div className="demo-dot" style={{ background: "#FEBC2E" }} /><div className="demo-dot" style={{ background: "#28C840" }} /><span className="demo-url">dominat8.io/build</span></div>
              <div className="demo-prompt"><div className="demo-prompt-label">Your prompt</div><div className="demo-prompt-input">{typedText}<span className="demo-cursor" /></div></div>
              <div className="demo-preview"><div className="demo-gen"><span className="demo-gen-dot" /><span className="demo-gen-dot" /><span className="demo-gen-dot" /> Generating&hellip;</div><div className="demo-mock"><div className="demo-mock-nav"><div className="demo-mock-logo" /><div className="demo-mock-links"><div className="demo-mock-link" /><div className="demo-mock-link" /><div className="demo-mock-link" /></div></div><div className="demo-mock-hero"><div className="demo-mock-hl" /><div className="demo-mock-sl" /><div className="demo-mock-btn" /></div><div className="demo-mock-cards"><div className="demo-mock-card" /><div className="demo-mock-card" /><div className="demo-mock-card" /></div></div></div>
            </div>
          </div>
        </div>
        <div className="stats-strip rv" style={{ maxWidth: 800, margin: "60px auto 0" }}>
          {[{ num: "50,000+", label: "Sites generated" },{ num: "< 30s", label: "Average build" },{ num: "180+", label: "Countries" },{ num: "4.9/5", label: "Satisfaction" }].map((s, i) => (
            <div key={i} className="stat"><div className="stat-num">{s.num}</div><div className="stat-label">{s.label}</div></div>
          ))}
        </div>
      </section>

      <div className="trust"><div className="trust-label">Trusted by teams at</div><div className="trust-track">{[...TRUST_LOGOS, ...TRUST_LOGOS].map((name, i) => (<span key={i} className="trust-item">{name}</span>))}</div></div>

      <section className="sec">
        <div className="sec-inner">
          <div className="rv"><div className="sec-label">How it works</div><h2 className="sec-h2">Six steps. Zero friction.</h2><p className="sec-body">Our agentic loop doesn&apos;t just generate — it reasons, builds, detects errors, self-heals, audits, and ships. Every site comes out clean.</p></div>
          <div className="loop rv rv-d1">{LOOP_STEPS.map((step, i) => (<div key={step.id} className={`loop-step${activeStep === i ? " active" : ""}`}><div className="loop-num">{step.icon}</div><div className="loop-label">{step.label}</div><div className="loop-desc">{step.desc}</div></div>))}</div>
          <div className="heal rv rv-d2">
            <div><div className="heal-title">Self-healing architecture.</div><p className="heal-body">Other builders ship broken code. Ours detects rendering failures, accessibility violations, and layout bugs — then rewrites the code to fix them before you ever see the output.</p></div>
            <div className="heal-steps">{[{ n: "1", text: "<strong>Render check</strong> — headless browser validates every page loads without errors" },{ n: "2", text: "<strong>Layout scan</strong> — checks responsive breakpoints at 320, 768, 1440px" },{ n: "3", text: "<strong>Auto-patch</strong> — rewrites failing CSS/HTML and re-validates until clean" }].map(s => (<div key={s.n} className="heal-step"><div className="heal-step-num">{s.n}</div><div className="heal-step-text" dangerouslySetInnerHTML={{ __html: s.text }} /></div>))}</div>
          </div>
        </div>
      </section>

      <section className="sec sec--alt">
        <div className="sec-inner">
          <div className="code-split">
            <div className="rv"><div className="sec-label">Your code</div><h2 className="sec-h2">Clean React + TypeScript. Yours to keep.</h2><p className="sec-body">Every generated site is fully ownable — download the source, host it anywhere, modify anything. No lock-in.</p>
              <div className="code-features">{["React 18 + TypeScript — no jQuery, no junk","Responsive from day one — tested at every breakpoint","SEO metadata, OG tags, structured data included","One-click deploy to Dominat8 CDN or export"].map(f => (<div key={f} className="code-feat"><span className="code-feat-dot" />{f}</div>))}</div>
            </div>
            <div className="rv rv-d2"><div className="code-box"><div className="code-bar"><div className="code-dot" style={{ background: "#FF5F57" }} /><div className="code-dot" style={{ background: "#FEBC2E" }} /><div className="code-dot" style={{ background: "#28C840" }} /><span className="code-fname">HeroSection.tsx</span></div><div className="code-body" dangerouslySetInnerHTML={{ __html: `<span class="kw">export default</span> <span class="kw">function</span> <span class="fn">Hero</span>() {\n  <span class="kw">return</span> (\n    <span class="tp">&lt;section</span> className=<span class="str">"hero"</span><span class="tp">&gt;</span>\n      <span class="tp">&lt;h1&gt;</span>Your Business<span class="tp">&lt;/h1&gt;</span>\n      <span class="tp">&lt;p&gt;</span>Built in 30 seconds<span class="tp">&lt;/p&gt;</span>\n      <span class="tp">&lt;Button</span> variant=<span class="str">"primary"</span><span class="tp">/&gt;</span>\n    <span class="tp">&lt;/section&gt;</span>\n  );\n}` }} /></div></div>
          </div>
        </div>
      </section>

      <section className="sec">
        <div className="sec-inner">
          <div className="rv"><div className="sec-label">Specialist agents</div><h2 className="sec-h2">6 agents. Every angle covered.</h2><p className="sec-body">After generation, run specialist AI agents that audit SEO, accessibility, performance, responsive layout, links, and design — then fix what they find.</p></div>
          <div className="agents rv rv-d1">{AGENTS.map(a => (<div key={a.name} className="agent"><div className="agent-icon">{a.icon}</div><div className="agent-name">{a.name}</div><div className="agent-desc">{a.desc}</div><div className="agent-meta"><span className="agent-cost">{a.cost}</span><span className="agent-plan">{a.plan} plan</span></div></div>))}</div>
        </div>
      </section>

      <section className="sec sec--alt">
        <div className="sec-inner">
          <div className="rv" style={{ textAlign: "center", maxWidth: 600, margin: "0 auto 48px" }}><div className="sec-label" style={{ textAlign: "center" }}>Pricing</div><h2 className="sec-h2" style={{ textAlign: "center" }}>Simple, honest pricing.</h2></div>
          <div className="plans rv rv-d1">{PLANS.map(p => (<div key={p.name} className={`plan${p.highlight ? " plan--pro" : ""}`}><div className="plan-name">{p.name}</div><div className="plan-price">{p.price}</div><div className="plan-period">{p.period || "forever"}</div><div className="plan-detail">{p.gens} AI generations</div><div className="plan-detail">{p.credits} agent credits</div><Link href={p.href} className="plan-cta">{p.cta}</Link></div>))}</div>
        </div>
      </section>

      <section className="sec">
        <div className="sec-inner">
          <div className="rv" style={{ textAlign: "center", maxWidth: 600, margin: "0 auto 48px" }}><div className="sec-label" style={{ textAlign: "center" }}>Testimonials</div><h2 className="sec-h2" style={{ textAlign: "center" }}>Loved by builders.</h2></div>
          <div className="testi rv rv-d1">{TESTIMONIALS.map((t, i) => (<div key={i} className="testi-card"><div className="testi-text">&ldquo;{t.text}&rdquo;</div><div className="testi-author"><div className="testi-avatar">{t.avatar}</div><div><div className="testi-name">{t.name}</div><div className="testi-role">{t.role}</div></div></div></div>))}</div>
        </div>
      </section>

      <section className="sec sec--alt">
        <div className="sec-inner">
          <div className="rv" style={{ textAlign: "center", maxWidth: 600, margin: "0 auto 48px" }}><div className="sec-label" style={{ textAlign: "center" }}>FAQ</div><h2 className="sec-h2" style={{ textAlign: "center" }}>Questions? Answered.</h2></div>
          <div className="faq-grid rv rv-d1">{[{ q: "How is this different from Wix or Squarespace?", a: "Those are drag-and-drop builders. Dominat8 generates a complete, custom site from a single text description — no templates, no manual editing, no design skills needed." },{ q: "Do I own the code?", a: "100%. Every site you generate is yours — download the HTML, host it anywhere, modify anything. No lock-in, no vendor dependency." },{ q: "What tech stack does it output?", a: "Clean React 18 + TypeScript with Tailwind CSS. Fully responsive, SEO-optimised, and ready to deploy to any modern hosting platform." },{ q: "What are agent credits?", a: "Credits let you run specialist AI agents (SEO, accessibility, performance, etc.) that audit and fix your generated site. Free plan includes 5 credits." },{ q: "Can I use it for client work?", a: "Absolutely. The Agency plan includes white-label output, API access, and bulk generation — perfect for agencies and freelancers." },{ q: "Is there a money-back guarantee?", a: "Yes — 14-day money-back guarantee on all paid plans. No questions asked." }].map((faq, i) => (<div key={i} className="faq-item"><div className="faq-q">{faq.q}</div><div className="faq-a">{faq.a}</div></div>))}</div>
        </div>
      </section>

      <div className="final-cta rv"><h2 className="final-h2">Ready to build?</h2><p className="final-sub">Your first 3 sites are free. No credit card required. Describe your business and watch it appear.</p><Link href="/build" className="final-btn">Start building free</Link></div>

      <SiteFooter />
    </>
  );
}
