"use client";

import Link from "next/link";
import GoldFogPageLayout from "@/components/GoldFogPageLayout";

export default function AnimatePage() {
  return (
    <GoldFogPageLayout title="Animate">
      <div className="gold-fog-card">
        <p className="gold-fog-muted" style={{ marginBottom: 20 }}>
          Add or refine animations on your site. The Builder generates sites with scroll and hover effects; you can regenerate with different styles or refine the prompt.
        </p>
        <Link href="/" className="gold-fog-btn">Open Builder</Link>
      </div>
      <div className="gold-fog-card">
        <h2 style={{ fontSize: 16, fontWeight: 600, margin: "0 0 12px", color: "rgba(255,255,255,0.9)" }}>In the Builder</h2>
        <ul style={{ margin: 0, paddingLeft: 20, color: "rgba(255,255,255,0.7)", lineHeight: 1.8 }}>
          <li>Generate a site, then use <strong>Refine</strong> to ask for &quot;more animations&quot; or &quot;add scroll-triggered effects&quot;.</li>
          <li>Choose a style (Minimal, Bold, Luxury) — Bold and Luxury include stronger motion.</li>
          <li>Use the Fix page to repair broken @keyframes or transitions in existing HTML.</li>
        </ul>
      </div>
    </GoldFogPageLayout>
  );
}
