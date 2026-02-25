"use client";

import { useState } from "react";
import Link from "next/link";
import GoldFogPageLayout from "@/components/GoldFogPageLayout";

export default function SettingsPage() {
  const [billingLoading, setBillingLoading] = useState(false);

  async function openBillingPortal() {
    setBillingLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = (await res.json()) as { url?: string; error?: string };
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error ?? "Could not open billing portal. Do you have an active subscription?");
      }
    } catch {
      alert("Something went wrong. Please try again.");
    } finally {
      setBillingLoading(false);
    }
  }

  return (
    <GoldFogPageLayout title="Settings">
      <div className="gold-fog-card">
        <h2 style={{ fontSize: 16, fontWeight: 600, margin: "0 0 12px", color: "rgba(255,255,255,0.9)" }}>Account</h2>
        <p className="gold-fog-muted" style={{ marginBottom: 16 }}>
          Sign in and manage your profile.
        </p>
        <Link href="/sign-in" className="gold-fog-btn gold-fog-btn--secondary">Sign in</Link>
      </div>
      <div className="gold-fog-card">
        <h2 style={{ fontSize: 16, fontWeight: 600, margin: "0 0 12px", color: "rgba(255,255,255,0.9)" }}>Billing</h2>
        <p className="gold-fog-muted" style={{ marginBottom: 16 }}>
          Manage subscription and payment method.
        </p>
        <button
          type="button"
          onClick={openBillingPortal}
          disabled={billingLoading}
          className="gold-fog-btn gold-fog-btn--secondary"
        >
          {billingLoading ? "Opening…" : "Billing portal"}
        </button>
      </div>
      <div className="gold-fog-card">
        <h2 style={{ fontSize: 16, fontWeight: 600, margin: "0 0 12px", color: "rgba(255,255,255,0.9)" }}>Preferences</h2>
        <p className="gold-fog-muted">
          Default region, notifications, and API keys. More options coming soon.
        </p>
      </div>
    </GoldFogPageLayout>
  );
}
