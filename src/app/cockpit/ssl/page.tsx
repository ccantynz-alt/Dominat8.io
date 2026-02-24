"use client";

import GoldFogPageLayout from "@/components/GoldFogPageLayout";

export default function SSLPage() {
  return (
    <GoldFogPageLayout title="SSL">
      <div className="gold-fog-card">
        <p className="gold-fog-muted" style={{ marginBottom: 16 }}>
          SSL certificates are managed automatically for all sites on Dominat8.
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: 16, background: "rgba(56,248,166,0.06)", border: "1px solid rgba(56,248,166,0.2)", borderRadius: 10 }}>
          <span style={{ fontSize: 24 }}>✓</span>
          <div>
            <div style={{ fontWeight: 600, color: "rgba(255,255,255,0.9)" }}>HTTPS enabled</div>
            <div className="gold-fog-muted">Certificates are issued and renewed via Let&apos;s Encrypt. No action needed.</div>
          </div>
        </div>
      </div>
      <div className="gold-fog-card">
        <h2 style={{ fontSize: 16, fontWeight: 600, margin: "0 0 12px", color: "rgba(255,255,255,0.9)" }}>Custom domains</h2>
        <p className="gold-fog-muted">
          When you add a custom domain and point it to Dominat8, we provision an SSL certificate for it automatically after DNS propagates.
        </p>
      </div>
    </GoldFogPageLayout>
  );
}
