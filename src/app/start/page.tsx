import type { Metadata } from "next";
import * as React from "react";
import StartClient from "./StartClient";

export const metadata: Metadata = {
  title: "Start",
  description: "Start a new project",
};

// ✅ Prevent prerender/export issues caused by useSearchParams in StartClient
export const dynamic = "force-dynamic";

export default function StartPage() {
  return (
    <React.Suspense fallback={<div style={{ padding: 24 }}>Loading…</div>}>
      <StartClient />
    </React.Suspense>
  );
}
