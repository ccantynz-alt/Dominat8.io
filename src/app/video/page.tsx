"use client";

import React, { useState, useEffect } from "react";
import type { VideoScript } from "@/app/api/video/script/route";
import type { VideoProduction } from "@/app/api/video/produce/route";
import { SiteNav } from "@/components/shared/SiteNav";
import { SiteFooter } from "@/components/shared/SiteFooter";

const PLATFORMS = [
  { id: "tiktok", label: "TikTok", icon: "\u{1F3B5}", color: "#FF0050" },
  { id: "facebook", label: "Facebook Reels", icon: "\u{1F4D8}", color: "#1877F2" },
  { id: "instagram", label: "Instagram Reels", icon: "\u{1F4F8}", color: "#E1306C" },
] as const;

const PRO_PLATFORMS = [
  { id: "tiktok", label: "TikTok", icon: "\u{1F3B5}", color: "#FF0050" },
  { id: "facebook", label: "Facebook", icon: "\u{1F4D8}", color: "#1877F2" },
  { id: "instagram", label: "Instagram", icon: "\u{1F4F8}", color: "#E1306C" },
  { id: "youtube", label: "YouTube", icon: "\u{1F3AC}", color: "#FF0000" },
] as const;

const DURATIONS = [
  { id: "15", label: "15s", desc: "Quick hook" },
  { id: "30", label: "30s", desc: "Standard" },
  { id: "60", label: "60s", desc: "Deep dive" },
] as const;

const INDUSTRIES = [
  "Restaurant", "Law Firm", "SaaS", "Real Estate", "Fitness", "E-commerce",
  "Portfolio", "Agency", "Medical", "Education", "Photography", "Consulting",
  "Technology", "Finance", "Travel", "Beauty",
];

type Tier = "script" | "production";

