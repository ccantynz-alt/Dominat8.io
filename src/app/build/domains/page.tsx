"use client";

import { useState } from "react";
import {
  BuildPageShell,
  GlassCard,
  StatusBadge,
  MetricCard,
} from "@/io/surfaces/BuildPageShell";

/* ━━━ Types ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

interface DomainEntry {
  id: string;
  name: string;
  status: "online" | "pending";
  ssl: "active" | "provisioning" | "expired";
  dnsVerified: boolean;
  propagation: number; // 0–100
  responseTime: number; // ms
  addedAt: string;
}

/* ━━━ Seed Data ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

const INITIAL_DOMAINS: DomainEntry[] = [
  {
    id: "d1",
    name: "dominat8.io",
    status: "online",
    ssl: "active",
    dnsVerified: true,
    propagation: 100,
    responseTime: 42,
    addedAt: "2026-01-15",
  },
  {
    id: "d2",
    name: "app.dominat8.io",
    status: "online",
    ssl: "active",
    dnsVerified: true,
    propagation: 100,
    responseTime: 38,
    addedAt: "2026-02-01",
  },
  {
    id: "d3",
    name: "staging.dominat8.io",
    status: "pending",
    ssl: "provisioning",
    dnsVerified: false,
    propagation: 64,
    responseTime: 0,
    addedAt: "2026-02-27",
  },
];

const DNS_RECORDS = [
  { type: "A", host: "@", value: "76.76.21.21", ttl: "3600" },
  { type: "CNAME", host: "www", value: "cname.dominat8.io", ttl: "3600" },
  { type: "CNAME", host: "app", value: "cname.dominat8.io", ttl: "3600" },
  { type: "TXT", host: "@", value: "d8-verify=abc123xyz", ttl: "3600" },
];

/* ━━━ Helpers ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

function sslLabel(ssl: DomainEntry["ssl"]) {
  switch (ssl) {
    case "active":
      return "SSL Active";
    case "provisioning":
      return "Provisioning";
    case "expired":
      return "Expired";
  }
}

function sslBadgeStatus(ssl: DomainEntry["ssl"]): "online" | "warning" | "pending" {
  switch (ssl) {
    case "active":
      return "online";
    case "provisioning":
      return "pending";
    case "expired":
      return "warning";
  }
}

/* ━━━ Page Component ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

export default function DomainsPage() {
  const [domains, setDomains] = useState<DomainEntry[]>(INITIAL_DOMAINS);
  const [newDomain, setNewDomain] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  /* Add a new domain */
  const handleAddDomain = () => {
    const trimmed = newDomain.trim().toLowerCase();
    if (!trimmed) return;
    if (domains.some((d) => d.name === trimmed)) return;

    const entry: DomainEntry = {
      id: `d${Date.now()}`,
      name: trimmed,
      status: "pending",
      ssl: "provisioning",
      dnsVerified: false,
      propagation: 0,
      responseTime: 0,
      addedAt: new Date().toISOString().slice(0, 10),
    };
    setDomains((prev) => [...prev, entry]);
    setNewDomain("");
  };

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <BuildPageShell title="Domains" icon="🌐" accentColor="#0088FF" activePage="Domains">
      <style>{`
        /* ── Domains-specific styles ── */
        .dom-input-row { display: flex; gap: 12px; align-items: stretch; }
        .dom-input {
          flex: 1; padding: 12px 16px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.08);
          background: rgba(255,255,255,0.04); color: #E0E6F0; font-size: 14px; font-family: inherit;
          outline: none; transition: all 0.25s; backdrop-filter: blur(8px);
        }
        .dom-input::placeholder { color: #5A6B8A; }
        .dom-input:focus { border-color: #0088FF; box-shadow: 0 0 20px rgba(0,136,255,0.15); background: rgba(255,255,255,0.06); }

        .dom-domain-row { display: flex; align-items: center; gap: 12px; padding: 16px; cursor: pointer; border-radius: 12px; transition: all 0.2s; }
        .dom-domain-row:hover { background: rgba(0,136,255,0.04); }
        .dom-domain-icon { font-size: 24px; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; border-radius: 12px; background: rgba(0,136,255,0.1); border: 1px solid rgba(0,136,255,0.15); flex-shrink: 0; }
        .dom-domain-info { flex: 1; min-width: 0; }
        .dom-domain-name { font-size: 15px; font-weight: 700; color: #E0E6F0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .dom-domain-meta { font-size: 12px; color: #5A6B8A; margin-top: 3px; display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
        .dom-badges { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
        .dom-chevron { font-size: 16px; color: #5A6B8A; transition: transform 0.25s; flex-shrink: 0; }
        .dom-chevron-open { transform: rotate(90deg); color: #0088FF; }

        .dom-detail { padding: 0 16px 16px 72px; animation: domSlideIn 0.25s ease-out; }
        @keyframes domSlideIn { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
        .dom-detail-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
        @media (max-width: 768px) { .dom-detail-grid { grid-template-columns: 1fr; } .dom-input-row { flex-direction: column; } }

        .dom-health-bar { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
        .dom-health-label { font-size: 12px; color: #8B9DC3; width: 100px; flex-shrink: 0; }
        .dom-health-track { flex: 1; height: 8px; border-radius: 4px; background: rgba(255,255,255,0.06); overflow: hidden; }
        .dom-health-fill { height: 100%; border-radius: 4px; transition: width 0.8s ease; }

        .dom-dns-table { width: 100%; border-collapse: separate; border-spacing: 0; }
        .dom-dns-table th { text-align: left; padding: 10px 14px; font-size: 11px; font-weight: 700; color: #5A6B8A; text-transform: uppercase; letter-spacing: 0.08em; border-bottom: 1px solid rgba(255,255,255,0.06); }
        .dom-dns-table td { padding: 12px 14px; font-size: 13px; color: #E0E6F0; border-bottom: 1px solid rgba(255,255,255,0.03); }
        .dom-dns-type { display: inline-flex; padding: 3px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; font-family: 'SF Mono', 'Fira Code', monospace; }
        .dom-dns-type-a { background: rgba(0,136,255,0.12); color: #0088FF; border: 1px solid rgba(0,136,255,0.2); }
        .dom-dns-type-cname { background: rgba(123,97,255,0.12); color: #7B61FF; border: 1px solid rgba(123,97,255,0.2); }
        .dom-dns-type-txt { background: rgba(0,255,178,0.12); color: #00FFB2; border: 1px solid rgba(0,255,178,0.2); }
        .dom-dns-value { font-family: 'SF Mono', 'Fira Code', monospace; font-size: 12px; color: #8B9DC3; word-break: break-all; }
        .dom-dns-copy {
          padding: 4px 10px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.08);
          background: rgba(255,255,255,0.04); color: #8B9DC3; font-size: 11px; cursor: pointer;
          transition: all 0.2s;
        }
        .dom-dns-copy:hover { background: rgba(0,136,255,0.1); color: #0088FF; border-color: rgba(0,136,255,0.25); }

        .dom-remove {
          padding: 4px 12px; border-radius: 6px; border: 1px solid rgba(255,77,106,0.2);
          background: rgba(255,77,106,0.08); color: #FF4D6A; font-size: 11px; cursor: pointer;
          font-weight: 600; transition: all 0.2s;
        }
        .dom-remove:hover { background: rgba(255,77,106,0.15); border-color: rgba(255,77,106,0.35); }
      `}</style>

      {/* ── 1. Add Domain ── */}
      <section className="bps-section">
        <div className="bps-section-title">Add Domain</div>
        <GlassCard>
          <p style={{ fontSize: 13, color: "#8B9DC3", margin: "0 0 16px" }}>
            Enter a custom domain to connect to your Dominat8 project. DNS configuration
            instructions will be provided after adding.
          </p>
          <div className="dom-input-row">
            <input
              className="dom-input"
              type="text"
              placeholder="e.g. yourdomain.com"
              value={newDomain}
              onChange={(e) => setNewDomain(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddDomain()}
            />
            <button className="bps-btn bps-btn-primary" onClick={handleAddDomain}>
              Connect Domain
            </button>
          </div>
        </GlassCard>
      </section>

      {/* ── 2. Connected Domains ── */}
      <section className="bps-section">
        <div className="bps-section-title">
          Connected Domains
          <span className="bps-tag" style={{ marginLeft: 8 }}>{domains.length}</span>
        </div>

        {domains.length === 0 ? (
          <GlassCard>
            <div className="bps-empty">
              <div className="bps-empty-icon">🌐</div>
              <div className="bps-empty-text">No domains connected yet. Add one above to get started.</div>
            </div>
          </GlassCard>
        ) : (
          <GlassCard className="" >
            {domains.map((domain, idx) => {
              const isExpanded = expandedId === domain.id;
              return (
                <div key={domain.id}>
                  {idx > 0 && <hr className="bps-divider" />}

                  {/* Domain row */}
                  <div className="dom-domain-row" onClick={() => toggleExpand(domain.id)}>
                    <div className="dom-domain-icon">🌐</div>
                    <div className="dom-domain-info">
                      <div className="dom-domain-name">{domain.name}</div>
                      <div className="dom-domain-meta">
                        <span>Added {domain.addedAt}</span>
                        {domain.dnsVerified && <span style={{ color: "#00FFB2" }}>DNS Verified</span>}
                        {!domain.dnsVerified && <span style={{ color: "#FFB800" }}>DNS Pending</span>}
                      </div>
                    </div>
                    <div className="dom-badges">
                      <StatusBadge label={domain.status === "online" ? "Online" : "Pending"} status={domain.status} />
                      <StatusBadge label={sslLabel(domain.ssl)} status={sslBadgeStatus(domain.ssl)} />
                    </div>
                    <span className={`dom-chevron ${isExpanded ? "dom-chevron-open" : ""}`}>▶</span>
                  </div>

                  {/* Expanded detail */}
                  {isExpanded && (
                    <div className="dom-detail">
                      <div className="dom-detail-grid">
                        <MetricCard
                          label="Propagation"
                          value={`${domain.propagation}%`}
                          sub={domain.propagation === 100 ? "Fully propagated" : "In progress"}
                          color={domain.propagation === 100 ? "#00FFB2" : "#FFB800"}
                        />
                        <MetricCard
                          label="SSL Status"
                          value={sslLabel(domain.ssl)}
                          sub={domain.ssl === "active" ? "TLS 1.3" : "Issuing certificate"}
                          color={domain.ssl === "active" ? "#00FFB2" : "#7B61FF"}
                        />
                        <MetricCard
                          label="Response Time"
                          value={domain.responseTime > 0 ? `${domain.responseTime}ms` : "—"}
                          sub={domain.responseTime > 0 ? "Average latency" : "Not yet measured"}
                          color="#0088FF"
                        />
                      </div>
                      <div style={{ marginTop: 16, display: "flex", justifyContent: "flex-end" }}>
                        <button
                          className="dom-remove"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDomains((prev) => prev.filter((d) => d.id !== domain.id));
                            if (expandedId === domain.id) setExpandedId(null);
                          }}
                        >
                          Remove Domain
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </GlassCard>
        )}
      </section>

      {/* ── 3. DNS Configuration ── */}
      <section className="bps-section">
        <div className="bps-section-title">DNS Configuration</div>
        <GlassCard>
          <p style={{ fontSize: 13, color: "#8B9DC3", margin: "0 0 16px" }}>
            Add the following records to your DNS provider. Changes may take up to 48 hours to propagate.
          </p>
          <div style={{ overflowX: "auto" }}>
            <table className="dom-dns-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Host</th>
                  <th>Value</th>
                  <th>TTL</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {DNS_RECORDS.map((rec, i) => (
                  <tr key={i}>
                    <td>
                      <span
                        className={`dom-dns-type ${
                          rec.type === "A"
                            ? "dom-dns-type-a"
                            : rec.type === "CNAME"
                            ? "dom-dns-type-cname"
                            : "dom-dns-type-txt"
                        }`}
                      >
                        {rec.type}
                      </span>
                    </td>
                    <td className="dom-dns-value">{rec.host}</td>
                    <td className="dom-dns-value">{rec.value}</td>
                    <td style={{ fontSize: 12, color: "#5A6B8A" }}>{rec.ttl}</td>
                    <td>
                      <button
                        className="dom-dns-copy"
                        onClick={() => navigator.clipboard?.writeText(rec.value)}
                      >
                        Copy
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </section>

      {/* ── 4. Domain Health ── */}
      <section className="bps-section">
        <div className="bps-section-title">Domain Health</div>
        <div className="bps-grid-2">
          {domains.map((domain) => (
            <GlassCard key={domain.id}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <span style={{ fontSize: 18 }}>🌐</span>
                <span style={{ fontWeight: 700, fontSize: 14, color: "#E0E6F0" }}>{domain.name}</span>
                <span style={{ marginLeft: "auto" }}>
                  <StatusBadge
                    label={domain.status === "online" ? "Healthy" : "Configuring"}
                    status={domain.status}
                  />
                </span>
              </div>

              {/* Propagation bar */}
              <div className="dom-health-bar">
                <span className="dom-health-label">Propagation</span>
                <div className="dom-health-track">
                  <div
                    className="dom-health-fill"
                    style={{
                      width: `${domain.propagation}%`,
                      background:
                        domain.propagation === 100
                          ? "linear-gradient(90deg, #00FFB2, #00D4FF)"
                          : "linear-gradient(90deg, #FFB800, #FF8C00)",
                    }}
                  />
                </div>
                <span style={{ fontSize: 12, color: "#8B9DC3", width: 40, textAlign: "right" }}>
                  {domain.propagation}%
                </span>
              </div>

              {/* SSL bar */}
              <div className="dom-health-bar">
                <span className="dom-health-label">SSL</span>
                <div className="dom-health-track">
                  <div
                    className="dom-health-fill"
                    style={{
                      width: domain.ssl === "active" ? "100%" : domain.ssl === "provisioning" ? "45%" : "10%",
                      background:
                        domain.ssl === "active"
                          ? "linear-gradient(90deg, #00FFB2, #00D4FF)"
                          : "linear-gradient(90deg, #7B61FF, #0088FF)",
                    }}
                  />
                </div>
                <span style={{ fontSize: 12, color: "#8B9DC3", width: 40, textAlign: "right" }}>
                  {domain.ssl === "active" ? "100%" : domain.ssl === "provisioning" ? "45%" : "10%"}
                </span>
              </div>

              {/* Response time bar */}
              <div className="dom-health-bar">
                <span className="dom-health-label">Response</span>
                <div className="dom-health-track">
                  <div
                    className="dom-health-fill"
                    style={{
                      width: domain.responseTime > 0 ? `${Math.max(5, 100 - domain.responseTime)}%` : "0%",
                      background: "linear-gradient(90deg, #0088FF, #00D4FF)",
                    }}
                  />
                </div>
                <span style={{ fontSize: 12, color: "#8B9DC3", width: 40, textAlign: "right" }}>
                  {domain.responseTime > 0 ? `${domain.responseTime}ms` : "—"}
                </span>
              </div>

              {/* DNS verification */}
              <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 14 }}>{domain.dnsVerified ? "✅" : "⏳"}</span>
                <span style={{ fontSize: 12, color: domain.dnsVerified ? "#00FFB2" : "#FFB800", fontWeight: 600 }}>
                  {domain.dnsVerified ? "DNS Records Verified" : "DNS Verification Pending"}
                </span>
              </div>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* ── Summary Metrics ── */}
      <section className="bps-section">
        <div className="bps-section-title">Overview</div>
        <div className="bps-grid-4">
          <MetricCard
            label="Total Domains"
            value={`${domains.length}`}
            sub="Connected"
            color="#0088FF"
          />
          <MetricCard
            label="Online"
            value={`${domains.filter((d) => d.status === "online").length}`}
            sub="Active and serving"
            color="#00FFB2"
          />
          <MetricCard
            label="SSL Active"
            value={`${domains.filter((d) => d.ssl === "active").length}`}
            sub="Certificates valid"
            color="#7B61FF"
          />
          <MetricCard
            label="DNS Verified"
            value={`${domains.filter((d) => d.dnsVerified).length}`}
            sub="Records confirmed"
            color="#00D4FF"
          />
        </div>
      </section>
    </BuildPageShell>
  );
}
