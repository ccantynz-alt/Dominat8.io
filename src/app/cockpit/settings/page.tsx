"use client";

import Link from "next/link";
import GoldFogPageLayout from "@/components/GoldFogPageLayout";

export default function SettingsPage() {
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
        <a href="/api/stripe/portal" className="gold-fog-btn gold-fog-btn--secondary">Billing portal</a>
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
