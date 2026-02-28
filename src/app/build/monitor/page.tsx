"use client";

import { useState, useCallback } from "react";
import {
  BuildPageShell,
  GlassCard,
  StatusBadge,
  MetricCard,
} from "@/io/surfaces/BuildPageShell";

/* ━━━ Static Data ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

const ACCENT = "#00FFB2";

interface Alert {
  id: string;
  severity: "info" | "warning";
  title: string;
  message: string;
  timestamp: string;
}

const INITIAL_ALERTS: Alert[] = [
  {
    id: "a1",
    severity: "info",
    title: "CDN Cache Purged",
    message: "Global CDN cache was automatically purged after deployment v3.14.2",
    timestamp: "2 min ago",
  },
  {
    id: "a2",
    severity: "warning",
    title: "Elevated Latency — EU-Central",
    message: "Response times in EU-Central exceeded 120ms threshold for 45s",
    timestamp: "18 min ago",
  },
  {
    id: "a3",
    severity: "info",
    title: "SSL Certificate Renewed",
    message: "Wildcard certificate for *.dominat8.io renewed successfully",
    timestamp: "1 hr ago",
  },
];

const ENDPOINTS = [
  { path: "/api/generate", status: "online" as const, time: "38ms" },
  { path: "/api/sites", status: "online" as const, time: "24ms" },
  { path: "/healthz", status: "online" as const, time: "6ms" },
];

const REGIONS = [
  { name: "US-East", flag: "🇺🇸", latency: "12ms", status: "online" as const },
  { name: "US-West", flag: "🇺🇸", latency: "18ms", status: "online" as const },
  { name: "EU-Central", flag: "🇪🇺", latency: "34ms", status: "warning" as const },
  { name: "Asia-Pacific", flag: "🌏", latency: "67ms", status: "online" as const },
];

/** Generate 24 pseudo-random bar heights for the performance chart */
const BAR_HEIGHTS = [
  62, 45, 38, 55, 70, 48, 42, 35, 58, 72, 65, 40,
  50, 44, 68, 53, 41, 60, 75, 46, 38, 52, 47, 42,
];

const HOUR_LABELS = Array.from({ length: 24 }, (_, i) => {
  const h = (new Date().getHours() - 23 + i + 24) % 24;
  return h === 0 ? "12a" : h < 12 ? `${h}a` : h === 12 ? "12p" : `${h - 12}p`;
});

