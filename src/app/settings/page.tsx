"use client";

import GoldFogPageLayout from "@/components/GoldFogPageLayout";

export default function SettingsPage() {
  return (
    <GoldFogPageLayout title="Settings">
      <div className="gold-fog-card">
        <p style={{ color: "rgba(255,255,255,0.7)", margin: 0 }}>
          Account, billing, team, and preferences. Configure how you use Dominat8.
        </p>
      </div>
    </GoldFogPageLayout>
  );
}
