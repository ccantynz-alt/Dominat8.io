import React from "react";

export default function TvFallback() {
  return (
    <main style={{ minHeight:"100vh", padding:24, background:"#05070a", color:"#eaf0ff", fontFamily:"ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial" }}>
      <div style={{ fontSize:28, fontWeight:900 }}>DOMINAT8 TV — STAGING</div>
      <div style={{ marginTop:12, opacity:0.85 }}>
        Pages Router fallback route is active.
      </div>
      <div style={{ marginTop:12, opacity:0.75, fontFamily:"ui-monospace, monospace" }}>
        NEXT_PUBLIC_STAGING_BASE_URL: {(process.env.NEXT_PUBLIC_STAGING_BASE_URL || "(NOT SET)")}
      </div>
    </main>
  );
}
