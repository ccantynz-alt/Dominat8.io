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
  { icon: "S", name: "SEO Sweep", desc: "Title, meta, OG tags, structured data — full technical SEO audit.", cost: "1 cr", plan: "free", color: "#00FFB2" },
  { icon: "R", name: "Responsive Audit", desc: "Tests at 320 / 768 / 1440px. Catches and fixes every layout break.", cost: "1 cr", plan: "free", color: "#00D4FF" },
  { icon: "L", name: "Link & Nav Check", desc: "Validates every href, anchor and scroll target. Flags broken paths.", cost: "1 cr", plan: "free", color: "#7B61FF" },
  { icon: "A", name: "Accessibility Pass", desc: "Colour contrast, ARIA labels, keyboard navigation. WCAG 2.1 AA.", cost: "2 cr", plan: "starter", color: "#00D4FF" },
  { icon: "P", name: "Perf Optimiser", desc: "Image sizing, lazy-load, unused CSS, bundle hints. Lighthouse-ready.", cost: "2 cr", plan: "starter", color: "#0066FF" },
  { icon: "D", name: "Design Fixer", desc: "Spacing, alignment, typography, colour harmony — the pixel-perfect pass.", cost: "3 cr", plan: "pro", color: "#FF6BCA" },
];

const PLANS = [
  { name: "Free", price: "$0", period: "forever", desc: "Try it out", features: ["3 generations/month", "HTML download", "Share link (7-day)"], highlight: false },
  { name: "Starter", price: "$9", period: "/month", desc: "Side projects", features: ["20 generations/month", "Fix agent + SEO scan", "Share links (90-day)"], highlight: false },
  { name: "Pro", price: "$29", period: "/month", desc: "Freelancers & growing businesses", features: ["100 generations/month", "Deploy to CDN + SSL", "A/B variants, custom domain"], highlight: true },
  { name: "Agency", price: "$99", period: "/month", desc: "Teams & high-volume", features: ["500 generations/month", "White-label, API, 5 seats", "SLA + dedicated support"], highlight: false },
];

const TESTIMONIALS = [
  { name: "Sarah M.", role: "Startup Founder, Austin", quote: "I described my SaaS and had a production-ready site in 22 seconds. Replaced a $12k agency quote.", stars: 5 },
  { name: "James L.", role: "Freelance Designer, London", quote: "The self-healing loop caught a responsive break I would have missed. Client was thrilled.", stars: 5 },
  { name: "Priya K.", role: "E-commerce Owner, Mumbai", quote: "38 product pages generated from a single prompt. The SEO agent even wrote my meta tags.", stars: 5 },
];

const FAQS = [
  { q: "What do I get for free?", a: "3 AI generations per month, HTML download, and a 7-day share link. No credit card required." },
  { q: "How fast is a generation?", a: "Most sites generate in under 30 seconds. Complex multi-page builds may take up to 60 seconds." },
  { q: "Can I export the code?", a: "Yes — you get clean React + TypeScript (or HTML) that you can host anywhere. No lock-in." },
  { q: "What are agent credits?", a: "Credits let you run specialist AI agents (SEO, responsive audit, perf, etc.) on your generated site. Free plans include 5 credits/month." },
  { q: "Can I use my own domain?", a: "Pro and Agency plans include custom domain + auto-SSL on the Dominat8 CDN." },
  { q: "Is there a money-back guarantee?", a: "Yes — 14-day money-back on all paid plans, no questions asked." },
];

const MARQUEE_LOGOS = ["Y Combinator", "Vercel", "Stripe", "OpenAI", "Anthropic", "Cloudflare", "Supabase", "Linear"];

/* ═══════════════════════════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════════════════════════ */

