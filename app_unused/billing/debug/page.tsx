// /app/billing/debug/page.tsx
"use client";

import * as React from "react";

export default function BillingDebugPage() {
  const [me, setMe] = React.useState<any>(null);
  const [webhook, setWebhook] = React.useState<any>(null);

  async function refresh() {
    const a = await fetch("/api/billing/me").then((r) => r.json());
    const b = await fetch("/api/billing/webhook-health").then((r) => r.json());
    setMe(a);
    setWebhook(b);
  }

  React.useEffect(() => {
    refresh();
  }, []);

  return (
    <main style={{ padding: 24, maxWidth: 1000 }}>
      <h1 style={{ fontSize: 28, fontWeight: 800 }}>Billing Debug</h1>

      <button
        onClick={refresh}
        style={{
          marginTop: 12,
          padding: "10px 12px",
          borderRadius: 10,
          border: "1px solid #ccc",
          fontWeight: 600,
          cursor: "pointer",
        }}
      >
        Refresh
      </button>

      <h2 style={{ marginTop: 20, fontSize: 18, fontWeight: 700 }}>/api/billing/me</h2>
      <pre style={{ padding: 12, background: "#f6f6f6", borderRadius: 10, overflowX: "auto" }}>
        {JSON.stringify(me, null, 2)}
      </pre>

      <h2 style={{ marginTop: 20, fontSize: 18, fontWeight: 700 }}>/api/billing/webhook-health</h2>
      <pre style={{ padding: 12, background: "#f6f6f6", borderRadius: 10, overflowX: "auto" }}>
        {JSON.stringify(webhook, null, 2)}
      </pre>
    </main>
  );
}
