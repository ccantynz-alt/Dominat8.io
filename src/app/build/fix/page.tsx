"use client";

import React, { useState, useCallback, useRef } from "react";
import { BuildPageShell, GlassCard, StatusBadge } from "@/io/surfaces/BuildPageShell";

/* ━━━ Types ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

type Severity = "critical" | "warning" | "info";

interface Issue {
  id: string;
  severity: Severity;
  title: string;
  description: string;
  icon: string;
  scoreImpact: number;
}

interface FixHistoryEntry {
  id: string;
  title: string;
  before: string;
  after: string;
  timestamp: string;
  severity: Severity;
}

/* ━━━ Data ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

const INITIAL_ISSUES: Issue[] = [
  {
    id: "img-alt",
    severity: "critical",
    title: "Missing alt text on 3 images",
    description: "Screen readers cannot describe these images to visually impaired users.",
    icon: "🖼️",
    scoreImpact: 5,
  },
  {
    id: "contrast",
    severity: "critical",
    title: "Low contrast ratio on CTA button",
    description: "Primary CTA fails WCAG AA — contrast ratio is 2.8:1 (minimum 4.5:1).",
    icon: "🎨",
    scoreImpact: 4,
  },
  {
    id: "broken-link",
    severity: "warning",
    title: "Broken internal link detected",
    description: "/about-us/team returns 404. Linked from footer and navigation.",
    icon: "🔗",
    scoreImpact: 3,
  },
  {
    id: "meta-desc",
    severity: "warning",
    title: "Meta description too long",
    description: "Homepage meta description is 185 characters — recommended max is 155.",
    icon: "📝",
    scoreImpact: 2,
  },
  {
    id: "unused-css",
    severity: "info",
    title: "Unused CSS rules (12KB)",
    description: "12 stylesheets contain dead rules adding 12KB of unnecessary payload.",
    icon: "🧹",
    scoreImpact: 2,
  },
  {
    id: "heading-order",
    severity: "info",
    title: "Heading hierarchy skips H3",
    description: "Page jumps from H2 to H4, breaking document outline for assistive tech.",
    icon: "📐",
    scoreImpact: 1,
  },
];

const INITIAL_HISTORY: FixHistoryEntry[] = [
  {
    id: "h1",
    title: "Duplicate H1 tags removed",
    before: "3 H1 elements on homepage",
    after: "Single H1 with proper hierarchy",
    timestamp: "2 hours ago",
    severity: "warning",
  },
  {
    id: "h2",
    title: "Image compression applied",
    before: "Total image payload: 4.2MB",
    after: "Optimized to 890KB (79% reduction)",
    timestamp: "Yesterday",
    severity: "info",
  },
  {
    id: "h3",
    title: "ARIA labels added to form inputs",
    before: "5 inputs missing accessible names",
    after: "All form controls properly labelled",
    timestamp: "3 days ago",
    severity: "critical",
  },
];

/* ━━━ Severity helpers ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

const SEVERITY_CONFIG: Record<Severity, { label: string; status: "error" | "warning" | "online"; color: string }> = {
  critical: { label: "Critical", status: "error", color: "#FF4D6A" },
  warning:  { label: "Warning",  status: "warning", color: "#FFB800" },
  info:     { label: "Info",     status: "online", color: "#00FFB2" },
};

/* ━━━ Quick Fix definitions ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

interface QuickFix {
  id: string;
  icon: string;
  title: string;
  description: string;
  relatedIssueIds: string[];
}

const QUICK_FIXES: QuickFix[] = [
  { id: "qf-a11y", icon: "♿", title: "Fix All Accessibility", description: "Resolve alt text, contrast, ARIA, and heading issues", relatedIssueIds: ["img-alt", "contrast", "heading-order"] },
  { id: "qf-images", icon: "🖼️", title: "Optimize Images", description: "Compress, convert to WebP, and add lazy loading", relatedIssueIds: ["img-alt"] },
  { id: "qf-css", icon: "🧹", title: "Clean Unused CSS", description: "Tree-shake dead rules and reduce bundle size", relatedIssueIds: ["unused-css"] },
  { id: "qf-links", icon: "🔗", title: "Fix Broken Links", description: "Repair or redirect all broken internal links", relatedIssueIds: ["broken-link"] },
];

/* ━━━ Page Component ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

export default function FixPage() {
  const [scanState, setScanState] = useState<"idle" | "scanning" | "done">("idle");
  const [scanProgress, setScanProgress] = useState(0);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [fixingIds, setFixingIds] = useState<Set<string>>(new Set());
  const [healthScore, setHealthScore] = useState(73);
  const [history, setHistory] = useState<FixHistoryEntry[]>(INITIAL_HISTORY);
  const [quickFixRunning, setQuickFixRunning] = useState<string | null>(null);
  const scanIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /* ── Scan simulation ── */
  const startScan = useCallback(() => {
    setScanState("scanning");
    setScanProgress(0);
    setIssues([]);

    let progress = 0;
    scanIntervalRef.current = setInterval(() => {
      progress += Math.random() * 12 + 3;
      if (progress >= 100) {
        progress = 100;
        if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);
        setScanProgress(100);
        setTimeout(() => {
          setScanState("done");
          setIssues(INITIAL_ISSUES);
          setHealthScore(73);
        }, 400);
      } else {
        setScanProgress(Math.min(progress, 99));
      }
    }, 200);
  }, []);

  /* ── Fix a single issue ── */
  const fixIssue = useCallback((issue: Issue) => {
    setFixingIds((prev) => new Set(prev).add(issue.id));
    setTimeout(() => {
      setIssues((prev) => prev.filter((i) => i.id !== issue.id));
      setFixingIds((prev) => {
        const next = new Set(prev);
        next.delete(issue.id);
        return next;
      });
      setHealthScore((prev) => Math.min(100, prev + issue.scoreImpact));
      setHistory((prev) => [
        {
          id: `fix-${issue.id}-${Date.now()}`,
          title: issue.title + " — Fixed",
          before: issue.description,
          after: "Resolved by AI auto-fix",
          timestamp: "Just now",
          severity: issue.severity,
        },
        ...prev,
      ]);
    }, 1200 + Math.random() * 600);
  }, []);

  /* ── Quick fix action ── */
  const runQuickFix = useCallback((qf: QuickFix) => {
    setQuickFixRunning(qf.id);
    const relatedIssues = issues.filter((i) => qf.relatedIssueIds.includes(i.id));
    const totalImpact = relatedIssues.reduce((sum, i) => sum + i.scoreImpact, 0);

    // Mark all related as fixing
    relatedIssues.forEach((i) => setFixingIds((prev) => new Set(prev).add(i.id)));

    setTimeout(() => {
      setIssues((prev) => prev.filter((i) => !qf.relatedIssueIds.includes(i.id)));
      setFixingIds(new Set());
      setQuickFixRunning(null);
      setHealthScore((prev) => Math.min(100, prev + totalImpact));
      if (relatedIssues.length > 0) {
        setHistory((prev) => [
          {
            id: `qf-${qf.id}-${Date.now()}`,
            title: `${qf.title} — ${relatedIssues.length} issue(s) resolved`,
            before: relatedIssues.map((i) => i.title).join("; "),
            after: "All resolved by batch AI auto-fix",
            timestamp: "Just now",
            severity: relatedIssues[0].severity,
          },
          ...prev,
        ]);
      }
    }, 1800);
  }, [issues]);

  /* ── Health score color ── */
  const scoreColor = healthScore >= 90 ? "#00FFB2" : healthScore >= 70 ? "#FFB800" : "#FF4D6A";

  /* ── Circular score geometry ── */
  const circleRadius = 54;
  const circleCircumference = 2 * Math.PI * circleRadius;
  const scoreOffset = circleCircumference - (healthScore / 100) * circleCircumference;

  return (
    <BuildPageShell title="Fix & Repair" icon="🔧" accentColor="#FF6B35" activePage="Fix">
      {/* ── Inline styles for animations & health circle ── */}
      <style>{`
        @keyframes fixScanPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(255,107,53,0.3); }
          50% { box-shadow: 0 0 0 12px rgba(255,107,53,0); }
        }
        @keyframes fixScanLine {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(300%); }
        }
        @keyframes fixSpinner {
          to { transform: rotate(360deg); }
        }
        @keyframes fixFadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fixScorePop {
          0% { transform: scale(0.8); opacity: 0; }
          60% { transform: scale(1.05); }
          100% { transform: scale(1); opacity: 1; }
        }
        .fix-scan-btn-pulse { animation: fixScanPulse 2s ease-in-out infinite; }
        .fix-issue-enter { animation: fixFadeIn 0.35s ease-out both; }
        .fix-score-ring { animation: fixScorePop 0.6s ease-out both; }
        .fix-spinner {
          width: 16px; height: 16px;
          border: 2px solid rgba(255,255,255,0.15);
          border-top-color: #FF6B35;
          border-radius: 50%;
          animation: fixSpinner 0.7s linear infinite;
          display: inline-block;
        }
        .fix-scan-overlay {
          position: absolute; inset: 0; border-radius: 16px; overflow: hidden; pointer-events: none;
        }
        .fix-scan-line {
          position: absolute; left: 0; right: 0; height: 3px;
          background: linear-gradient(90deg, transparent, #FF6B35, transparent);
          box-shadow: 0 0 20px rgba(255,107,53,0.6);
          animation: fixScanLine 1.5s ease-in-out infinite;
        }
        .fix-health-wrap {
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          padding: 24px 0;
        }
        .fix-health-svg { width: 140px; height: 140px; }
        .fix-health-bg { fill: none; stroke: rgba(255,255,255,0.06); stroke-width: 8; }
        .fix-health-fg {
          fill: none; stroke-width: 8; stroke-linecap: round;
          transition: stroke-dashoffset 0.8s ease, stroke 0.4s ease;
        }
        .fix-health-text {
          font-size: 28px; font-weight: 800; fill: currentColor;
          dominant-baseline: central; text-anchor: middle;
        }
        .fix-health-label {
          font-size: 10px; fill: #8B9DC3; text-anchor: middle;
          text-transform: uppercase; letter-spacing: 0.1em;
        }
        .fix-timeline-dot {
          width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0;
          border: 2px solid; position: relative; z-index: 1;
        }
        .fix-timeline-line {
          position: absolute; left: 4px; top: 10px; bottom: -14px; width: 2px;
          background: rgba(255,255,255,0.06);
        }
        .fix-timeline-item {
          display: flex; gap: 14px; padding: 12px 0; position: relative;
        }
        .fix-qf-card {
          display: flex; flex-direction: column; align-items: center; gap: 10px;
          padding: 20px 16px; text-align: center; cursor: pointer;
          background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06);
          border-radius: 14px; transition: all 0.3s;
        }
        .fix-qf-card:hover {
          background: rgba(255,107,53,0.06); border-color: rgba(255,107,53,0.25);
          transform: translateY(-3px); box-shadow: 0 8px 30px rgba(255,107,53,0.12);
        }
        .fix-qf-card[data-disabled="true"] {
          opacity: 0.5; pointer-events: none;
        }
        .fix-qf-icon {
          font-size: 28px; width: 52px; height: 52px; display: flex;
          align-items: center; justify-content: center; border-radius: 14px;
          background: rgba(255,107,53,0.1); border: 1px solid rgba(255,107,53,0.2);
        }
        .fix-qf-title { font-weight: 700; font-size: 14px; color: #E0E6F0; }
        .fix-qf-desc { font-size: 12px; color: #5A6B8A; line-height: 1.4; }
        .fix-issue-actions { display: flex; align-items: center; gap: 8px; margin-left: auto; flex-shrink: 0; }
        .fix-severity-bar {
          width: 4px; height: 100%; border-radius: 2px; position: absolute;
          left: 0; top: 0; bottom: 0;
        }
        .fix-all-clear {
          text-align: center; padding: 32px 20px; color: #00FFB2;
        }
        .fix-all-clear-icon { font-size: 40px; margin-bottom: 8px; }
        .fix-all-clear-text { font-size: 15px; font-weight: 600; }
        .fix-all-clear-sub { font-size: 12px; color: #5A6B8A; margin-top: 4px; }
      `}</style>

      {/* ━━━ Scan Status — Hero Card ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div className="bps-section">
        <GlassCard>
          <div style={{ position: "relative" }}>
            {scanState === "scanning" && (
              <div className="fix-scan-overlay">
                <div className="fix-scan-line" />
              </div>
            )}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                  <span style={{ fontSize: "24px" }}>🛡️</span>
                  <h2 style={{ margin: 0, fontSize: "20px", fontWeight: 800, color: "#E0E6F0" }}>
                    AI Issue Scanner
                  </h2>
                  {scanState === "done" && (
                    <StatusBadge
                      label={issues.length === 0 ? "All Clear" : `${issues.length} Issue${issues.length !== 1 ? "s" : ""}`}
                      status={issues.length === 0 ? "online" : issues.some((i) => i.severity === "critical") ? "error" : "warning"}
                    />
                  )}
                  {scanState === "scanning" && <StatusBadge label="Scanning" status="pending" />}
                </div>
                <p style={{ margin: 0, fontSize: "13px", color: "#5A6B8A", maxWidth: "500px", lineHeight: 1.5 }}>
                  {scanState === "idle" && "Run a full AI-powered scan to detect accessibility, SEO, performance, and code quality issues across your site."}
                  {scanState === "scanning" && `Analyzing pages, assets, and markup... ${Math.round(scanProgress)}% complete`}
                  {scanState === "done" && issues.length > 0 && `Scan complete. Found ${issues.length} issue${issues.length !== 1 ? "s" : ""} that can be auto-fixed.`}
                  {scanState === "done" && issues.length === 0 && "Your site is in great shape. No issues detected."}
                </p>
              </div>
              <button
                className={`bps-btn bps-btn-primary ${scanState === "idle" ? "fix-scan-btn-pulse" : ""}`}
                onClick={startScan}
                disabled={scanState === "scanning"}
                style={{ opacity: scanState === "scanning" ? 0.6 : 1, cursor: scanState === "scanning" ? "not-allowed" : "pointer" }}
              >
                {scanState === "scanning" ? (
                  <>
                    <span className="fix-spinner" />
                    Scanning...
                  </>
                ) : (
                  <>🔍 {scanState === "done" ? "Re-Scan" : "Run AI Scan"}</>
                )}
              </button>
            </div>

            {/* Progress bar during scan */}
            {scanState === "scanning" && (
              <div style={{ marginTop: "20px" }}>
                <div className="bps-progress">
                  <div className="bps-progress-bar" style={{ width: `${scanProgress}%` }} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: "8px", fontSize: "11px", color: "#5A6B8A" }}>
                  <span>Checking accessibility, SEO, links, performance...</span>
                  <span style={{ fontWeight: 700, color: "#FF6B35" }}>{Math.round(scanProgress)}%</span>
                </div>
              </div>
            )}
          </div>
        </GlassCard>
      </div>

      {/* ━━━ Main grid: Issues + Health Score ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div className="bps-grid-2 bps-section" style={{ gridTemplateColumns: "2fr 1fr" }}>
        {/* ── Issues Found ── */}
        <div>
          <div className="bps-section-title">Issues Found</div>
          <GlassCard>
            {scanState === "idle" && (
              <div className="bps-empty">
                <div className="bps-empty-icon">🔍</div>
                <div className="bps-empty-text">Run a scan to detect issues</div>
              </div>
            )}

            {scanState === "scanning" && (
              <div className="bps-empty">
                <div className="bps-empty-icon" style={{ animation: "fixSpinner 2s linear infinite", display: "inline-block" }}>⏳</div>
                <div className="bps-empty-text">Analyzing your site...</div>
              </div>
            )}

            {scanState === "done" && issues.length === 0 && (
              <div className="fix-all-clear">
                <div className="fix-all-clear-icon">✅</div>
                <div className="fix-all-clear-text">All Issues Resolved!</div>
                <div className="fix-all-clear-sub">Your site is clean. Run another scan to verify.</div>
              </div>
            )}

            {scanState === "done" && issues.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {issues.map((issue, idx) => {
                  const cfg = SEVERITY_CONFIG[issue.severity];
                  const isFixing = fixingIds.has(issue.id);
                  return (
                    <div
                      key={issue.id}
                      className="bps-list-item fix-issue-enter"
                      style={{
                        animationDelay: `${idx * 0.08}s`,
                        position: "relative",
                        overflow: "hidden",
                        opacity: isFixing ? 0.5 : 1,
                        transition: "opacity 0.3s",
                      }}
                    >
                      <div
                        className="fix-severity-bar"
                        style={{ background: cfg.color }}
                      />
                      <div className="bps-list-icon" style={{ background: `${cfg.color}15`, fontSize: "18px", marginLeft: "8px" }}>
                        {issue.icon}
                      </div>
                      <div className="bps-list-content">
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "2px" }}>
                          <span className="bps-list-title">{issue.title}</span>
                          <StatusBadge label={cfg.label} status={cfg.status} />
                        </div>
                        <div className="bps-list-sub">{issue.description}</div>
                      </div>
                      <div className="fix-issue-actions">
                        {isFixing ? (
                          <span className="fix-spinner" />
                        ) : (
                          <button
                            className="bps-btn bps-btn-ghost"
                            style={{ padding: "6px 14px", fontSize: "11px" }}
                            onClick={() => fixIssue(issue)}
                          >
                            ⚡ Auto-Fix
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </GlassCard>
        </div>

        {/* ── Health Score ── */}
        <div>
          <div className="bps-section-title">Health Score</div>
          <GlassCard>
            <div className="fix-health-wrap">
              <svg className="fix-health-svg fix-score-ring" viewBox="0 0 120 120">
                <circle className="fix-health-bg" cx="60" cy="60" r={circleRadius} />
                <circle
                  className="fix-health-fg"
                  cx="60"
                  cy="60"
                  r={circleRadius}
                  stroke={scoreColor}
                  strokeDasharray={circleCircumference}
                  strokeDashoffset={scoreOffset}
                  transform="rotate(-90 60 60)"
                  style={{ filter: `drop-shadow(0 0 6px ${scoreColor})` }}
                />
                <text className="fix-health-text" x="60" y="56" style={{ fill: scoreColor }}>
                  {healthScore}
                </text>
                <text className="fix-health-label" x="60" y="74">
                  out of 100
                </text>
              </svg>
              <div style={{ marginTop: "16px", textAlign: "center" }}>
                <div style={{ fontSize: "13px", fontWeight: 700, color: scoreColor }}>
                  {healthScore >= 90 ? "Excellent" : healthScore >= 70 ? "Good" : "Needs Work"}
                </div>
                <div style={{ fontSize: "11px", color: "#5A6B8A", marginTop: "4px" }}>
                  {healthScore >= 90
                    ? "Your site is in top shape!"
                    : healthScore >= 70
                      ? "A few issues remain to address"
                      : "Several critical issues need fixing"}
                </div>
              </div>
            </div>
            {scanState === "done" && issues.length > 0 && (
              <>
                <hr className="bps-divider" />
                <button
                  className="bps-btn bps-btn-primary"
                  style={{ width: "100%", justifyContent: "center" }}
                  onClick={() => {
                    issues.forEach((issue) => fixIssue(issue));
                  }}
                >
                  ⚡ Fix All ({issues.length})
                </button>
              </>
            )}
          </GlassCard>
        </div>
      </div>

      {/* ━━━ Quick Fixes ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div className="bps-section">
        <div className="bps-section-title">Quick Fixes</div>
        <div className="bps-grid-4" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
          {QUICK_FIXES.map((qf) => {
            const hasRelatedIssues = issues.some((i) => qf.relatedIssueIds.includes(i.id));
            const isRunning = quickFixRunning === qf.id;
            return (
              <div
                key={qf.id}
                className="fix-qf-card"
                data-disabled={(!hasRelatedIssues && scanState === "done") || isRunning ? "true" : undefined}
                onClick={() => {
                  if (hasRelatedIssues && !isRunning) runQuickFix(qf);
                }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if ((e.key === "Enter" || e.key === " ") && hasRelatedIssues && !isRunning) runQuickFix(qf);
                }}
              >
                <div className="fix-qf-icon">{isRunning ? <span className="fix-spinner" /> : qf.icon}</div>
                <div className="fix-qf-title">{qf.title}</div>
                <div className="fix-qf-desc">{qf.description}</div>
                {scanState === "done" && (
                  <span className="bps-tag" style={
                    hasRelatedIssues
                      ? { background: "rgba(255,107,53,0.12)", color: "#FF6B35", borderColor: "rgba(255,107,53,0.3)" }
                      : { opacity: 0.4 }
                  }>
                    {hasRelatedIssues
                      ? `${issues.filter((i) => qf.relatedIssueIds.includes(i.id)).length} fixable`
                      : "No issues"}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ━━━ Fix History — Timeline ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div className="bps-section">
        <div className="bps-section-title">Fix History</div>
        <GlassCard>
          {history.length === 0 ? (
            <div className="bps-empty">
              <div className="bps-empty-icon">📋</div>
              <div className="bps-empty-text">No fixes applied yet</div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column" }}>
              {history.map((entry, idx) => {
                const cfg = SEVERITY_CONFIG[entry.severity];
                return (
                  <div key={entry.id} className="fix-timeline-item fix-issue-enter" style={{ animationDelay: `${idx * 0.06}s` }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", position: "relative" }}>
                      <div
                        className="fix-timeline-dot"
                        style={{ borderColor: cfg.color, background: `${cfg.color}25` }}
                      />
                      {idx < history.length - 1 && <div className="fix-timeline-line" />}
                    </div>
                    <div style={{ flex: 1, paddingBottom: "8px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                        <span style={{ fontWeight: 700, fontSize: "14px", color: "#E0E6F0" }}>{entry.title}</span>
                        <span style={{ fontSize: "11px", color: "#5A6B8A" }}>{entry.timestamp}</span>
                      </div>
                      <div style={{
                        display: "grid",
                        gridTemplateColumns: "1fr auto 1fr",
                        gap: "10px",
                        alignItems: "center",
                        fontSize: "12px",
                        marginTop: "6px",
                        padding: "10px 14px",
                        borderRadius: "8px",
                        background: "rgba(255,255,255,0.02)",
                        border: "1px solid rgba(255,255,255,0.04)",
                      }}>
                        <div>
                          <div style={{ color: "#FF4D6A", fontWeight: 600, fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "2px" }}>Before</div>
                          <div style={{ color: "#8B9DC3" }}>{entry.before}</div>
                        </div>
                        <span style={{ color: "#5A6B8A", fontSize: "16px" }}>→</span>
                        <div>
                          <div style={{ color: "#00FFB2", fontWeight: 600, fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "2px" }}>After</div>
                          <div style={{ color: "#8B9DC3" }}>{entry.after}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </GlassCard>
      </div>
    </BuildPageShell>
  );
}
