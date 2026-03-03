import { Suspense } from "react";
import { Builder } from "@/io/surfaces/Builder";

export const dynamic = "force-dynamic";

export default function BuildPage() {
  return (
    <Suspense
      fallback={
        <div style={{
          background: "#030712",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "rgba(200,220,255,0.45)",
          fontFamily: "'Outfit', system-ui, sans-serif",
          fontSize: 15,
        }}>
          Loading builder...
        </div>
      }
    >
      <Builder />
    </Suspense>
  );
}
