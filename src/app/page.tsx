import { Suspense } from "react";
import { Builder } from "@/io/surfaces/Builder";
import FuturisticLandingPage from "./FuturisticLandingPage";

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
 * Alternate views (not used here; keep in mind for dominat8.com):
 * - FuturisticLandingPage: "Dominat8 is Coming" splash + gold card + Vanta fog.
 * - MonsterHeroClient: full marketing hero ("Your website doesn't sit there. It works.", proof card, nav).
 */
export default function Page() {
  return (
    <Suspense fallback={<BuilderFallback />}>
      <Builder />
    </Suspense>
  );
}
