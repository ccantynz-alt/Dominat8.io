"use client";

import { useState, useEffect, useCallback } from "react";
import {
  BuildPageShell,
  GlassCard,
  StatusBadge,
  MetricCard,
} from "@/io/surfaces/BuildPageShell";

/* ━━━ Types ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

type Environment = "staging" | "production";
type PipelineStep = "build" | "test" | "deploy" | "verify";
type StepStatus = "idle" | "running" | "passed" | "failed";

interface DeploymentEntry {
  id: string;
  commit: string;
  message: string;
  branch: string;
  environment: Environment;
  status: "online" | "pending" | "error";
  timestamp: string;
  duration: string;
  author: string;
}

/* ━━━ Mock Data ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

const MOCK_DEPLOYMENTS: DeploymentEntry[] = [
  {
    id: "d-2a7f",
    commit: "a3c8f1e",
    message: "feat: add payment gateway integration",
    branch: "main",
    environment: "production",
    status: "online",
    timestamp: "2 minutes ago",
    duration: "1m 42s",
    author: "ccantynz",
  },
  {
    id: "d-1b3e",
    commit: "f91d24b",
    message: "fix: resolve CORS headers on API routes",
    branch: "main",
    environment: "production",
    status: "online",
    timestamp: "47 minutes ago",
    duration: "1m 18s",
    author: "ccantynz",
  },
  {
    id: "d-8c4d",
    commit: "e7b032a",
    message: "chore: upgrade Next.js to 15.2",
    branch: "staging",
    environment: "staging",
    status: "pending",
    timestamp: "1 hour ago",
    duration: "2m 05s",
    author: "d8-bot",
  },
  {
    id: "d-5f9a",
    commit: "c42a8f7",
    message: "feat: quantum theme glassmorphism polish",
    branch: "claude/glass-v2",
    environment: "staging",
    status: "online",
    timestamp: "3 hours ago",
    duration: "1m 33s",
    author: "ccantynz",
  },
  {
    id: "d-0e2c",
    commit: "89d1e5f",
    message: "fix: mobile dock overflow on small screens",
    branch: "main",
    environment: "production",
    status: "online",
    timestamp: "6 hours ago",
    duration: "1m 51s",
    author: "ccantynz",
  },
];

const PIPELINE_STEPS: { key: PipelineStep; label: string; icon: string }[] = [
  { key: "build", label: "Build", icon: "🔨" },
  { key: "test", label: "Test", icon: "🧪" },
  { key: "deploy", label: "Deploy", icon: "🚀" },
  { key: "verify", label: "Verify", icon: "✅" },
];

const BRANCHES = ["main", "staging", "claude/glass-v2", "develop", "feature/payments"];

/* ━━━ Page Component ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

export default function DeployPage() {
  /* ── State ── */
  const [environment, setEnvironment] = useState<Environment>("production");
  const [autoDeploy, setAutoDeploy] = useState(true);
  const [selectedBranch, setSelectedBranch] = useState("main");
  const [notifySlack, setNotifySlack] = useState(true);
  const [notifyEmail, setNotifyEmail] = useState(false);
  const [notifyWebhook, setNotifyWebhook] = useState(true);

  const [deploying, setDeploying] = useState(false);
  const [deployProgress, setDeployProgress] = useState(0);
  const [pipelineStatuses, setPipelineStatuses] = useState<Record<PipelineStep, StepStatus>>({
    build: "idle",
    test: "idle",
    deploy: "idle",
    verify: "idle",
  });
  const [deployComplete, setDeployComplete] = useState(false);

  /* ── Deploy simulation ── */
  const resetPipeline = useCallback(() => {
    setPipelineStatuses({ build: "idle", test: "idle", deploy: "idle", verify: "idle" });
    setDeployProgress(0);
    setDeployComplete(false);
  }, []);

  const simulateDeploy = useCallback(() => {
    if (deploying) return;
    setDeploying(true);
    setDeployComplete(false);
    setDeployProgress(0);
    setPipelineStatuses({ build: "running", test: "idle", deploy: "idle", verify: "idle" });

    const steps: PipelineStep[] = ["build", "test", "deploy", "verify"];
    const durations = [1800, 1400, 2000, 1000]; // ms per step

    let elapsed = 0;
    const totalDuration = durations.reduce((a, b) => a + b, 0);

    steps.forEach((step, i) => {
      const stepStart = durations.slice(0, i).reduce((a, b) => a + b, 0);

      // Mark step as running
      setTimeout(() => {
        setPipelineStatuses((prev) => ({ ...prev, [step]: "running" }));
      }, stepStart);

      // Mark step as passed
      setTimeout(() => {
        setPipelineStatuses((prev) => ({ ...prev, [step]: "passed" }));
      }, stepStart + durations[i]);
    });

    // Progress bar animation
    const interval = setInterval(() => {
      elapsed += 80;
      const pct = Math.min((elapsed / totalDuration) * 100, 100);
      setDeployProgress(pct);
      if (pct >= 100) clearInterval(interval);
    }, 80);

    // Complete
    setTimeout(() => {
      clearInterval(interval);
      setDeployProgress(100);
      setDeploying(false);
      setDeployComplete(true);
    }, totalDuration + 200);
  }, [deploying]);

  // Reset after success message lingers
  useEffect(() => {
    if (!deployComplete) return;
    const t = setTimeout(resetPipeline, 6000);
    return () => clearTimeout(t);
  }, [deployComplete, resetPipeline]);

  /* ── Helpers ── */
  const envColor = environment === "production" ? "#00FFB2" : "#FFB800";
  const envLabel = environment === "production" ? "Production" : "Staging";

  return (
    <BuildPageShell title="Deploy" icon="🚀" accentColor="#00D4FF" activePage="Deploy">
      <DeployPageStyles />

      {/* ━━━ 1. Deploy Now ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="bps-section">
        <h2 className="bps-section-title">Deploy Now</h2>
        <GlassCard className="deploy-hero">
          <div className="deploy-hero-left">
            <div className="deploy-env-selector">
              <button
                className={`deploy-env-btn ${environment === "staging" ? "deploy-env-active" : ""}`}
                onClick={() => setEnvironment("staging")}
              >
                <span className="deploy-env-dot" style={{ background: "#FFB800" }} />
                Staging
              </button>
              <button
                className={`deploy-env-btn ${environment === "production" ? "deploy-env-active" : ""}`}
                onClick={() => setEnvironment("production")}
              >
                <span className="deploy-env-dot" style={{ background: "#00FFB2" }} />
                Production
              </button>
            </div>
            <p className="deploy-hero-desc">
              Deploy <strong>{selectedBranch}</strong> to{" "}
              <span style={{ color: envColor, fontWeight: 700 }}>{envLabel}</span>
            </p>
            {deploying && (
              <div style={{ width: "100%", marginTop: 12 }}>
                <div className="bps-progress" style={{ height: 8 }}>
                  <div
                    className="bps-progress-bar"
                    style={{ width: `${deployProgress}%` }}
                  />
                </div>
                <span className="deploy-progress-label">
                  {Math.round(deployProgress)}% complete
                </span>
              </div>
            )}
            {deployComplete && !deploying && (
              <div className="deploy-success-msg">
                Deployed successfully to {envLabel}
              </div>
            )}
          </div>
          <div className="deploy-hero-right">
            <button
              className={`deploy-big-btn ${deploying ? "deploy-big-btn-disabled" : ""}`}
              onClick={simulateDeploy}
              disabled={deploying}
            >
              <span className="deploy-big-btn-icon">🚀</span>
              <span className="deploy-big-btn-label">
                {deploying ? "Deploying..." : "Deploy"}
              </span>
              <span className="deploy-big-btn-glow" />
            </button>
          </div>
        </GlassCard>
      </section>

      {/* ━━━ 2. Deployment Pipeline ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="bps-section">
        <h2 className="bps-section-title">Deployment Pipeline</h2>
        <GlassCard>
          <div className="pipeline-track">
            {PIPELINE_STEPS.map((step, i) => {
              const status = pipelineStatuses[step.key];
              return (
                <div key={step.key} className="pipeline-node-wrap">
                  {i > 0 && (
                    <div
                      className={`pipeline-connector ${
                        status === "passed" || status === "running"
                          ? "pipeline-connector-active"
                          : ""
                      }`}
                    />
                  )}
                  <div
                    className={`pipeline-node pipeline-node-${status}`}
                    title={`${step.label}: ${status}`}
                  >
                    <span className="pipeline-node-icon">{step.icon}</span>
                    {status === "running" && <span className="pipeline-spinner" />}
                    {status === "passed" && <span className="pipeline-check">&#10003;</span>}
                  </div>
                  <span className="pipeline-label">{step.label}</span>
                  <span className={`pipeline-status pipeline-status-${status}`}>
                    {status === "idle" && "Waiting"}
                    {status === "running" && "Running"}
                    {status === "passed" && "Passed"}
                    {status === "failed" && "Failed"}
                  </span>
                </div>
              );
            })}
          </div>
        </GlassCard>
      </section>

      {/* ━━━ 3. Metrics ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="bps-section">
        <h2 className="bps-section-title">Metrics</h2>
        <div className="bps-grid-4">
          <MetricCard label="Total Deploys" value="1,247" sub="+18 this week" color="#00D4FF" />
          <MetricCard label="Uptime" value="99.98%" sub="Last 30 days" color="#00FFB2" />
          <MetricCard label="Avg Build Time" value="1m 38s" sub="-12s from last week" color="#7B61FF" />
          <MetricCard label="Success Rate" value="99.4%" sub="6 failed / 1,247" color="#FFB800" />
        </div>
      </section>

      {/* ━━━ 4. Recent Deployments ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="bps-section">
        <h2 className="bps-section-title">Recent Deployments</h2>
        <GlassCard className="deploy-list-card">
          {/* Table header */}
          <div className="deploy-list-header">
            <span className="deploy-col-status">Status</span>
            <span className="deploy-col-commit">Commit</span>
            <span className="deploy-col-message">Message</span>
            <span className="deploy-col-env">Environment</span>
            <span className="deploy-col-time">Time</span>
            <span className="deploy-col-dur">Duration</span>
          </div>
          <hr className="bps-divider" style={{ margin: "0 0 4px" }} />
          {MOCK_DEPLOYMENTS.map((d) => (
            <div key={d.id} className="bps-list-item deploy-list-row">
              <span className="deploy-col-status">
                <StatusBadge
                  label={d.status === "online" ? "Live" : d.status === "pending" ? "Pending" : "Error"}
                  status={d.status === "online" ? "online" : d.status === "pending" ? "pending" : "error"}
                />
              </span>
              <span className="deploy-col-commit">
                <code className="deploy-commit-hash">{d.commit}</code>
              </span>
              <span className="deploy-col-message">
                <span className="bps-list-title">{d.message}</span>
                <span className="bps-list-sub">{d.author}</span>
              </span>
              <span className="deploy-col-env">
                <span
                  className="bps-tag"
                  style={
                    d.environment === "production"
                      ? { background: "rgba(0,255,178,0.1)", color: "#00FFB2", borderColor: "rgba(0,255,178,0.2)" }
                      : { background: "rgba(255,184,0,0.1)", color: "#FFB800", borderColor: "rgba(255,184,0,0.2)" }
                  }
                >
                  {d.environment}
                </span>
              </span>
              <span className="deploy-col-time" style={{ color: "#8B9DC3", fontSize: 12 }}>
                {d.timestamp}
              </span>
              <span className="deploy-col-dur" style={{ color: "#5A6B8A", fontSize: 12 }}>
                {d.duration}
              </span>
            </div>
          ))}
        </GlassCard>
      </section>

      {/* ━━━ 5. Deployment Settings ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="bps-section">
        <h2 className="bps-section-title">Deployment Settings</h2>
        <div className="bps-grid-2">
          {/* Left: Config */}
          <GlassCard>
            <h3 className="deploy-settings-heading">Configuration</h3>

            {/* Auto-deploy toggle */}
            <div className="deploy-setting-row">
              <div className="deploy-setting-info">
                <span className="deploy-setting-label">Auto Deploy</span>
                <span className="deploy-setting-hint">
                  Automatically deploy when changes are pushed to the selected branch
                </span>
              </div>
              <button
                className={`deploy-toggle ${autoDeploy ? "deploy-toggle-on" : ""}`}
                onClick={() => setAutoDeploy((v) => !v)}
                aria-label="Toggle auto-deploy"
              >
                <span className="deploy-toggle-knob" />
              </button>
            </div>

            <hr className="bps-divider" />

            {/* Branch selector */}
            <div className="deploy-setting-row">
              <div className="deploy-setting-info">
                <span className="deploy-setting-label">Deploy Branch</span>
                <span className="deploy-setting-hint">
                  Branch that triggers production deployments
                </span>
              </div>
              <select
                className="deploy-select"
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
              >
                {BRANCHES.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>

            <hr className="bps-divider" />

            {/* Environment default */}
            <div className="deploy-setting-row">
              <div className="deploy-setting-info">
                <span className="deploy-setting-label">Default Environment</span>
                <span className="deploy-setting-hint">
                  Target environment for one-click deploys
                </span>
              </div>
              <div className="deploy-env-selector" style={{ gap: 6 }}>
                <button
                  className={`deploy-env-btn deploy-env-btn-sm ${environment === "staging" ? "deploy-env-active" : ""}`}
                  onClick={() => setEnvironment("staging")}
                >
                  Staging
                </button>
                <button
                  className={`deploy-env-btn deploy-env-btn-sm ${environment === "production" ? "deploy-env-active" : ""}`}
                  onClick={() => setEnvironment("production")}
                >
                  Production
                </button>
              </div>
            </div>
          </GlassCard>

          {/* Right: Notifications */}
          <GlassCard>
            <h3 className="deploy-settings-heading">Notifications</h3>

            <div className="deploy-setting-row">
              <div className="deploy-setting-info">
                <span className="deploy-setting-label">Slack Notifications</span>
                <span className="deploy-setting-hint">Post deployment status to #deploys</span>
              </div>
              <button
                className={`deploy-toggle ${notifySlack ? "deploy-toggle-on" : ""}`}
                onClick={() => setNotifySlack((v) => !v)}
                aria-label="Toggle Slack notifications"
              >
                <span className="deploy-toggle-knob" />
              </button>
            </div>

            <hr className="bps-divider" />

            <div className="deploy-setting-row">
              <div className="deploy-setting-info">
                <span className="deploy-setting-label">Email Alerts</span>
                <span className="deploy-setting-hint">
                  Send email on failed deployments
                </span>
              </div>
              <button
                className={`deploy-toggle ${notifyEmail ? "deploy-toggle-on" : ""}`}
                onClick={() => setNotifyEmail((v) => !v)}
                aria-label="Toggle email alerts"
              >
                <span className="deploy-toggle-knob" />
              </button>
            </div>

            <hr className="bps-divider" />

            <div className="deploy-setting-row">
              <div className="deploy-setting-info">
                <span className="deploy-setting-label">Webhook</span>
                <span className="deploy-setting-hint">
                  POST deploy events to your custom endpoint
                </span>
              </div>
              <button
                className={`deploy-toggle ${notifyWebhook ? "deploy-toggle-on" : ""}`}
                onClick={() => setNotifyWebhook((v) => !v)}
                aria-label="Toggle webhook"
              >
                <span className="deploy-toggle-knob" />
              </button>
            </div>

            <hr className="bps-divider" />

            <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
              <button className="bps-btn bps-btn-primary" style={{ fontSize: 12 }}>
                Save Settings
              </button>
              <button className="bps-btn bps-btn-ghost" style={{ fontSize: 12 }}>
                Reset Defaults
              </button>
            </div>
          </GlassCard>
        </div>
      </section>
    </BuildPageShell>
  );
}

