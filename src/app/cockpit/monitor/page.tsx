"use client";

import GoldFogPageLayout from "@/components/GoldFogPageLayout";

export default function MonitorPage() {
  return (
    <GoldFogPageLayout title="Monitor">
      <div className="gold-fog-card">
        <p className="gold-fog-muted" style={{ marginBottom: 20 }}>
          Uptime and performance monitoring for your deployments.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 16 }}>
          {[
            { label: "Uptime", value: "99.9%", sub: "Last 30 days" },
            { label: "Avg response", value: "&lt; 200ms", sub: "Global" },
            { label: "Requests", value: "—", sub: "Coming soon" },
          ].map((m) => (
            <div key={m.label} style={{ padding: 18, background: "rgba(0,0,0,0.2)", borderRadius: 10, border: "1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginBottom: 6 }}>{m.label}</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: "rgba(212,175,55,0.9)" }}>{m.value}</div>
              <div className="gold-fog-muted" style={{ fontSize: 12, marginTop: 4 }}>{m.sub}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="gold-fog-card">
        <p className="gold-fog-muted">
          Full metrics (response times, error rates, regions) will appear here as we add monitoring. Your sites are served over the edge for low latency.
        </p>
      </div>
    </GoldFogPageLayout>
  );
}
