import { Suspense } from "react";
import { Builder } from "@/io/surfaces/Builder";

export const metadata = {
  title: "Dominat8 — Your website doesn't sit there. It works.",
  description: "Generate. Launch. Rank. The AI system that keeps your site alive and growing.",
};

function BuilderFallback() {
  return (
    <div style={{ minHeight: "100vh", background: "#04060e", display: "flex", alignItems: "center", justifyContent: "center", color: "#9aa3c7" }}>
      Loading…
    </div>
  );
}

/**
 * dominat8.io home: Builder (Gold Fog) — hero, prompt, dock, deployments.
 * No sign-in required to view or generate (per FIRST_IMPRESSIONS.md). Optional account for save/deploy.
 */
export default function Page() {
  return (
    <Suspense fallback={<BuilderFallback />}>
      <Builder />
    </Suspense>
  );
}