/* ━━━ Page-Specific Styles ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

function DeployPageStyles() {
  return (
    <style>{`
      /* ── Deploy Hero ── */
      .deploy-hero {
        display: flex;
        align-items: center;
        gap: 32px;
      }
      .deploy-hero-left {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      .deploy-hero-right {
        flex-shrink: 0;
      }
      .deploy-hero-desc {
        margin: 0;
        font-size: 14px;
        color: #8B9DC3;
        line-height: 1.5;
      }
      .deploy-hero-desc strong {
        color: #E0E6F0;
        font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
        font-size: 13px;
        padding: 2px 8px;
        background: rgba(255,255,255,0.06);
        border-radius: 4px;
        border: 1px solid rgba(255,255,255,0.08);
      }

      /* ── Environment Selector ── */
      .deploy-env-selector {
        display: flex;
        gap: 8px;
      }
      .deploy-env-btn {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 8px 18px;
        border-radius: 10px;
        font-size: 13px;
        font-weight: 600;
        background: rgba(255,255,255,0.04);
        color: #8B9DC3;
        border: 1px solid rgba(255,255,255,0.08);
        cursor: pointer;
        transition: all 0.25s;
      }
      .deploy-env-btn:hover {
        background: rgba(255,255,255,0.07);
        border-color: rgba(255,255,255,0.15);
      }
      .deploy-env-btn-sm {
        padding: 5px 14px;
        font-size: 12px;
      }
      .deploy-env-active {
        background: rgba(0,212,255,0.1) !important;
        border-color: rgba(0,212,255,0.3) !important;
        color: #00D4FF !important;
        box-shadow: 0 0 16px rgba(0,212,255,0.1);
      }
      .deploy-env-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        display: inline-block;
      }

      /* ── Deploy Big Button ── */
      .deploy-big-btn {
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        width: 140px;
        height: 140px;
        border-radius: 50%;
        background: linear-gradient(135deg, #00D4FF, #7B61FF);
        border: none;
        cursor: pointer;
        transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
        box-shadow:
          0 0 40px rgba(0,212,255,0.3),
          0 0 80px rgba(0,212,255,0.1),
          inset 0 -4px 12px rgba(0,0,0,0.2);
        overflow: hidden;
      }
      .deploy-big-btn:hover:not(.deploy-big-btn-disabled) {
        transform: scale(1.08);
        box-shadow:
          0 0 60px rgba(0,212,255,0.45),
          0 0 120px rgba(0,212,255,0.15),
          inset 0 -4px 12px rgba(0,0,0,0.2);
      }
      .deploy-big-btn:active:not(.deploy-big-btn-disabled) {
        transform: scale(0.96);
      }
      .deploy-big-btn-disabled {
        opacity: 0.7;
        cursor: not-allowed;
        animation: deployPulse 1.5s ease-in-out infinite;
      }
      .deploy-big-btn-icon {
        font-size: 36px;
        filter: drop-shadow(0 2px 6px rgba(0,0,0,0.3));
      }
      .deploy-big-btn-label {
        font-size: 14px;
        font-weight: 800;
        color: #fff;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        margin-top: 4px;
        text-shadow: 0 1px 4px rgba(0,0,0,0.3);
      }
      .deploy-big-btn-glow {
        position: absolute;
        inset: -2px;
        border-radius: 50%;
        background: radial-gradient(circle, transparent 60%, rgba(0,212,255,0.15));
        pointer-events: none;
        animation: glowRotate 4s linear infinite;
      }
      @keyframes glowRotate {
        0%   { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      @keyframes deployPulse {
        0%, 100% { box-shadow: 0 0 40px rgba(0,212,255,0.3), 0 0 80px rgba(0,212,255,0.1); }
        50%      { box-shadow: 0 0 60px rgba(0,212,255,0.5), 0 0 120px rgba(0,212,255,0.2); }
      }

      .deploy-progress-label {
        display: block;
        margin-top: 6px;
        font-size: 11px;
        color: #8B9DC3;
        font-weight: 600;
        letter-spacing: 0.03em;
      }

      .deploy-success-msg {
        padding: 8px 16px;
        border-radius: 8px;
        background: rgba(0,255,178,0.08);
        border: 1px solid rgba(0,255,178,0.2);
        color: #00FFB2;
        font-size: 13px;
        font-weight: 600;
        animation: fadeSlideIn 0.4s ease-out;
      }
      @keyframes fadeSlideIn {
        from { opacity: 0; transform: translateY(8px); }
        to   { opacity: 1; transform: translateY(0); }
      }

      /* ── Pipeline ── */
      .pipeline-track {
        display: flex;
        align-items: flex-start;
        justify-content: center;
        gap: 0;
        padding: 20px 0;
      }
      .pipeline-node-wrap {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 10px;
        position: relative;
        flex: 1;
        max-width: 180px;
      }
      .pipeline-connector {
        position: absolute;
        top: 30px;
        right: calc(50% + 32px);
        width: calc(100% - 64px);
        height: 3px;
        background: rgba(255,255,255,0.08);
        border-radius: 2px;
        transition: background 0.5s;
        z-index: 0;
      }
      .pipeline-connector-active {
        background: linear-gradient(90deg, #00D4FF, #7B61FF);
        box-shadow: 0 0 12px rgba(0,212,255,0.3);
      }
      .pipeline-node {
        position: relative;
        width: 60px;
        height: 60px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2px solid rgba(255,255,255,0.1);
        background: rgba(255,255,255,0.03);
        transition: all 0.4s;
        z-index: 1;
      }
      .pipeline-node-icon {
        font-size: 22px;
        z-index: 2;
      }
      .pipeline-node-idle {
        border-color: rgba(255,255,255,0.1);
      }
      .pipeline-node-running {
        border-color: #00D4FF;
        background: rgba(0,212,255,0.08);
        box-shadow: 0 0 24px rgba(0,212,255,0.2);
        animation: nodeGlow 1.5s ease-in-out infinite;
      }
      .pipeline-node-passed {
        border-color: #00FFB2;
        background: rgba(0,255,178,0.08);
        box-shadow: 0 0 20px rgba(0,255,178,0.15);
      }
      .pipeline-node-failed {
        border-color: #FF4D6A;
        background: rgba(255,77,106,0.08);
        box-shadow: 0 0 20px rgba(255,77,106,0.15);
      }
      @keyframes nodeGlow {
        0%, 100% { box-shadow: 0 0 24px rgba(0,212,255,0.2); }
        50%      { box-shadow: 0 0 40px rgba(0,212,255,0.4); }
      }
      .pipeline-spinner {
        position: absolute;
        inset: -4px;
        border-radius: 50%;
        border: 2px solid transparent;
        border-top-color: #00D4FF;
        animation: spinPipeline 0.8s linear infinite;
      }
      @keyframes spinPipeline {
        to { transform: rotate(360deg); }
      }
      .pipeline-check {
        position: absolute;
        bottom: -2px;
        right: -2px;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: #00FFB2;
        color: #0A0E1A;
        font-size: 11px;
        font-weight: 900;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 0 8px rgba(0,255,178,0.4);
      }
      .pipeline-label {
        font-size: 13px;
        font-weight: 700;
        color: #E0E6F0;
        letter-spacing: 0.02em;
      }
      .pipeline-status {
        font-size: 11px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.06em;
      }
      .pipeline-status-idle    { color: #5A6B8A; }
      .pipeline-status-running { color: #00D4FF; }
      .pipeline-status-passed  { color: #00FFB2; }
      .pipeline-status-failed  { color: #FF4D6A; }

      /* ── Deployment List ── */
      .deploy-list-card {
        padding: 16px 20px;
      }
      .deploy-list-header {
        display: flex;
        align-items: center;
        padding: 8px 16px;
        gap: 12px;
        font-size: 11px;
        font-weight: 700;
        color: #5A6B8A;
        text-transform: uppercase;
        letter-spacing: 0.08em;
      }
      .deploy-list-row {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .deploy-col-status  { width: 100px; flex-shrink: 0; }
      .deploy-col-commit  { width: 90px; flex-shrink: 0; }
      .deploy-col-message { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
      .deploy-col-env     { width: 100px; flex-shrink: 0; }
      .deploy-col-time    { width: 110px; flex-shrink: 0; text-align: right; }
      .deploy-col-dur     { width: 80px; flex-shrink: 0; text-align: right; }

      .deploy-commit-hash {
        font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
        font-size: 12px;
        color: #00D4FF;
        background: rgba(0,212,255,0.08);
        padding: 2px 8px;
        border-radius: 4px;
        border: 1px solid rgba(0,212,255,0.15);
      }

      /* ── Settings ── */
      .deploy-settings-heading {
        font-size: 15px;
        font-weight: 700;
        color: #E0E6F0;
        margin: 0 0 20px;
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .deploy-setting-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
      }
      .deploy-setting-info {
        display: flex;
        flex-direction: column;
        gap: 2px;
        flex: 1;
      }
      .deploy-setting-label {
        font-size: 14px;
        font-weight: 600;
        color: #E0E6F0;
      }
      .deploy-setting-hint {
        font-size: 12px;
        color: #5A6B8A;
        line-height: 1.4;
      }

      /* Toggle switch */
      .deploy-toggle {
        position: relative;
        width: 48px;
        height: 26px;
        border-radius: 13px;
        background: rgba(255,255,255,0.08);
        border: 1px solid rgba(255,255,255,0.12);
        cursor: pointer;
        transition: all 0.3s;
        flex-shrink: 0;
      }
      .deploy-toggle-on {
        background: rgba(0,212,255,0.2);
        border-color: rgba(0,212,255,0.4);
        box-shadow: 0 0 12px rgba(0,212,255,0.15);
      }
      .deploy-toggle-knob {
        position: absolute;
        top: 3px;
        left: 3px;
        width: 18px;
        height: 18px;
        border-radius: 50%;
        background: #5A6B8A;
        transition: all 0.3s;
        box-shadow: 0 1px 4px rgba(0,0,0,0.3);
      }
      .deploy-toggle-on .deploy-toggle-knob {
        left: 25px;
        background: #00D4FF;
        box-shadow: 0 0 10px rgba(0,212,255,0.5);
      }

      /* Select */
      .deploy-select {
        padding: 7px 14px;
        border-radius: 8px;
        font-size: 13px;
        font-weight: 600;
        font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
        background: rgba(255,255,255,0.05);
        color: #E0E6F0;
        border: 1px solid rgba(255,255,255,0.1);
        cursor: pointer;
        transition: all 0.25s;
        outline: none;
        appearance: none;
        -webkit-appearance: none;
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%238B9DC3'/%3E%3C/svg%3E");
        background-repeat: no-repeat;
        background-position: right 12px center;
        padding-right: 32px;
      }
      .deploy-select:hover {
        border-color: rgba(0,212,255,0.3);
        background-color: rgba(0,212,255,0.05);
      }
      .deploy-select:focus {
        border-color: rgba(0,212,255,0.5);
        box-shadow: 0 0 12px rgba(0,212,255,0.15);
      }
      .deploy-select option {
        background: #0A0E1A;
        color: #E0E6F0;
      }

      /* ── Responsive ── */
      @media (max-width: 768px) {
        .deploy-hero {
          flex-direction: column;
          text-align: center;
          gap: 24px;
        }
        .deploy-hero-left {
          align-items: center;
        }
        .deploy-env-selector {
          justify-content: center;
        }
        .pipeline-track {
          flex-direction: column;
          align-items: center;
          gap: 16px;
        }
        .pipeline-connector {
          display: none;
        }
        .deploy-list-header {
          display: none;
        }
        .deploy-list-row {
          flex-wrap: wrap;
          gap: 8px;
        }
        .deploy-col-status,
        .deploy-col-commit,
        .deploy-col-env,
        .deploy-col-time,
        .deploy-col-dur {
          width: auto;
        }
        .deploy-col-message {
          width: 100%;
          order: -1;
        }
        .deploy-setting-row {
          flex-direction: column;
          align-items: flex-start;
          gap: 10px;
        }
      }
    `}</style>
  );
}
