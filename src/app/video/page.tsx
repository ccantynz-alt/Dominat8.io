"use client";

import React, { useState, useEffect } from "react";
import type { VideoScript } from "@/app/api/video/script/route";
import { SiteNav } from "@/components/shared/SiteNav";
import { SiteFooter } from "@/components/shared/SiteFooter";

const PLATFORMS = [
  { id: "tiktok", label: "TikTok", icon: "\u{1F3B5}", color: "#FF0050" },
  { id: "facebook", label: "Facebook Reels", icon: "\u{1F4D8}", color: "#1877F2" },
  { id: "instagram", label: "Instagram Reels", icon: "\u{1F4F8}", color: "#E1306C" },
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
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

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

  const platformColor = PLATFORMS.find(p => p.id === platform)?.color ?? "#FF0050";

  return (
    <>
      <style>{`
@keyframes vpFade{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
@keyframes vpPulse{0%,100%{opacity:1}50%{opacity:.5}}
@keyframes vpShim{0%{left:-100%}40%{left:100%}100%{left:100%}}
.vp-a{animation:vpFade 700ms cubic-bezier(.16,1,.3,1) both}
.vp-d1{animation-delay:80ms}.vp-d2{animation-delay:160ms}.vp-d3{animation-delay:240ms}.vp-d4{animation-delay:320ms}

.vp-page{min-height:100vh;background:#08070B;color:#F5F0EB;font-family:'Outfit',system-ui,sans-serif;}

/* Ambient */
.vp-ambient{position:fixed;inset:0;pointer-events:none;z-index:0;overflow:hidden;}
.vp-blob1{position:absolute;width:700px;height:500px;top:-200px;right:-150px;border-radius:50%;background:radial-gradient(circle,rgba(232,113,90,.06) 0%,transparent 70%);}
.vp-blob2{position:absolute;width:500px;height:400px;bottom:-100px;left:-100px;border-radius:50%;background:radial-gradient(circle,rgba(155,138,255,.05) 0%,transparent 70%);}

.vp-main{max-width:760px;margin:0 auto;padding:120px 24px 80px;position:relative;z-index:1;}

/* Badge */
.vp-badge{display:inline-flex;align-items:center;gap:7px;padding:5px 16px;border-radius:999px;border:1px solid rgba(232,113,90,.30);background:rgba(232,113,90,.08);color:rgba(232,113,90,.90);font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;margin-bottom:22px;}
.vp-badge-dot{width:6px;height:6px;border-radius:50%;background:rgba(232,113,90,.80);}

.vp-title{font-size:clamp(30px,5vw,48px);font-weight:900;letter-spacing:-.04em;line-height:1.05;margin-bottom:12px;}
.vp-title span{-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;}
.vp-sub{font-size:17px;color:rgba(245,240,235,0.55);margin-bottom:40px;line-height:1.65;max-width:560px;}

/* Labels */
.vp-label{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:rgba(245,240,235,0.30);margin-bottom:10px;}

/* Platform pills */
.vp-platforms{display:flex;gap:10px;margin-bottom:28px;flex-wrap:wrap;}
.vp-plat{padding:11px 20px;border-radius:14px;border:1px solid rgba(245,240,235,0.08);background:rgba(245,240,235,0.035);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);color:rgba(245,240,235,0.55);font-size:14px;font-weight:600;cursor:pointer;font-family:inherit;transition:all 200ms;display:flex;align-items:center;gap:8px;}
.vp-plat:hover{border-color:rgba(245,240,235,0.16);color:rgba(245,240,235,0.80);background:rgba(245,240,235,0.06);}
.vp-plat.active{color:#F5F0EB;border-color:var(--pc);background:color-mix(in srgb,var(--pc) 12%,transparent);}

/* Select */
.vp-select{width:100%;padding:13px 16px;border-radius:14px;border:1px solid rgba(245,240,235,0.08);background:rgba(245,240,235,0.035);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);color:#F5F0EB;font-size:14px;font-family:inherit;margin-bottom:28px;outline:none;appearance:none;transition:border-color 200ms;}
.vp-select:focus{border-color:rgba(255,0,80,.35);}

/* Textarea */
.vp-textarea{width:100%;padding:16px 18px;border-radius:18px;border:1px solid rgba(245,240,235,0.08);background:rgba(245,240,235,0.035);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);color:#F5F0EB;font-size:15px;font-family:inherit;resize:vertical;min-height:90px;outline:none;line-height:1.6;margin-bottom:22px;transition:border-color 200ms;}
.vp-textarea:focus{border-color:rgba(255,0,80,.35);}
.vp-textarea::placeholder{color:rgba(245,240,235,0.30);}

/* Generate button */
.vp-gen{width:100%;padding:16px;border-radius:18px;background:linear-gradient(135deg,rgba(255,0,80,.20),rgba(232,113,90,.18));border:1px solid rgba(255,0,80,.40);color:rgba(255,80,120,.97);font-size:16px;font-weight:800;cursor:pointer;font-family:inherit;transition:all 200ms;letter-spacing:-.01em;margin-bottom:40px;position:relative;overflow:hidden;}
.vp-gen::after{content:'';position:absolute;top:0;left:-100%;width:100%;height:100%;background:linear-gradient(90deg,transparent,rgba(245,240,235,.04),transparent);animation:vpShim 4s ease-in-out infinite;}
.vp-gen:hover:not(:disabled){background:linear-gradient(135deg,rgba(255,0,80,.30),rgba(232,113,90,.25));transform:translateY(-2px);box-shadow:0 0 28px rgba(255,0,80,.10);}
.vp-gen:disabled{opacity:.45;cursor:default;transform:none;}

/* Error */
.vp-error{padding:14px 18px;border-radius:14px;border:1px solid rgba(255,80,80,.25);background:rgba(255,80,80,.06);color:rgba(255,120,120,.90);font-size:14px;margin-bottom:24px;}

/* Loading */
.vp-loading{display:flex;align-items:center;gap:8px;color:rgba(245,240,235,0.55);font-size:14px;padding:20px 0;animation:vpPulse 1.5s ease-in-out infinite;}

/* Script result sections */
.vp-script{display:flex;flex-direction:column;gap:14px;}

/* Timeline */
.vp-timeline{display:grid;grid-template-columns:repeat(5,1fr);gap:1px;margin-bottom:8px;border-radius:18px;overflow:hidden;border:1px solid rgba(245,240,235,0.08);}
.vp-tl-cell{background:rgba(245,240,235,0.035);padding:14px 10px;text-align:center;backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);}
.vp-tl-time{font-size:10px;color:rgba(245,240,235,0.30);margin-bottom:4px;font-family:'JetBrains Mono',monospace;}
.vp-tl-label{font-size:11px;font-weight:700;color:rgba(255,0,80,.70);}

/* Section card */
.vp-section{border:1px solid rgba(245,240,235,0.08);border-radius:18px;overflow:hidden;backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);background:rgba(245,240,235,0.035);transition:border-color 200ms;}
.vp-section:hover{border-color:rgba(245,240,235,0.14);}
.vp-sec-head{display:flex;align-items:center;justify-content:space-between;padding:14px 18px;background:rgba(245,240,235,0.02);border-bottom:1px solid rgba(245,240,235,0.08);}
.vp-sec-title{font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:rgba(245,240,235,0.55);display:flex;align-items:center;gap:8px;}
.vp-sec-time{font-size:11px;color:rgba(245,240,235,0.30);}
.vp-copy{padding:5px 12px;border-radius:10px;border:1px solid rgba(245,240,235,0.08);background:transparent;color:rgba(245,240,235,0.40);font-size:11px;font-weight:600;cursor:pointer;font-family:inherit;transition:all 150ms;}
.vp-copy:hover{background:rgba(245,240,235,0.06);color:rgba(245,240,235,0.75);}
.vp-copy.copied{border-color:rgba(74,222,128,.35);color:rgba(74,222,128,.80);}
.vp-sec-body{padding:16px 18px;font-size:15px;line-height:1.65;color:rgba(245,240,235,0.78);}
.vp-voiceover{font-style:italic;color:rgba(245,240,235,0.65);}
.vp-caption-body{font-size:14px;}

/* Hashtags */
.vp-hashtags{display:flex;flex-wrap:wrap;gap:6px;padding:16px 18px;}
.vp-hashtag{padding:4px 10px;border-radius:10px;background:rgba(255,0,80,.08);border:1px solid rgba(255,0,80,.18);color:rgba(255,80,120,.75);font-size:12px;font-weight:600;}

/* Overlays */
.vp-overlays{display:flex;flex-direction:column;gap:8px;padding:16px 18px;}
.vp-ov-item{display:flex;align-items:flex-start;gap:10px;}
.vp-ov-num{width:24px;height:24px;border-radius:8px;background:rgba(245,240,235,0.06);color:rgba(245,240,235,0.40);font-size:10px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:2px;}
.vp-ov-text{font-size:14px;color:rgba(245,240,235,0.70);line-height:1.45;}
      `}</style>

      <main className="vp-page">
        <div className="vp-ambient">
          <div className="vp-blob1" />
          <div className="vp-blob2" />
        </div>

        <SiteNav />

        <div className="vp-main">
          <div className={`vp-badge${mounted ? " vp-a" : ""}`}>
            <span className="vp-badge-dot" />
            AI VIDEO GENERATOR
          </div>
          <h1 className={`vp-title${mounted ? " vp-a vp-d1" : ""}`}>
            Turn your site into a<br />
            <span style={{ background: "linear-gradient(135deg,#FF0050,#E8715A)" }}>viral video</span>
          </h1>
          <p className={`vp-sub${mounted ? " vp-a vp-d2" : ""}`}>
            Generate a complete TikTok or Reels script &mdash; hook, voiceover, captions, hashtags &mdash; in seconds. Built to convert.
          </p>

          <div className={mounted ? "vp-a vp-d3" : ""}>
            <div className="vp-label">Platform</div>
            <div className="vp-platforms">
              {PLATFORMS.map(p => (
                <button
                  key={p.id}
                  className={`vp-plat${platform === p.id ? " active" : ""}`}
                  onClick={() => setPlatform(p.id)}
                  style={{ "--pc": p.color } as React.CSSProperties}
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
              className="vp-gen"
              onClick={generate}
              disabled={loading || !prompt.trim()}
            >
              {loading ? "Generating script..." : "Generate video script \u2192"}
            </button>
          </div>

          {error && <div className="vp-error">{error}</div>}

          {loading && (
            <div className="vp-loading">
              <span>\u2726</span> Writing your viral script...
            </div>
          )}

          {script && (
            <div className="vp-script vp-a">
              {/* Timeline overview */}
              <div className="vp-timeline">
                {[
                  { label: "HOOK", time: "0\u20133s" },
                  { label: "PROBLEM", time: "3\u20138s" },
                  { label: "SOLUTION", time: "8\u201315s" },
                  { label: "PROOF", time: "15\u201322s" },
                  { label: "CTA", time: "22\u201330s" },
                ].map(t => (
                  <div key={t.label} className="vp-tl-cell">
                    <div className="vp-tl-time">{t.time}</div>
                    <div className="vp-tl-label">{t.label}</div>
                  </div>
                ))}
              </div>

              {/* Script sections */}
              {[
                { key: "hook", label: "\u{1F3A3} Hook", time: "0\u20133s", content: script.hook },
                { key: "problem", label: "\u{1F624} Problem", time: "3\u20138s", content: script.problem },
                { key: "solution", label: "\u26A1 Solution", time: "8\u201315s", content: script.solution },
                { key: "proof", label: "\u2705 Proof", time: "15\u201322s", content: script.proof },
                { key: "cta", label: "\u{1F680} CTA", time: "22\u201330s", content: script.cta },
              ].map(s => (
                <div key={s.key} className="vp-section">
                  <div className="vp-sec-head">
                    <div className="vp-sec-title">
                      {s.label}
                      <span className="vp-sec-time">{s.time}</span>
                    </div>
                    <button
                      className={`vp-copy${copiedField === s.key ? " copied" : ""}`}
                      onClick={() => copy(s.content, s.key)}
                    >
                      {copiedField === s.key ? "Copied!" : "Copy"}
                    </button>
                  </div>
                  <div className="vp-sec-body">{s.content}</div>
                </div>
              ))}

              {/* Voiceover */}
              <div className="vp-section">
                <div className="vp-sec-head">
                  <div className="vp-sec-title">{"\u{1F399}"} Full voiceover script</div>
                  <button
                    className={`vp-copy${copiedField === "voiceover" ? " copied" : ""}`}
                    onClick={() => copy(script.voiceover, "voiceover")}
                  >
                    {copiedField === "voiceover" ? "Copied!" : "Copy"}
                  </button>
                </div>
                <div className="vp-sec-body vp-voiceover">{script.voiceover}</div>
              </div>

              {/* On-screen overlays */}
              <div className="vp-section">
                <div className="vp-sec-head">
                  <div className="vp-sec-title">{"\u{1F4F1}"} On-screen text overlays</div>
                  <button
                    className={`vp-copy${copiedField === "overlays" ? " copied" : ""}`}
                    onClick={() => copy(script.overlayTexts.join("\n"), "overlays")}
                  >
                    {copiedField === "overlays" ? "Copied!" : "Copy all"}
                  </button>
                </div>
                <div className="vp-overlays">
                  {script.overlayTexts.map((t, i) => (
                    <div key={i} className="vp-ov-item">
                      <div className="vp-ov-num">{i + 1}</div>
                      <div className="vp-ov-text">{t}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Caption */}
              <div className="vp-section">
                <div className="vp-sec-head">
                  <div className="vp-sec-title">{"\u{1F4DD}"} Caption</div>
                  <button
                    className={`vp-copy${copiedField === "caption" ? " copied" : ""}`}
                    onClick={() => copy(`${script.caption}\n\n#${script.hashtags.join(" #")}`, "caption")}
                  >
                    {copiedField === "caption" ? "Copied!" : "Copy with hashtags"}
                  </button>
                </div>
                <div className="vp-sec-body vp-caption-body">{script.caption}</div>
                <div className="vp-hashtags">
                  {script.hashtags.map(h => (
                    <span key={h} className="vp-hashtag">#{h}</span>
                  ))}
                </div>
              </div>

              {/* Generate another */}
              <button
                className="vp-gen"
                onClick={generate}
                disabled={loading}
                style={{ marginTop: 8 }}
              >
                {"\u21BA"} Generate another variation
              </button>
            </div>
          )}
        </div>

        <SiteFooter />
      </main>
    </>
  );
}