export default function VideoPage() {
  const [tier, setTier] = useState<Tier>("script");
  const [platform, setPlatform] = useState<string>("tiktok");
  const [duration, setDuration] = useState<"15" | "30" | "60">("30");
  const [industry, setIndustry] = useState("SaaS");
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [script, setScript] = useState<VideoScript | null>(null);
  const [production, setProduction] = useState<VideoProduction | null>(null);
  const [error, setError] = useState("");
  const [copiedField, setCopiedField] = useState("");
  const [mounted, setMounted] = useState(false);
  const [expandedScene, setExpandedScene] = useState<number | null>(null);

  useEffect(() => { setMounted(true); }, []);

  async function generate() {
    if (!prompt.trim()) return;
    setLoading(true);
    setError("");
    setScript(null);
    setProduction(null);

    try {
      if (tier === "script") {
        const res = await fetch("/api/video/script", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt, industry, platform }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error ?? "Failed to generate script");
        } else if (data.script) {
          setScript(data.script as VideoScript);
        } else {
          setError("Failed to generate script");
        }
      } else {
        const res = await fetch("/api/video/produce", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt, industry, platform, duration }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error ?? "Failed to generate production package");
        } else if (data.production) {
          setProduction(data.production as VideoProduction);
        } else {
          setError("Failed to generate production package");
        }
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

  const activePlatforms = tier === "production" ? PRO_PLATFORMS : PLATFORMS;

  return (
    <>
      <style>{`
@keyframes vpFade{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
@keyframes vpPulse{0%,100%{opacity:1}50%{opacity:.5}}
@keyframes vpShim{0%{left:-100%}40%{left:100%}100%{left:100%}}
@keyframes vpGlow{0%,100%{box-shadow:0 0 30px rgba(168,85,247,.12)}50%{box-shadow:0 0 60px rgba(168,85,247,.22)}}
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

/* Tier selector */
.vp-tiers{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:32px;}
.vp-tier{padding:18px 20px;border-radius:18px;border:1px solid rgba(245,240,235,0.08);background:rgba(245,240,235,0.025);cursor:pointer;transition:all 250ms;position:relative;overflow:hidden;}
.vp-tier:hover{border-color:rgba(245,240,235,0.16);background:rgba(245,240,235,0.04);}
.vp-tier.active{border-color:rgba(255,0,80,.45);background:rgba(255,0,80,.06);}
.vp-tier--pro.active{border-color:rgba(168,85,247,.50);background:rgba(168,85,247,.08);animation:vpGlow 3s ease-in-out infinite;}
.vp-tier-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;}
.vp-tier-name{font-size:15px;font-weight:800;letter-spacing:-.01em;}
.vp-tier-cost{font-size:11px;font-weight:700;padding:3px 10px;border-radius:8px;font-family:'JetBrains Mono',monospace;}
.vp-tier .vp-tier-cost{background:rgba(255,0,80,.12);color:rgba(255,80,120,.85);border:1px solid rgba(255,0,80,.25);}
.vp-tier--pro .vp-tier-cost{background:rgba(168,85,247,.12);color:rgba(192,132,252,.90);border:1px solid rgba(168,85,247,.30);}
.vp-tier-desc{font-size:12px;color:rgba(245,240,235,0.40);line-height:1.5;}
.vp-tier-badge{position:absolute;top:8px;right:8px;font-size:8px;font-weight:800;padding:3px 8px;border-radius:6px;background:linear-gradient(135deg,rgba(168,85,247,.30),rgba(139,92,246,.20));color:rgba(192,132,252,.95);border:1px solid rgba(168,85,247,.40);letter-spacing:.06em;text-transform:uppercase;}

/* Labels */
.vp-label{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:rgba(245,240,235,0.30);margin-bottom:10px;}

/* Platform pills */
.vp-platforms{display:flex;gap:10px;margin-bottom:28px;flex-wrap:wrap;}
.vp-plat{padding:11px 20px;border-radius:14px;border:1px solid rgba(245,240,235,0.08);background:rgba(245,240,235,0.035);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);color:rgba(245,240,235,0.55);font-size:14px;font-weight:600;cursor:pointer;font-family:inherit;transition:all 200ms;display:flex;align-items:center;gap:8px;}
.vp-plat:hover{border-color:rgba(245,240,235,0.16);color:rgba(245,240,235,0.80);background:rgba(245,240,235,0.06);}
.vp-plat.active{color:#F5F0EB;border-color:var(--pc);background:color-mix(in srgb,var(--pc) 12%,transparent);}

/* Duration pills */
.vp-durations{display:flex;gap:10px;margin-bottom:28px;}
.vp-dur{padding:11px 20px;border-radius:14px;border:1px solid rgba(245,240,235,0.08);background:rgba(245,240,235,0.035);color:rgba(245,240,235,0.55);font-size:14px;font-weight:600;cursor:pointer;font-family:inherit;transition:all 200ms;display:flex;flex-direction:column;align-items:center;gap:2px;}
.vp-dur:hover{border-color:rgba(168,85,247,.25);color:rgba(245,240,235,0.80);}
.vp-dur.active{border-color:rgba(168,85,247,.50);background:rgba(168,85,247,.10);color:#F5F0EB;}
.vp-dur-label{font-size:16px;font-weight:800;}
.vp-dur-desc{font-size:10px;color:rgba(245,240,235,0.35);font-weight:500;}

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
.vp-gen--pro{background:linear-gradient(135deg,rgba(168,85,247,.20),rgba(139,92,246,.18));border:1px solid rgba(168,85,247,.45);color:rgba(192,132,252,.97);}
.vp-gen--pro:hover:not(:disabled){background:linear-gradient(135deg,rgba(168,85,247,.30),rgba(139,92,246,.25));box-shadow:0 0 28px rgba(168,85,247,.15);}

/* Credit indicator inline */
.vp-credit-tag{display:inline-flex;align-items:center;gap:4px;font-size:11px;font-weight:700;padding:2px 8px;border-radius:6px;margin-left:8px;font-family:'JetBrains Mono',monospace;vertical-align:middle;}
.vp-credit-tag--script{background:rgba(255,0,80,.12);color:rgba(255,80,120,.80);border:1px solid rgba(255,0,80,.20);}
.vp-credit-tag--pro{background:rgba(168,85,247,.12);color:rgba(192,132,252,.85);border:1px solid rgba(168,85,247,.25);}

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

/* ── Production package styles ── */
.vp-prod{display:flex;flex-direction:column;gap:16px;}

.vp-prod-hero{border:1px solid rgba(168,85,247,.20);border-radius:22px;padding:24px;background:linear-gradient(135deg,rgba(168,85,247,.06),rgba(139,92,246,.03));position:relative;overflow:hidden;}
.vp-prod-hero::before{content:'';position:absolute;inset:0;border-radius:22px;padding:1px;background:linear-gradient(135deg,rgba(168,85,247,.30),rgba(139,92,246,.10));-webkit-mask:linear-gradient(#fff 0 0) content-box,linear-gradient(#fff 0 0);-webkit-mask-composite:xor;mask-composite:exclude;pointer-events:none;}
.vp-prod-title{font-size:22px;font-weight:900;letter-spacing:-.03em;margin-bottom:4px;}
.vp-prod-concept{font-size:14px;color:rgba(245,240,235,0.55);line-height:1.65;}
.vp-prod-meta{display:flex;gap:12px;margin-top:12px;flex-wrap:wrap;}
.vp-prod-tag{padding:4px 12px;border-radius:8px;font-size:11px;font-weight:700;border:1px solid rgba(168,85,247,.20);background:rgba(168,85,247,.08);color:rgba(192,132,252,.85);font-family:'JetBrains Mono',monospace;text-transform:uppercase;letter-spacing:.04em;}

/* Storyboard */
.vp-storyboard{display:flex;flex-direction:column;gap:2px;}
.vp-scene{border:1px solid rgba(245,240,235,0.08);border-radius:16px;overflow:hidden;background:rgba(245,240,235,0.025);transition:all 200ms;cursor:pointer;}
.vp-scene:hover{border-color:rgba(168,85,247,.25);}
.vp-scene.expanded{border-color:rgba(168,85,247,.35);background:rgba(168,85,247,.04);}
.vp-scene-head{display:flex;align-items:center;gap:12px;padding:14px 18px;}
.vp-scene-num{width:28px;height:28px;border-radius:10px;background:linear-gradient(135deg,rgba(168,85,247,.18),rgba(139,92,246,.10));color:rgba(192,132,252,.90);font-size:11px;font-weight:800;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
.vp-scene-info{flex:1;min-width:0;}
.vp-scene-tc{font-size:11px;color:rgba(168,85,247,.65);font-family:'JetBrains Mono',monospace;font-weight:600;}
.vp-scene-visual{font-size:13px;color:rgba(245,240,235,0.65);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.vp-scene.expanded .vp-scene-visual{white-space:normal;}
.vp-scene-chevron{color:rgba(245,240,235,0.25);font-size:14px;transition:transform 200ms;}
.vp-scene.expanded .vp-scene-chevron{transform:rotate(180deg);}
.vp-scene-detail{padding:0 18px 16px;display:grid;grid-template-columns:1fr 1fr;gap:10px;}
.vp-scene-field{padding:10px 14px;border-radius:12px;background:rgba(245,240,235,0.025);border:1px solid rgba(245,240,235,0.06);}
.vp-scene-field-label{font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:rgba(245,240,235,0.30);margin-bottom:4px;}
.vp-scene-field-val{font-size:12px;color:rgba(245,240,235,0.65);line-height:1.45;}

/* Shot list */
.vp-shots{display:grid;grid-template-columns:1fr 1fr;gap:8px;}
@media(max-width:560px){.vp-shots{grid-template-columns:1fr}}
.vp-shot{padding:14px 16px;border-radius:14px;border:1px solid rgba(245,240,235,0.06);background:rgba(245,240,235,0.025);transition:border-color 200ms;}
.vp-shot:hover{border-color:rgba(245,240,235,0.14);}
.vp-shot-num{font-size:10px;font-weight:700;color:rgba(168,85,247,.60);margin-bottom:6px;font-family:'JetBrains Mono',monospace;}
.vp-shot-type{font-size:12px;font-weight:700;color:rgba(245,240,235,0.70);margin-bottom:2px;}
.vp-shot-desc{font-size:11px;color:rgba(245,240,235,0.45);line-height:1.45;}

/* B-roll, tips */
.vp-list{display:flex;flex-direction:column;gap:6px;padding:16px 18px;}
.vp-list-item{display:flex;align-items:flex-start;gap:10px;font-size:13px;color:rgba(245,240,235,0.65);line-height:1.5;}
.vp-list-bullet{width:6px;height:6px;border-radius:50%;background:rgba(168,85,247,.50);flex-shrink:0;margin-top:7px;}

/* Music cues */
.vp-music{display:flex;flex-direction:column;gap:6px;padding:16px 18px;}
.vp-music-cue{display:flex;align-items:center;gap:12px;padding:10px 14px;border-radius:12px;background:rgba(245,240,235,0.02);border:1px solid rgba(245,240,235,0.06);}
.vp-music-tc{font-size:10px;font-weight:700;color:rgba(168,85,247,.60);font-family:'JetBrains Mono',monospace;min-width:70px;}
.vp-music-mood{font-size:11px;font-weight:700;color:rgba(245,240,235,0.55);padding:2px 8px;border-radius:6px;background:rgba(245,240,235,0.04);border:1px solid rgba(245,240,235,0.08);}
.vp-music-sug{font-size:12px;color:rgba(245,240,235,0.50);flex:1;}

/* Pro section style */
.vp-section--pro{border-color:rgba(168,85,247,.15);}
.vp-section--pro:hover{border-color:rgba(168,85,247,.30);}
.vp-section--pro .vp-sec-head{background:rgba(168,85,247,.04);border-bottom-color:rgba(168,85,247,.12);}
.vp-section--pro .vp-sec-title{color:rgba(192,132,252,.75);}
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
            AI VIDEO STUDIO
          </div>
          <h1 className={`vp-title${mounted ? " vp-a vp-d1" : ""}`}>
            Turn your site into a<br />
            <span style={{ background: "linear-gradient(135deg,#FF0050,#A855F7)" }}>viral video</span>
          </h1>
          <p className={`vp-sub${mounted ? " vp-a vp-d2" : ""}`}>
            Generate scripts or full production packages &mdash; hook, storyboard, shot list, voiceover, music &mdash; in seconds. Built to convert.
          </p>

          {/* ── Tier selector ── */}
          <div className={`vp-tiers${mounted ? " vp-a vp-d3" : ""}`}>
            <div
              className={`vp-tier${tier === "script" ? " active" : ""}`}
              onClick={() => { setTier("script"); setScript(null); setProduction(null); setError(""); }}
            >
              <div className="vp-tier-head">
                <span className="vp-tier-name">{"\u{1F4DD}"} Script Generator</span>
                <span className="vp-tier-cost">2 credits</span>
              </div>
              <div className="vp-tier-desc">
                Hook, voiceover, captions, hashtags &mdash; copy-paste ready for TikTok &amp; Reels
              </div>
            </div>
            <div
              className={`vp-tier vp-tier--pro${tier === "production" ? " active" : ""}`}
              onClick={() => { setTier("production"); setScript(null); setProduction(null); setError(""); setPlatform("tiktok"); }}
            >
              <span className="vp-tier-badge">PRO</span>
              <div className="vp-tier-head">
                <span className="vp-tier-name">{"\u{1F3AC}"} Production Package</span>
                <span className="vp-tier-cost">10 credits</span>
              </div>
              <div className="vp-tier-desc">
                Full storyboard, shot list, B-roll, music cues, timed voiceover, motion graphics
              </div>
            </div>
          </div>

          <div className={mounted ? "vp-a vp-d4" : ""}>
            <div className="vp-label">Platform</div>
            <div className="vp-platforms">
              {activePlatforms.map(p => (
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

            {tier === "production" && (
              <>
                <div className="vp-label">Duration</div>
                <div className="vp-durations">
                  {DURATIONS.map(d => (
                    <button
                      key={d.id}
                      className={`vp-dur${duration === d.id ? " active" : ""}`}
                      onClick={() => setDuration(d.id as "15" | "30" | "60")}
                    >
                      <span className="vp-dur-label">{d.label}</span>
                      <span className="vp-dur-desc">{d.desc}</span>
                    </button>
                  ))}
                </div>
              </>
            )}

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
              className={`vp-gen${tier === "production" ? " vp-gen--pro" : ""}`}
              onClick={generate}
              disabled={loading || !prompt.trim()}
            >
              {loading
                ? tier === "script" ? "Generating script..." : "Building production package..."
                : tier === "script"
                  ? <>Generate video script <span className="vp-credit-tag vp-credit-tag--script">2 credits</span></>
                  : <>Generate production package <span className="vp-credit-tag vp-credit-tag--pro">10 credits</span></>
              }
            </button>
          </div>

          {error && <div className="vp-error">{error}</div>}

          {loading && (
            <div className="vp-loading">
              <span>{"\u2726"}</span>
              {tier === "script" ? "Writing your viral script..." : "Building your production package..."}
            </div>
          )}

          {/* ══════════ Script result ══════════ */}
          {script && (
            <div className="vp-script vp-a">
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

          {/* ══════════ Production package result ══════════ */}
          {production && (
            <div className="vp-prod vp-a">
              {/* Hero card */}
              <div className="vp-prod-hero">
                <div className="vp-prod-title">{production.title}</div>
                <div className="vp-prod-concept">{production.concept}</div>
                <div className="vp-prod-meta">
                  <span className="vp-prod-tag">{production.platform}</span>
                  <span className="vp-prod-tag">{production.duration}</span>
                  <span className="vp-prod-tag">{production.storyboard?.length ?? 0} scenes</span>
                  <span className="vp-prod-tag">{production.shotList?.length ?? 0} shots</span>
                </div>
              </div>

              {/* Storyboard */}
              <div className="vp-section vp-section--pro">
                <div className="vp-sec-head">
                  <div className="vp-sec-title">{"\u{1F3AC}"} Storyboard</div>
                  <button
                    className={`vp-copy${copiedField === "storyboard" ? " copied" : ""}`}
                    onClick={() => copy(
                      production.storyboard.map(s => `[${s.timeCode}] ${s.visual} | Audio: ${s.audio} | Text: ${s.text}`).join("\n"),
                      "storyboard"
                    )}
                  >
                    {copiedField === "storyboard" ? "Copied!" : "Copy all"}
                  </button>
                </div>
                <div className="vp-storyboard" style={{ padding: "12px 18px" }}>
                  {production.storyboard.map((scene, i) => (
                    <div
                      key={i}
                      className={`vp-scene${expandedScene === i ? " expanded" : ""}`}
                      onClick={() => setExpandedScene(expandedScene === i ? null : i)}
                    >
                      <div className="vp-scene-head">
                        <div className="vp-scene-num">{scene.scene}</div>
                        <div className="vp-scene-info">
                          <div className="vp-scene-tc">{scene.timeCode}</div>
                          <div className="vp-scene-visual">{scene.visual}</div>
                        </div>
                        <span className="vp-scene-chevron">{"\u25BC"}</span>
                      </div>
                      {expandedScene === i && (
                        <div className="vp-scene-detail">
                          <div className="vp-scene-field">
                            <div className="vp-scene-field-label">Audio</div>
                            <div className="vp-scene-field-val">{scene.audio}</div>
                          </div>
                          <div className="vp-scene-field">
                            <div className="vp-scene-field-label">On-screen text</div>
                            <div className="vp-scene-field-val">{scene.text}</div>
                          </div>
                          <div className="vp-scene-field">
                            <div className="vp-scene-field-label">Transition</div>
                            <div className="vp-scene-field-val">{scene.transition}</div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Shot list */}
              <div className="vp-section vp-section--pro">
                <div className="vp-sec-head">
                  <div className="vp-sec-title">{"\u{1F4F7}"} Shot List</div>
                  <button
                    className={`vp-copy${copiedField === "shots" ? " copied" : ""}`}
                    onClick={() => copy(
                      production.shotList.map(s => `Shot ${s.shot}: ${s.type} / ${s.angle} / ${s.movement} — ${s.description}`).join("\n"),
                      "shots"
                    )}
                  >
                    {copiedField === "shots" ? "Copied!" : "Copy all"}
                  </button>
                </div>
                <div style={{ padding: "12px 18px" }}>
                  <div className="vp-shots">
                    {production.shotList.map((shot, i) => (
                      <div key={i} className="vp-shot">
                        <div className="vp-shot-num">Shot {shot.shot} — {shot.type}</div>
                        <div className="vp-shot-type">{shot.angle} / {shot.movement}</div>
                        <div className="vp-shot-desc">{shot.description}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Voiceover */}
              <div className="vp-section vp-section--pro">
                <div className="vp-sec-head">
                  <div className="vp-sec-title">{"\u{1F399}"} Voiceover Script</div>
                  <button
                    className={`vp-copy${copiedField === "pro-vo" ? " copied" : ""}`}
                    onClick={() => copy(production.voiceover.fullScript, "pro-vo")}
                  >
                    {copiedField === "pro-vo" ? "Copied!" : "Copy"}
                  </button>
                </div>
                <div className="vp-sec-body vp-voiceover">{production.voiceover.fullScript}</div>
                {production.voiceover.timedSegments?.length > 0 && (
                  <div className="vp-music" style={{ borderTop: "1px solid rgba(245,240,235,0.06)" }}>
                    {production.voiceover.timedSegments.map((seg, i) => (
                      <div key={i} className="vp-music-cue">
                        <span className="vp-music-tc">{seg.timeCode}</span>
                        <span className="vp-music-sug">{seg.text}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Music cues */}
              <div className="vp-section vp-section--pro">
                <div className="vp-sec-head">
                  <div className="vp-sec-title">{"\u{1F3B5}"} Music & Sound</div>
                </div>
                <div className="vp-music">
                  {production.musicCues.map((cue, i) => (
                    <div key={i} className="vp-music-cue">
                      <span className="vp-music-tc">{cue.timeCode}</span>
                      <span className="vp-music-mood">{cue.mood}</span>
                      <span className="vp-music-sug">{cue.suggestion}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* B-roll */}
              <div className="vp-section vp-section--pro">
                <div className="vp-sec-head">
                  <div className="vp-sec-title">{"\u{1F4F9}"} B-Roll Suggestions</div>
                  <button
                    className={`vp-copy${copiedField === "broll" ? " copied" : ""}`}
                    onClick={() => copy(production.bRoll.join("\n"), "broll")}
                  >
                    {copiedField === "broll" ? "Copied!" : "Copy all"}
                  </button>
                </div>
                <div className="vp-list">
                  {production.bRoll.map((item, i) => (
                    <div key={i} className="vp-list-item">
                      <div className="vp-list-bullet" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Motion graphics */}
              <div className="vp-section vp-section--pro">
                <div className="vp-sec-head">
                  <div className="vp-sec-title">{"\u2728"} Motion Graphics</div>
                </div>
                <div className="vp-list">
                  {production.motionGraphics.map((item, i) => (
                    <div key={i} className="vp-list-item">
                      <div className="vp-list-bullet" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Production notes */}
              <div className="vp-section vp-section--pro">
                <div className="vp-sec-head">
                  <div className="vp-sec-title">{"\u{1F4CB}"} Production Notes</div>
                </div>
                <div className="vp-list">
                  {production.productionNotes.map((note, i) => (
                    <div key={i} className="vp-list-item">
                      <div className="vp-list-bullet" />
                      <span>{note}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                className="vp-gen vp-gen--pro"
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
