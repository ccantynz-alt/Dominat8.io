"use client";

import React, { useState, useEffect } from "react";
import { SiteNav } from "@/components/shared/SiteNav";
import { SiteFooter } from "@/components/shared/SiteFooter";

const INDUSTRIES = [
  "SaaS", "E-commerce", "Restaurant", "Law Firm", "Real Estate",
  "Fitness", "Agency", "Medical", "Education", "Consulting",
  "Technology", "Finance", "Travel", "Beauty", "Photography",
];

const TONES = ["Professional", "Friendly & Casual", "Bold & Edgy", "Playful", "Authoritative"];
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const PLATFORM_COLORS: Record<string, string> = {
  twitter: "#1DA1F2", linkedin: "#0A66C2", instagram: "#E1306C", facebook: "#1877F2",
};
const PLATFORM_ICONS: Record<string, string> = {
  twitter: "\u{1D54F}", linkedin: "in", instagram: "\u{1F4F7}", facebook: "f",
};

/* eslint-disable @typescript-eslint/no-explicit-any */

export default function SocialKitPage() {
  const [prompt, setPrompt] = useState("");
  const [industry, setIndustry] = useState("SaaS");
  const [tone, setTone] = useState("Professional");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");
  const [copiedField, setCopiedField] = useState("");
  const [activeDay, setActiveDay] = useState(0);
  const [activeTab, setActiveTab] = useState<"schedule" | "profiles" | "hashtags" | "tips">("schedule");
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  async function generate() {
    if (!prompt.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch("/api/io/social-kit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, industry, tone }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to generate kit");
      } else if (data.weeklySchedule || data.brandVoice) {
        setResult(data);
      } else {
        setError("Unexpected response format");
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
@keyframes skFade{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
@keyframes skPulse{0%,100%{opacity:1}50%{opacity:.5}}
@keyframes skShim{0%{left:-100%}40%{left:100%}100%{left:100%}}
.sk-a{animation:skFade 700ms cubic-bezier(.16,1,.3,1) both}
.sk-d1{animation-delay:80ms}.sk-d2{animation-delay:160ms}.sk-d3{animation-delay:240ms}.sk-d4{animation-delay:320ms}

.sk-page{min-height:100vh;background:#08070B;color:#F5F0EB;font-family:'Outfit',system-ui,sans-serif;}
.sk-ambient{position:fixed;inset:0;pointer-events:none;z-index:0;overflow:hidden;}
.sk-blob1{position:absolute;width:700px;height:500px;top:-200px;left:-150px;border-radius:50%;background:radial-gradient(circle,rgba(59,130,246,.06) 0%,transparent 70%);}
.sk-blob2{position:absolute;width:500px;height:400px;bottom:-100px;right:-100px;border-radius:50%;background:radial-gradient(circle,rgba(225,48,108,.04) 0%,transparent 70%);}

.sk-main{max-width:820px;margin:0 auto;padding:120px 24px 80px;position:relative;z-index:1;}

.sk-badge{display:inline-flex;align-items:center;gap:7px;padding:5px 16px;border-radius:999px;border:1px solid rgba(59,130,246,.30);background:rgba(59,130,246,.08);color:rgba(96,165,250,.90);font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;margin-bottom:22px;}
.sk-badge-dot{width:6px;height:6px;border-radius:50%;background:rgba(59,130,246,.80);}

.sk-title{font-size:clamp(30px,5vw,48px);font-weight:900;letter-spacing:-.04em;line-height:1.05;margin-bottom:12px;}
.sk-title span{-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;}
.sk-sub{font-size:17px;color:rgba(245,240,235,0.55);margin-bottom:40px;line-height:1.65;max-width:560px;}

.sk-label{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:rgba(245,240,235,0.30);margin-bottom:10px;}
.sk-select{width:100%;padding:13px 16px;border-radius:14px;border:1px solid rgba(245,240,235,0.08);background:rgba(245,240,235,0.035);color:#F5F0EB;font-size:14px;font-family:inherit;margin-bottom:20px;outline:none;appearance:none;}
.sk-tones{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:20px;}
.sk-tone{padding:8px 16px;border-radius:12px;border:1px solid rgba(245,240,235,0.08);background:rgba(245,240,235,0.025);color:rgba(245,240,235,0.50);font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;transition:all 200ms;}
.sk-tone:hover{border-color:rgba(59,130,246,.25);color:rgba(245,240,235,0.75);}
.sk-tone.active{border-color:rgba(59,130,246,.45);background:rgba(59,130,246,.08);color:rgba(96,165,250,.90);}

.sk-textarea{width:100%;padding:16px 18px;border-radius:18px;border:1px solid rgba(245,240,235,0.08);background:rgba(245,240,235,0.035);color:#F5F0EB;font-size:15px;font-family:inherit;resize:vertical;min-height:90px;outline:none;line-height:1.6;margin-bottom:22px;transition:border-color 200ms;}
.sk-textarea:focus{border-color:rgba(59,130,246,.35);}
.sk-textarea::placeholder{color:rgba(245,240,235,0.30);}

.sk-gen{width:100%;padding:16px;border-radius:18px;background:linear-gradient(135deg,rgba(59,130,246,.18),rgba(225,48,108,.12));border:1px solid rgba(59,130,246,.40);color:rgba(96,165,250,.97);font-size:16px;font-weight:800;cursor:pointer;font-family:inherit;transition:all 200ms;margin-bottom:40px;position:relative;overflow:hidden;}
.sk-gen::after{content:'';position:absolute;top:0;left:-100%;width:100%;height:100%;background:linear-gradient(90deg,transparent,rgba(245,240,235,.04),transparent);animation:skShim 4s ease-in-out infinite;}
.sk-gen:hover:not(:disabled){background:linear-gradient(135deg,rgba(59,130,246,.28),rgba(225,48,108,.18));transform:translateY(-2px);box-shadow:0 0 28px rgba(59,130,246,.10);}
.sk-gen:disabled{opacity:.45;cursor:default;transform:none;}

.sk-credit{display:inline-flex;align-items:center;gap:4px;font-size:11px;font-weight:700;padding:2px 8px;border-radius:6px;margin-left:8px;background:rgba(59,130,246,.12);color:rgba(96,165,250,.80);border:1px solid rgba(59,130,246,.20);font-family:'JetBrains Mono',monospace;vertical-align:middle;}
.sk-error{padding:14px 18px;border-radius:14px;border:1px solid rgba(255,80,80,.25);background:rgba(255,80,80,.06);color:rgba(255,120,120,.90);font-size:14px;margin-bottom:24px;}
.sk-loading{display:flex;align-items:center;gap:8px;color:rgba(245,240,235,0.55);font-size:14px;padding:20px 0;animation:skPulse 1.5s ease-in-out infinite;}

/* Voice card */
.sk-voice{border:1px solid rgba(59,130,246,.18);border-radius:22px;padding:22px 24px;background:linear-gradient(135deg,rgba(59,130,246,.04),rgba(225,48,108,.02));margin-bottom:16px;}
.sk-voice-label{font-size:10px;font-weight:700;color:rgba(59,130,246,.60);text-transform:uppercase;letter-spacing:.08em;margin-bottom:6px;}
.sk-voice-text{font-size:15px;color:rgba(245,240,235,0.70);line-height:1.6;}

/* Pillars */
.sk-pillars{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:16px;}
.sk-pillar{padding:12px 16px;border-radius:14px;border:1px solid rgba(245,240,235,0.06);background:rgba(245,240,235,0.025);flex:1;min-width:140px;}
.sk-pillar-pct{font-size:22px;font-weight:900;color:rgba(59,130,246,.70);margin-bottom:2px;}
.sk-pillar-name{font-size:13px;font-weight:700;color:rgba(245,240,235,0.65);margin-bottom:4px;}
.sk-pillar-desc{font-size:11px;color:rgba(245,240,235,0.40);line-height:1.4;}

/* Tabs */
.sk-tabs{display:flex;gap:4px;margin-bottom:16px;border:1px solid rgba(245,240,235,0.06);border-radius:16px;padding:4px;background:rgba(245,240,235,0.02);}
.sk-tab{flex:1;padding:10px 8px;border-radius:12px;border:none;background:transparent;color:rgba(245,240,235,0.40);font-size:12px;font-weight:700;cursor:pointer;font-family:inherit;transition:all 200ms;text-align:center;}
.sk-tab:hover{color:rgba(245,240,235,0.65);background:rgba(245,240,235,0.03);}
.sk-tab.active{color:rgba(96,165,250,.90);background:rgba(59,130,246,.08);}

/* Day selector */
.sk-days{display:flex;gap:6px;margin-bottom:16px;overflow-x:auto;padding-bottom:4px;}
.sk-day{padding:8px 16px;border-radius:12px;border:1px solid rgba(245,240,235,0.06);background:rgba(245,240,235,0.025);color:rgba(245,240,235,0.40);font-size:12px;font-weight:700;cursor:pointer;font-family:inherit;transition:all 200ms;white-space:nowrap;}
.sk-day:hover{border-color:rgba(59,130,246,.25);}
.sk-day.active{border-color:rgba(59,130,246,.45);background:rgba(59,130,246,.08);color:rgba(96,165,250,.90);}

/* Post card */
.sk-post{padding:18px;border-radius:16px;border:1px solid rgba(245,240,235,0.06);background:rgba(245,240,235,0.02);margin-bottom:10px;position:relative;}
.sk-post-head{display:flex;align-items:center;gap:10px;margin-bottom:10px;}
.sk-post-platform{width:28px;height:28px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:900;color:#fff;}
.sk-post-meta{flex:1;}
.sk-post-plat-name{font-size:12px;font-weight:700;color:rgba(245,240,235,0.60);}
.sk-post-time{font-size:10px;color:rgba(245,240,235,0.30);font-family:'JetBrains Mono',monospace;}
.sk-post-type{font-size:10px;font-weight:700;padding:2px 8px;border-radius:6px;border:1px solid rgba(245,240,235,0.08);color:rgba(245,240,235,0.35);text-transform:uppercase;letter-spacing:.04em;}
.sk-post-content{font-size:14px;color:rgba(245,240,235,0.70);line-height:1.6;white-space:pre-wrap;margin-bottom:8px;}
.sk-post-hashtags{display:flex;flex-wrap:wrap;gap:4px;margin-bottom:6px;}
.sk-post-tag{font-size:11px;color:rgba(59,130,246,.65);font-weight:600;}
.sk-post-notes{font-size:11px;color:rgba(245,240,235,0.35);font-style:italic;}
.sk-copy{padding:5px 12px;border-radius:10px;border:1px solid rgba(245,240,235,0.08);background:transparent;color:rgba(245,240,235,0.40);font-size:11px;font-weight:600;cursor:pointer;font-family:inherit;transition:all 150ms;position:absolute;top:14px;right:14px;}
.sk-copy:hover{background:rgba(245,240,235,0.06);color:rgba(245,240,235,0.75);}
.sk-copy.copied{border-color:rgba(74,222,128,.35);color:rgba(74,222,128,.80);}

/* Profile cards */
.sk-profiles{display:grid;grid-template-columns:1fr 1fr;gap:12px;}
@media(max-width:560px){.sk-profiles{grid-template-columns:1fr;}}
.sk-profile{padding:18px;border-radius:16px;border:1px solid rgba(245,240,235,0.06);background:rgba(245,240,235,0.02);}
.sk-profile-head{display:flex;align-items:center;gap:10px;margin-bottom:10px;}
.sk-profile-icon{width:32px;height:32px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:15px;font-weight:900;color:#fff;}
.sk-profile-name{font-size:14px;font-weight:700;color:rgba(245,240,235,0.70);}
.sk-profile-bio{font-size:13px;color:rgba(245,240,235,0.55);line-height:1.5;white-space:pre-wrap;}

/* Hashtag section */
.sk-section{border:1px solid rgba(245,240,235,0.08);border-radius:18px;overflow:hidden;background:rgba(245,240,235,0.025);margin-bottom:12px;}
.sk-sec-head{padding:14px 18px;background:rgba(245,240,235,0.02);border-bottom:1px solid rgba(245,240,235,0.06);font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:rgba(245,240,235,0.50);}
.sk-sec-body{padding:16px 18px;}
.sk-hashtag-group{margin-bottom:12px;}
.sk-hashtag-label{font-size:10px;font-weight:700;color:rgba(245,240,235,0.30);text-transform:uppercase;letter-spacing:.06em;margin-bottom:6px;}
.sk-hashtag-list{display:flex;flex-wrap:wrap;gap:5px;}
.sk-hashtag{padding:3px 10px;border-radius:8px;background:rgba(59,130,246,.08);border:1px solid rgba(59,130,246,.18);color:rgba(96,165,250,.75);font-size:12px;font-weight:600;}

/* Tips & KPIs */
.sk-list{display:flex;flex-direction:column;gap:8px;padding:16px 18px;}
.sk-list-item{display:flex;align-items:flex-start;gap:10px;font-size:13px;color:rgba(245,240,235,0.65);line-height:1.5;}
.sk-list-bullet{width:6px;height:6px;border-radius:50%;flex-shrink:0;margin-top:7px;}
      `}</style>

      <main className="sk-page">
        <div className="sk-ambient"><div className="sk-blob1" /><div className="sk-blob2" /></div>
        <SiteNav />

        <div className="sk-main">
          <div className={`sk-badge${mounted ? " sk-a" : ""}`}>
            <span className="sk-badge-dot" />SOCIAL MEDIA KIT
          </div>
          <h1 className={`sk-title${mounted ? " sk-a sk-d1" : ""}`}>
            7 days of content<br />
            <span style={{ background: "linear-gradient(135deg,#3B82F6,#E1306C)" }}>ready to post</span>
          </h1>
          <p className={`sk-sub${mounted ? " sk-a sk-d2" : ""}`}>
            Platform bios, content calendar, hashtag strategy, engagement tips &mdash; your complete social media blueprint.
          </p>

          <div className={mounted ? "sk-a sk-d3" : ""}>
            <div className="sk-label">Industry</div>
            <select className="sk-select" value={industry} onChange={e => setIndustry(e.target.value)}>
              {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
            </select>

            <div className="sk-label">Brand tone</div>
            <div className="sk-tones">
              {TONES.map(t => (
                <button key={t} className={`sk-tone${tone === t ? " active" : ""}`} onClick={() => setTone(t)}>{t}</button>
              ))}
            </div>

            <div className="sk-label">Describe your business</div>
            <textarea className="sk-textarea" value={prompt} onChange={e => setPrompt(e.target.value)} placeholder="A premium coffee roastery in Melbourne — artisan, sustainable, direct-trade" rows={3} />

            <button className="sk-gen" onClick={generate} disabled={loading || !prompt.trim()}>
              {loading ? "Generating kit..." : <>Generate social media kit <span className="sk-credit">3 credits</span></>}
            </button>
          </div>

          {error && <div className="sk-error">{error}</div>}
          {loading && <div className="sk-loading"><span>{"\u2726"}</span> Building your social media kit...</div>}

          {result && (
            <div className="sk-a">
              {/* Brand voice */}
              <div className="sk-voice">
                <div className="sk-voice-label">Brand Voice</div>
                <div className="sk-voice-text">{result.brandVoice}</div>
              </div>

              {/* Content pillars */}
              {result.contentPillars?.length > 0 && (
                <div className="sk-pillars">
                  {result.contentPillars.map((p: any, i: number) => (
                    <div key={i} className="sk-pillar">
                      <div className="sk-pillar-pct">{p.percentage}%</div>
                      <div className="sk-pillar-name">{p.pillar}</div>
                      <div className="sk-pillar-desc">{p.description}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Tabs */}
              <div className="sk-tabs">
                {[
                  { key: "schedule" as const, label: "7-Day Schedule" },
                  { key: "profiles" as const, label: "Profile Bios" },
                  { key: "hashtags" as const, label: "Hashtags" },
                  { key: "tips" as const, label: "Tips & KPIs" },
                ].map(t => (
                  <button key={t.key} className={`sk-tab${activeTab === t.key ? " active" : ""}`} onClick={() => setActiveTab(t.key)}>
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Schedule tab */}
              {activeTab === "schedule" && result.weeklySchedule && (
                <>
                  <div className="sk-days">
                    {DAYS.map((d, i) => (
                      <button key={d} className={`sk-day${activeDay === i ? " active" : ""}`} onClick={() => setActiveDay(i)}>
                        {d}
                      </button>
                    ))}
                  </div>
                  {result.weeklySchedule[activeDay]?.posts?.map((post: any, i: number) => {
                    const pColor = PLATFORM_COLORS[post.platform] ?? "#666";
                    const pIcon = PLATFORM_ICONS[post.platform] ?? "?";
                    return (
                      <div key={i} className="sk-post">
                        <button
                          className={`sk-copy${copiedField === `post-${activeDay}-${i}` ? " copied" : ""}`}
                          onClick={() => copy(post.content + (post.hashtags?.length ? "\n\n" + post.hashtags.map((h: string) => `#${h}`).join(" ") : ""), `post-${activeDay}-${i}`)}
                        >
                          {copiedField === `post-${activeDay}-${i}` ? "Copied!" : "Copy"}
                        </button>
                        <div className="sk-post-head">
                          <div className="sk-post-platform" style={{ background: pColor }}>{pIcon}</div>
                          <div className="sk-post-meta">
                            <div className="sk-post-plat-name">{post.platform}</div>
                            <div className="sk-post-time">{post.time}</div>
                          </div>
                          <span className="sk-post-type">{post.type}</span>
                        </div>
                        <div className="sk-post-content">{post.content}</div>
                        {post.hashtags?.length > 0 && (
                          <div className="sk-post-hashtags">
                            {post.hashtags.map((h: string, j: number) => <span key={j} className="sk-post-tag">#{h}</span>)}
                          </div>
                        )}
                        {post.notes && <div className="sk-post-notes">{post.notes}</div>}
                      </div>
                    );
                  })}
                </>
              )}

              {/* Profiles tab */}
              {activeTab === "profiles" && result.profiles && (
                <div className="sk-profiles">
                  {Object.entries(result.profiles).map(([platform, data]: [string, any]) => (
                    <div key={platform} className="sk-profile">
                      <div className="sk-profile-head">
                        <div className="sk-profile-icon" style={{ background: PLATFORM_COLORS[platform] ?? "#666" }}>
                          {PLATFORM_ICONS[platform] ?? "?"}
                        </div>
                        <div className="sk-profile-name">{platform.charAt(0).toUpperCase() + platform.slice(1)}</div>
                      </div>
                      <div className="sk-profile-bio">
                        {data.bio || data.headline || data.about || ""}
                        {data.about && data.headline && <><br /><br />{data.about}</>}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Hashtags tab */}
              {activeTab === "hashtags" && result.hashtagStrategy && (
                <>
                  {["branded", "industry", "trending"].map(group => (
                    result.hashtagStrategy[group]?.length > 0 && (
                      <div key={group} className="sk-section">
                        <div className="sk-sec-head">{group} hashtags</div>
                        <div className="sk-sec-body">
                          <div className="sk-hashtag-list">
                            {result.hashtagStrategy[group].map((h: string, i: number) => <span key={i} className="sk-hashtag">#{h}</span>)}
                          </div>
                        </div>
                      </div>
                    )
                  ))}
                  {result.hashtagStrategy.perPlatform && Object.entries(result.hashtagStrategy.perPlatform).map(([platform, tags]: [string, any]) => (
                    tags?.length > 0 && (
                      <div key={platform} className="sk-section">
                        <div className="sk-sec-head">{platform} hashtags</div>
                        <div className="sk-sec-body">
                          <div className="sk-hashtag-list">
                            {tags.map((h: string, i: number) => <span key={i} className="sk-hashtag">#{h}</span>)}
                          </div>
                        </div>
                      </div>
                    )
                  ))}
                </>
              )}

              {/* Tips & KPIs tab */}
              {activeTab === "tips" && (
                <>
                  {result.engagementTips?.length > 0 && (
                    <div className="sk-section">
                      <div className="sk-sec-head">Engagement Tips</div>
                      <div className="sk-list">
                        {result.engagementTips.map((tip: string, i: number) => (
                          <div key={i} className="sk-list-item">
                            <div className="sk-list-bullet" style={{ background: "rgba(59,130,246,.50)" }} />
                            <span>{tip}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {result.kpis?.length > 0 && (
                    <div className="sk-section">
                      <div className="sk-sec-head">KPIs to Track</div>
                      <div className="sk-list">
                        {result.kpis.map((kpi: string, i: number) => (
                          <div key={i} className="sk-list-item">
                            <div className="sk-list-bullet" style={{ background: "rgba(16,185,129,.50)" }} />
                            <span>{kpi}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              <button className="sk-gen" onClick={generate} disabled={loading} style={{ marginTop: 8 }}>
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
