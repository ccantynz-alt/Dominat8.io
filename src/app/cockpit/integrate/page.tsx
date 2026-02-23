"use client";

import GoldFogPageLayout from "@/components/GoldFogPageLayout";

const INTEGRATIONS = [
  { name: "Google Analytics", desc: "Track page views and events", status: "Coming soon" },
  { name: "Stripe", desc: "Payments and subscriptions", status: "Available", href: "/pricing" },
  { name: "Clerk", desc: "Auth and user accounts", status: "Available" },
  { name: "Forms", desc: "Contact and lead forms", status: "Coming soon" },
  { name: "CRM", desc: "Connect HubSpot, Salesforce", status: "Coming soon" },
];

export default function IntegratePage() {
  return (
    <GoldFogPageLayout title="Integrate">
      <div className="gold-fog-card">
        <p className="gold-fog-muted" style={{ marginBottom: 24 }}>
          Connect third-party services to your sites. Manage API keys and webhooks in one place.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {INTEGRATIONS.map((int) => (
            <div
              key={int.name}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: 18,
                background: "rgba(0,0,0,0.2)",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: 10,
              }}
            >
              <div>
                <div style={{ fontWeight: 600, color: "rgba(255,255,255,0.9)" }}>{int.name}</div>
                <div className="gold-fog-muted" style={{ fontSize: 13, marginTop: 4 }}>{int.desc}</div>
              </div>
              {int.href ? (
                <a href={int.href} className="gold-fog-btn gold-fog-btn--secondary" style={{ padding: "8px 16px", fontSize: 13 }}>
                  Open
                </a>
              ) : (
                <span className="gold-fog-muted" style={{ fontSize: 13 }}>{int.status}</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </GoldFogPageLayout>
  );
}
