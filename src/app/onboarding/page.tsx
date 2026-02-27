"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const INDUSTRIES = [
  { label: "Restaurant", icon: "🍽️" },
  { label: "Law Firm", icon: "⚖️" },
  { label: "SaaS", icon: "⚡" },
  { label: "Real Estate", icon: "🏠" },
  { label: "Fitness", icon: "💪" },
  { label: "E-commerce", icon: "🛍️" },
  { label: "Portfolio", icon: "✦" },
  { label: "Agency", icon: "🚀" },
  { label: "Medical", icon: "🏥" },
  { label: "Education", icon: "🎓" },
  { label: "Photography", icon: "📸" },
  { label: "Consulting", icon: "🧠" },
];

const GOALS = [
  { label: "Generate leads", icon: "🎯" },
  { label: "Sell products", icon: "🛒" },
  { label: "Build a portfolio", icon: "✨" },
  { label: "Grow a brand", icon: "📈" },
  { label: "Just exploring", icon: "👀" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [industry, setIndustry] = useState("");
  const [goal, setGoal] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  function finish() {
    if (typeof window !== "undefined") {
      if (industry) localStorage.setItem("d8_onboard_industry", industry);
      if (goal) localStorage.setItem("d8_onboard_goal", goal);
    }
    router.push("/build");
  }

  return (
    <>
      <style>{`
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap');
@keyframes obFade{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
@keyframes obShim{0%{left:-100%}40%{left:100%}100%{left:100%}}
@keyframes obPulse{0%,100%{opacity:.5}50%{opacity:1}}
@keyframes obFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
.ob-a{animation:obFade 700ms cubic-bezier(.16,1,.3,1) both}
.ob-d1{animation-delay:80ms}.ob-d2{animation-delay:160ms}.ob-d3{animation-delay:240ms}.ob-d4{animation-delay:320ms}

.ob-page{min-height:100vh;background:#08070B;color:#F5F0EB;font-family:'Outfit',system-ui,sans-serif;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:40px 24px;position:relative;overflow:hidden;}

/* Ambient blobs — warm amber/coral mesh orbs */
.ob-ambient{position:fixed;inset:0;pointer-events:none;z-index:0;overflow:hidden;}
.ob-blob1{position:absolute;width:600px;height:400px;top:-150px;left:-100px;border-radius:50%;background:radial-gradient(circle,rgba(240,179,90,.07) 0%,transparent 70%);animation:obFloat 8s ease-in-out infinite;}
.ob-blob2{position:absolute;width:500px;height:350px;bottom:-100px;right:-100px;border-radius:50%;background:radial-gradient(circle,rgba(232,113,90,.07) 0%,transparent 70%);animation:obFloat 10s ease-in-out infinite 1s;}

/* Logo */
.ob-logo{font-size:24px;font-weight:900;letter-spacing:-.03em;margin-bottom:48px;position:relative;z-index:1;color:#F5F0EB;}
.ob-logo span{background:linear-gradient(135deg,#F0B35A,#E8715A);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;}

/* Card */
.ob-card{width:100%;max-width:580px;position:relative;z-index:1;}

/* Progress bar */
.ob-progress{display:flex;gap:8px;margin-bottom:40px;}
.ob-bar{height:4px;border-radius:3px;background:rgba(245,240,235,.08);transition:all 500ms cubic-bezier(.16,1,.3,1);position:relative;overflow:hidden;}
.ob-bar.active{background:rgba(240,179,90,.20);}
.ob-bar.active::after{content:'';position:absolute;inset:0;border-radius:3px;background:linear-gradient(90deg,#F0B35A,#E8A040);animation:obShim 3s ease-in-out infinite;}
.ob-bar.done{background:linear-gradient(90deg,#F0B35A,#E8715A);}

/* Step indicator */
.ob-step{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.10em;color:#F0B35A;margin-bottom:14px;font-family:'Inter',system-ui,sans-serif;}

.ob-title{font-size:clamp(28px,4.5vw,36px);font-weight:800;letter-spacing:-.04em;margin-bottom:10px;line-height:1.1;color:#F5F0EB;}
.ob-sub{font-size:15px;color:rgba(245,240,235,.45);margin-bottom:36px;line-height:1.6;font-family:'Inter',system-ui,sans-serif;}

/* Chips grid */
.ob-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:36px;}
@media(max-width:500px){.ob-grid{grid-template-columns:repeat(2,1fr);}}

.ob-chip{padding:16px 14px;border-radius:16px;border:1px solid rgba(245,240,235,.08);background:rgba(245,240,235,.035);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);cursor:pointer;text-align:center;transition:all 220ms cubic-bezier(.16,1,.3,1);font-size:13px;font-weight:600;color:rgba(245,240,235,.65);display:flex;flex-direction:column;align-items:center;gap:8px;position:relative;overflow:hidden;}
.ob-chip::before{content:'';position:absolute;inset:0;border-radius:16px;padding:1px;background:linear-gradient(135deg,rgba(240,179,90,.30),rgba(232,113,90,.25));-webkit-mask:linear-gradient(#fff 0 0) content-box,linear-gradient(#fff 0 0);-webkit-mask-composite:xor;mask-composite:exclude;opacity:0;transition:opacity 220ms;pointer-events:none;}
.ob-chip:hover{border-color:rgba(240,179,90,.25);background:rgba(240,179,90,.05);color:#F5F0EB;transform:translateY(-2px);}
.ob-chip:hover::before{opacity:.5;}
.ob-chip.selected{border-color:rgba(240,179,90,.50);background:rgba(240,179,90,.10);color:#F0B35A;}
.ob-chip.selected::before{opacity:1;}
.ob-chip-icon{font-size:24px;}

/* CTA button — amber gradient with dark text */
.ob-btn{width:100%;padding:16px;border-radius:16px;background:linear-gradient(135deg,#F0B35A,#E8A040);border:1px solid rgba(240,179,90,.50);color:#0F0D15;font-size:16px;font-weight:800;cursor:pointer;font-family:inherit;transition:all 200ms;letter-spacing:-.01em;position:relative;overflow:hidden;}
.ob-btn::after{content:'';position:absolute;top:0;left:-100%;width:100%;height:100%;background:linear-gradient(90deg,transparent,rgba(255,255,255,.12),transparent);animation:obShim 4s ease-in-out infinite;}
.ob-btn:hover{background:linear-gradient(135deg,#F5C06A,#F0B35A);transform:translateY(-2px);box-shadow:0 0 28px rgba(240,179,90,.20);}
.ob-btn:disabled{opacity:.35;cursor:default;transform:none;box-shadow:none;}

/* Skip / back */
.ob-skip{display:block;text-align:center;margin-top:18px;font-size:13px;color:rgba(245,240,235,.28);cursor:pointer;background:none;border:none;font-family:inherit;transition:color 150ms;}
.ob-skip:hover{color:rgba(245,240,235,.55);}
      `}</style>

      <div className="ob-page">
        <div className="ob-ambient">
          <div className="ob-blob1" />
          <div className="ob-blob2" />
        </div>

        <div className={`ob-logo${mounted ? " ob-a" : ""}`}>
          Dominat8<span>.io</span>
        </div>

        <div className="ob-card">
          {/* Progress bar */}
          <div className={`ob-progress${mounted ? " ob-a" : ""}`}>
            {[0, 1].map(i => (
              <div
                key={i}
                className={`ob-bar${i === step ? " active" : ""}${i < step ? " done" : ""}`}
                style={{ flex: i === step ? 2.5 : 1 }}
              />
            ))}
          </div>

          {step === 0 && (
            <div className={mounted ? "ob-a ob-d1" : ""}>
              <div className="ob-step">Step 1 of 2</div>
              <div className="ob-title">What kind of business?</div>
              <div className="ob-sub">We&apos;ll customise the AI for your industry.</div>
              <div className="ob-grid">
                {INDUSTRIES.map(ind => (
                  <div
                    key={ind.label}
                    className={`ob-chip${industry === ind.label ? " selected" : ""}`}
                    onClick={() => setIndustry(ind.label)}
                  >
                    <span className="ob-chip-icon">{ind.icon}</span>
                    {ind.label}
                  </div>
                ))}
              </div>
              <button
                className="ob-btn"
                onClick={() => setStep(1)}
                disabled={!industry}
              >
                Continue &rarr;
              </button>
              <button className="ob-skip" onClick={finish}>Skip for now</button>
            </div>
          )}

          {step === 1 && (
            <div className={mounted ? "ob-a" : ""}>
              <div className="ob-step">Step 2 of 2</div>
              <div className="ob-title">What&apos;s your main goal?</div>
              <div className="ob-sub">This helps the AI write better copy for you.</div>
              <div className="ob-grid" style={{ gridTemplateColumns: "repeat(2, 1fr)" }}>
                {GOALS.map(g => (
                  <div
                    key={g.label}
                    className={`ob-chip${goal === g.label ? " selected" : ""}`}
                    onClick={() => setGoal(g.label)}
                  >
                    <span className="ob-chip-icon">{g.icon}</span>
                    {g.label}
                  </div>
                ))}
              </div>
              <button
                className="ob-btn"
                onClick={finish}
                style={{ marginTop: 8 }}
              >
                Build my site &rarr;
              </button>
              <button className="ob-skip" onClick={() => setStep(0)}>&larr; Back</button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
