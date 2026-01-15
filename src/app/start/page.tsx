import * as React from "react";
import StartClient from "./StartClient";
import { TEMPLATES, USE_CASES } from "@/app/lib/marketingCatalog";

export const dynamic = "force-dynamic";

export default function StartPage() {
  return (
    <React.Suspense fallback={<div style={{ padding: 24 }}>Loading…</div>}>
      <StartClient templates={TEMPLATES} useCases={USE_CASES} />
    </React.Suspense>
  );
}
