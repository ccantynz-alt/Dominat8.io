"use client";

import React, { useState } from "react";
import {
  BuildPageShell,
  GlassCard,
  StatusBadge,
  MetricCard,
} from "@/io/surfaces/BuildPageShell";

/* ── data ─────────────────────────────────────────────────────────────────── */

const ACCENT = "#7B61FF";

interface SecurityHeader {
  name: string;
  value: string;
  enabled: boolean;
}

const SECURITY_HEADERS: SecurityHeader[] = [
  { name: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload", enabled: true },
  { name: "X-Frame-Options",           value: "DENY",                                        enabled: true },
  { name: "Content-Security-Policy",   value: "default-src 'self'; script-src 'self'",       enabled: true },
  { name: "X-Content-Type-Options",    value: "nosniff",                                     enabled: true },
  { name: "Referrer-Policy",           value: "strict-origin-when-cross-origin",              enabled: true },
];

interface ToggleOption {
  id: string;
  label: string;
  description: string;
  defaultOn: boolean;
}

const SSL_TOGGLES: ToggleOption[] = [
  { id: "force-https",  label: "Force HTTPS Redirect", description: "Redirect all HTTP traffic to HTTPS automatically",       defaultOn: true  },
  { id: "hsts-preload", label: "HSTS Preload",         description: "Submit domain to browser HSTS preload lists",            defaultOn: false },
  { id: "ocsp",         label: "OCSP Stapling",        description: "Improve TLS handshake speed with stapled OCSP responses", defaultOn: true  },
  { id: "http2-push",   label: "HTTP/2 Server Push",   description: "Proactively push critical assets to the client",          defaultOn: false },
];

interface CertEvent {
  date: string;
  action: string;
  detail: string;
  status: "online" | "pending" | "warning";
}

const CERT_HISTORY: CertEvent[] = [
  { date: "2026-02-15", action: "Auto-Renewed",    detail: "Wildcard certificate renewed via ACME DNS-01 challenge", status: "online"  },
  { date: "2025-11-16", action: "Auto-Renewed",    detail: "Standard renewal — 90-day cycle",                       status: "online"  },
  { date: "2025-08-18", action: "Auto-Renewed",    detail: "Standard renewal — 90-day cycle",                       status: "online"  },
  { date: "2025-05-20", action: "Initial Issuance", detail: "First certificate provisioned for dominat8.io",         status: "pending" },
];

/* ── page ─────────────────────────────────────────────────────────────────── */

export default function SSLPage() {
  const [toggles, setToggles] = useState<Record<string, boolean>>(
    Object.fromEntries(SSL_TOGGLES.map((t) => [t.id, t.defaultOn]))
  );

  const flip = (id: string) =>
    setToggles((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <BuildPageShell title="SSL & Security" icon="🔒" accentColor={ACCENT} activePage="SSL">
      <style>{`
        /* ── SSL page-scoped styles ── */
        .ssl-shield { font-size: 64px; line-height: 1; filter: drop-shadow(0 0 24px rgba(123,97,255,0.4)); }
        .ssl-cert-grid { display: grid; grid-template-columns: 1fr auto; gap: 24px; align-items: center; }
        .ssl-cert-info { display: flex; flex-direction: column; gap: 8px; }
        .ssl-cert-label { font-size: 12px; color: #5A6B8A; text-transform: uppercase; letter-spacing: 0.06em; }
        .ssl-cert-value { font-size: 15px; font-weight: 600; color: #E0E6F0; }
        .ssl-cert-badges { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 4px; }

        /* circular score */
        .ssl-score-wrap { display: flex; flex-direction: column; align-items: center; gap: 12px; }
        .ssl-score-ring { position: relative; width: 140px; height: 140px; }
        .ssl-score-ring svg { transform: rotate(-90deg); }
        .ssl-score-ring circle { fill: none; stroke-width: 8; }
        .ssl-score-ring .ring-bg { stroke: rgba(255,255,255,0.06); }
        .ssl-score-ring .ring-fg { stroke: url(#ssl-grad); stroke-linecap: round; stroke-dasharray: 408; stroke-dashoffset: 12; transition: stroke-dashoffset 1.2s ease; }
        .ssl-score-label { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; }
        .ssl-score-grade { font-size: 36px; font-weight: 900; background: linear-gradient(135deg, #00FFB2, ${ACCENT}); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .ssl-score-text { font-size: 11px; color: #5A6B8A; text-transform: uppercase; letter-spacing: 0.08em; margin-top: 2px; }
        .ssl-score-note { font-size: 12px; color: #8B9DC3; text-align: center; max-width: 200px; }

        /* header list */
        .ssl-header-row { display: flex; align-items: center; gap: 12px; padding: 12px 16px; border-radius: 10px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); transition: all 0.2s; }
        .ssl-header-row:hover { background: rgba(0,212,255,0.04); border-color: rgba(0,212,255,0.12); }
        .ssl-header-row + .ssl-header-row { margin-top: 8px; }
        .ssl-header-check { width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 14px; flex-shrink: 0; }
        .ssl-header-check--on  { background: rgba(0,255,178,0.12); color: #00FFB2; border: 1px solid rgba(0,255,178,0.3); }
        .ssl-header-check--off { background: rgba(255,77,106,0.12); color: #FF4D6A; border: 1px solid rgba(255,77,106,0.3); }
        .ssl-header-name { font-weight: 600; font-size: 13px; color: #E0E6F0; min-width: 220px; }
        .ssl-header-val  { font-size: 12px; color: #5A6B8A; font-family: 'SF Mono', 'Fira Code', monospace; word-break: break-all; }

        /* toggle */
        .ssl-toggle-row { display: flex; align-items: center; gap: 16px; padding: 16px; border-radius: 12px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); transition: all 0.2s; }
        .ssl-toggle-row:hover { background: rgba(0,212,255,0.04); border-color: rgba(0,212,255,0.12); }
        .ssl-toggle-row + .ssl-toggle-row { margin-top: 10px; }
        .ssl-toggle-info { flex: 1; }
        .ssl-toggle-label { font-weight: 600; font-size: 14px; color: #E0E6F0; }
        .ssl-toggle-desc  { font-size: 12px; color: #5A6B8A; margin-top: 2px; }

        .ssl-switch { position: relative; width: 48px; height: 26px; border-radius: 13px; cursor: pointer; border: none; padding: 0; transition: background 0.3s; flex-shrink: 0; }
        .ssl-switch--on  { background: linear-gradient(135deg, #00FFB2, ${ACCENT}); box-shadow: 0 0 14px rgba(0,255,178,0.3); }
        .ssl-switch--off { background: rgba(255,255,255,0.1); }
        .ssl-switch::after { content: ''; position: absolute; top: 3px; left: 3px; width: 20px; height: 20px; border-radius: 50%; background: #fff; transition: transform 0.3s; box-shadow: 0 1px 4px rgba(0,0,0,0.3); }
        .ssl-switch--on::after { transform: translateX(22px); }

        /* timeline */
        .ssl-timeline { position: relative; padding-left: 28px; }
        .ssl-timeline::before { content: ''; position: absolute; left: 9px; top: 8px; bottom: 8px; width: 2px; background: linear-gradient(180deg, ${ACCENT}, rgba(123,97,255,0.1)); border-radius: 1px; }
        .ssl-tl-item { position: relative; padding: 12px 16px; margin-bottom: 12px; border-radius: 10px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); transition: all 0.2s; }
        .ssl-tl-item:hover { background: rgba(0,212,255,0.04); border-color: rgba(0,212,255,0.12); }
        .ssl-tl-dot { position: absolute; left: -24px; top: 18px; width: 12px; height: 12px; border-radius: 50%; border: 2px solid ${ACCENT}; background: #0A0E1A; }
        .ssl-tl-date { font-size: 11px; color: #5A6B8A; margin-bottom: 4px; font-family: 'SF Mono', 'Fira Code', monospace; }
        .ssl-tl-action { font-weight: 700; font-size: 14px; color: #E0E6F0; }
        .ssl-tl-detail { font-size: 12px; color: #8B9DC3; margin-top: 2px; }

        @media (max-width: 768px) {
          .ssl-cert-grid { grid-template-columns: 1fr; text-align: center; }
          .ssl-header-name { min-width: auto; }
          .ssl-header-row { flex-wrap: wrap; }
        }
      `}</style>

      {/* ─── Row 1 : Certificate Status + Security Score ─── */}
      <div className="bps-section">
        <h2 className="bps-section-title">Certificate Overview</h2>
        <div className="bps-grid-2">
          {/* Certificate Status */}
          <GlassCard>
            <div className="ssl-cert-grid">
              <div className="ssl-cert-info">
                <div className="ssl-cert-badges">
                  <StatusBadge label="Active" status="online" />
                  <span className="bps-tag">TLS 1.3</span>
                  <span className="bps-tag">Auto-Renew</span>
                </div>

                <div style={{ marginTop: 16 }}>
                  <div className="ssl-cert-label">Domain</div>
                  <div className="ssl-cert-value">*.dominat8.io</div>
                </div>
                <div>
                  <div className="ssl-cert-label">Issuer</div>
                  <div className="ssl-cert-value">Let&#39;s Encrypt &mdash; R3</div>
                </div>
                <div>
                  <div className="ssl-cert-label">Expires</div>
                  <div className="ssl-cert-value">2026-05-16 &nbsp; (77 days remaining)</div>
                </div>
                <div>
                  <div className="ssl-cert-label">Serial</div>
                  <div className="ssl-cert-value" style={{ fontFamily: "'SF Mono','Fira Code',monospace", fontSize: 12, color: "#5A6B8A" }}>
                    04:A3:E8:2B:7F:01:CC:D9
                  </div>
                </div>
              </div>

              <div className="ssl-shield" aria-hidden="true">🛡️</div>
            </div>
          </GlassCard>

          {/* Security Score */}
          <GlassCard>
            <div className="ssl-score-wrap">
              <div className="ssl-score-ring">
                <svg viewBox="0 0 140 140" width="140" height="140">
                  <defs>
                    <linearGradient id="ssl-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#00FFB2" />
                      <stop offset="100%" stopColor={ACCENT} />
                    </linearGradient>
                  </defs>
                  <circle className="ring-bg" cx="70" cy="70" r="65" />
                  <circle className="ring-fg" cx="70" cy="70" r="65" />
                </svg>
                <div className="ssl-score-label">
                  <span className="ssl-score-grade">A+</span>
                  <span className="ssl-score-text">Security Score</span>
                </div>
              </div>
              <p className="ssl-score-note">
                All security checks passed. Your site exceeds industry standards for TLS configuration.
              </p>
            </div>
          </GlassCard>
        </div>
      </div>

      {/* ─── Row 2 : Metric strip ─── */}
      <div className="bps-section">
        <div className="bps-grid-4">
          <MetricCard label="Protocol"      value="TLS 1.3" sub="Latest standard" color="#00FFB2" />
          <MetricCard label="Cipher Suite"  value="AES-256"  sub="GCM-SHA384"     color={ACCENT}  />
          <MetricCard label="Key Exchange"  value="X25519"   sub="ECDHE"           color="#00D4FF" />
          <MetricCard label="Cert Chain"    value="3"        sub="Certificates"    color="#FFB800" />
        </div>
      </div>

      {/* ─── Security Headers ─── */}
      <div className="bps-section">
        <h2 className="bps-section-title">Security Headers</h2>
        <GlassCard>
          {SECURITY_HEADERS.map((hdr) => (
            <div className="ssl-header-row" key={hdr.name}>
              <div className={`ssl-header-check ${hdr.enabled ? "ssl-header-check--on" : "ssl-header-check--off"}`}>
                {hdr.enabled ? "✓" : "✗"}
              </div>
              <span className="ssl-header-name">{hdr.name}</span>
              <span className="ssl-header-val">{hdr.value}</span>
            </div>
          ))}
        </GlassCard>
      </div>

      {/* ─── SSL Configuration toggles ─── */}
      <div className="bps-section">
        <h2 className="bps-section-title">SSL Configuration</h2>
        <GlassCard>
          {SSL_TOGGLES.map((opt) => (
            <div className="ssl-toggle-row" key={opt.id}>
              <div className="ssl-toggle-info">
                <div className="ssl-toggle-label">{opt.label}</div>
                <div className="ssl-toggle-desc">{opt.description}</div>
              </div>
              <button
                className={`ssl-switch ${toggles[opt.id] ? "ssl-switch--on" : "ssl-switch--off"}`}
                onClick={() => flip(opt.id)}
                role="switch"
                aria-checked={toggles[opt.id]}
                aria-label={opt.label}
              />
            </div>
          ))}
          <hr className="bps-divider" />
          <div style={{ display: "flex", gap: 12 }}>
            <button className="bps-btn bps-btn-primary">Save Configuration</button>
            <button className="bps-btn bps-btn-ghost">Reset Defaults</button>
          </div>
        </GlassCard>
      </div>

      {/* ─── Certificate History ─── */}
      <div className="bps-section">
        <h2 className="bps-section-title">Certificate History</h2>
        <GlassCard>
          <div className="ssl-timeline">
            {CERT_HISTORY.map((evt, i) => (
              <div className="ssl-tl-item" key={i}>
                <div className="ssl-tl-dot" />
                <div className="ssl-tl-date">{evt.date}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span className="ssl-tl-action">{evt.action}</span>
                  <StatusBadge label={evt.status === "online" ? "Success" : evt.status === "pending" ? "Initial" : "Warning"} status={evt.status} />
                </div>
                <div className="ssl-tl-detail">{evt.detail}</div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </BuildPageShell>
  );
}
