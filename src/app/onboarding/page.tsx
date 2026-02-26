"use client";

import React, { useState } from "react";
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

  function finish() {
    // Store selections so Builder can pre-fill
    if (typeof window !== "undefined") {
      if (industry) localStorage.setItem("d8_onboard_industry", industry);
      if (goal) localStorage.setItem("d8_onboard_goal", goal);
    }
    router.push("/build");
  }

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #060810; color: #e9eef7; font-family: 'Outfit', system-ui, sans-serif; }
        .ob-root { min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px 24px; }
        .ob-logo { font-size: 22px; font-weight: 900; letter-spacing: -0.03em; margin-bottom: 48px; }
        .ob-logo span { color: #3DF0FF; }
        .ob-card { width: 100%; max-width: 560px; }
        .ob-step { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: rgba(61,240,255,0.70); margin-bottom: 12px; }
        .ob-title { font-size: 32px; font-weight: 800; letter-spacing: -0.03em; margin-bottom: 8px; }
        .ob-sub { font-size: 15px; color: rgba(255,255,255,0.50); margin-bottom: 32px; }
        .ob-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 32px; }
        @media (max-width: 480px) { .ob-grid { grid-template-columns: repeat(2, 1fr); } }
        .ob-chip { padding: 14px 12px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.10); background: rgba(255,255,255,0.04); cursor: pointer; text-align: center; transition: all 150ms; font-size: 13px; font-weight: 600; color: rgba(255,255,255,0.70); display: flex; flex-direction: column; align-items: center; gap: 6px; }
        .ob-chip:hover { border-color: rgba(61,240,255,0.35); background: rgba(61,240,255,0.06); color: #fff; }
        .ob-chip.selected { border-color: rgba(61,240,255,0.60); background: rgba(61,240,255,0.12); color: rgba(61,240,255,0.95); }
        .ob-chip-icon { font-size: 22px; }
        .ob-btn { width: 100%; padding: 15px; border-radius: 12px; background: linear-gradient(135deg, rgba(61,240,255,0.20), rgba(139,92,246,0.20)); border: 1px solid rgba(61,240,255,0.45); color: rgba(61,240,255,0.97); font-size: 16px; font-weight: 700; cursor: pointer; font-family: inherit; transition: all 150ms; letter-spacing: -0.01em; }
        .ob-btn:hover { background: linear-gradient(135deg, rgba(61,240,255,0.28), rgba(139,92,246,0.28)); transform: translateY(-1px); }
        .ob-btn:disabled { opacity: 0.4; cursor: default; transform: none; }
        .ob-skip { display: block; text-align: center; margin-top: 16px; font-size: 13px; color: rgba(255,255,255,0.30); cursor: pointer; background: none; border: none; font-family: inherit; }
        .ob-skip:hover { color: rgba(255,255,255,0.55); }
        .ob-progress { display: flex; gap: 6px; margin-bottom: 40px; }
        .ob-dot { height: 3px; border-radius: 2px; background: rgba(255,255,255,0.12); transition: all 300ms; }
        .ob-dot.active { background: rgba(61,240,255,0.70); }
      `}</style>

      <div className="ob-root">
        <div className="ob-logo">Dominat8<span>.io</span></div>

        <div className="ob-card">
          {/* Progress dots */}
          <div className="ob-progress">
            {[0, 1].map(i => (
              <div key={i} className={`ob-dot ${i <= step ? "active" : ""}`}
                style={{ flex: i === step ? 2 : 1 }} />
            ))}
          </div>

          {step === 0 && (
            <>
              <div className="ob-step">Step 1 of 2</div>
              <div className="ob-title">What kind of business?</div>
              <div className="ob-sub">We&apos;ll customise the AI for your industry.</div>
              <div className="ob-grid">
                {INDUSTRIES.map(ind => (
                  <div
                    key={ind.label}
                    className={`ob-chip ${industry === ind.label ? "selected" : ""}`}
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
                Continue →
              </button>
              <button className="ob-skip" onClick={finish}>Skip for now</button>
            </>
          )}

          {step === 1 && (
            <>
              <div className="ob-step">Step 2 of 2</div>
              <div className="ob-title">What&apos;s your main goal?</div>
              <div className="ob-sub">This helps the AI write better copy for you.</div>
              <div className="ob-grid" style={{ gridTemplateColumns: "repeat(2, 1fr)" }}>
                {GOALS.map(g => (
                  <div
                    key={g.label}
                    className={`ob-chip ${goal === g.label ? "selected" : ""}`}
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
                Build my site →
              </button>
              <button className="ob-skip" onClick={() => setStep(0)}>← Back</button>
            </>
          )}
        </div>
      </div>
    </>
  );
}
