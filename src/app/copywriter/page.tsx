"use client";

import React, { useState, useEffect } from "react";
import { SiteNav } from "@/components/shared/SiteNav";
import { SiteFooter } from "@/components/shared/SiteFooter";

const TONES = [
  "Professional", "Friendly & Casual", "Bold & Edgy",
  "Luxurious", "Playful", "Authoritative", "Conversational",
];

const INDUSTRIES = [
  "SaaS", "E-commerce", "Restaurant", "Law Firm", "Real Estate",
  "Fitness", "Agency", "Medical", "Education", "Consulting",
  "Technology", "Finance", "Travel", "Beauty", "Photography",
];

/* eslint-disable @typescript-eslint/no-explicit-any */

export default function CopywriterPage() {
  const [prompt, setPrompt] = useState("");
  const [industry, setIndustry] = useState("SaaS");
  const [tone, setTone] = useState("Professional");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");
  const [copiedField, setCopiedField] = useState("");
  const [activeTab, setActiveTab] = useState<"landing" | "emails" | "ads" | "product">("landing");
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  async function generate() {
    if (!prompt.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch("/api/io/copywriter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, industry, tone }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to generate copy");
      } else if (data.landingPage) {
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

  const TABS = [
    { key: "landing" as const, label: "Landing Page", icon: "\u{1F3E0}" },
    { key: "emails" as const, label: "Email Sequence", icon: "\u{1F4E7}" },
    { key: "ads" as const, label: "Ad Copy", icon: "\u{1F4E2}" },
    { key: "product" as const, label: "Product Copy", icon: "\u{1F4E6}" },
  ];

  return (
    <>
      <style>{`
@keyframes cwFade{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
@keyframes cwPulse{0%,100%{opacity:1}50%{opacity:.5}}
@keyframes cwShim{0%{left:-100%}40%{left:100%}100%{left:100%}}
.cw-a{animation:cwFade 700ms cubic-bezier(.16,1,.3,1) both}
.cw-d1{animation-delay:80ms}.cw-d2{animation-delay:160ms}.cw-d3{animation-delay:240ms}.cw-d4{animation-delay:320ms}

.cw-page{min-height:100vh;background:#08070B;color:#F5F0EB;font-family:'Outfit',system-ui,sans-serif;}
.cw-ambient{position:fixed;inset:0;pointer-events:none;z-index:0;overflow:hidden;}
.cw-blob1{position:absolute;width:700px;height:500px;top:-200px;right:-150px;border-radius:50%;background:radial-gradient(circle,rgba(245,158,11,.06) 0%,transparent 70%);}
.cw-blob2{position:absolute;width:500px;height:400px;bottom:-100px;left:-100px;border-radius:50%;background:radial-gradient(circle,rgba(239,68,68,.04) 0%,transparent 70%);}

.cw-main{max-width:800px;margin:0 auto;padding:120px 24px 80px;position:relative;z-index:1;}

.cw-badge{display:inline-flex;align-items:center;gap:7px;padding:5px 16px;border-radius:999px;border:1px solid rgba(245,158,11,.30);background:rgba(245,158,11,.08);color:rgba(245,158,11,.90);font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;margin-bottom:22px;}
.cw-badge-dot{width:6px;height:6px;border-radius:50%;background:rgba(245,158,11,.80);}

.cw-title{font-size:clamp(30px,5vw,48px);font-weight:900;letter-spacing:-.04em;line-height:1.05;margin-bottom:12px;}
.cw-title span{-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;}
.cw-sub{font-size:17px;color:rgba(245,240,235,0.55);margin-bottom:40px;line-height:1.65;max-width:560px;}

.cw-label{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:rgba(245,240,235,0.30);margin-bottom:10px;}
.cw-select{width:100%;padding:13px 16px;border-radius:14px;border:1px solid rgba(245,240,235,0.08);background:rgba(245,240,235,0.035);color:#F5F0EB;font-size:14px;font-family:inherit;margin-bottom:20px;outline:none;appearance:none;transition:border-color 200ms;}
.cw-select:focus{border-color:rgba(245,158,11,.35);}

.cw-tones{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:20px;}
.cw-tone{padding:8px 16px;border-radius:12px;border:1px solid rgba(245,240,235,0.08);background:rgba(245,240,235,0.025);color:rgba(245,240,235,0.50);font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;transition:all 200ms;}
.cw-tone:hover{border-color:rgba(245,158,11,.25);color:rgba(245,240,235,0.75);}
.cw-tone.active{border-color:rgba(245,158,11,.45);background:rgba(245,158,11,.08);color:rgba(245,158,11,.90);}

.cw-textarea{width:100%;padding:16px 18px;border-radius:18px;border:1px solid rgba(245,240,235,0.08);background:rgba(245,240,235,0.035);color:#F5F0EB;font-size:15px;font-family:inherit;resize:vertical;min-height:90px;outline:none;line-height:1.6;margin-bottom:22px;transition:border-color 200ms;}
.cw-textarea:focus{border-color:rgba(245,158,11,.35);}
.cw-textarea::placeholder{color:rgba(245,240,235,0.30);}

.cw-gen{width:100%;padding:16px;border-radius:18px;background:linear-gradient(135deg,rgba(245,158,11,.18),rgba(239,68,68,.12));border:1px solid rgba(245,158,11,.40);color:rgba(245,158,11,.97);font-size:16px;font-weight:800;cursor:pointer;font-family:inherit;transition:all 200ms;margin-bottom:40px;position:relative;overflow:hidden;}
.cw-gen::after{content:'';position:absolute;top:0;left:-100%;width:100%;height:100%;background:linear-gradient(90deg,transparent,rgba(245,240,235,.04),transparent);animation:cwShim 4s ease-in-out infinite;}
.cw-gen:hover:not(:disabled){background:linear-gradient(135deg,rgba(245,158,11,.28),rgba(239,68,68,.18));transform:translateY(-2px);box-shadow:0 0 28px rgba(245,158,11,.10);}
.cw-gen:disabled{opacity:.45;cursor:default;transform:none;}

.cw-credit{display:inline-flex;align-items:center;gap:4px;font-size:11px;font-weight:700;padding:2px 8px;border-radius:6px;margin-left:8px;background:rgba(245,158,11,.12);color:rgba(245,158,11,.80);border:1px solid rgba(245,158,11,.20);font-family:'JetBrains Mono',monospace;vertical-align:middle;}
.cw-error{padding:14px 18px;border-radius:14px;border:1px solid rgba(255,80,80,.25);background:rgba(255,80,80,.06);color:rgba(255,120,120,.90);font-size:14px;margin-bottom:24px;}
.cw-loading{display:flex;align-items:center;gap:8px;color:rgba(245,240,235,0.55);font-size:14px;padding:20px 0;animation:cwPulse 1.5s ease-in-out infinite;}

/* Result tabs */
.cw-tabs{display:flex;gap:4px;margin-bottom:16px;border:1px solid rgba(245,240,235,0.06);border-radius:16px;padding:4px;background:rgba(245,240,235,0.02);}
.cw-tab{flex:1;padding:10px 8px;border-radius:12px;border:none;background:transparent;color:rgba(245,240,235,0.40);font-size:12px;font-weight:700;cursor:pointer;font-family:inherit;transition:all 200ms;display:flex;align-items:center;justify-content:center;gap:6px;}
.cw-tab:hover{color:rgba(245,240,235,0.65);background:rgba(245,240,235,0.03);}
.cw-tab.active{color:rgba(245,158,11,.90);background:rgba(245,158,11,.08);}

/* Hero result */
.cw-hero-card{border:1px solid rgba(245,158,11,.18);border-radius:22px;padding:28px 24px;background:linear-gradient(135deg,rgba(245,158,11,.04),rgba(239,68,68,.02));margin-bottom:16px;position:relative;overflow:hidden;}
.cw-hero-card::before{content:'';position:absolute;inset:0;border-radius:22px;padding:1px;background:linear-gradient(135deg,rgba(245,158,11,.25),rgba(239,68,68,.10));-webkit-mask:linear-gradient(#fff 0 0) content-box,linear-gradient(#fff 0 0);-webkit-mask-composite:xor;mask-composite:exclude;pointer-events:none;}
.cw-biz-name{font-size:12px;font-weight:700;color:rgba(245,158,11,.65);text-transform:uppercase;letter-spacing:.08em;margin-bottom:6px;}
.cw-tagline{font-size:20px;font-weight:900;color:#F5F0EB;letter-spacing:-.03em;margin-bottom:4px;}
.cw-tone-guide{font-size:12px;color:rgba(245,240,235,0.40);font-style:italic;}

/* Section */
.cw-section{border:1px solid rgba(245,240,235,0.08);border-radius:18px;overflow:hidden;background:rgba(245,240,235,0.025);margin-bottom:12px;transition:border-color 200ms;}
.cw-section:hover{border-color:rgba(245,240,235,0.14);}
.cw-sec-head{display:flex;align-items:center;justify-content:space-between;padding:14px 18px;background:rgba(245,240,235,0.02);border-bottom:1px solid rgba(245,240,235,0.06);}
.cw-sec-title{font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:rgba(245,240,235,0.50);display:flex;align-items:center;gap:8px;}
.cw-sec-body{padding:16px 18px;font-size:14px;line-height:1.65;color:rgba(245,240,235,0.75);}
.cw-copy{padding:5px 12px;border-radius:10px;border:1px solid rgba(245,240,235,0.08);background:transparent;color:rgba(245,240,235,0.40);font-size:11px;font-weight:600;cursor:pointer;font-family:inherit;transition:all 150ms;}
.cw-copy:hover{background:rgba(245,240,235,0.06);color:rgba(245,240,235,0.75);}
.cw-copy.copied{border-color:rgba(74,222,128,.35);color:rgba(74,222,128,.80);}

/* Feature grid */
.cw-features{display:grid;grid-template-columns:1fr 1fr;gap:10px;padding:16px 18px;}
@media(max-width:560px){.cw-features{grid-template-columns:1fr;}}
.cw-feat{padding:14px 16px;border-radius:14px;border:1px solid rgba(245,240,235,0.06);background:rgba(245,240,235,0.02);}
.cw-feat-icon{font-size:20px;margin-bottom:6px;}
.cw-feat-title{font-size:13px;font-weight:700;color:rgba(245,240,235,0.70);margin-bottom:4px;}
.cw-feat-desc{font-size:12px;color:rgba(245,240,235,0.45);line-height:1.45;}

/* Email cards */
.cw-email{padding:18px;border-radius:16px;border:1px solid rgba(245,240,235,0.06);background:rgba(245,240,235,0.02);margin-bottom:10px;}
.cw-email-day{font-size:10px;font-weight:700;color:rgba(245,158,11,.60);text-transform:uppercase;letter-spacing:.06em;margin-bottom:6px;font-family:'JetBrains Mono',monospace;}
.cw-email-subj{font-size:15px;font-weight:800;color:#F5F0EB;margin-bottom:4px;}
.cw-email-preview{font-size:12px;color:rgba(245,158,11,.50);margin-bottom:10px;font-style:italic;}
.cw-email-body{font-size:13px;color:rgba(245,240,235,0.60);line-height:1.65;white-space:pre-wrap;margin-bottom:8px;}
.cw-email-cta{display:inline-block;padding:6px 16px;border-radius:10px;background:rgba(245,158,11,.12);border:1px solid rgba(245,158,11,.25);color:rgba(245,158,11,.85);font-size:12px;font-weight:700;}

/* Ad cards */
.cw-ads{display:flex;flex-direction:column;gap:10px;padding:16px 18px;}
.cw-ad{padding:16px;border-radius:14px;border:1px solid rgba(245,240,235,0.06);background:rgba(245,240,235,0.02);}
.cw-ad-label{font-size:9px;font-weight:700;color:rgba(245,240,235,0.30);text-transform:uppercase;letter-spacing:.06em;margin-bottom:6px;}
.cw-ad-headline{font-size:14px;font-weight:700;color:rgba(59,130,246,.80);margin-bottom:4px;}
.cw-ad-desc{font-size:13px;color:rgba(245,240,235,0.55);line-height:1.5;}
.cw-ad-primary{font-size:14px;color:rgba(245,240,235,0.70);line-height:1.55;margin-bottom:6px;}
      `}</style>

      <main className="cw-page">
        <div className="cw-ambient"><div className="cw-blob1" /><div className="cw-blob2" /></div>
        <SiteNav />

        <div className="cw-main">
          <div className={`cw-badge${mounted ? " cw-a" : ""}`}>
            <span className="cw-badge-dot" />AI COPYWRITER
          </div>
          <h1 className={`cw-title${mounted ? " cw-a cw-d1" : ""}`}>
            Copy that<br />
            <span style={{ background: "linear-gradient(135deg,#F59E0B,#EF4444)" }}>sells itself</span>
          </h1>
          <p className={`cw-sub${mounted ? " cw-a cw-d2" : ""}`}>
            Landing pages, email sequences, Google &amp; Facebook ads, product descriptions &mdash; all in your brand voice. One click.
          </p>

          <div className={mounted ? "cw-a cw-d3" : ""}>
            <div className="cw-label">Industry</div>
            <select className="cw-select" value={industry} onChange={e => setIndustry(e.target.value)}>
              {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
            </select>

            <div className="cw-label">Tone of voice</div>
            <div className="cw-tones">
              {TONES.map(t => (
                <button key={t} className={`cw-tone${tone === t ? " active" : ""}`} onClick={() => setTone(t)}>
                  {t}
                </button>
              ))}
            </div>

            <div className="cw-label">Describe your business / product</div>
            <textarea
              className="cw-textarea"
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              placeholder="A luxury plumbing company in Auckland — premium, trustworthy, modern. We specialize in high-end bathroom renovations."
              rows={3}
            />

            <button className="cw-gen" onClick={generate} disabled={loading || !prompt.trim()}>
              {loading ? "Generating copy..." : <>Generate copy package <span className="cw-credit">3 credits</span></>}
            </button>
          </div>

          {error && <div className="cw-error">{error}</div>}
          {loading && <div className="cw-loading"><span>{"\u2726"}</span> Writing your marketing copy...</div>}

          {result && (
            <div className="cw-a">
              {/* Business hero */}
              <div className="cw-hero-card">
                <div className="cw-biz-name">{result.businessName}</div>
                <div className="cw-tagline">{result.tagline}</div>
                <div className="cw-tone-guide">{result.toneGuide}</div>
              </div>

              {/* Tabs */}
              <div className="cw-tabs">
                {TABS.map(t => (
                  <button key={t.key} className={`cw-tab${activeTab === t.key ? " active" : ""}`} onClick={() => setActiveTab(t.key)}>
                    {t.icon} {t.label}
                  </button>
                ))}
              </div>

              {/* Landing page tab */}
              {activeTab === "landing" && result.landingPage && (
                <>
                  <div className="cw-section">
                    <div className="cw-sec-head">
                      <div className="cw-sec-title">Hero Section</div>
                      <button className={`cw-copy${copiedField === "hero" ? " copied" : ""}`} onClick={() => copy(`${result.landingPage.heroHeadline}\n${result.landingPage.heroSubheadline}`, "hero")}>
                        {copiedField === "hero" ? "Copied!" : "Copy"}
                      </button>
                    </div>
                    <div className="cw-sec-body">
                      <div style={{ fontSize: 22, fontWeight: 900, marginBottom: 6, letterSpacing: "-.03em" }}>{result.landingPage.heroHeadline}</div>
                      <div style={{ color: "rgba(245,240,235,0.55)" }}>{result.landingPage.heroSubheadline}</div>
                      <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
                        <span style={{ padding: "8px 18px", borderRadius: 12, background: "rgba(245,158,11,.15)", border: "1px solid rgba(245,158,11,.30)", color: "rgba(245,158,11,.90)", fontWeight: 700, fontSize: 13 }}>{result.landingPage.ctaPrimary}</span>
                        <span style={{ padding: "8px 18px", borderRadius: 12, border: "1px solid rgba(245,240,235,0.10)", color: "rgba(245,240,235,0.50)", fontWeight: 600, fontSize: 13 }}>{result.landingPage.ctaSecondary}</span>
                      </div>
                    </div>
                  </div>

                  {result.landingPage.features?.length > 0 && (
                    <div className="cw-section">
                      <div className="cw-sec-head">
                        <div className="cw-sec-title">Features</div>
                      </div>
                      <div className="cw-features">
                        {result.landingPage.features.map((f: any, i: number) => (
                          <div key={i} className="cw-feat">
                            <div className="cw-feat-icon">{f.icon}</div>
                            <div className="cw-feat-title">{f.title}</div>
                            <div className="cw-feat-desc">{f.description}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="cw-section">
                    <div className="cw-sec-head">
                      <div className="cw-sec-title">Social Proof &amp; Urgency</div>
                      <button className={`cw-copy${copiedField === "proof" ? " copied" : ""}`} onClick={() => copy(`${result.landingPage.socialProof}\n${result.landingPage.urgency}`, "proof")}>
                        {copiedField === "proof" ? "Copied!" : "Copy"}
                      </button>
                    </div>
                    <div className="cw-sec-body">
                      <div style={{ marginBottom: 8 }}>{result.landingPage.socialProof}</div>
                      <div style={{ color: "rgba(245,158,11,.70)", fontWeight: 700 }}>{result.landingPage.urgency}</div>
                    </div>
                  </div>
                </>
              )}

              {/* Emails tab */}
              {activeTab === "emails" && result.emailSequence?.length > 0 && (
                <div>
                  {result.emailSequence.map((email: any, i: number) => (
                    <div key={i} className="cw-email">
                      <div className="cw-email-day">Day {email.sendDay} email</div>
                      <div className="cw-email-subj">{email.subject}</div>
                      <div className="cw-email-preview">{email.preview}</div>
                      <div className="cw-email-body">{email.body}</div>
                      <span className="cw-email-cta">{email.cta}</span>
                      <button
                        className={`cw-copy${copiedField === `email-${i}` ? " copied" : ""}`}
                        style={{ marginLeft: 10 }}
                        onClick={() => copy(`Subject: ${email.subject}\nPreview: ${email.preview}\n\n${email.body}\n\nCTA: ${email.cta}`, `email-${i}`)}
                      >
                        {copiedField === `email-${i}` ? "Copied!" : "Copy email"}
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Ads tab */}
              {activeTab === "ads" && result.adCopy && (
                <>
                  <div className="cw-section">
                    <div className="cw-sec-head">
                      <div className="cw-sec-title">Google Ads</div>
                      <button className={`cw-copy${copiedField === "google" ? " copied" : ""}`} onClick={() => copy(result.adCopy.google.map((a: any) => `${a.headline1} | ${a.headline2}\n${a.description}`).join("\n\n"), "google")}>
                        {copiedField === "google" ? "Copied!" : "Copy all"}
                      </button>
                    </div>
                    <div className="cw-ads">
                      {result.adCopy.google?.map((ad: any, i: number) => (
                        <div key={i} className="cw-ad">
                          <div className="cw-ad-label">Google Ad {i + 1}</div>
                          <div className="cw-ad-headline">{ad.headline1} | {ad.headline2}</div>
                          <div className="cw-ad-desc">{ad.description}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="cw-section">
                    <div className="cw-sec-head">
                      <div className="cw-sec-title">Facebook Ads</div>
                      <button className={`cw-copy${copiedField === "fb" ? " copied" : ""}`} onClick={() => copy(result.adCopy.facebook.map((a: any) => `${a.primaryText}\n\nHeadline: ${a.headline}\n${a.description}\nCTA: ${a.cta}`).join("\n\n---\n\n"), "fb")}>
                        {copiedField === "fb" ? "Copied!" : "Copy all"}
                      </button>
                    </div>
                    <div className="cw-ads">
                      {result.adCopy.facebook?.map((ad: any, i: number) => (
                        <div key={i} className="cw-ad">
                          <div className="cw-ad-label">Facebook Ad {i + 1}</div>
                          <div className="cw-ad-primary">{ad.primaryText}</div>
                          <div className="cw-ad-headline" style={{ color: "rgba(24,119,242,.80)" }}>{ad.headline}</div>
                          <div className="cw-ad-desc">{ad.description}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Product copy tab */}
              {activeTab === "product" && result.productDescription && (
                <>
                  {["short", "medium", "long"].map(len => (
                    <div key={len} className="cw-section">
                      <div className="cw-sec-head">
                        <div className="cw-sec-title">{len.charAt(0).toUpperCase() + len.slice(1)} description</div>
                        <button className={`cw-copy${copiedField === `pd-${len}` ? " copied" : ""}`} onClick={() => copy(result.productDescription[len], `pd-${len}`)}>
                          {copiedField === `pd-${len}` ? "Copied!" : "Copy"}
                        </button>
                      </div>
                      <div className="cw-sec-body" style={{ whiteSpace: "pre-wrap" }}>{result.productDescription[len]}</div>
                    </div>
                  ))}
                </>
              )}

              <button className="cw-gen" onClick={generate} disabled={loading} style={{ marginTop: 8 }}>
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
