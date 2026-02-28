"use client";

import React, { useState, useCallback, useRef } from "react";
import {
  BuildPageShell,
  GlassCard,
  StatusBadge,
  MetricCard,
} from "@/io/surfaces/BuildPageShell";

/* ━━━ Types ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

type AgentStatus = "idle" | "running" | "complete";

interface Agent {
  id: string;
  icon: string;
  name: string;
  description: string;
  creditCost: number;
}

interface AgentRunState {
  status: AgentStatus;
  progress: number;
  results: { found: number; fixed: number; duration: string } | null;
}

interface ScheduledTask {
  id: string;
  icon: string;
  name: string;
  schedule: string;
  nextRun: string;
  lastStatus: "online" | "warning" | "error" | "pending";
  lastStatusLabel: string;
}

interface PipelineStage {
  id: string;
  icon: string;
  label: string;
  status: "online" | "warning" | "error" | "pending";
  statusLabel: string;
}

interface RunHistoryEntry {
  id: string;
  agent: string;
  icon: string;
  ranAt: string;
  duration: string;
  issuesFound: number;
  issuesFixed: number;
  status: "online" | "warning" | "error";
}

/* ━━━ Static Data ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

const AGENTS: Agent[] = [
  {
    id: "seo-sweep",
    icon: "🔍",
    name: "SEO Sweep",
    description: "Scan every page for missing meta tags, broken structured data, and keyword gaps.",
    creditCost: 5,
  },
  {
    id: "design-fixer",
    icon: "🎨",
    name: "Design Fixer",
    description: "Detect visual regressions, inconsistent spacing, and color contrast failures.",
    creditCost: 8,
  },
  {
    id: "responsive-audit",
    icon: "📱",
    name: "Responsive Audit",
    description: "Test every breakpoint for layout shifts, overflow, and touch-target sizing.",
    creditCost: 6,
  },
  {
    id: "perf-optimizer",
    icon: "🚀",
    name: "Performance Optimizer",
    description: "Analyze Core Web Vitals, bundle size, and render-blocking resources.",
    creditCost: 10,
  },
  {
    id: "a11y-checker",
    icon: "♿",
    name: "Accessibility Checker",
    description: "WCAG 2.2 AA audit: ARIA roles, keyboard nav, screen reader compatibility.",
    creditCost: 7,
  },
  {
    id: "link-scanner",
    icon: "🔗",
    name: "Link Scanner",
    description: "Crawl all internal and external links for 404s, redirect chains, and orphan pages.",
    creditCost: 3,
  },
];

const SCHEDULED_TASKS: ScheduledTask[] = [
  {
    id: "st-1",
    icon: "🔍",
    name: "SEO Sweep — Full Site",
    schedule: "0 3 * * 1",
    nextRun: "Mon 03:00 UTC",
    lastStatus: "online",
    lastStatusLabel: "Passed",
  },
  {
    id: "st-2",
    icon: "🔗",
    name: "Link Scanner — Nightly",
    schedule: "0 2 * * *",
    nextRun: "Tomorrow 02:00 UTC",
    lastStatus: "warning",
    lastStatusLabel: "3 Warnings",
  },
  {
    id: "st-3",
    icon: "🚀",
    name: "Performance Check — Weekly",
    schedule: "30 4 * * 5",
    nextRun: "Fri 04:30 UTC",
    lastStatus: "online",
    lastStatusLabel: "Passed",
  },
  {
    id: "st-4",
    icon: "♿",
    name: "Accessibility Audit — Bi-weekly",
    schedule: "0 6 1,15 * *",
    nextRun: "Mar 01 06:00 UTC",
    lastStatus: "error",
    lastStatusLabel: "2 Failures",
  },
  {
    id: "st-5",
    icon: "📱",
    name: "Responsive Snapshot — Daily",
    schedule: "0 5 * * *",
    nextRun: "Tomorrow 05:00 UTC",
    lastStatus: "online",
    lastStatusLabel: "Passed",
  },
];

const PIPELINE_STAGES: PipelineStage[] = [
  { id: "p-1", icon: "📤", label: "Code Push", status: "online", statusLabel: "Complete" },
  { id: "p-2", icon: "🔨", label: "Build", status: "online", statusLabel: "Complete" },
  { id: "p-3", icon: "🧪", label: "Test", status: "online", statusLabel: "126 Passed" },
  { id: "p-4", icon: "🔍", label: "SEO Check", status: "warning", statusLabel: "1 Warning" },
  { id: "p-5", icon: "🚀", label: "Deploy", status: "pending", statusLabel: "Waiting" },
];

const RUN_HISTORY: RunHistoryEntry[] = [
  { id: "rh-1", agent: "SEO Sweep", icon: "🔍", ranAt: "28 Feb 14:22", duration: "1m 12s", issuesFound: 7, issuesFixed: 5, status: "warning" },
  { id: "rh-2", agent: "Link Scanner", icon: "🔗", ranAt: "28 Feb 11:05", duration: "0m 34s", issuesFound: 2, issuesFixed: 2, status: "online" },
  { id: "rh-3", agent: "Performance Optimizer", icon: "🚀", ranAt: "27 Feb 22:10", duration: "2m 48s", issuesFound: 4, issuesFixed: 4, status: "online" },
  { id: "rh-4", agent: "Accessibility Checker", icon: "♿", ranAt: "27 Feb 18:33", duration: "1m 55s", issuesFound: 11, issuesFixed: 8, status: "error" },
  { id: "rh-5", agent: "Design Fixer", icon: "🎨", ranAt: "27 Feb 09:12", duration: "3m 05s", issuesFound: 3, issuesFixed: 3, status: "online" },
];

const MOCK_RESULTS: Record<string, { found: number; fixed: number; duration: string }> = {
  "seo-sweep": { found: 7, fixed: 5, duration: "1m 12s" },
  "design-fixer": { found: 3, fixed: 3, duration: "3m 05s" },
  "responsive-audit": { found: 5, fixed: 4, duration: "2m 18s" },
  "perf-optimizer": { found: 4, fixed: 4, duration: "2m 48s" },
  "a11y-checker": { found: 11, fixed: 8, duration: "1m 55s" },
  "link-scanner": { found: 2, fixed: 2, duration: "0m 34s" },
};

/* ━━━ Component ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

export default function AutomatePage() {
  /* --- Agent run state --- */
  const [agentStates, setAgentStates] = useState<Record<string, AgentRunState>>({});
  const [credits, setCredits] = useState(142);
  const timersRef = useRef<Record<string, ReturnType<typeof setInterval>>>({});

  const runAgent = useCallback(
    (agent: Agent) => {
      if (credits < agent.creditCost) return;

      setCredits((c) => c - agent.creditCost);
      setAgentStates((prev) => ({
        ...prev,
        [agent.id]: { status: "running", progress: 0, results: null },
      }));

      let tick = 0;
      const interval = setInterval(() => {
        tick += 1;
        const pct = Math.min(tick * 5, 100);
        setAgentStates((prev) => ({
          ...prev,
          [agent.id]: { ...prev[agent.id], progress: pct },
        }));

        if (pct >= 100) {
          clearInterval(interval);
          delete timersRef.current[agent.id];
          setAgentStates((prev) => ({
            ...prev,
            [agent.id]: {
              status: "complete",
              progress: 100,
              results: MOCK_RESULTS[agent.id] ?? { found: 0, fixed: 0, duration: "0m 00s" },
            },
          }));
        }
      }, 120);

      timersRef.current[agent.id] = interval;
    },
    [credits],
  );

  const getAgentState = (id: string): AgentRunState =>
    agentStates[id] ?? { status: "idle", progress: 0, results: null };

  /* --- Render --- */
  return (
    <BuildPageShell title="Automate" icon="⚡" accentColor="#FFB800" activePage="Automate">
      <AutomateStyles />

      {/* ── Credits ── */}
      <section className="bps-section">
        <h2 className="bps-section-title">Credits</h2>
        <GlassCard>
          <div className="at-credits-row">
            <div className="at-credits-balance">
              <span className="at-credits-icon">⚡</span>
              <div>
                <div className="at-credits-value">{credits}</div>
                <div className="at-credits-label">credits remaining</div>
              </div>
            </div>
            <button className="bps-btn bps-btn-primary">Buy Credits</button>
          </div>
          <div className="bps-progress" style={{ marginTop: 16 }}>
            <div
              className="bps-progress-bar"
              style={{ width: `${Math.min((credits / 200) * 100, 100)}%` }}
            />
          </div>
          <div className="at-credits-cap">200 credit monthly cap</div>
        </GlassCard>
      </section>

      {/* ── AI Agents ── */}
      <section className="bps-section">
        <h2 className="bps-section-title">AI Agents</h2>
        <div className="bps-grid-3">
          {AGENTS.map((agent) => {
            const state = getAgentState(agent.id);
            return (
              <GlassCard key={agent.id}>
                <div className="at-agent-header">
                  <span className="at-agent-icon">{agent.icon}</span>
                  <span className="bps-tag">{agent.creditCost} credits</span>
                </div>
                <div className="at-agent-name">{agent.name}</div>
                <div className="at-agent-desc">{agent.description}</div>

                {state.status === "idle" && (
                  <button
                    className="bps-btn bps-btn-primary at-agent-btn"
                    onClick={() => runAgent(agent)}
                    disabled={credits < agent.creditCost}
                    title={
                      credits < agent.creditCost
                        ? "Not enough credits"
                        : `Run ${agent.name}`
                    }
                  >
                    ▶ Run
                  </button>
                )}

                {state.status === "running" && (
                  <div className="at-agent-running">
                    <div className="bps-progress">
                      <div
                        className="bps-progress-bar"
                        style={{ width: `${state.progress}%` }}
                      />
                    </div>
                    <span className="at-agent-pct">{state.progress}%</span>
                  </div>
                )}

                {state.status === "complete" && state.results && (
                  <div className="at-agent-results">
                    <StatusBadge label="Complete" status="online" />
                    <div className="at-agent-stats">
                      <span className="at-stat">
                        <strong>{state.results.found}</strong> found
                      </span>
                      <span className="at-stat-sep" />
                      <span className="at-stat">
                        <strong>{state.results.fixed}</strong> fixed
                      </span>
                      <span className="at-stat-sep" />
                      <span className="at-stat">{state.results.duration}</span>
                    </div>
                  </div>
                )}
              </GlassCard>
            );
          })}
        </div>
      </section>

      {/* ── Pipeline ── */}
      <section className="bps-section">
        <h2 className="bps-section-title">Pipeline</h2>
        <GlassCard>
          <div className="at-pipeline">
            {PIPELINE_STAGES.map((stage, i) => (
              <React.Fragment key={stage.id}>
                <div className="at-pipe-stage">
                  <div className="at-pipe-icon">{stage.icon}</div>
                  <div className="at-pipe-label">{stage.label}</div>
                  <StatusBadge label={stage.statusLabel} status={stage.status} />
                </div>
                {i < PIPELINE_STAGES.length - 1 && (
                  <div className="at-pipe-connector">
                    <div
                      className="at-pipe-line"
                      data-active={
                        stage.status === "online" ? "true" : "false"
                      }
                    />
                    <span className="at-pipe-arrow">→</span>
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </GlassCard>
      </section>

      {/* ── Scheduled Tasks ── */}
      <section className="bps-section">
        <h2 className="bps-section-title">Scheduled Tasks</h2>
        <GlassCard>
          <div className="at-task-list">
            {SCHEDULED_TASKS.map((task) => (
              <div key={task.id} className="bps-list-item">
                <div className="bps-list-icon">{task.icon}</div>
                <div className="bps-list-content">
                  <div className="bps-list-title">{task.name}</div>
                  <div className="bps-list-sub">
                    <code className="at-cron">{task.schedule}</code>
                    <span className="at-next-run">Next: {task.nextRun}</span>
                  </div>
                </div>
                <StatusBadge label={task.lastStatusLabel} status={task.lastStatus} />
              </div>
            ))}
          </div>
        </GlassCard>
      </section>

      {/* ── Agent Run History ── */}
      <section className="bps-section">
        <h2 className="bps-section-title">Agent Run History</h2>
        <GlassCard>
          <div className="at-history-header">
            <span className="at-hh-col at-hh-agent">Agent</span>
            <span className="at-hh-col at-hh-ran">Ran</span>
            <span className="at-hh-col at-hh-dur">Duration</span>
            <span className="at-hh-col at-hh-found">Found</span>
            <span className="at-hh-col at-hh-fixed">Fixed</span>
            <span className="at-hh-col at-hh-status">Status</span>
          </div>
          <hr className="bps-divider" style={{ margin: "8px 0" }} />
          {RUN_HISTORY.map((entry) => (
            <div key={entry.id} className="at-history-row">
              <span className="at-hh-col at-hh-agent">
                <span className="at-hr-icon">{entry.icon}</span>
                {entry.agent}
              </span>
              <span className="at-hh-col at-hh-ran">{entry.ranAt}</span>
              <span className="at-hh-col at-hh-dur">{entry.duration}</span>
              <span className="at-hh-col at-hh-found">{entry.issuesFound}</span>
              <span className="at-hh-col at-hh-fixed">{entry.issuesFixed}</span>
              <span className="at-hh-col at-hh-status">
                <StatusBadge
                  label={
                    entry.status === "online"
                      ? "All Fixed"
                      : entry.status === "warning"
                        ? "Partial"
                        : "Needs Review"
                  }
                  status={entry.status}
                />
              </span>
            </div>
          ))}
        </GlassCard>
      </section>
    </BuildPageShell>
  );
}

/* ━━━ Page-Scoped Styles ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

function AutomateStyles() {
  return (
    <style>{`
      /* ── Credits ── */
      .at-credits-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 16px;
      }
      .at-credits-balance {
        display: flex;
        align-items: center;
        gap: 14px;
      }
      .at-credits-icon {
        font-size: 36px;
        filter: drop-shadow(0 0 12px rgba(255,184,0,0.5));
      }
      .at-credits-value {
        font-size: 36px;
        font-weight: 800;
        background: linear-gradient(135deg, #FFB800, #E0E6F0);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        line-height: 1.1;
      }
      .at-credits-label {
        font-size: 12px;
        color: #5A6B8A;
        text-transform: uppercase;
        letter-spacing: 0.06em;
      }
      .at-credits-cap {
        font-size: 11px;
        color: #5A6B8A;
        text-align: right;
        margin-top: 6px;
      }

      /* ── Agent cards ── */
      .at-agent-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 10px;
      }
      .at-agent-icon {
        font-size: 28px;
        filter: drop-shadow(0 0 8px rgba(255,184,0,0.35));
      }
      .at-agent-name {
        font-size: 16px;
        font-weight: 700;
        color: #E0E6F0;
        margin-bottom: 6px;
      }
      .at-agent-desc {
        font-size: 12px;
        color: #8B9DC3;
        line-height: 1.55;
        margin-bottom: 16px;
        min-height: 40px;
      }
      .at-agent-btn {
        width: 100%;
        justify-content: center;
      }
      .at-agent-btn:disabled {
        opacity: 0.4;
        cursor: not-allowed;
        transform: none !important;
        box-shadow: none !important;
      }
      .at-agent-running {
        display: flex;
        align-items: center;
        gap: 10px;
      }
      .at-agent-running .bps-progress { flex: 1; }
      .at-agent-pct {
        font-size: 13px;
        font-weight: 700;
        color: #FFB800;
        min-width: 38px;
        text-align: right;
      }
      .at-agent-results {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      .at-agent-stats {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 12px;
        color: #8B9DC3;
      }
      .at-stat strong {
        color: #E0E6F0;
        font-weight: 700;
      }
      .at-stat-sep {
        width: 1px;
        height: 14px;
        background: rgba(255,255,255,0.12);
      }

      /* ── Pipeline ── */
      .at-pipeline {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0;
        flex-wrap: wrap;
        padding: 12px 0;
      }
      .at-pipe-stage {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
        padding: 16px 12px;
        min-width: 100px;
      }
      .at-pipe-icon {
        font-size: 28px;
        width: 52px;
        height: 52px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 14px;
        background: rgba(255,184,0,0.08);
        border: 1px solid rgba(255,184,0,0.18);
      }
      .at-pipe-label {
        font-size: 13px;
        font-weight: 600;
        color: #E0E6F0;
      }
      .at-pipe-connector {
        display: flex;
        align-items: center;
        gap: 4px;
        padding: 0 2px;
      }
      .at-pipe-line {
        width: 32px;
        height: 2px;
        border-radius: 1px;
        background: rgba(255,255,255,0.1);
        transition: background 0.3s;
      }
      .at-pipe-line[data-active="true"] {
        background: linear-gradient(90deg, #00FFB2, #FFB800);
        box-shadow: 0 0 8px rgba(0,255,178,0.3);
      }
      .at-pipe-arrow {
        font-size: 14px;
        color: #5A6B8A;
      }

      /* ── Scheduled Tasks ── */
      .at-task-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .at-cron {
        display: inline-block;
        padding: 1px 7px;
        border-radius: 4px;
        background: rgba(123,97,255,0.12);
        color: #7B61FF;
        font-size: 11px;
        font-family: 'SF Mono', 'Fira Code', 'Cascadia Code', monospace;
        margin-right: 10px;
        border: 1px solid rgba(123,97,255,0.2);
      }
      .at-next-run {
        font-size: 11px;
        color: #5A6B8A;
      }

      /* ── Run History ── */
      .at-history-header,
      .at-history-row {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 0;
      }
      .at-history-header {
        font-size: 11px;
        font-weight: 700;
        color: #5A6B8A;
        text-transform: uppercase;
        letter-spacing: 0.06em;
      }
      .at-history-row {
        font-size: 13px;
        color: #8B9DC3;
        border-bottom: 1px solid rgba(255,255,255,0.04);
        transition: background 0.2s;
      }
      .at-history-row:last-child { border-bottom: none; }
      .at-history-row:hover { background: rgba(0,212,255,0.03); }
      .at-hh-col { flex-shrink: 0; }
      .at-hh-agent { flex: 2; display: flex; align-items: center; gap: 8px; min-width: 0; }
      .at-hh-ran   { flex: 1.2; }
      .at-hh-dur   { flex: 0.8; }
      .at-hh-found { flex: 0.6; text-align: center; }
      .at-hh-fixed { flex: 0.6; text-align: center; }
      .at-hh-status { flex: 1; display: flex; justify-content: flex-end; }
      .at-hr-icon { font-size: 16px; flex-shrink: 0; }

      /* ── Responsive ── */
      @media (max-width: 768px) {
        .at-pipeline { flex-direction: column; }
        .at-pipe-connector {
          transform: rotate(90deg);
          padding: 4px 0;
        }
        .at-history-header { display: none; }
        .at-history-row {
          flex-wrap: wrap;
          gap: 4px 12px;
          padding: 12px 0;
        }
        .at-hh-agent { flex-basis: 100%; }
        .at-hh-status { flex-basis: 100%; justify-content: flex-start; margin-top: 4px; }
      }
    `}</style>
  );
}