export default function HomePage() {
  const [mounted, setMounted] = useState(false);
  const [typedText, setTypedText] = useState("");
  const [promptIdx, setPromptIdx] = useState(0);
  const [activeStep, setActiveStep] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const rvRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setMounted(true); }, []);

  /* Typing effect */
  useEffect(() => {
    if (!mounted) return;
    const prompt = HERO_PROMPTS[promptIdx];
    let i = 0;
    setTypedText("");
    const iv = setInterval(() => {
      i++;
      setTypedText(prompt.slice(0, i));
      if (i >= prompt.length) {
        clearInterval(iv);
        setTimeout(() => setPromptIdx(prev => (prev + 1) % HERO_PROMPTS.length), 2000);
      }
    }, 38);
    return () => clearInterval(iv);
  }, [promptIdx, mounted]);

  /* Loop step rotation */
  useEffect(() => {
    if (!mounted) return;
    const iv = setInterval(() => setActiveStep(p => (p + 1) % LOOP_STEPS.length), 2400);
    return () => clearInterval(iv);
  }, [mounted]);

  /* Scroll reveal */
  useEffect(() => {
    if (!mounted) return;
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add("rv--vis"); obs.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    document.querySelectorAll(".rv").forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, [mounted]);

  return (
    <>
      <style>{`
/* ── Quantum Blue Theme ── */
@keyframes meshFloat{0%{transform:translate(0,0) scale(1)}50%{transform:translate(30px,-40px) scale(1.08)}100%{transform:translate(-10px,20px) scale(0.96)}}
@keyframes gradShift{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
@keyframes cardFloat{0%,100%{transform:perspective(900px) rotateY(-4deg) rotateX(2deg) translateY(0)}50%{transform:perspective(900px) rotateY(-2deg) rotateX(0deg) translateY(-14px)}}
@keyframes cursorBlink{0%,100%{opacity:1}50%{opacity:0}}
@keyframes marquee{from{transform:translateX(0)}to{transform:translateX(-50%)}}
@keyframes dotPulse{0%,100%{transform:scale(1);opacity:.7}50%{transform:scale(1.3);opacity:1}}
@keyframes shimmer{0%{left:-100%}40%{left:100%}100%{left:100%}}
@keyframes scanLine{0%{top:-2px}100%{top:100%}}
@keyframes particleDrift{0%{transform:translateY(0) translateX(0);opacity:0}10%{opacity:1}90%{opacity:1}100%{transform:translateY(-200px) translateX(40px);opacity:0}}

/* ── Reveal on scroll ── */
.rv{opacity:0;transform:translateY(48px);transition:all 900ms cubic-bezier(.16,1,.3,1)}
.rv--vis{opacity:1;transform:translateY(0)}
.rv-d1{transition-delay:120ms}.rv-d2{transition-delay:240ms}.rv-d3{transition-delay:360ms}.rv-d4{transition-delay:480ms}.rv-d5{transition-delay:600ms}

.hp{min-height:100vh;background:#030712;color:#E8F0FF;font-family:'Outfit',system-ui,sans-serif;position:relative;overflow:hidden;}

/* ── Mesh background ── */
.hp-mesh{position:fixed;inset:0;pointer-events:none;z-index:0;overflow:hidden;}
.hp-orb1{position:absolute;width:900px;height:900px;top:-350px;left:-250px;border-radius:50%;background:radial-gradient(circle,rgba(0,212,255,.12) 0%,rgba(0,102,255,.06) 35%,transparent 65%);filter:blur(80px);animation:meshFloat 20s ease-in-out infinite alternate;}
.hp-orb2{position:absolute;width:700px;height:700px;top:40%;right:-200px;border-radius:50%;background:radial-gradient(circle,rgba(123,97,255,.10) 0%,rgba(0,102,255,.04) 40%,transparent 65%);filter:blur(80px);animation:meshFloat 25s ease-in-out infinite alternate-reverse;}
.hp-orb3{position:absolute;width:500px;height:500px;bottom:-200px;left:30%;border-radius:50%;background:radial-gradient(circle,rgba(0,212,255,.08) 0%,transparent 60%);filter:blur(60px);animation:meshFloat 18s ease-in-out infinite alternate;}

/* ── Grain overlay ── */
.hp::after{content:'';position:fixed;inset:0;pointer-events:none;z-index:1;opacity:.03;background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");}

/* ── Hero ── */
.hp-hero{position:relative;z-index:2;display:grid;grid-template-columns:1fr 1fr;gap:48px;align-items:center;max-width:1240px;margin:0 auto;padding:160px 40px 80px;}
@media(max-width:960px){.hp-hero{grid-template-columns:1fr;text-align:center;padding:140px 24px 60px;gap:40px;}}

.hp-h1{font-size:clamp(52px,8.5vw,100px);font-weight:900;letter-spacing:-.06em;line-height:.95;margin:0 0 24px;}
.hp-h1-line2{display:block;background:linear-gradient(135deg,#00D4FF 0%,#0066FF 40%,#7B61FF 70%,#00D4FF 100%);background-size:200% 200%;-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;animation:gradShift 8s ease-in-out infinite;}

.hp-sub{font-size:clamp(16px,1.5vw,19px);color:rgba(200,220,255,.50);line-height:1.75;margin:0 0 28px;max-width:520px;font-family:'Inter',system-ui,sans-serif;}
@media(max-width:960px){.hp-sub{margin:0 auto 28px;}}

.hp-ctas{display:flex;gap:12px;flex-wrap:wrap;}
@media(max-width:960px){.hp-ctas{justify-content:center;}}

.hp-cta-primary{display:inline-flex;align-items:center;gap:6px;padding:16px 36px;border-radius:14px;background:linear-gradient(135deg,#00D4FF,#0066FF);border:1px solid rgba(0,212,255,.40);color:#030712;text-decoration:none;font-size:16px;font-weight:800;transition:all 250ms cubic-bezier(.16,1,.3,1);position:relative;overflow:hidden;font-family:'Outfit',system-ui,sans-serif;}
.hp-cta-primary::after{content:'';position:absolute;top:0;left:-100%;width:100%;height:100%;background:linear-gradient(90deg,transparent,rgba(255,255,255,.20),transparent);animation:shimmer 4s ease-in-out infinite;}
.hp-cta-primary:hover{transform:translateY(-3px);box-shadow:0 0 40px rgba(0,212,255,.30),0 8px 32px rgba(0,102,255,.25);text-decoration:none;}

.hp-cta-secondary{display:inline-flex;align-items:center;gap:6px;padding:16px 36px;border-radius:14px;border:1px solid rgba(100,180,255,.12);background:rgba(100,180,255,.04);color:rgba(200,220,255,.70);text-decoration:none;font-size:16px;font-weight:600;transition:all 200ms;font-family:'Outfit',system-ui,sans-serif;}
.hp-cta-secondary:hover{background:rgba(100,180,255,.08);border-color:rgba(100,180,255,.22);color:#E8F0FF;text-decoration:none;}

/* Demo card */
.hp-demo{position:relative;perspective:900px;}
@media(max-width:960px){.hp-demo{max-width:520px;margin:0 auto;}}
.hp-demo-card{background:rgba(10,22,40,.80);border:1px solid rgba(0,212,255,.15);border-radius:22px;padding:24px;backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);animation:cardFloat 12s ease-in-out infinite;position:relative;overflow:hidden;box-shadow:0 20px 80px rgba(0,0,0,.50),0 0 60px rgba(0,212,255,.06);}
.hp-demo-card::before{content:'';position:absolute;inset:0;border-radius:22px;padding:1px;background:linear-gradient(135deg,rgba(0,212,255,.30),rgba(0,102,255,.15),rgba(123,97,255,.10));-webkit-mask:linear-gradient(#fff 0 0) content-box,linear-gradient(#fff 0 0);-webkit-mask-composite:xor;mask-composite:exclude;pointer-events:none;}
.hp-demo-scan{position:absolute;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,rgba(0,212,255,.40),transparent);animation:scanLine 3s linear infinite;pointer-events:none;}

.hp-demo-top{display:flex;gap:6px;margin-bottom:14px;opacity:.5;}
.hp-demo-dot{width:8px;height:8px;border-radius:50%;}

.hp-demo-prompt{display:flex;align-items:center;gap:10px;padding:14px 16px;border-radius:12px;border:1px solid rgba(0,212,255,.20);background:rgba(0,212,255,.04);margin-bottom:14px;min-height:48px;}
.hp-demo-icon{color:rgba(0,212,255,.70);font-size:14px;flex-shrink:0;}
.hp-demo-text{font-size:14px;color:rgba(200,220,255,.75);font-family:'Inter',system-ui,sans-serif;flex:1;min-height:20px;}
.hp-demo-cursor{display:inline-block;width:2px;height:16px;background:rgba(0,212,255,.70);margin-left:2px;animation:cursorBlink 1s steps(1) infinite;vertical-align:text-bottom;}

.hp-demo-preview{border-radius:12px;border:1px solid rgba(100,180,255,.08);background:rgba(3,7,18,.60);padding:16px;height:180px;display:flex;flex-direction:column;justify-content:center;gap:10px;}
.hp-demo-prev-bar{height:6px;border-radius:3px;background:linear-gradient(90deg,rgba(0,212,255,.30),rgba(0,102,255,.15));width:65%;}
.hp-demo-prev-bar2{height:4px;border-radius:2px;background:rgba(100,180,255,.10);width:45%;}
.hp-demo-prev-bar3{height:4px;border-radius:2px;background:rgba(100,180,255,.06);width:55%;}
.hp-demo-prev-btn{height:22px;width:80px;border-radius:6px;background:linear-gradient(135deg,rgba(0,212,255,.25),rgba(0,102,255,.15));margin-top:8px;}
.hp-demo-prev-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-top:12px;}
.hp-demo-prev-card{height:24px;border-radius:6px;background:rgba(100,180,255,.06);border:1px solid rgba(100,180,255,.04);}

/* ── Stats strip ── */
.hp-stats{position:relative;z-index:2;display:grid;grid-template-columns:repeat(4,1fr);gap:1px;max-width:1100px;margin:0 auto 0;padding:0 40px;}
.hp-stat{padding:36px 20px;text-align:center;background:rgba(100,180,255,.025);border:1px solid rgba(100,180,255,.06);transition:all 200ms;}
.hp-stat:first-child{border-radius:18px 0 0 18px}.hp-stat:last-child{border-radius:0 18px 18px 0}
.hp-stat:hover{background:rgba(100,180,255,.05);}
.hp-stat-val{font-size:clamp(30px,3.5vw,48px);font-weight:900;letter-spacing:-.04em;background:linear-gradient(135deg,#00D4FF,#0066FF);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;margin-bottom:6px;}
.hp-stat-label{font-size:13px;color:rgba(200,220,255,.38);font-family:'Inter',system-ui,sans-serif;}
@media(max-width:768px){.hp-stats{grid-template-columns:1fr 1fr;padding:0 24px;}.hp-stat:first-child{border-radius:18px 0 0 0}.hp-stat:nth-child(2){border-radius:0 18px 0 0}.hp-stat:nth-child(3){border-radius:0 0 0 18px}.hp-stat:last-child{border-radius:0 0 18px 0}}

/* ── Trust marquee ── */
.hp-marquee-wrap{position:relative;z-index:2;padding:48px 0;overflow:hidden;border-top:1px solid rgba(100,180,255,.05);border-bottom:1px solid rgba(100,180,255,.05);margin-top:72px;}
.hp-marquee-label{text-align:center;font-size:11px;font-weight:600;letter-spacing:.14em;text-transform:uppercase;color:rgba(200,220,255,.22);margin-bottom:24px;font-family:'JetBrains Mono',monospace;}
.hp-marquee-track{display:flex;gap:80px;animation:marquee 40s linear infinite;width:max-content;}
.hp-marquee-item{font-size:17px;font-weight:700;color:rgba(200,220,255,.14);white-space:nowrap;letter-spacing:-.01em;transition:color 300ms;}

/* ── Section divider glow ── */
.hp-glow-div{height:1px;max-width:700px;margin:0 auto;background:linear-gradient(90deg,transparent,rgba(0,212,255,.20),rgba(0,102,255,.12),transparent);}

/* ── How it works (loop) ── */
.hp-loop{position:relative;z-index:2;max-width:1100px;margin:0 auto;padding:96px 40px;}
@media(max-width:768px){.hp-loop{padding:72px 24px;}}
.hp-section-badge{display:inline-flex;align-items:center;gap:7px;padding:5px 16px;border-radius:999px;border:1px solid rgba(0,212,255,.25);background:rgba(0,212,255,.06);color:rgba(0,212,255,.80);font-size:11px;font-weight:700;letter-spacing:.10em;text-transform:uppercase;margin-bottom:22px;font-family:'JetBrains Mono',monospace;backdrop-filter:blur(12px);}
.hp-section-badge-dot{width:6px;height:6px;border-radius:50%;background:rgba(0,212,255,.80);animation:dotPulse 2s ease-in-out infinite;}
.hp-section-h2{font-size:clamp(32px,5vw,56px);font-weight:900;letter-spacing:-.05em;margin:0 0 14px;line-height:1.05;}
.hp-section-sub{font-size:17px;color:rgba(200,220,255,.42);margin:0 0 48px;line-height:1.7;max-width:520px;font-family:'Inter',system-ui,sans-serif;}

.hp-loop-grid{display:grid;grid-template-columns:repeat(6,1fr);gap:10px;}
@media(max-width:960px){.hp-loop-grid{grid-template-columns:repeat(3,1fr);}}
@media(max-width:520px){.hp-loop-grid{grid-template-columns:1fr 1fr;}}

.hp-loop-step{padding:18px 14px;border-radius:16px;border:1px solid rgba(100,180,255,.06);background:rgba(100,180,255,.02);text-align:center;transition:all 320ms cubic-bezier(.16,1,.3,1);cursor:default;position:relative;overflow:hidden;}
.hp-loop-step--active{border-color:rgba(0,212,255,.30);background:rgba(0,212,255,.06);box-shadow:0 0 40px rgba(0,212,255,.08),inset 0 1px 0 rgba(0,212,255,.10);}
.hp-loop-step--active::before{content:'';position:absolute;inset:0;border-radius:16px;padding:1px;background:linear-gradient(135deg,rgba(0,212,255,.25),rgba(0,102,255,.12));-webkit-mask:linear-gradient(#fff 0 0) content-box,linear-gradient(#fff 0 0);-webkit-mask-composite:xor;mask-composite:exclude;pointer-events:none;}
.hp-loop-num{font-size:11px;font-weight:700;color:rgba(200,220,255,.20);font-family:'JetBrains Mono',monospace;margin-bottom:8px;transition:color 200ms;}
.hp-loop-step--active .hp-loop-num{color:rgba(0,212,255,.70);}
.hp-loop-label{font-size:14px;font-weight:700;color:rgba(200,220,255,.55);transition:color 200ms;letter-spacing:-.02em;}
.hp-loop-step--active .hp-loop-label{color:#E8F0FF;}
.hp-loop-desc{font-size:12px;color:rgba(200,220,255,.28);margin-top:8px;line-height:1.5;font-family:'Inter',system-ui,sans-serif;transition:color 200ms;}
.hp-loop-step--active .hp-loop-desc{color:rgba(200,220,255,.55);}

/* ── Self-heal section ── */
.hp-heal{position:relative;z-index:2;max-width:900px;margin:0 auto;padding:0 40px 96px;}
@media(max-width:768px){.hp-heal{padding:0 24px 72px;}}
.hp-heal-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;}
@media(max-width:640px){.hp-heal-grid{grid-template-columns:1fr;}}
.hp-heal-card{padding:22px;border-radius:18px;border:1px solid rgba(100,180,255,.08);background:rgba(100,180,255,.025);text-align:center;transition:all 200ms;}
.hp-heal-card:hover{background:rgba(100,180,255,.05);transform:translateY(-3px);box-shadow:0 12px 40px rgba(0,0,0,.25);}
.hp-heal-icon{font-size:28px;margin-bottom:10px;}
.hp-heal-title{font-size:15px;font-weight:700;letter-spacing:-.02em;margin-bottom:6px;color:#E8F0FF;}
.hp-heal-body{font-size:13px;color:rgba(200,220,255,.45);line-height:1.65;font-family:'Inter',system-ui,sans-serif;}

/* ── Code export ── */
.hp-code{position:relative;z-index:2;max-width:900px;margin:0 auto;padding:0 40px 96px;}
@media(max-width:768px){.hp-code{padding:0 24px 72px;}}
.hp-code-block{border-radius:18px;border:1px solid rgba(100,180,255,.10);background:rgba(10,22,40,.60);overflow:hidden;box-shadow:0 16px 48px rgba(0,0,0,.30);}
.hp-code-top{display:flex;align-items:center;gap:8px;padding:12px 18px;border-bottom:1px solid rgba(100,180,255,.06);background:rgba(100,180,255,.03);}
.hp-code-dot{width:10px;height:10px;border-radius:50%;opacity:.6;}
.hp-code-title{flex:1;text-align:center;font-size:12px;color:rgba(200,220,255,.30);font-family:'JetBrains Mono',monospace;}
.hp-code-pre{padding:24px;font-size:13px;line-height:1.7;color:rgba(200,220,255,.65);font-family:'JetBrains Mono',monospace;overflow-x:auto;margin:0;}
.hp-code-kw{color:#7B61FF;}.hp-code-fn{color:#00D4FF;}.hp-code-str{color:#00FFB2;}.hp-code-cm{color:rgba(200,220,255,.20);}

/* ── Agents ── */
.hp-agents{position:relative;z-index:2;max-width:1100px;margin:0 auto;padding:0 40px 96px;}
@media(max-width:768px){.hp-agents{padding:0 24px 72px;}}
.hp-agents-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;}
@media(max-width:768px){.hp-agents-grid{grid-template-columns:1fr 1fr;}}
@media(max-width:520px){.hp-agents-grid{grid-template-columns:1fr;}}
.hp-agent{padding:22px;border-radius:18px;border:1px solid rgba(100,180,255,.08);background:rgba(100,180,255,.025);transition:all 280ms cubic-bezier(.16,1,.3,1);position:relative;overflow:hidden;}
.hp-agent::before{content:'';position:absolute;inset:0;border-radius:18px;padding:1px;background:linear-gradient(135deg,var(--agent-c,rgba(0,212,255,.22)),rgba(100,180,255,.04));-webkit-mask:linear-gradient(#fff 0 0) content-box,linear-gradient(#fff 0 0);-webkit-mask-composite:xor;mask-composite:exclude;opacity:0;transition:opacity 280ms;pointer-events:none;}
.hp-agent:hover{background:rgba(100,180,255,.05);transform:translateY(-4px);box-shadow:0 16px 48px rgba(0,0,0,.25),0 0 30px var(--agent-glow,rgba(0,212,255,.06));}
.hp-agent:hover::before{opacity:1;}
.hp-agent-icon{width:36px;height:36px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:800;margin-bottom:14px;font-family:'JetBrains Mono',monospace;}
.hp-agent-name{font-size:15px;font-weight:700;letter-spacing:-.02em;margin-bottom:6px;color:#E8F0FF;}
.hp-agent-desc{font-size:13px;color:rgba(200,220,255,.45);line-height:1.65;margin-bottom:14px;font-family:'Inter',system-ui,sans-serif;}
.hp-agent-meta{display:flex;gap:10px;font-size:11px;font-family:'JetBrains Mono',monospace;}
.hp-agent-cost{color:rgba(0,212,255,.55);}
.hp-agent-plan{color:rgba(200,220,255,.22);text-transform:uppercase;letter-spacing:.06em;}

/* ── Pricing ── */
.hp-pricing{position:relative;z-index:2;max-width:1100px;margin:0 auto;padding:0 40px 96px;}
@media(max-width:768px){.hp-pricing{padding:0 24px 72px;}}
.hp-price-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;}
@media(max-width:960px){.hp-price-grid{grid-template-columns:1fr 1fr;}}
@media(max-width:520px){.hp-price-grid{grid-template-columns:1fr;}}
.hp-price-card{padding:24px;border-radius:20px;border:1px solid rgba(100,180,255,.08);background:rgba(100,180,255,.025);display:flex;flex-direction:column;transition:all 280ms;}
.hp-price-card:hover{transform:translateY(-4px);box-shadow:0 16px 48px rgba(0,0,0,.25);}
.hp-price-card--pro{background:linear-gradient(180deg,rgba(0,212,255,.06),rgba(0,102,255,.03));border-color:transparent;box-shadow:0 0 60px rgba(0,212,255,.08),0 20px 48px rgba(0,0,0,.30);position:relative;}
.hp-price-card--pro::before{content:'';position:absolute;inset:0;border-radius:20px;padding:1px;background:linear-gradient(135deg,rgba(0,212,255,.40),rgba(0,102,255,.25),rgba(0,255,178,.12));-webkit-mask:linear-gradient(#fff 0 0) content-box,linear-gradient(#fff 0 0);-webkit-mask-composite:xor;mask-composite:exclude;pointer-events:none;}
.hp-price-card--pro:hover{box-shadow:0 0 80px rgba(0,212,255,.12),0 24px 60px rgba(0,0,0,.35);transform:translateY(-6px);}
.hp-price-name{font-size:11px;font-weight:700;letter-spacing:.10em;text-transform:uppercase;color:rgba(200,220,255,.38);font-family:'JetBrains Mono',monospace;margin-bottom:8px;}
.hp-price-card--pro .hp-price-name{color:rgba(0,212,255,.80);}
.hp-price-amount{font-size:40px;font-weight:900;letter-spacing:-.04em;color:#E8F0FF;margin-bottom:2px;}
.hp-price-period{font-size:12px;color:rgba(200,220,255,.28);margin-bottom:12px;font-family:'Inter',system-ui,sans-serif;}
.hp-price-features{display:flex;flex-direction:column;gap:8px;flex:1;margin-bottom:16px;}
.hp-price-feat{font-size:13px;color:rgba(200,220,255,.55);display:flex;align-items:center;gap:7px;font-family:'Inter',system-ui,sans-serif;}
.hp-price-feat::before{content:"\\2713";font-size:10px;font-weight:800;color:rgba(0,255,178,.55);flex-shrink:0;}
.hp-price-btn{display:block;text-align:center;padding:12px;border-radius:12px;font-size:13px;font-weight:700;cursor:pointer;transition:all 200ms;border:1px solid rgba(100,180,255,.10);background:rgba(100,180,255,.04);color:rgba(200,220,255,.65);text-decoration:none;font-family:'Outfit',system-ui,sans-serif;}
.hp-price-btn:hover{background:rgba(100,180,255,.08);color:#E8F0FF;border-color:rgba(100,180,255,.20);text-decoration:none;}
.hp-price-card--pro .hp-price-btn{background:linear-gradient(135deg,#00D4FF,#0066FF);border-color:transparent;color:#030712;font-weight:800;position:relative;overflow:hidden;}
.hp-price-card--pro .hp-price-btn::after{content:'';position:absolute;top:0;left:-100%;width:100%;height:100%;background:linear-gradient(90deg,transparent,rgba(255,255,255,.20),transparent);animation:shimmer 4s ease-in-out infinite;}
.hp-price-card--pro .hp-price-btn:hover{box-shadow:0 0 28px rgba(0,212,255,.30);}
.hp-price-pop{position:absolute;top:14px;right:14px;font-size:9px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;padding:4px 10px;border-radius:8px;background:linear-gradient(135deg,rgba(0,212,255,.20),rgba(0,102,255,.12));color:rgba(200,220,255,.90);border:1px solid rgba(0,212,255,.25);font-family:'JetBrains Mono',monospace;}

/* ── Testimonials ── */
.hp-test{position:relative;z-index:2;max-width:1100px;margin:0 auto;padding:0 40px 96px;}
@media(max-width:768px){.hp-test{padding:0 24px 72px;}}
.hp-test-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;}
@media(max-width:768px){.hp-test-grid{grid-template-columns:1fr;}}
.hp-test-card{padding:24px;border-radius:18px;border:1px solid rgba(100,180,255,.08);background:rgba(100,180,255,.025);transition:all 200ms;}
.hp-test-card:hover{background:rgba(100,180,255,.045);transform:translateY(-3px);box-shadow:0 12px 36px rgba(0,0,0,.20);}
.hp-test-stars{color:#00D4FF;font-size:14px;letter-spacing:2px;margin-bottom:14px;}
.hp-test-quote{font-size:15px;color:rgba(200,220,255,.65);line-height:1.75;margin-bottom:18px;font-family:'Inter',system-ui,sans-serif;font-style:italic;}
.hp-test-name{font-size:14px;font-weight:700;color:#E8F0FF;letter-spacing:-.01em;}
.hp-test-role{font-size:12px;color:rgba(200,220,255,.30);margin-top:2px;font-family:'Inter',system-ui,sans-serif;}

/* ── FAQ ── */
.hp-faq{position:relative;z-index:2;max-width:720px;margin:0 auto;padding:0 40px 96px;}
@media(max-width:768px){.hp-faq{padding:0 24px 72px;}}
.hp-faq-item{border-bottom:1px solid rgba(100,180,255,.06);}
.hp-faq-q{display:flex;align-items:center;justify-content:space-between;padding:20px 0;cursor:pointer;font-size:16px;font-weight:600;color:rgba(200,220,255,.70);transition:color 200ms;font-family:'Outfit',system-ui,sans-serif;border:none;background:none;width:100%;text-align:left;}
.hp-faq-q:hover{color:#E8F0FF;}
.hp-faq-icon{font-size:18px;color:rgba(200,220,255,.25);transition:transform 300ms,color 300ms;flex-shrink:0;}
.hp-faq-icon--open{transform:rotate(45deg);color:rgba(0,212,255,.65);}
.hp-faq-a{max-height:0;overflow:hidden;transition:max-height 350ms cubic-bezier(.16,1,.3,1),padding 350ms;padding:0 0;}
.hp-faq-a--open{max-height:200px;padding:0 0 20px;}
.hp-faq-a-text{font-size:15px;color:rgba(200,220,255,.45);line-height:1.75;font-family:'Inter',system-ui,sans-serif;}

/* ── Final CTA ── */
.hp-final{position:relative;z-index:2;text-align:center;padding:0 40px 120px;}
@media(max-width:768px){.hp-final{padding:0 24px 80px;}}
.hp-final-h2{font-size:clamp(34px,5vw,60px);font-weight:900;letter-spacing:-.05em;margin:0 0 16px;line-height:1.05;}
.hp-final-h2 span{background:linear-gradient(135deg,#00D4FF,#0066FF,#7B61FF);background-size:200% 200%;-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;animation:gradShift 8s ease-in-out infinite;}
.hp-final-sub{font-size:17px;color:rgba(200,220,255,.40);margin:0 0 32px;font-family:'Inter',system-ui,sans-serif;}
      `}</style>

      <main className="hp" ref={rvRef}>
        {/* Mesh background */}
        <div className="hp-mesh">
          <div className="hp-orb1" />
          <div className="hp-orb2" />
          <div className="hp-orb3" />
        </div>

        <SiteNav />

        {/* ══════ HERO ══════ */}
        <section className="hp-hero">
          <div>
            <h1 className="hp-h1">
              Describe it.
              <span className="hp-h1-line2">We build it.</span>
            </h1>
            <p className="hp-sub">
              The world&apos;s first agentic AI website builder. Type a sentence, get production-ready React + TypeScript in under 30 seconds.
            </p>
            <div className="hp-ctas">
              <Link href="/build" className="hp-cta-primary">Start building free &rarr;</Link>
              <Link href="/gallery" className="hp-cta-secondary">See examples</Link>
            </div>
          </div>

          {/* Demo card */}
          <div className="hp-demo">
            <div className="hp-demo-card">
              <div className="hp-demo-scan" />
              <div className="hp-demo-top">
                <div className="hp-demo-dot" style={{ background: "#FF4757" }} />
                <div className="hp-demo-dot" style={{ background: "#FFB830" }} />
                <div className="hp-demo-dot" style={{ background: "#00FFB2" }} />
              </div>
              <div className="hp-demo-prompt">
                <span className="hp-demo-icon">&#9889;</span>
                <span className="hp-demo-text">
                  {typedText}
                  <span className="hp-demo-cursor" />
                </span>
              </div>
              <div className="hp-demo-preview">
                <div className="hp-demo-prev-bar" />
                <div className="hp-demo-prev-bar2" />
                <div className="hp-demo-prev-bar3" />
                <div className="hp-demo-prev-btn" />
                <div className="hp-demo-prev-grid">
                  <div className="hp-demo-prev-card" />
                  <div className="hp-demo-prev-card" />
                  <div className="hp-demo-prev-card" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ══════ STATS ══════ */}
        <section className="hp-stats rv">
          {[
            { val: "50,000+", label: "Websites generated" },
            { val: "< 30s", label: "Average build time" },
            { val: "180+", label: "Countries reached" },
            { val: "4.9 / 5", label: "User satisfaction" },
          ].map((s, i) => (
            <div key={i} className="hp-stat">
              <div className="hp-stat-val">{s.val}</div>
              <div className="hp-stat-label">{s.label}</div>
            </div>
          ))}
        </section>

        {/* ══════ TRUST MARQUEE ══════ */}
        <div className="hp-marquee-wrap rv">
          <div className="hp-marquee-label">Trusted by builders at</div>
          <div className="hp-marquee-track">
            {[...MARQUEE_LOGOS, ...MARQUEE_LOGOS].map((name, i) => (
              <span key={i} className="hp-marquee-item">{name}</span>
            ))}
          </div>
        </div>

        {/* ══════ HOW IT WORKS ══════ */}
        <section className="hp-loop">
          <div className="hp-section-badge rv"><span className="hp-section-badge-dot" />THE LOOP</div>
          <h2 className="hp-section-h2 rv rv-d1">Six steps. Zero effort.</h2>
          <p className="hp-section-sub rv rv-d2">
            Our agentic loop handles everything — from prompt to deployed production site. No drag-and-drop. No templates. Just results.
          </p>
          <div className="hp-loop-grid rv rv-d3">
            {LOOP_STEPS.map((step, i) => (
              <div
                key={step.id}
                className={`hp-loop-step${activeStep === i ? " hp-loop-step--active" : ""}`}
              >
                <div className="hp-loop-num">{step.num}</div>
                <div className="hp-loop-label">{step.label}</div>
                <div className="hp-loop-desc">{step.desc}</div>
              </div>
            ))}
          </div>
        </section>

        <div className="hp-glow-div" />

        {/* ══════ SELF-HEAL ══════ */}
        <section className="hp-heal">
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <div className="hp-section-badge rv"><span className="hp-section-badge-dot" />SELF-HEALING</div>
            <h2 className="hp-section-h2 rv rv-d1" style={{ margin: "0 auto 14px" }}>Every build validates itself.</h2>
            <p className="hp-section-sub rv rv-d2" style={{ margin: "0 auto" }}>
              Three-pass render validation catches bugs before you ever see them.
            </p>
          </div>
          <div className="hp-heal-grid rv rv-d3">
            {[
              { icon: "1", title: "Render", body: "Full DOM render in headless browser. If it crashes, the loop fixes and re-renders." },
              { icon: "2", title: "Validate", body: "HTML structure, ARIA labels, link integrity, and responsive layout verified." },
              { icon: "3", title: "Heal", body: "Any issues found are auto-patched. You only see the polished result." },
            ].map((c, i) => (
              <div key={i} className="hp-heal-card">
                <div className="hp-heal-icon" style={{ color: "#00D4FF", fontFamily: "'JetBrains Mono', monospace", fontWeight: 900 }}>{c.icon}</div>
                <div className="hp-heal-title">{c.title}</div>
                <div className="hp-heal-body">{c.body}</div>
              </div>
            ))}
          </div>
        </section>

        <div className="hp-glow-div" />

        {/* ══════ CODE EXPORT ══════ */}
        <section className="hp-code">
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <div className="hp-section-badge rv"><span className="hp-section-badge-dot" />CLEAN CODE</div>
            <h2 className="hp-section-h2 rv rv-d1" style={{ margin: "0 auto 14px" }}>Export-ready. No lock-in.</h2>
            <p className="hp-section-sub rv rv-d2" style={{ margin: "0 auto" }}>
              Every site outputs clean React + TypeScript you can host anywhere.
            </p>
          </div>
          <div className="hp-code-block rv rv-d3">
            <div className="hp-code-top">
              <div className="hp-code-dot" style={{ background: "#FF4757" }} />
              <div className="hp-code-dot" style={{ background: "#FFB830" }} />
              <div className="hp-code-dot" style={{ background: "#00FFB2" }} />
              <span className="hp-code-title">HeroSection.tsx</span>
            </div>
            <pre className="hp-code-pre">
{`  `}<span className="hp-code-kw">export default function</span> <span className="hp-code-fn">HeroSection</span>() &#123;{"\n"}
{`    `}<span className="hp-code-kw">return</span> ({"\n"}
{`      `}&lt;<span className="hp-code-fn">section</span> className=<span className="hp-code-str">&quot;hero&quot;</span>&gt;{"\n"}
{`        `}&lt;<span className="hp-code-fn">h1</span>&gt;Welcome to Your Business&lt;/<span className="hp-code-fn">h1</span>&gt;{"\n"}
{`        `}&lt;<span className="hp-code-fn">p</span>&gt;AI-generated, production-ready.&lt;/<span className="hp-code-fn">p</span>&gt;{"\n"}
{`        `}&lt;<span className="hp-code-fn">Button</span> variant=<span className="hp-code-str">&quot;primary&quot;</span>&gt;Get Started&lt;/<span className="hp-code-fn">Button</span>&gt;{"\n"}
{`      `}&lt;/<span className="hp-code-fn">section</span>&gt;{"\n"}
{`    `});{"\n"}
{`  `}&#125;
            </pre>
          </div>
        </section>

        <div className="hp-glow-div" />

        {/* ══════ SPECIALIST AGENTS ══════ */}
        <section className="hp-agents">
          <div className="hp-section-badge rv"><span className="hp-section-badge-dot" />AGENTS</div>
          <h2 className="hp-section-h2 rv rv-d1">6 specialist agents.<br />One-click quality.</h2>
          <p className="hp-section-sub rv rv-d2">
            After your site is built, run targeted AI agents that sweep for issues and auto-fix them.
          </p>
          <div className="hp-agents-grid rv rv-d3">
            {AGENTS.map((a, i) => (
              <div
                key={i}
                className="hp-agent"
                style={{ "--agent-c": `${a.color}33`, "--agent-glow": `${a.color}12` } as React.CSSProperties}
              >
                <div className="hp-agent-icon" style={{ background: `${a.color}18`, color: a.color, border: `1px solid ${a.color}30` }}>
                  {a.icon}
                </div>
                <div className="hp-agent-name">{a.name}</div>
                <div className="hp-agent-desc">{a.desc}</div>
                <div className="hp-agent-meta">
                  <span className="hp-agent-cost">{a.cost}</span>
                  <span className="hp-agent-plan">{a.plan}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="hp-glow-div" />

        {/* ══════ PRICING ══════ */}
        <section className="hp-pricing">
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <div className="hp-section-badge rv"><span className="hp-section-badge-dot" />PRICING</div>
            <h2 className="hp-section-h2 rv rv-d1" style={{ margin: "0 auto 14px" }}>Start free. Scale as you grow.</h2>
            <p className="hp-section-sub rv rv-d2" style={{ margin: "0 auto" }}>
              No credit card required. Upgrade when you&apos;re ready.
            </p>
          </div>
          <div className="hp-price-grid rv rv-d3">
            {PLANS.map(p => (
              <div key={p.name} className={`hp-price-card${p.highlight ? " hp-price-card--pro" : ""}`}>
                {p.highlight && <span className="hp-price-pop">MOST POPULAR</span>}
                <div className="hp-price-name">{p.name}</div>
                <div className="hp-price-amount">{p.price}</div>
                <div className="hp-price-period">{p.period}</div>
                <div className="hp-price-features">
                  {p.features.map(f => <div key={f} className="hp-price-feat">{f}</div>)}
                </div>
                <Link href="/pricing" className="hp-price-btn">
                  {p.highlight ? "Start Pro — $29/mo" : `Get ${p.name}`}
                </Link>
              </div>
            ))}
          </div>
        </section>

        <div className="hp-glow-div" />

        {/* ══════ TESTIMONIALS ══════ */}
        <section className="hp-test">
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <h2 className="hp-section-h2 rv" style={{ margin: "0 auto 14px" }}>Loved by builders.</h2>
            <p className="hp-section-sub rv rv-d1" style={{ margin: "0 auto" }}>
              Thousands of creators ship production sites with Dominat8 every day.
            </p>
          </div>
          <div className="hp-test-grid rv rv-d2">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="hp-test-card">
                <div className="hp-test-stars">{"★".repeat(t.stars)}</div>
                <div className="hp-test-quote">&ldquo;{t.quote}&rdquo;</div>
                <div className="hp-test-name">{t.name}</div>
                <div className="hp-test-role">{t.role}</div>
              </div>
            ))}
          </div>
        </section>

        <div className="hp-glow-div" />

        {/* ══════ FAQ ══════ */}
        <section className="hp-faq">
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <h2 className="hp-section-h2 rv" style={{ margin: "0 auto 14px" }}>Questions? Answers.</h2>
          </div>
          <div className="rv rv-d1">
            {FAQS.map((f, i) => (
              <div key={i} className="hp-faq-item">
                <button className="hp-faq-q" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  {f.q}
                  <span className={`hp-faq-icon${openFaq === i ? " hp-faq-icon--open" : ""}`}>+</span>
                </button>
                <div className={`hp-faq-a${openFaq === i ? " hp-faq-a--open" : ""}`}>
                  <div className="hp-faq-a-text">{f.a}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="hp-glow-div" />

        {/* ══════ FINAL CTA ══════ */}
        <section className="hp-final">
          <h2 className="hp-final-h2 rv">
            Ready to <span>build?</span>
          </h2>
          <p className="hp-final-sub rv rv-d1">Describe your business. Watch your site appear.</p>
          <div className="rv rv-d2">
            <Link href="/build" className="hp-cta-primary">Start building free &rarr;</Link>
          </div>
        </section>

        <SiteFooter />
      </main>
    </>
  );
}
