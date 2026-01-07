"use client";

import React, { useState } from "react";

export default function BillingPage() {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string>("");

  async function handleUpgrade() {
    setLoading(true);
    setMsg("");

    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({}),
      });

      // Always read text first (prevents "Unexpected end of JSON input")
      const text = await res.text();

      // Try to parse JSON, but don’t crash if it isn’t JSON
      let data: any = null;
      try {
        data = text ? JSON.parse(text) : null;
      } catch {
        data = null;
      }

      if (!res.ok) {
        const errMsg =
          (data && (data.error || data.message)) ||
          text ||
          `Request failed (${res.status})`;
        setMsg(errMsg);
        setLoading(false);
        return;
      }

      // Expected JSON shape: { ok: true, url: "https://checkout.stripe.com/..." }
      const url = data?.url;
      if (!url || typeof url !== "string") {
        setMsg(
          "Checkout API did not return a redirect URL. Open DevTools → Network and check /api/billing/checkout response."
        );
        setLoading(false);
        return;
      }

      window.location.href = url;
    } catch (e: any) {
      setMsg(e?.message || String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: 24, maxWidth: 720 }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>
        Billing
      </h1>
      <p style={{ marginBottom: 16 }}>
        Upgrade to Pro to unlock higher limits.
      </p>

      <button
        onClick={handleUpgrade}
        disabled={loading}
        style={{
          width: "100%",
          padding: "12px 16px",
          borderRadius: 10,
          border: "1px solid #ddd",
          background: loading ? "#f5f5f5" : "white",
          cursor: loading ? "not-allowed" : "pointer",
          fontWeight: 600,
        }}
      >
        {loading ? "Opening Stripe Checkout..." : "Upgrade to Pro"}
      </button>

      {msg ? (
        <div style={{ marginTop: 12, color: "crimson", whiteSpace: "pre-wrap" }}>
          {msg}
        </div>
      ) : null}
    </div>
  );
}
