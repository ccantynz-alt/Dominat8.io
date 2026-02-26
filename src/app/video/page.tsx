"use client";

import React, { useState } from "react";
import type { VideoScript } from "@/app/api/video/script/route";

const PLATFORMS = [
  { id: "tiktok", label: "TikTok", icon: "🎵", color: "rgba(255,0,80,0.85)" },
  { id: "facebook", label: "Facebook Reels", icon: "📘", color: "rgba(24,119,242,0.85)" },
  { id: "instagram", label: "Instagram Reels", icon: "📸", color: "rgba(225,48,108,0.85)" },
] as const;

const INDUSTRIES = [
  "Restaurant", "Law Firm", "SaaS", "Real Estate", "Fitness", "E-commerce",
  "Portfolio", "Agency", "Medical", "Education", "Photography", "Consulting",
  "Technology", "Finance", "Travel", "Beauty",
];

export default function VideoPage() {
  const [platform, setPlatform] = useState<"tiktok" | "facebook" | "instagram">("tiktok");
  const [industry, setIndustry] = useState("SaaS");
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [script, setScript] = useState<VideoScript | null>(null);
  const [error, setError] = useState("");
  const [copiedField, setCopiedField] = useState("");

  async function generate() {
    if (!prompt.trim()) return;
    setLoading(true);
    setError("");
    setScript(null);
    try {
      const res = await fetch("/api/video/script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, industry, platform }),
      });
      const data = await res.json();
      if (data.script) {
        setScript(data.script as VideoScript);
      } else {
        setError(data.error ?? "Failed to generate script");
      }
    } catch {
      setError("Network error — try again");
    } finally {
      setLoading(false);
    }
  }

  function copy(text: string, field: string) {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(""), 2000);
  }

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #060810; color: #e9eef7; font-family: 'Outfit', system-ui, sans-serif; }
        .vp-root { min-height: 100vh; }
        .vp-nav { position: fixed; top: 0; left: 0; right: 0; z-index: 100; backdrop-filter: blur(24px); background: rgba(6,8,16,0.82); border-bottom: 1px solid rgba(255,255,255,0.07); display: flex; align-items: center; justify-content: space-between; padding: 0 32px; height: 56px; }
        .vp-logo { font-size: 18px; font-weight: 800; color: #fff; text-decoration: none; letter-spacing: -0.03em; }
        .vp-nav-btn { padding: 6px 14px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.12); background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.75); font-size: 13px; font-weight: 500; text-decoration: none; }
        .vp-main { max-width: 760px; margin: 0 auto; padding: 80px 24px 80px; }
        .vp-badge { display: inline-flex; align-items: center; gap: 6px; padding: 4px 12px; border-radius: 99px; border: 1px solid rgba(255,0,80,0.30); background: rgba(255,0,80,0.08); color: rgba(255,80,120,0.90); font-size: 11px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; margin-bottom: 16px; }
        .vp-title { font-size: clamp(28px,5vw,44px); font-weight: 900; letter-spacing: -0.04em; line-height: 1.05; margin-bottom: 10px; }
        .vp-sub { font-size: 16px; color: rgba(255,255,255,0.50); margin-bottom: 40px; line-height: 1.5; }
        .vp-label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.07em; color: rgba(255,255,255,0.40); margin-bottom: 10px; }
        .vp-platform-row { display: flex; gap: 10px; margin-bottom: 24px; flex-wrap: wrap; }
        .vp-platform-btn { padding: 10px 18px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.12); background: rgba(255,255,255,0.04); color: rgba(255,255,255,0.60); font-size: 14px; font-weight: 600; cursor: pointer; font-family: inherit; transition: all 150ms; display: flex; align-items: center; gap: 6px; }
        .vp-platform-btn.active { background: rgba(255,255,255,0.10); border-color: rgba(255,255,255,0.30); color: #fff; }
        .vp-select { width: 100%; padding: 12px 14px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.12); background: rgba(255,255,255,0.04); color: #e9eef7; font-size: 14px; font-family: inherit; margin-bottom: 24px; outline: none; appearance: none; }
        .vp-textarea { width: 100%; padding: 14px 16px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.12); background: rgba(255,255,255,0.04); color: #e9eef7; font-size: 15px; font-family: inherit; resize: vertical; min-height: 80px; outline: none; line-height: 1.5; margin-bottom: 20px; transition: border-color 150ms; }
        .vp-textarea:focus { border-color: rgba(255,0,80,0.40); }
        .vp-generate-btn { width: 100%; padding: 15px; border-radius: 12px; background: linear-gradient(135deg, rgba(255,0,80,0.25), rgba(139,92,246,0.25)); border: 1px solid rgba(255,0,80,0.45); color: rgba(255,80,120,0.97); font-size: 16px; font-weight: 800; cursor: pointer; font-family: inherit; transition: all 150ms; letter-spacing: -0.01em; margin-bottom: 40px; }
        .vp-generate-btn:hover:not(:disabled) { background: linear-gradient(135deg, rgba(255,0,80,0.35), rgba(139,92,246,0.35)); transform: translateY(-1px); }
        .vp-generate-btn:disabled { opacity: 0.5; cursor: default; transform: none; }
        .vp-error { padding: 14px 18px; border-radius: 10px; border: 1px solid rgba(255,80,80,0.30); background: rgba(255,80,80,0.08); color: rgba(255,120,120,0.90); font-size: 14px; margin-bottom: 24px; }
        .vp-script { display: flex; flex-direction: column; gap: 12px; }
        .vp-section { border: 1px solid rgba(255,255,255,0.09); border-radius: 14px; overflow: hidden; }
        .vp-section-head { display: flex; align-items: center; justify-content: space-between; padding: 14px 18px; background: rgba(255,255,255,0.03); border-bottom: 1px solid rgba(255,255,255,0.07); }
        .vp-section-title { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.07em; color: rgba(255,255,255,0.45); display: flex; align-items: center; gap: 8px; }
        .vp-section-time { font-size: 11px; color: rgba(255,255,255,0.25); }
        .vp-copy-btn { padding: 5px 10px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.12); background: transparent; color: rgba(255,255,255,0.45); font-size: 11px; font-weight: 600; cursor: pointer; font-family: inherit; transition: all 120ms; }
        .vp-copy-btn:hover { background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.80); }
        .vp-copy-btn.copied { border-color: rgba(56,248,166,0.35); color: rgba(56,248,166,0.80); }
        .vp-section-body { padding: 16px 18px; font-size: 15px; line-height: 1.6; color: rgba(255,255,255,0.80); }
        .vp-voiceover { font-style: italic; color: rgba(255,255,255,0.70); }
        .vp-caption-body { font-size: 14px; }
        .vp-hashtags { display: flex; flex-wrap: wrap; gap: 6px; padding: 16px 18px; }
        .vp-hashtag { padding: 4px 10px; border-radius: 6px; background: rgba(255,0,80,0.10); border: 1px solid rgba(255,0,80,0.20); color: rgba(255,80,120,0.80); font-size: 12px; font-weight: 600; }
        .vp-overlays { display: flex; flex-direction: column; gap: 8px; padding: 16px 18px; }
        .vp-overlay-item { display: flex; align-items: flex-start; gap: 10px; }
        .vp-overlay-num { width: 22px; height: 22px; border-radius: 6px; background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.45); font-size: 10px; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 2px; }
        .vp-overlay-text { font-size: 14px; color: rgba(255,255,255,0.75); line-height: 1.4; }
        .vp-timeline { display: grid; grid-template-columns: repeat(5, 1fr); gap: 1px; margin-bottom: 24px; background: rgba(255,255,255,0.06); border-radius: 12px; overflow: hidden; }
        .vp-tl-cell { background: #060810; padding: 12px 10px; text-align: center; }
        .vp-tl-time { font-size: 10px; color: rgba(255,255,255,0.30); margin-bottom: 4px; font-family: 'JetBrains Mono', monospace; }
        .vp-tl-label { font-size: 11px; font-weight: 700; color: rgba(255,0,80,0.75); }
        @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.5; } }
        .vp-loading { display: flex; align-items: center; gap: 8px; color: rgba(255,255,255,0.45); font-size: 14px; padding: 20px 0; animation: pulse 1.5s ease-in-out infinite; }
      `}</style>

      <div className="vp-root">
        <nav className="vp-nav">
          <a href="/" className="vp-logo">Dominat8.io</a>
          <div style={{ display: "flex", gap: 8 }}>
            <a href="/dashboard" className="vp-nav-btn">Dashboard</a>
            <a href="/build" className="vp-nav-btn" style={{ background: "rgba(255,0,80,0.12)", borderColor: "rgba(255,0,80,0.30)", color: "rgba(255,80,120,0.90)" }}>⚡ Builder</a>
          </div>
        </nav>

        <main className="vp-main">
          <div className="vp-badge">🎵 AI Video Generator</div>
          <h1 className="vp-title">Turn your site into a<br /><span style={{ background: "linear-gradient(135deg,#FF0050,#8B5CF6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>viral video</span></h1>
          <p className="vp-sub">Generate a complete TikTok or Reels script — hook, voiceover, captions, hashtags — in seconds. Built to convert.</p>

          <div className="vp-label">Platform</div>
          <div className="vp-platform-row">
            {PLATFORMS.map(p => (
              <button
                key={p.id}
                className={`vp-platform-btn ${platform === p.id ? "active" : ""}`}
                onClick={() => setPlatform(p.id)}
                style={platform === p.id ? { borderColor: p.color, color: p.color, background: `${p.color}15` } : {}}
              >
                {p.icon} {p.label}
              </button>
            ))}
          </div>

          <div className="vp-label">Industry / Niche</div>
          <select className="vp-select" value={industry} onChange={e => setIndustry(e.target.value)}>
            {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
          </select>

          <div className="vp-label">What does your site / business do?</div>
          <textarea
            className="vp-textarea"
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            placeholder="A luxury plumbing company in Auckland — premium, trustworthy, modern"
            rows={3}
          />

          <button
            className="vp-generate-btn"
            onClick={generate}
            disabled={loading || !prompt.trim()}
          >
            {loading ? "Generating script…" : "Generate video script →"}
          </button>

          {error && <div className="vp-error">⚠️ {error}</div>}

          {loading && (
            <div className="vp-loading">
              <span>✦</span> Writing your viral script…
            </div>
          )}

          {script && (
            <div className="vp-script">
              {/* Timeline overview */}
              <div className="vp-timeline">
                {[
                  { label: "HOOK", time: "0–3s" },
                  { label: "PROBLEM", time: "3–8s" },
                  { label: "SOLUTION", time: "8–15s" },
                  { label: "PROOF", time: "15–22s" },
                  { label: "CTA", time: "22–30s" },
                ].map(t => (
                  <div key={t.label} className="vp-tl-cell">
                    <div className="vp-tl-time">{t.time}</div>
                    <div className="vp-tl-label">{t.label}</div>
                  </div>
                ))}
              </div>

              {/* Hook */}
              {[
                { key: "hook", label: "🎣 Hook", time: "0–3s", content: script.hook },
                { key: "problem", label: "😤 Problem", time: "3–8s", content: script.problem },
                { key: "solution", label: "⚡ Solution", time: "8–15s", content: script.solution },
                { key: "proof", label: "✅ Proof", time: "15–22s", content: script.proof },
                { key: "cta", label: "🚀 CTA", time: "22–30s", content: script.cta },
              ].map(s => (
                <div key={s.key} className="vp-section">
                  <div className="vp-section-head">
                    <div className="vp-section-title">
                      {s.label}
                      <span className="vp-section-time">{s.time}</span>
                    </div>
                    <button
                      className={`vp-copy-btn ${copiedField === s.key ? "copied" : ""}`}
                      onClick={() => copy(s.content, s.key)}
                    >
                      {copiedField === s.key ? "Copied!" : "Copy"}
                    </button>
                  </div>
                  <div className="vp-section-body">{s.content}</div>
                </div>
              ))}

              {/* Voiceover */}
              <div className="vp-section">
                <div className="vp-section-head">
                  <div className="vp-section-title">🎙 Full voiceover script</div>
                  <button
                    className={`vp-copy-btn ${copiedField === "voiceover" ? "copied" : ""}`}
                    onClick={() => copy(script.voiceover, "voiceover")}
                  >
                    {copiedField === "voiceover" ? "Copied!" : "Copy"}
                  </button>
                </div>
                <div className="vp-section-body vp-voiceover">{script.voiceover}</div>
              </div>

              {/* On-screen overlays */}
              <div className="vp-section">
                <div className="vp-section-head">
                  <div className="vp-section-title">📱 On-screen text overlays</div>
                  <button
                    className={`vp-copy-btn ${copiedField === "overlays" ? "copied" : ""}`}
                    onClick={() => copy(script.overlayTexts.join("\n"), "overlays")}
                  >
                    {copiedField === "overlays" ? "Copied!" : "Copy all"}
                  </button>
                </div>
                <div className="vp-overlays">
                  {script.overlayTexts.map((t, i) => (
                    <div key={i} className="vp-overlay-item">
                      <div className="vp-overlay-num">{i + 1}</div>
                      <div className="vp-overlay-text">{t}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Caption */}
              <div className="vp-section">
                <div className="vp-section-head">
                  <div className="vp-section-title">📝 Caption</div>
                  <button
                    className={`vp-copy-btn ${copiedField === "caption" ? "copied" : ""}`}
                    onClick={() => copy(`${script.caption}\n\n#${script.hashtags.join(" #")}`, "caption")}
                  >
                    {copiedField === "caption" ? "Copied!" : "Copy with hashtags"}
                  </button>
                </div>
                <div className="vp-section-body vp-caption-body">{script.caption}</div>
                <div className="vp-hashtags">
                  {script.hashtags.map(h => (
                    <span key={h} className="vp-hashtag">#{h}</span>
                  ))}
                </div>
              </div>

              {/* Generate another */}
              <button
                className="vp-generate-btn"
                onClick={generate}
                disabled={loading}
                style={{ marginTop: 8 }}
              >
                ↺ Generate another variation
              </button>
            </div>
          )}
        </main>
      </div>
    </>
  );
}
