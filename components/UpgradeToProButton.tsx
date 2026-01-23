// /components/UpgradeToProButton.tsx
"use client";

import * as React from "react";

export function UpgradeToProButton() {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function goToCheckout() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({}),
      });

      const data = await res.json();

      if (!res.ok || !data?.url) {
        throw new Error(data?.error ?? "Failed to start checkout");
      }

      window.location.href = data.url;
    } catch (e: any) {
      setError(e?.message ?? "Something went wrong");
      setLoading(false);
    }
  }

  return (
    <div style={{ display: "grid", gap: 10, maxWidth: 420 }}>
      <button
        onClick={goToCheckout}
        disabled={loading}
        style={{
          padding: "12px 16px",
          borderRadius: 10,
          border: "1px solid #ccc",
          fontWeight: 600,
          cursor: loading ? "not-allowed" : "pointer",
        }}
      >
        {loading ? "Redirecting to Stripe..." : "Upgrade to Pro"}
      </button>

      {error ? (
        <div style={{ color: "crimson", fontSize: 14 }}>
          {error}
        </div>
      ) : null}
    </div>
  );
}