/* ━━━ Page Component ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

export default function MonitorPage() {
  const [alerts, setAlerts] = useState<Alert[]>(INITIAL_ALERTS);
  const [refreshing, setRefreshing] = useState(false);

  const dismissAlert = useCallback((id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1200);
  }, []);

  return (
    <BuildPageShell title="Monitor" icon="📊" accentColor={ACCENT} activePage="Monitor">
      {/* ── Scoped page styles ── */}
      <MonitorStyles />

      {/* ── Refresh button ── */}
      <div className="bps-section" style={{ display: "flex", justifyContent: "flex-end" }}>
        <button className="bps-btn bps-btn-ghost mon-refresh" onClick={handleRefresh}>
          <span className={`mon-refresh-icon ${refreshing ? "mon-spinning" : ""}`}>↻</span>
          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* ── 1. System Status Hero ── */}
      <div className="bps-section">
        <GlassCard className="mon-hero">
          <div className="mon-hero-inner">
            <span className="mon-hero-dot" />
            <div>
              <h2 className="mon-hero-title bps-text-glow">All Systems Operational</h2>
              <p className="mon-hero-sub">
                Uptime: <strong>99.99%</strong> over the last 90 days
              </p>
            </div>
            <StatusBadge label="Healthy" status="online" />
          </div>
        </GlassCard>
      </div>

      {/* ── 2. Metrics Row ── */}
      <div className="bps-section">
        <h3 className="bps-section-title">Key Metrics</h3>
        <div className="bps-grid-4">
          <MetricCard label="Uptime" value="99.99%" sub="Last 90 days" color={ACCENT} />
          <MetricCard label="Response Time" value="42ms" sub="p95 avg" color="#00D4FF" />
          <MetricCard label="Requests / min" value="1,247" sub="+8.3% from yesterday" color="#7B61FF" />
          <MetricCard label="Error Rate" value="0.01%" sub="2 errors in 24h" color="#FF4D6A" />
        </div>
      </div>

      {/* ── 3. Performance Chart ── */}
      <div className="bps-section">
        <h3 className="bps-section-title">Response Time — Last 24 Hours</h3>
        <GlassCard>
          <div className="mon-chart">
            <div className="mon-chart-y">
              <span>100ms</span>
              <span>75ms</span>
              <span>50ms</span>
              <span>25ms</span>
              <span>0ms</span>
            </div>
            <div className="mon-chart-bars">
              {BAR_HEIGHTS.map((h, i) => (
                <div key={i} className="mon-bar-col">
                  <div
                    className="mon-bar"
                    style={{ height: `${h}%` }}
                    title={`${HOUR_LABELS[i]}: ${Math.round(h * 1.1)}ms`}
                  />
                  {i % 4 === 0 && <span className="mon-bar-label">{HOUR_LABELS[i]}</span>}
                </div>
              ))}
            </div>
          </div>
        </GlassCard>
      </div>

      {/* ── 4. Active Alerts ── */}
      <div className="bps-section">
        <h3 className="bps-section-title">Active Alerts ({alerts.length})</h3>
        {alerts.length === 0 ? (
          <GlassCard>
            <div className="bps-empty">
              <div className="bps-empty-icon">✅</div>
              <div className="bps-empty-text">No active alerts — everything looks good.</div>
            </div>
          </GlassCard>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {alerts.map((alert) => (
              <GlassCard key={alert.id}>
                <div className="bps-list-item" style={{ border: "none", background: "none", padding: 0 }}>
                  <div className="bps-list-icon" style={{
                    background: alert.severity === "warning"
                      ? "rgba(255,184,0,0.1)"
                      : "rgba(0,212,255,0.08)",
                  }}>
                    {alert.severity === "warning" ? "⚠️" : "ℹ️"}
                  </div>
                  <div className="bps-list-content">
                    <div className="bps-list-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      {alert.title}
                      <StatusBadge
                        label={alert.severity === "warning" ? "Warning" : "Info"}
                        status={alert.severity === "warning" ? "warning" : "pending"}
                      />
                    </div>
                    <div className="bps-list-sub">{alert.message}</div>
                    <div className="bps-list-sub" style={{ marginTop: 4, fontSize: 11, color: "#5A6B8A" }}>
                      {alert.timestamp}
                    </div>
                  </div>
                  <button
                    className="bps-btn bps-btn-ghost mon-dismiss"
                    onClick={() => dismissAlert(alert.id)}
                    title="Dismiss alert"
                  >
                    ✕
                  </button>
                </div>
              </GlassCard>
            ))}
          </div>
        )}
      </div>

      {/* ── 5. Endpoint Health ── */}
      <div className="bps-section">
        <h3 className="bps-section-title">Endpoint Health</h3>
        <GlassCard>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {ENDPOINTS.map((ep) => (
              <div key={ep.path} className="bps-list-item">
                <div className="bps-list-icon">🔗</div>
                <div className="bps-list-content">
                  <div className="bps-list-title" style={{ fontFamily: "monospace" }}>{ep.path}</div>
                  <div className="bps-list-sub">Response: {ep.time}</div>
                </div>
                <StatusBadge label="Online" status={ep.status} />
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* ── 6. Region Status ── */}
      <div className="bps-section">
        <h3 className="bps-section-title">CDN Region Status</h3>
        <div className="bps-grid-4">
          {REGIONS.map((region) => (
            <GlassCard key={region.name}>
              <div className="mon-region">
                <span className="mon-region-flag">{region.flag}</span>
                <div className="mon-region-name">{region.name}</div>
                <div className="mon-region-latency">{region.latency}</div>
                <StatusBadge
                  label={region.status === "online" ? "Healthy" : "Elevated"}
                  status={region.status}
                />
              </div>
            </GlassCard>
          ))}
        </div>
      </div>
    </BuildPageShell>
  );
}

