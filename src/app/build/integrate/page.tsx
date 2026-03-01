"use client";

import { useState, useCallback } from "react";
import { BuildPageShell, GlassCard, StatusBadge } from "@/io/surfaces/BuildPageShell";

/* ━━━ Types ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

interface Integration {
  id: string;
  icon: string;
  name: string;
  description: string;
  status?: "online" | "warning" | "error" | "pending";
  connectedAt?: string;
}

interface Webhook {
  id: string;
  url: string;
  event: string;
  status: "online" | "error" | "pending";
  lastTriggered: string;
}

/* ━━━ Initial Data ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

const INITIAL_CONNECTED: Integration[] = [
  { id: "google-analytics", icon: "📈", name: "Google Analytics", description: "Website traffic & conversion tracking", status: "online", connectedAt: "Jan 12, 2026" },
  { id: "stripe", icon: "💳", name: "Stripe", description: "Payment processing & subscriptions", status: "online", connectedAt: "Feb 3, 2026" },
  { id: "mailchimp", icon: "📧", name: "Mailchimp", description: "Email marketing & audience management", status: "warning", connectedAt: "Feb 18, 2026" },
];

const INITIAL_AVAILABLE: Integration[] = [
  { id: "slack", icon: "💬", name: "Slack", description: "Team notifications & alerts" },
  { id: "discord", icon: "🎮", name: "Discord", description: "Community engagement & bot integration" },
  { id: "zapier", icon: "⚡", name: "Zapier", description: "Automate workflows across 5,000+ apps" },
  { id: "hubspot", icon: "🧲", name: "HubSpot", description: "CRM, marketing & sales platform" },
  { id: "vercel", icon: "▲", name: "Vercel", description: "Deploy & host with edge functions" },
  { id: "cloudflare", icon: "☁️", name: "Cloudflare", description: "CDN, DDoS protection & DNS" },
  { id: "github", icon: "🐙", name: "GitHub", description: "Source control & CI/CD pipelines" },
  { id: "notion", icon: "📝", name: "Notion", description: "Docs, wikis & project management" },
];

const WEBHOOKS: Webhook[] = [
  { id: "wh-1", url: "https://api.example.com/hooks/deploy", event: "deploy.success", status: "online", lastTriggered: "2 hours ago" },
  { id: "wh-2", url: "https://api.example.com/hooks/form", event: "form.submission", status: "online", lastTriggered: "18 min ago" },
  { id: "wh-3", url: "https://hooks.slack.com/d8-alerts", event: "monitor.alert", status: "pending", lastTriggered: "Never" },
  { id: "wh-4", url: "https://api.example.com/hooks/payment", event: "payment.received", status: "error", lastTriggered: "3 days ago" },
];

/* ━━━ Inline styles ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

const integrationCardStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  textAlign: "center",
  padding: "28px 16px",
  gap: "12px",
  cursor: "pointer",
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  position: "relative",
  overflow: "hidden",
};

const integrationCardHoverOverlay: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  background: "radial-gradient(ellipse at center, rgba(176,110,255,0.08) 0%, transparent 70%)",
  opacity: 0,
  transition: "opacity 0.3s",
  pointerEvents: "none",
};

const integrationIconStyle: React.CSSProperties = {
  fontSize: "32px",
  width: "56px",
  height: "56px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "14px",
  background: "rgba(176,110,255,0.1)",
  border: "1px solid rgba(176,110,255,0.2)",
  transition: "all 0.3s",
};

const apiKeyDisplayStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  padding: "14px 18px",
  borderRadius: "10px",
  background: "rgba(0,0,0,0.3)",
  border: "1px solid rgba(255,255,255,0.06)",
  fontFamily: "'SF Mono', 'Fira Code', 'Cascadia Code', monospace",
  fontSize: "14px",
  color: "#B06EFF",
  letterSpacing: "0.05em",
  flex: 1,
};

const connectedRowStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "12px",
  flexWrap: "wrap",
};

const pageStyles = `
  .int-card:hover {
    transform: translateY(-4px);
    border-color: rgba(176,110,255,0.3) !important;
    box-shadow: 0 8px 32px rgba(176,110,255,0.15), 0 0 60px rgba(176,110,255,0.05);
  }
  .int-card:hover .int-hover-overlay {
    opacity: 1 !important;
  }
  .int-card:hover .int-icon-wrap {
    background: rgba(176,110,255,0.18) !important;
    border-color: rgba(176,110,255,0.35) !important;
    transform: scale(1.08);
  }
  .int-disconnect:hover {
    background: rgba(255,77,106,0.15) !important;
    color: #FF4D6A !important;
    border-color: rgba(255,77,106,0.3) !important;
  }
  .int-copy-btn:hover {
    background: rgba(176,110,255,0.15) !important;
    color: #B06EFF !important;
  }
  .int-webhook-row:hover {
    background: rgba(176,110,255,0.04) !important;
    border-color: rgba(176,110,255,0.15) !important;
  }
  .int-key-row {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
  }
  @media (max-width: 768px) {
    .int-key-row { flex-direction: column; }
    .int-key-row > * { width: 100%; }
  }
`;

/* ━━━ Component ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

export default function IntegratePage() {
  const [connected, setConnected] = useState<Integration[]>(INITIAL_CONNECTED);
  const [available, setAvailable] = useState<Integration[]>(INITIAL_AVAILABLE);
  const [apiKeyVisible, setApiKeyVisible] = useState(false);
  const [copied, setCopied] = useState(false);
  const [webhooks] = useState<Webhook[]>(WEBHOOKS);

  const apiKey = "d8_live_7kQ9xR2mPvL4nWjT8sYfE3bA";
  const maskedKey = "d8_live_••••••••••••••••••••";

  const handleConnect = useCallback((integration: Integration) => {
    setAvailable((prev) => prev.filter((i) => i.id !== integration.id));
    setConnected((prev) => [
      ...prev,
      {
        ...integration,
        status: "online" as const,
        connectedAt: "Just now",
      },
    ]);
  }, []);

  const handleDisconnect = useCallback((integration: Integration) => {
    setConnected((prev) => prev.filter((i) => i.id !== integration.id));
    setAvailable((prev) => [
      ...prev,
      {
        id: integration.id,
        icon: integration.icon,
        name: integration.name,
        description: integration.description,
      },
    ]);
  }, []);

  const handleCopyKey = useCallback(() => {
    navigator.clipboard.writeText(apiKey).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [apiKey]);

  return (
    <BuildPageShell title="Integrate" icon="✏️" accentColor="#B06EFF" activePage="Integrate">
      <style>{pageStyles}</style>

      {/* ── Connected Integrations ── */}
      <section className="bps-section">
        <h2 className="bps-section-title">Connected Integrations</h2>
        <GlassCard>
          {connected.length === 0 ? (
            <div className="bps-empty">
              <div className="bps-empty-icon">🔌</div>
              <div className="bps-empty-text">No integrations connected yet. Browse available integrations below.</div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {connected.map((item) => (
                <div key={item.id} className="bps-list-item">
                  <div className="bps-list-icon" style={{ background: "rgba(176,110,255,0.1)" }}>
                    {item.icon}
                  </div>
                  <div className="bps-list-content">
                    <div style={connectedRowStyle}>
                      <div>
                        <div className="bps-list-title">{item.name}</div>
                        <div className="bps-list-sub">{item.description}</div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
                        {item.connectedAt && (
                          <span style={{ fontSize: "11px", color: "#5A6B8A" }}>
                            Connected {item.connectedAt}
                          </span>
                        )}
                        {item.status && <StatusBadge label={item.status} status={item.status} />}
                        <button
                          className="bps-btn bps-btn-ghost int-disconnect"
                          onClick={() => handleDisconnect(item)}
                          style={{ padding: "6px 14px", fontSize: "11px" }}
                        >
                          Disconnect
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </GlassCard>
      </section>

      {/* ── Available Integrations ── */}
      <section className="bps-section">
        <h2 className="bps-section-title">Available Integrations</h2>
        {available.length === 0 ? (
          <GlassCard>
            <div className="bps-empty">
              <div className="bps-empty-icon">🎉</div>
              <div className="bps-empty-text">All integrations are connected!</div>
            </div>
          </GlassCard>
        ) : (
          <div className="bps-grid-4">
            {available.map((item) => (
              <GlassCard key={item.id} className="int-card">
                <div style={integrationCardStyle}>
                  <div className="int-hover-overlay" style={integrationCardHoverOverlay} />
                  <div className="int-icon-wrap" style={integrationIconStyle}>
                    {item.icon}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: "15px", color: "#E0E6F0", marginBottom: "4px" }}>
                      {item.name}
                    </div>
                    <div style={{ fontSize: "12px", color: "#5A6B8A", lineHeight: 1.4 }}>
                      {item.description}
                    </div>
                  </div>
                  <button
                    className="bps-btn bps-btn-primary"
                    onClick={() => handleConnect(item)}
                    style={{ marginTop: "8px", padding: "8px 20px", fontSize: "11px", width: "100%" }}
                  >
                    Connect
                  </button>
                </div>
              </GlassCard>
            ))}
          </div>
        )}
      </section>

      {/* ── API Keys ── */}
      <section className="bps-section">
        <h2 className="bps-section-title">API Keys</h2>
        <GlassCard>
          <div style={{ marginBottom: "16px" }}>
            <div style={{ fontSize: "14px", fontWeight: 600, color: "#E0E6F0", marginBottom: "4px" }}>
              Live API Key
            </div>
            <div style={{ fontSize: "12px", color: "#5A6B8A", marginBottom: "16px" }}>
              Use this key to authenticate requests to the Dominat8 API. Keep it secret.
            </div>
          </div>
          <div className="int-key-row">
            <div style={apiKeyDisplayStyle}>
              <span style={{ opacity: 0.6, fontSize: "12px", color: "#8B9DC3", flexShrink: 0 }}>KEY</span>
              <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {apiKeyVisible ? apiKey : maskedKey}
              </span>
              <button
                onClick={() => setApiKeyVisible((v) => !v)}
                className="int-copy-btn"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "6px",
                  padding: "4px 10px",
                  fontSize: "11px",
                  color: "#8B9DC3",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  flexShrink: 0,
                }}
              >
                {apiKeyVisible ? "Hide" : "Reveal"}
              </button>
            </div>
            <button
              className="bps-btn bps-btn-ghost int-copy-btn"
              onClick={handleCopyKey}
              style={{ padding: "10px 16px", fontSize: "12px", flexShrink: 0 }}
            >
              {copied ? "Copied!" : "📋 Copy"}
            </button>
            <button
              className="bps-btn bps-btn-primary"
              style={{ padding: "10px 16px", fontSize: "12px", flexShrink: 0 }}
            >
              Generate New Key
            </button>
          </div>
          <hr className="bps-divider" />
          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: "#5A6B8A" }}>
            <span style={{ color: "#FFB800" }}>⚠</span>
            Generating a new key will invalidate the current key. All services using it will need to be updated.
          </div>
        </GlassCard>
      </section>

      {/* ── Webhooks ── */}
      <section className="bps-section">
        <h2 className="bps-section-title">Webhooks</h2>
        <GlassCard>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <div>
              <div style={{ fontSize: "14px", fontWeight: 600, color: "#E0E6F0" }}>
                Configured Endpoints
              </div>
              <div style={{ fontSize: "12px", color: "#5A6B8A", marginTop: "2px" }}>
                {webhooks.length} webhook{webhooks.length !== 1 ? "s" : ""} registered
              </div>
            </div>
            <button className="bps-btn bps-btn-primary" style={{ padding: "8px 16px", fontSize: "11px" }}>
              + Add Webhook
            </button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {webhooks.map((wh) => (
              <div key={wh.id} className="bps-list-item int-webhook-row">
                <div className="bps-list-icon" style={{ background: "rgba(176,110,255,0.1)", fontSize: "16px" }}>
                  🔗
                </div>
                <div className="bps-list-content">
                  <div style={connectedRowStyle}>
                    <div style={{ minWidth: 0 }}>
                      <div className="bps-list-title" style={{ fontFamily: "monospace", fontSize: "13px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {wh.url}
                      </div>
                      <div className="bps-list-sub" style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px" }}>
                        <span className="bps-tag">{wh.event}</span>
                        <span>Last triggered: {wh.lastTriggered}</span>
                      </div>
                    </div>
                    <div style={{ flexShrink: 0 }}>
                      <StatusBadge
                        label={wh.status === "online" ? "Active" : wh.status === "error" ? "Failing" : "Pending"}
                        status={wh.status}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </section>
    </BuildPageShell>
  );
}
