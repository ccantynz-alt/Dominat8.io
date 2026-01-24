import AudienceQualificationStrip from "@/src/components/marketing/AudienceQualificationStrip";
import ValuePropositionCyclone from "@/src/components/marketing/ValuePropositionCyclone";
import HowItWorksCalm from "@/src/components/marketing/HowItWorksCalm";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import React from "react";

import LuxuryHero from "@/components/marketing/LuxuryHero";
import AudienceQualificationStrip from "@/components/marketing/AudienceQualificationStrip";
import ValuePropCyclone from "@/components/marketing/ValuePropCyclone";
import HowItWorksCalm from "@/components/marketing/HowItWorksCalm";
import ProofAndCTA from "@/components/marketing/ProofAndCTA";

export default function MarketingHomePage() {
  return (
    <main className="min-h-screen bg-black text-white">
      {/* Marker to prove we are on the correct route/output */}
      <div className="sr-only">HOME_OK</div>

      <LuxuryHero />
      <div className="px-6 pt-2 text-[11px] text-white/40">BUILD_STAMP: BUILD_20260124_211633</div>
      {/* WOW_FLOW_START */}
      <AudienceQualificationStrip />
      <ValuePropositionCyclone />
      <HowItWorksCalm />
      {/* WOW_FLOW_END */}

      <AudienceQualificationStrip />
      <ValuePropCyclone />
      <HowItWorksCalm />
      <ProofAndCTA />

      {/* Footer spacer */}
      <div className="h-12" />
    </main>
  );
}