/* ━━━ Scoped Styles ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

function MonitorStyles() {
  return (
    <style>{`
      /* ── Hero ── */
      .mon-hero { overflow: hidden; }
      .mon-hero-inner {
        display: flex;
        align-items: center;
        gap: 16px;
        flex-wrap: wrap;
      }
      .mon-hero-dot {
        width: 16px;
        height: 16px;
        border-radius: 50%;
        background: ${ACCENT};
        box-shadow: 0 0 16px ${ACCENT}, 0 0 40px ${ACCENT}55;
        animation: monPulse 2s ease-in-out infinite;
        flex-shrink: 0;
      }
      @keyframes monPulse {
        0%, 100% { transform: scale(1); opacity: 1; box-shadow: 0 0 16px ${ACCENT}, 0 0 40px ${ACCENT}55; }
        50% { transform: scale(1.15); opacity: 0.8; box-shadow: 0 0 24px ${ACCENT}, 0 0 60px ${ACCENT}88; }
      }
      .mon-hero-title {
        font-size: 24px;
        font-weight: 800;
        margin: 0;
        background: linear-gradient(135deg, ${ACCENT}, #E0E6F0);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }
      .mon-hero-sub {
        font-size: 13px;
        color: #8B9DC3;
        margin: 4px 0 0;
      }
      .mon-hero-sub strong {
        color: ${ACCENT};
        -webkit-text-fill-color: ${ACCENT};
      }

      /* ── Refresh button ── */
      .mon-refresh {
        font-size: 13px;
      }
      .mon-refresh-icon {
        display: inline-block;
        font-size: 16px;
        transition: transform 0.3s;
      }
      .mon-spinning {
        animation: monSpin 0.8s linear infinite;
      }
      @keyframes monSpin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }

      /* ── Performance Chart ── */
      .mon-chart {
        display: flex;
        gap: 12px;
        height: 200px;
        align-items: stretch;
      }
      .mon-chart-y {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        font-size: 10px;
        color: #5A6B8A;
        padding: 4px 0;
        min-width: 40px;
        text-align: right;
      }
      .mon-chart-bars {
        display: flex;
        align-items: flex-end;
        gap: 4px;
        flex: 1;
        border-left: 1px solid rgba(255,255,255,0.06);
        border-bottom: 1px solid rgba(255,255,255,0.06);
        padding: 0 4px 20px;
        position: relative;
      }
      .mon-bar-col {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: flex-end;
        height: 100%;
        position: relative;
      }
      .mon-bar {
        width: 100%;
        min-width: 4px;
        max-width: 24px;
        border-radius: 4px 4px 0 0;
        background: linear-gradient(180deg, ${ACCENT}, #7B61FF);
        opacity: 0.85;
        transition: opacity 0.2s, transform 0.2s;
        cursor: pointer;
      }
      .mon-bar:hover {
        opacity: 1;
        transform: scaleY(1.03);
        box-shadow: 0 0 12px ${ACCENT}66;
      }
      .mon-bar-label {
        position: absolute;
        bottom: -18px;
        font-size: 9px;
        color: #5A6B8A;
        white-space: nowrap;
      }

      /* ── Dismiss button ── */
      .mon-dismiss {
        padding: 6px 10px !important;
        font-size: 14px !important;
        line-height: 1;
        min-width: auto;
        border-radius: 8px;
        flex-shrink: 0;
      }
      .mon-dismiss:hover {
        color: #FF4D6A !important;
        border-color: rgba(255,77,106,0.3) !important;
        background: rgba(255,77,106,0.08) !important;
      }

      /* ── Region card ── */
      .mon-region {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
        text-align: center;
      }
      .mon-region-flag {
        font-size: 28px;
      }
      .mon-region-name {
        font-size: 14px;
        font-weight: 700;
        color: #E0E6F0;
      }
      .mon-region-latency {
        font-size: 22px;
        font-weight: 800;
        background: linear-gradient(135deg, ${ACCENT}, #00D4FF);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }

      /* ── Responsive ── */
      @media (max-width: 768px) {
        .mon-hero-title { font-size: 18px; }
        .mon-chart { height: 150px; }
        .mon-chart-y { display: none; }
      }
    `}</style>
  );
}
