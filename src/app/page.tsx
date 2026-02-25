import { Suspense } from "react";
import { Builder } from "@/io/surfaces/Builder";

export const metadata = {
  title: "Dominat8 — The AI that builds sites CMOs pay $50K for",
  description: "Award-worthy websites in under 30 seconds. Describe your business — get a complete, deploy-ready site. No credit card. 1-click deploy.",
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
