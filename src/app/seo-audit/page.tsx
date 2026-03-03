"use client";

import React, { useState, useEffect } from "react";
import { SiteNav } from "@/components/shared/SiteNav";
import { SiteFooter } from "@/components/shared/SiteFooter";

/* eslint-disable @typescript-eslint/no-explicit-any */

export default function SeoAuditPage() {
  const [html, setHtml] = useState("");
  const [businessInfo, setBusinessInfo] = useState("");
  const [targetKeywords, setTargetKeywords] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"technical" | "content" | "backlinks" | "calendar" | "quickwins">("technical");
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  async function generate() {
    if (!html.trim() && !businessInfo.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch("/api/io/seo-deep", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          html: html || `<html><head><title>${businessInfo}</title></head><body><p>${businessInfo}</p></body></html>`,
          businessInfo,
          targetKeywords,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to generate audit");
      } else if (data.overallScore !== undefined) {
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

  function gradeColor(grade: string): string {
    if (grade?.startsWith("A")) return "#10B981";
    if (grade?.startsWith("B")) return "#3B82F6";
    if (grade?.startsWith("C")) return "#F59E0B";
    return "#EF4444";
  }

  function severityColor(sev: string): string {
    if (sev === "critical") return "#EF4444";
    if (sev === "warning") return "#F59E0B";
    return "#3B82F6";
  }

  return (
    <>
      <style>{`
@keyframes seoFade{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
@keyframes seoPulse{0%,100%{opacity:1}50%{opacity:.5}}
@keyframes seoShim{0%{left:-100%}40%{left:100%}100%{left:100%}}
.seo-a{animation:seoFade 700ms cubic-bezier(.16,1,.3,1) both}
.seo-d1{animation-delay:80ms}.seo-d2{animation-delay:160ms}.seo-d3{animation-delay:240ms}.seo-d4{animation-delay:320ms}

.seo-page{min-height:100vh;background:#08070B;color:#F5F0EB;font-family:'Outfit',system-ui,sans-serif;}
.seo-ambient{position:fixed;inset:0;pointer-events:none;z-index:0;overflow:hidden;}
.seo-blob1{position:absolute;width:700px;height:500px;top:-200px;right:-150px;border-radius:50%;background:radial-gradient(circle,rgba(16,185,129,.06) 0%,transparent 70%);}
.seo-blob2{position:absolute;width:500px;height:400px;bottom:-100px;left:-100px;border-radius:50%;background:radial-gradient(circle,rgba(59,130,246,.04) 0%,transparent 70%);}

.seo-main{max-width:820px;margin:0 auto;padding:120px 24px 80px;position:relative;z-index:1;}

.seo-badge{display:inline-flex;align-items:center;gap:7px;padding:5px 16px;border-radius:999px;border:1px solid rgba(16,185,129,.30);background:rgba(16,185,129,.08);color:rgba(52,211,153,.90);font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;margin-bottom:22px;}
.seo-badge-dot{width:6px;height:6px;border-radius:50%;background:rgba(16,185,129,.80);}

.seo-title{font-size:clamp(30px,5vw,48px);font-weight:900;letter-spacing:-.04em;line-height:1.05;margin-bottom:12px;}
.seo-title span{-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;}
.seo-sub{font-size:17px;color:rgba(245,240,235,0.55);margin-bottom:40px;line-height:1.65;max-width:580px;}

.seo-label{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:rgba(245,240,235,0.30);margin-bottom:10px;}
.seo-textarea{width:100%;padding:16px 18px;border-radius:18px;border:1px solid rgba(245,240,235,0.08);background:rgba(245,240,235,0.035);color:#F5F0EB;font-size:14px;font-family:'JetBrains Mono',monospace;resize:vertical;min-height:120px;outline:none;line-height:1.5;margin-bottom:20px;transition:border-color 200ms;}
.seo-textarea:focus{border-color:rgba(16,185,129,.35);}
.seo-textarea::placeholder{color:rgba(245,240,235,0.25);}
.seo-input{width:100%;padding:13px 16px;border-radius:14px;border:1px solid rgba(245,240,235,0.08);background:rgba(245,240,235,0.035);color:#F5F0EB;font-size:14px;font-family:inherit;margin-bottom:20px;outline:none;transition:border-color 200ms;}
.seo-input:focus{border-color:rgba(16,185,129,.35);}
.seo-input::placeholder{color:rgba(245,240,235,0.25);}

.seo-gen{width:100%;padding:16px;border-radius:18px;background:linear-gradient(135deg,rgba(16,185,129,.18),rgba(59,130,246,.12));border:1px solid rgba(16,185,129,.40);color:rgba(52,211,153,.97);font-size:16px;font-weight:800;cursor:pointer;font-family:inherit;transition:all 200ms;margin-bottom:40px;position:relative;overflow:hidden;}
.seo-gen::after{content:'';position:absolute;top:0;left:-100%;width:100%;height:100%;background:linear-gradient(90deg,transparent,rgba(245,240,235,.04),transparent);animation:seoShim 4s ease-in-out infinite;}
.seo-gen:hover:not(:disabled){background:linear-gradient(135deg,rgba(16,185,129,.28),rgba(59,130,246,.18));transform:translateY(-2px);box-shadow:0 0 28px rgba(16,185,129,.10);}
.seo-gen:disabled{opacity:.45;cursor:default;transform:none;}
.seo-credit{display:inline-flex;align-items:center;gap:4px;font-size:11px;font-weight:700;padding:2px 8px;border-radius:6px;margin-left:8px;background:rgba(16,185,129,.12);color:rgba(52,211,153,.80);border:1px solid rgba(16,185,129,.20);font-family:'JetBrains Mono',monospace;vertical-align:middle;}
.seo-error{padding:14px 18px;border-radius:14px;border:1px solid rgba(255,80,80,.25);background:rgba(255,80,80,.06);color:rgba(255,120,120,.90);font-size:14px;margin-bottom:24px;}
.seo-loading{display:flex;align-items:center;gap:8px;color:rgba(245,240,235,0.55);font-size:14px;padding:20px 0;animation:seoPulse 1.5s ease-in-out infinite;}

/* Score hero */
.seo-score-hero{display:flex;gap:20px;align-items:center;border:1px solid rgba(16,185,129,.18);border-radius:22px;padding:24px;background:linear-gradient(135deg,rgba(16,185,129,.04),rgba(59,130,246,.02));margin-bottom:16px;}
.seo-score-ring{width:100px;height:100px;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-direction:column;flex-shrink:0;position:relative;}
.seo-score-num{font-size:36px;font-weight:900;letter-spacing:-.04em;}
.seo-score-label{font-size:10px;font-weight:700;color:rgba(245,240,235,0.35);text-transform:uppercase;letter-spacing:.06em;}
.seo-score-grade{position:absolute;top:-4px;right:-4px;width:32px;height:32px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:900;color:#fff;}
.seo-summary{flex:1;}
.seo-summary-title{font-size:14px;font-weight:700;color:rgba(245,240,235,0.70);margin-bottom:6px;}
.seo-summary-text{font-size:13px;color:rgba(245,240,235,0.50);line-height:1.6;}

/* Tabs */
.seo-tabs{display:flex;gap:4px;margin-bottom:16px;border:1px solid rgba(245,240,235,0.06);border-radius:16px;padding:4px;background:rgba(245,240,235,0.02);overflow-x:auto;}
.seo-tab{flex:1;padding:10px 8px;border-radius:12px;border:none;background:transparent;color:rgba(245,240,235,0.40);font-size:11px;font-weight:700;cursor:pointer;font-family:inherit;transition:all 200ms;text-align:center;white-space:nowrap;}
.seo-tab:hover{color:rgba(245,240,235,0.65);background:rgba(245,240,235,0.03);}
.seo-tab.active{color:rgba(52,211,153,.90);background:rgba(16,185,129,.08);}

/* Section */
.seo-section{border:1px solid rgba(245,240,235,0.08);border-radius:18px;overflow:hidden;background:rgba(245,240,235,0.025);margin-bottom:12px;}
.seo-sec-head{padding:14px 18px;background:rgba(245,240,235,0.02);border-bottom:1px solid rgba(245,240,235,0.06);font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:rgba(245,240,235,0.50);display:flex;align-items:center;gap:8px;}
.seo-sec-body{padding:16px 18px;}

/* Issue card */
.seo-issue{padding:14px 16px;border-radius:14px;border:1px solid rgba(245,240,235,0.06);background:rgba(245,240,235,0.02);margin-bottom:8px;display:flex;gap:12px;align-items:flex-start;}
.seo-issue-sev{width:8px;height:8px;border-radius:50%;flex-shrink:0;margin-top:6px;}
.seo-issue-info{flex:1;}
.seo-issue-title{font-size:14px;font-weight:700;color:rgba(245,240,235,0.70);margin-bottom:4px;}
.seo-issue-fix{font-size:12px;color:rgba(245,240,235,0.45);line-height:1.5;}
.seo-issue-impact{font-size:10px;font-weight:700;padding:2px 8px;border-radius:6px;border:1px solid rgba(245,240,235,0.08);color:rgba(245,240,235,0.35);text-transform:uppercase;letter-spacing:.04em;margin-left:auto;align-self:flex-start;white-space:nowrap;}

/* Keyword table */
.seo-kw{padding:12px 16px;border-radius:14px;border:1px solid rgba(245,240,235,0.06);background:rgba(245,240,235,0.02);margin-bottom:8px;display:flex;gap:12px;align-items:center;}
.seo-kw-rank{font-size:18px;font-weight:900;color:rgba(16,185,129,.65);width:32px;text-align:center;flex-shrink:0;}
.seo-kw-info{flex:1;}
.seo-kw-name{font-size:14px;font-weight:700;color:rgba(245,240,235,0.70);}
.seo-kw-meta{display:flex;gap:8px;margin-top:4px;}
.seo-kw-tag{font-size:10px;font-weight:700;padding:2px 8px;border-radius:6px;border:1px solid rgba(245,240,235,0.08);color:rgba(245,240,235,0.35);}

/* Topic cluster */
.seo-cluster{padding:16px;border-radius:16px;border:1px solid rgba(245,240,235,0.06);background:rgba(245,240,235,0.02);margin-bottom:10px;}
.seo-cluster-title{font-size:15px;font-weight:800;color:rgba(245,240,235,0.70);margin-bottom:4px;}
.seo-cluster-traffic{font-size:11px;color:rgba(16,185,129,.60);font-family:'JetBrains Mono',monospace;margin-bottom:8px;}
.seo-cluster-subs{display:flex;flex-wrap:wrap;gap:6px;}
.seo-cluster-sub{padding:4px 12px;border-radius:10px;background:rgba(16,185,129,.06);border:1px solid rgba(16,185,129,.15);color:rgba(52,211,153,.70);font-size:12px;font-weight:600;}

/* Backlink opportunity */
.seo-bl{padding:14px 16px;border-radius:14px;border:1px solid rgba(245,240,235,0.06);background:rgba(245,240,235,0.02);margin-bottom:8px;}
.seo-bl-type{font-size:10px;font-weight:700;color:rgba(59,130,246,.60);text-transform:uppercase;letter-spacing:.06em;margin-bottom:4px;}
.seo-bl-target{font-size:14px;font-weight:700;color:rgba(245,240,235,0.65);margin-bottom:2px;}
.seo-bl-diff{font-size:11px;color:rgba(245,240,235,0.35);}

/* Calendar */
.seo-cal{display:grid;grid-template-columns:auto 1fr auto auto;gap:0;border:1px solid rgba(245,240,235,0.06);border-radius:16px;overflow:hidden;}
.seo-cal-head{background:rgba(245,240,235,0.03);padding:10px 14px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:rgba(245,240,235,0.30);border-bottom:1px solid rgba(245,240,235,0.06);}
.seo-cal-cell{padding:10px 14px;font-size:13px;color:rgba(245,240,235,0.60);border-bottom:1px solid rgba(245,240,235,0.04);}
.seo-cal-week{font-weight:800;color:rgba(16,185,129,.60);font-family:'JetBrains Mono',monospace;}

/* Quick wins */
.seo-list{display:flex;flex-direction:column;gap:8px;padding:16px 18px;}
.seo-list-item{display:flex;align-items:flex-start;gap:10px;font-size:13px;color:rgba(245,240,235,0.65);line-height:1.5;}
.seo-list-num{width:24px;height:24px;border-radius:8px;background:rgba(16,185,129,.10);color:rgba(52,211,153,.70);font-size:11px;font-weight:800;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
      `}</style>

      <main className="seo-page">
        <div className="seo-ambient"><div className="seo-blob1" /><div className="seo-blob2" /></div>
        <SiteNav />

        <div className="seo-main">
          <div className={`seo-badge${mounted ? " seo-a" : ""}`}>
            <span className="seo-badge-dot" />DEEP SEO AUDIT
          </div>
          <h1 className={`seo-title${mounted ? " seo-a seo-d1" : ""}`}>
            Dominate<br />
            <span style={{ background: "linear-gradient(135deg,#10B981,#3B82F6)" }}>search rankings</span>
          </h1>
          <p className={`seo-sub${mounted ? " seo-a seo-d2" : ""}`}>
            Technical audit, keyword strategy, content calendar, backlink plan &mdash; a complete SEO growth blueprint from our AI strategist.
          </p>

          <div className={mounted ? "seo-a seo-d3" : ""}>
            <div className="seo-label">Paste your website HTML (or leave blank)</div>
            <textarea
              className="seo-textarea"
              value={html}
              onChange={e => setHtml(e.target.value)}
              placeholder="Paste your page HTML here for the most accurate audit... or just describe your business below."
              rows={5}
            />

            <div className="seo-label">Business description</div>
            <input
              className="seo-input"
              value={businessInfo}
              onChange={e => setBusinessInfo(e.target.value)}
              placeholder="Auckland luxury plumbing — bathroom renovations for high-end homes"
            />

            <div className="seo-label">Target keywords (optional)</div>
            <input
              className="seo-input"
              value={targetKeywords}
              onChange={e => setTargetKeywords(e.target.value)}
              placeholder="luxury plumber auckland, bathroom renovation, high-end plumbing"
            />

            <button className="seo-gen" onClick={generate} disabled={loading || (!html.trim() && !businessInfo.trim())}>
              {loading ? "Running deep audit..." : <>Run deep SEO audit <span className="seo-credit">5 credits</span></>}
            </button>
          </div>

          {error && <div className="seo-error">{error}</div>}
          {loading && <div className="seo-loading"><span>{"\u2726"}</span> Analyzing your site and building strategy...</div>}

          {result && (
            <div className="seo-a">
              {/* Score hero */}
              <div className="seo-score-hero">
                <div className="seo-score-ring" style={{ border: `4px solid ${gradeColor(result.grade)}`, boxShadow: `0 0 30px ${gradeColor(result.grade)}25` }}>
                  <div className="seo-score-num" style={{ color: gradeColor(result.grade) }}>{result.overallScore}</div>
                  <div className="seo-score-label">/ 100</div>
                  <div className="seo-score-grade" style={{ background: gradeColor(result.grade) }}>{result.grade}</div>
                </div>
                <div className="seo-summary">
                  <div className="seo-summary-title">SEO Health Score</div>
                  <div className="seo-summary-text">{result.executiveSummary}</div>
                </div>
              </div>

              {/* Tabs */}
              <div className="seo-tabs">
                {[
                  { key: "technical" as const, label: "Technical SEO" },
                  { key: "content" as const, label: "Content Strategy" },
                  { key: "backlinks" as const, label: "Backlinks" },
                  { key: "calendar" as const, label: "Content Calendar" },
                  { key: "quickwins" as const, label: "Quick Wins" },
                ].map(t => (
                  <button key={t.key} className={`seo-tab${activeTab === t.key ? " active" : ""}`} onClick={() => setActiveTab(t.key)}>
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Technical SEO */}
              {activeTab === "technical" && result.technicalSeo && (
                <>
                  <div className="seo-section">
                    <div className="seo-sec-head">
                      Issues ({result.technicalSeo.issues?.length ?? 0})
                      <span style={{ marginLeft: "auto", fontSize: 14, fontWeight: 900, color: gradeColor(result.grade) }}>
                        {result.technicalSeo.score}/100
                      </span>
                    </div>
                    <div className="seo-sec-body">
                      {result.technicalSeo.issues?.map((issue: any, i: number) => (
                        <div key={i} className="seo-issue">
                          <div className="seo-issue-sev" style={{ background: severityColor(issue.severity) }} />
                          <div className="seo-issue-info">
                            <div className="seo-issue-title">{issue.issue}</div>
                            <div className="seo-issue-fix">{issue.fix}</div>
                          </div>
                          <span className="seo-issue-impact">{issue.impact}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  {result.technicalSeo.strengths?.length > 0 && (
                    <div className="seo-section">
                      <div className="seo-sec-head">Strengths</div>
                      <div className="seo-list">
                        {result.technicalSeo.strengths.map((s: string, i: number) => (
                          <div key={i} className="seo-list-item">
                            <div className="seo-list-num" style={{ background: "rgba(16,185,129,.15)", color: "#10B981" }}>{"\u2713"}</div>
                            <span>{s}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {result.schemaMarkup?.recommended?.length > 0 && (
                    <div className="seo-section">
                      <div className="seo-sec-head">Schema Markup Recommendations</div>
                      <div className="seo-sec-body">
                        {result.schemaMarkup.recommended.map((s: any, i: number) => (
                          <div key={i} className="seo-issue" style={{ borderLeftColor: "rgba(59,130,246,.20)" }}>
                            <div className="seo-issue-sev" style={{ background: "#3B82F6" }} />
                            <div className="seo-issue-info">
                              <div className="seo-issue-title">{s.type}</div>
                              <div className="seo-issue-fix">{s.reason} &mdash; {s.impact}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Content Strategy */}
              {activeTab === "content" && result.contentStrategy && (
                <>
                  {result.contentStrategy.primaryKeywords?.length > 0 && (
                    <div className="seo-section">
                      <div className="seo-sec-head">Target Keywords</div>
                      <div className="seo-sec-body">
                        {result.contentStrategy.primaryKeywords.map((kw: any, i: number) => (
                          <div key={i} className="seo-kw">
                            <div className="seo-kw-rank">#{kw.priority}</div>
                            <div className="seo-kw-info">
                              <div className="seo-kw-name">{kw.keyword}</div>
                              <div className="seo-kw-meta">
                                <span className="seo-kw-tag">Difficulty: {kw.difficulty}</span>
                                <span className="seo-kw-tag">Volume: {kw.searchVolume}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {result.contentStrategy.topicClusters?.length > 0 && (
                    <div className="seo-section">
                      <div className="seo-sec-head">Topic Clusters</div>
                      <div className="seo-sec-body">
                        {result.contentStrategy.topicClusters.map((cluster: any, i: number) => (
                          <div key={i} className="seo-cluster">
                            <div className="seo-cluster-title">{cluster.pillar}</div>
                            <div className="seo-cluster-traffic">{cluster.estimatedTraffic}</div>
                            <div className="seo-cluster-subs">
                              {cluster.subtopics?.map((sub: string, j: number) => (
                                <span key={j} className="seo-cluster-sub">{sub}</span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {result.contentStrategy.contentGaps?.length > 0 && (
                    <div className="seo-section">
                      <div className="seo-sec-head">Content Gaps</div>
                      <div className="seo-list">
                        {result.contentStrategy.contentGaps.map((gap: string, i: number) => (
                          <div key={i} className="seo-list-item">
                            <div className="seo-list-num">{i + 1}</div>
                            <span>{gap}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Backlinks */}
              {activeTab === "backlinks" && result.backlinkStrategy && (
                <>
                  <div className="seo-section">
                    <div className="seo-sec-head">Current Profile</div>
                    <div className="seo-sec-body" style={{ fontSize: 14, color: "rgba(245,240,235,0.60)", lineHeight: 1.6 }}>
                      {result.backlinkStrategy.currentProfile}
                    </div>
                  </div>
                  {result.backlinkStrategy.opportunities?.length > 0 && (
                    <div className="seo-section">
                      <div className="seo-sec-head">Link Building Opportunities</div>
                      <div className="seo-sec-body">
                        {result.backlinkStrategy.opportunities.map((opp: any, i: number) => (
                          <div key={i} className="seo-bl">
                            <div className="seo-bl-type">{opp.type}</div>
                            <div className="seo-bl-target">{opp.target}</div>
                            <div className="seo-bl-diff">Difficulty: {opp.difficulty}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {result.localSeo?.applicable && result.localSeo.recommendations?.length > 0 && (
                    <div className="seo-section">
                      <div className="seo-sec-head">Local SEO</div>
                      <div className="seo-list">
                        {result.localSeo.recommendations.map((rec: string, i: number) => (
                          <div key={i} className="seo-list-item">
                            <div className="seo-list-num">{i + 1}</div>
                            <span>{rec}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Content Calendar */}
              {activeTab === "calendar" && result.contentCalendar?.length > 0 && (
                <div className="seo-section">
                  <div className="seo-sec-head">4-Week Content Calendar</div>
                  <div className="seo-sec-body" style={{ padding: 0 }}>
                    <div className="seo-cal">
                      <div className="seo-cal-head">Week</div>
                      <div className="seo-cal-head">Topic</div>
                      <div className="seo-cal-head">Type</div>
                      <div className="seo-cal-head">Keyword</div>
                      {result.contentCalendar.map((item: any, i: number) => (
                        <React.Fragment key={i}>
                          <div className="seo-cal-cell seo-cal-week">W{item.week}</div>
                          <div className="seo-cal-cell" style={{ fontWeight: 600 }}>{item.topic}</div>
                          <div className="seo-cal-cell" style={{ fontSize: 12, color: "rgba(245,240,235,0.40)" }}>{item.type}</div>
                          <div className="seo-cal-cell" style={{ fontSize: 12, color: "rgba(16,185,129,.55)", fontFamily: "'JetBrains Mono',monospace" }}>{item.targetKeyword}</div>
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Quick Wins */}
              {activeTab === "quickwins" && (
                <>
                  {result.quickWins?.length > 0 && (
                    <div className="seo-section">
                      <div className="seo-sec-head">Do This Week</div>
                      <div className="seo-list">
                        {result.quickWins.map((win: string, i: number) => (
                          <div key={i} className="seo-list-item">
                            <div className="seo-list-num">{i + 1}</div>
                            <span>{win}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {result.competitorInsights?.length > 0 && (
                    <div className="seo-section">
                      <div className="seo-sec-head">Competitor Insights</div>
                      <div className="seo-list">
                        {result.competitorInsights.map((insight: string, i: number) => (
                          <div key={i} className="seo-list-item">
                            <div className="seo-list-num" style={{ background: "rgba(59,130,246,.10)", color: "rgba(96,165,250,.70)" }}>{"\u{1F50D}"}</div>
                            <span>{insight}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              <button className="seo-gen" onClick={generate} disabled={loading} style={{ marginTop: 8 }}>
                {"\u21BA"} Run another audit
              </button>
            </div>
          )}
        </div>

        <SiteFooter />
      </main>
    </>
  );
}
