"use client";

import React, { useEffect, useState } from "react";

type Status = {
  ok: boolean;
  signedIn?: boolean;
  plan?: string;
  userId?: string;
  key?: string;
  note?: string;
  error?: string;
};

export default function BillingPage() {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string>("");
  const [status, setStatus] = useState<Status | null>(null);
  const [lastRaw, setLastRaw] = useState<string>("");

  async function refreshStatus() {
    setMsg("");
    setLastRaw("");

    try {
      const res = await fetch("/api/billing/status", { method: "GET" });
      const text = await res.text();
      setLastRaw(text);

      let data: any = null;
      try {
        data = text ? JSON.parse(text) : null;
      } catch {
        data = null;
      }

      if (!res.ok) {
        setMsg((data && (data.error || data.message)) || text || `Status failed (${res.status})`);
        return;
      }

      setStatus(data);
    } catch (e: any) {
      setMsg(e?.message || String(e));
    }
  }

  async function handleUpgrade() {
    setLoading(true);
    setMsg("");

    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({}),
      });

      const text = await res.text();

      let data: any = null;
      try {
        data = text ? JSON.parse(text) : null;
      } catch {
        data = null;
      }

      if (!res.ok) {
        setMsg((data && (data.error || data.message)) || text || `Checkout failed (${res.status})`);
        setLoading(false);
        return;
      }

      const url = data?.url;
      if (!url) {
        setMsg("Checkout API did not return a URL.");
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

  // Load once on page open
  useEffect(() => {
    refreshStatus().catch(() => {});
  }, []);

  const planLabel = status?.plan === "pro" ? "Pro ✅" : "Free";

  return (
    <div style={{ padding: 24, maxWidth: 720 }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>
        Billing
      </h1>

      <p style={{ marginBottom: 12 }}>
        Current plan: <b>{planLabel}</b>
      </p>

      <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
        <button
          onClick={refreshStatus}
          style={{
            padding: "10px 14px",
            borderRadius: 10,
            border: "1px solid #ddd",
            background: "white",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          Refresh status
        </button>

        {status?.plan !== "pro" ? (
          <button
            onClick={handleUpgrade}
            disabled={loading}
            style={{
              flex: 1,
              padding: "10px 14px",
              borderRadius: 10,
              border: "1px solid #ddd",
              background: loading ? "#f5f5f5" : "white",
              cursor: loading ? "not-allowed" : "pointer",
              fontWeight: 700,
            }}
          >
            {loading ? "Opening Stripe Checkout..." : "Upgrade to Pro"}
          </button>
        ) : (
          <div style={{ flex: 1, padding: "10px 14px" }}>
            You’re already Pro.
          </div>
        )}
      </div>

      {msg ? (
        <div style={{ marginTop: 12, color: "crimson", whiteSpace: "pre-wrap" }}>
          {msg}
        </div>
      ) : null}

      <div style={{ marginTop: 14, fontSize: 13, color: "#555" }}>
        <div style={{ marginBottom: 6 }}>
          Tip: After you complete Checkout, Stripe must deliver{" "}
          <code>checkout.session.completed</code> to your webhook. Then click{" "}
          “Refresh status” to see Pro.
        </div>

        <div style={{ marginTop: 10 }}>
          <b>Last /api/billing/status response:</b>
          <pre
            style={{
              marginTop: 6,
              padding: 10,
              borderRadius: 10,
              border: "1px solid #eee",
              background: "#fafafa",
              overflowX: "auto",
            }}
          >
            {lastRaw || "(no response yet)"}
          </pre>
        </div>
      </div>
    </div>
  );
}

