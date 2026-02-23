"use client";

import GoldFogPageLayout from "@/components/GoldFogPageLayout";

export default function LogsPage() {
  return (
    <GoldFogPageLayout title="Logs">
      <div className="gold-fog-card">
        <p style={{ color: "rgba(255,255,255,0.7)", margin: 0 }}>
          Request logs, build logs, and deployment history. Debug and audit activity.
        </p>
      </div>
    </GoldFogPageLayout>
  );
}
