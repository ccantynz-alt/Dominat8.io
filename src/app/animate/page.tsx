"use client";

import GoldFogPageLayout from "@/components/GoldFogPageLayout";

export default function AnimatePage() {
  return (
    <GoldFogPageLayout title="Animate">
      <div className="gold-fog-card">
        <p style={{ color: "rgba(255,255,255,0.7)", margin: 0 }}>
          Add or refine animations on your site. Micro-interactions, scroll effects, and transitions.
        </p>
      </div>
    </GoldFogPageLayout>
  );
}
