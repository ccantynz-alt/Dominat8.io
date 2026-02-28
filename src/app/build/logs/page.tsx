"use client";

import React, { useState, useRef, useEffect } from "react";
import { BuildPageShell, GlassCard, StatusBadge } from "@/io/surfaces/BuildPageShell";

/* ━━━ Types ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

type Severity = "INFO" | "WARN" | "ERROR" | "DEBUG";
type FilterKey = "All" | Severity;

interface LogEntry {
  id: number;
  timestamp: string;
  severity: Severity;
  message: string;
  source: string;
}

/* ━━━ Mock data ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

const MOCK_LOGS: LogEntry[] = [
  { id: 1,  timestamp: "2026-02-28 14:32:01.042", severity: "INFO",  message: "Site generated successfully (3.2s)",               source: "builder" },
  { id: 2,  timestamp: "2026-02-28 14:31:58.911", severity: "INFO",  message: "Deployment pipeline triggered for prod-v2.8.1",    source: "deploy" },
  { id: 3,  timestamp: "2026-02-28 14:31:55.330", severity: "WARN",  message: "Rate limit approaching (82%)",                     source: "api-gateway" },
  { id: 4,  timestamp: "2026-02-28 14:31:52.107", severity: "ERROR", message: "Payment webhook timeout after 30 000 ms",          source: "payments" },
  { id: 5,  timestamp: "2026-02-28 14:31:49.884", severity: "DEBUG", message: "Cache invalidated for user_abc",                   source: "cache" },
  { id: 6,  timestamp: "2026-02-28 14:31:47.215", severity: "INFO",  message: "SSL certificate renewed — expires 2027-02-28",     source: "ssl" },
  { id: 7,  timestamp: "2026-02-28 14:31:44.671", severity: "WARN",  message: "Memory usage at 78 % on worker-3",                source: "monitor" },
  { id: 8,  timestamp: "2026-02-28 14:31:41.003", severity: "INFO",  message: "DNS propagation complete for dominat8.io",         source: "domains" },
  { id: 9,  timestamp: "2026-02-28 14:31:38.540", severity: "ERROR", message: "Database connection pool exhausted (max 50)",      source: "db" },
  { id: 10, timestamp: "2026-02-28 14:31:35.290", severity: "DEBUG", message: "WebSocket heartbeat acknowledged — latency 12 ms", source: "ws" },
  { id: 11, timestamp: "2026-02-28 14:31:32.118", severity: "INFO",  message: "Asset optimization complete — saved 42 %",         source: "builder" },
  { id: 12, timestamp: "2026-02-28 14:31:29.005", severity: "WARN",  message: "Deprecated API endpoint /v1/users hit 14 times",  source: "api-gateway" },
  { id: 13, timestamp: "2026-02-28 14:31:26.770", severity: "INFO",  message: "Background job queue drained (0 pending)",         source: "workers" },
  { id: 14, timestamp: "2026-02-28 14:31:23.330", severity: "DEBUG", message: "Feature flag 'dark-mode-v2' evaluated true",       source: "flags" },
  { id: 15, timestamp: "2026-02-28 14:31:20.112", severity: "ERROR", message: "Image resize failed — unsupported format .webp2",  source: "media" },
];

const SEVERITY_COLORS: Record<Severity, string> = {
  INFO:  "#00D4FF",
  WARN:  "#FFB800",
  ERROR: "#FF4D6A",
  DEBUG: "#6B7A99",
};

const FILTER_KEYS: FilterKey[] = ["All", "INFO", "WARN", "ERROR", "DEBUG"];

/* ━━━ Page component ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

export default function LogsPage() {
  const [activeFilter, setActiveFilter] = useState<FilterKey>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [liveTail, setLiveTail] = useState(false);
  const logEndRef = useRef<HTMLDivElement>(null);

  /* Auto-scroll when live tail is on */
  useEffect(() => {
    if (liveTail && logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [liveTail]);

  /* Filtered log entries */
  const filteredLogs = MOCK_LOGS.filter((entry) => {
    const matchesSeverity = activeFilter === "All" || entry.severity === activeFilter;
    const matchesSearch =
      searchQuery === "" ||
      entry.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.source.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSeverity && matchesSearch;
  });

  /* Stats */
  const totalEntries = MOCK_LOGS.length;
  const errorCount = MOCK_LOGS.filter((e) => e.severity === "ERROR").length;
  const warnCount = MOCK_LOGS.filter((e) => e.severity === "WARN").length;
  const avgResponseTime = "142 ms";

  return (
    <BuildPageShell title="Logs" icon="💬" accentColor="#00D4FF" activePage="Logs">
      <LogsStyles />

      {/* ── Stats bar ── */}
      <div className="bps-section">
        <div className="bps-section-title">Overview</div>
        <div className="bps-grid-4 logs-stats-grid">
          <GlassCard className="logs-stat-card">
            <div className="logs-stat-value">{totalEntries}</div>
            <div className="logs-stat-label">Total Entries</div>
          </GlassCard>
          <GlassCard className="logs-stat-card">
            <div className="logs-stat-value logs-stat-error">{errorCount}</div>
            <div className="logs-stat-label">Errors (1 h)</div>
          </GlassCard>
          <GlassCard className="logs-stat-card">
            <div className="logs-stat-value logs-stat-warn">{warnCount}</div>
            <div className="logs-stat-label">Warnings (1 h)</div>
          </GlassCard>
          <GlassCard className="logs-stat-card">
            <div className="logs-stat-value logs-stat-cyan">{avgResponseTime}</div>
            <div className="logs-stat-label">Avg Response</div>
          </GlassCard>
        </div>
      </div>

      {/* ── Filter bar ── */}
      <div className="bps-section">
        <div className="bps-section-title">Filter &amp; Search</div>
        <GlassCard>
          <div className="logs-filter-bar">
            <div className="logs-filter-pills">
              {FILTER_KEYS.map((key) => {
                const isActive = key === activeFilter;
                const pillColor = key === "All" ? "#00D4FF" : SEVERITY_COLORS[key as Severity];
                return (
                  <button
                    key={key}
                    className={`logs-pill ${isActive ? "logs-pill-active" : ""}`}
                    style={
                      {
                        "--pill-color": pillColor,
                      } as React.CSSProperties
                    }
                    onClick={() => setActiveFilter(key)}
                  >
                    {key === "All" ? "All" : key}
                    {key !== "All" && (
                      <span className="logs-pill-count">
                        {MOCK_LOGS.filter((e) => e.severity === key).length}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            <div className="logs-search-wrap">
              <span className="logs-search-icon">&#128269;</span>
              <input
                type="text"
                className="logs-search"
                placeholder="Search logs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button className="logs-search-clear" onClick={() => setSearchQuery("")}>
                  &times;
                </button>
              )}
            </div>
          </div>
        </GlassCard>
      </div>

      {/* ── Live Log Stream ── */}
      <div className="bps-section">
        <div className="bps-section-title">
          Log Stream
          <span className="logs-stream-meta">
            {filteredLogs.length} of {totalEntries} entries
          </span>
        </div>
        <GlassCard className="logs-terminal-card">
          {/* Terminal header */}
          <div className="logs-terminal-header">
            <div className="logs-terminal-dots">
              <span className="logs-dot logs-dot-red" />
              <span className="logs-dot logs-dot-yellow" />
              <span className="logs-dot logs-dot-green" />
            </div>
            <span className="logs-terminal-title">dominat8.io &mdash; live stream</span>
            <button
              className={`logs-tail-btn ${liveTail ? "logs-tail-active" : ""}`}
              onClick={() => setLiveTail((prev) => !prev)}
            >
              <span className={`logs-tail-dot ${liveTail ? "logs-tail-dot-on" : ""}`} />
              {liveTail ? "Live" : "Tail"}
            </button>
          </div>

          {/* Log lines */}
          <div className="logs-terminal-body">
            {filteredLogs.length === 0 && (
              <div className="logs-empty">No log entries match the current filter.</div>
            )}
            {filteredLogs.map((entry) => (
              <div key={entry.id} className="logs-line">
                <span className="logs-ts">{entry.timestamp}</span>
                <span
                  className="logs-severity"
                  style={{ color: SEVERITY_COLORS[entry.severity] }}
                >
                  [{entry.severity}]
                </span>
                <span className="logs-msg">{entry.message}</span>
                <span className="logs-source">{entry.source}</span>
              </div>
            ))}
            <div ref={logEndRef} />
          </div>
        </GlassCard>
      </div>

      {/* ── Actions ── */}
      <div className="bps-section">
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <button className="bps-btn bps-btn-primary">Export Logs</button>
          <button className="bps-btn bps-btn-ghost" onClick={() => { setActiveFilter("All"); setSearchQuery(""); }}>
            Clear Filters
          </button>
          <button className="bps-btn bps-btn-ghost">Configure Alerts</button>
        </div>
      </div>
    </BuildPageShell>
  );
}

/* ━━━ Inline styles for log-specific UI ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

function LogsStyles() {
  return (
    <style>{`
      /* ── Stats grid ── */
      .logs-stats-grid { margin-bottom: 8px; }
      .logs-stat-card { text-align: center; padding: 20px 16px; }
      .logs-stat-value {
        font-size: 28px;
        font-weight: 800;
        font-variant-numeric: tabular-nums;
        background: linear-gradient(135deg, #E0E6F0, #8B9DC3);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }
      .logs-stat-error {
        background: linear-gradient(135deg, #FF4D6A, #FF8A9E);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }
      .logs-stat-warn {
        background: linear-gradient(135deg, #FFB800, #FFD466);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }
      .logs-stat-cyan {
        background: linear-gradient(135deg, #00D4FF, #7B61FF);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }
      .logs-stat-label {
        font-size: 11px;
        color: #5A6B8A;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        margin-top: 6px;
        font-weight: 600;
      }

      /* ── Filter bar ── */
      .logs-filter-bar {
        display: flex;
        align-items: center;
        gap: 16px;
        flex-wrap: wrap;
      }
      .logs-filter-pills {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
      }
      .logs-pill {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 7px 16px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        cursor: pointer;
        border: 1px solid rgba(255,255,255,0.08);
        background: rgba(255,255,255,0.04);
        color: #8B9DC3;
        transition: all 0.25s;
        font-family: inherit;
      }
      .logs-pill:hover {
        background: color-mix(in srgb, var(--pill-color) 12%, transparent);
        color: var(--pill-color);
        border-color: color-mix(in srgb, var(--pill-color) 30%, transparent);
      }
      .logs-pill-active {
        background: color-mix(in srgb, var(--pill-color) 18%, transparent) !important;
        color: var(--pill-color) !important;
        border-color: color-mix(in srgb, var(--pill-color) 40%, transparent) !important;
        box-shadow: 0 0 14px color-mix(in srgb, var(--pill-color) 20%, transparent);
      }
      .logs-pill-count {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: 18px;
        height: 18px;
        padding: 0 5px;
        border-radius: 9px;
        font-size: 10px;
        font-weight: 800;
        background: color-mix(in srgb, var(--pill-color) 20%, transparent);
        color: var(--pill-color);
      }

      /* ── Search ── */
      .logs-search-wrap {
        position: relative;
        flex: 1;
        min-width: 200px;
      }
      .logs-search-icon {
        position: absolute;
        left: 12px;
        top: 50%;
        transform: translateY(-50%);
        font-size: 14px;
        opacity: 0.4;
        pointer-events: none;
      }
      .logs-search {
        width: 100%;
        padding: 9px 36px 9px 36px;
        border-radius: 10px;
        border: 1px solid rgba(255,255,255,0.08);
        background: rgba(0,0,0,0.3);
        color: #E0E6F0;
        font-size: 13px;
        font-family: 'SF Mono', 'Fira Code', 'Cascadia Code', monospace;
        outline: none;
        transition: all 0.25s;
      }
      .logs-search::placeholder { color: #4A5568; }
      .logs-search:focus {
        border-color: rgba(0,212,255,0.4);
        box-shadow: 0 0 16px rgba(0,212,255,0.1);
        background: rgba(0,0,0,0.45);
      }
      .logs-search-clear {
        position: absolute;
        right: 10px;
        top: 50%;
        transform: translateY(-50%);
        background: none;
        border: none;
        color: #6B7A99;
        font-size: 18px;
        cursor: pointer;
        line-height: 1;
        padding: 2px 4px;
        transition: color 0.2s;
      }
      .logs-search-clear:hover { color: #FF4D6A; }

      /* ── Stream meta ── */
      .logs-stream-meta {
        font-size: 11px;
        font-weight: 500;
        color: #5A6B8A;
        text-transform: none;
        letter-spacing: 0;
        margin-left: 8px;
      }

      /* ── Terminal card ── */
      .logs-terminal-card {
        padding: 0 !important;
        overflow: hidden;
        background: rgba(6,10,20,0.7) !important;
        border-color: rgba(255,255,255,0.06) !important;
      }

      /* Terminal header */
      .logs-terminal-header {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 10px 16px;
        background: rgba(0,0,0,0.35);
        border-bottom: 1px solid rgba(255,255,255,0.06);
      }
      .logs-terminal-dots { display: flex; gap: 6px; }
      .logs-dot {
        width: 10px;
        height: 10px;
        border-radius: 50%;
      }
      .logs-dot-red    { background: #FF5F57; }
      .logs-dot-yellow { background: #FFBD2E; }
      .logs-dot-green  { background: #28C840; }
      .logs-terminal-title {
        flex: 1;
        text-align: center;
        font-size: 11px;
        color: #5A6B8A;
        font-weight: 500;
        letter-spacing: 0.04em;
      }

      /* Live tail button */
      .logs-tail-btn {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 5px 14px;
        border-radius: 14px;
        font-size: 11px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        cursor: pointer;
        border: 1px solid rgba(255,255,255,0.1);
        background: rgba(255,255,255,0.04);
        color: #6B7A99;
        font-family: inherit;
        transition: all 0.25s;
      }
      .logs-tail-btn:hover {
        background: rgba(0,212,255,0.08);
        color: #00D4FF;
        border-color: rgba(0,212,255,0.25);
      }
      .logs-tail-active {
        background: rgba(0,255,178,0.12) !important;
        color: #00FFB2 !important;
        border-color: rgba(0,255,178,0.35) !important;
        box-shadow: 0 0 12px rgba(0,255,178,0.15);
      }
      .logs-tail-dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: #6B7A99;
        transition: all 0.25s;
      }
      .logs-tail-dot-on {
        background: #00FFB2;
        box-shadow: 0 0 8px #00FFB2;
        animation: logsTailPulse 1.5s ease-in-out infinite;
      }
      @keyframes logsTailPulse {
        0%, 100% { opacity: 1; box-shadow: 0 0 8px #00FFB2; }
        50%      { opacity: 0.35; box-shadow: 0 0 4px #00FFB2; }
      }

      /* Terminal body */
      .logs-terminal-body {
        padding: 12px 0;
        max-height: 520px;
        overflow-y: auto;
        font-family: 'SF Mono', 'Fira Code', 'Cascadia Code', 'Consolas', monospace;
        font-size: 12.5px;
        line-height: 1.75;
      }
      .logs-terminal-body::-webkit-scrollbar { width: 6px; }
      .logs-terminal-body::-webkit-scrollbar-track { background: transparent; }
      .logs-terminal-body::-webkit-scrollbar-thumb {
        background: rgba(0,212,255,0.15);
        border-radius: 3px;
      }
      .logs-terminal-body::-webkit-scrollbar-thumb:hover {
        background: rgba(0,212,255,0.3);
      }

      /* Log line */
      .logs-line {
        display: flex;
        align-items: baseline;
        gap: 12px;
        padding: 3px 16px;
        transition: background 0.15s;
        white-space: nowrap;
      }
      .logs-line:hover {
        background: rgba(0,212,255,0.04);
      }

      .logs-ts {
        color: #4A5568;
        font-size: 11px;
        flex-shrink: 0;
        font-variant-numeric: tabular-nums;
      }

      .logs-severity {
        font-weight: 800;
        font-size: 11px;
        flex-shrink: 0;
        min-width: 52px;
        letter-spacing: 0.03em;
      }

      .logs-msg {
        color: #C8D1E0;
        flex: 1;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .logs-source {
        flex-shrink: 0;
        display: inline-flex;
        padding: 2px 8px;
        border-radius: 5px;
        font-size: 10px;
        font-weight: 600;
        background: rgba(0,212,255,0.08);
        color: #5A8BA6;
        border: 1px solid rgba(0,212,255,0.12);
        letter-spacing: 0.02em;
      }

      /* Empty state */
      .logs-empty {
        text-align: center;
        padding: 40px 20px;
        color: #4A5568;
        font-size: 13px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      }

      /* ── Responsive ── */
      @media (max-width: 768px) {
        .logs-filter-bar { flex-direction: column; align-items: stretch; }
        .logs-filter-pills { justify-content: center; }
        .logs-line { font-size: 11px; gap: 8px; padding: 3px 10px; }
        .logs-ts { display: none; }
        .logs-terminal-body { max-height: 400px; }
        .bps-grid-4 { grid-template-columns: repeat(2, 1fr) !important; }
      }
    `}</style>
  );
}
