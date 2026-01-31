/**
 * Dominat8 — /domains route proof
 * Marker: DOMAINS_ROUTE_PROOF_V1
 *
 * If you can see this page on prod, routing is correct.
 */
export const dynamic = "force-dynamic";

export default function DomainsProofPage() {
  const stamp = process.env.NEXT_PUBLIC_BUILD_STAMP || process.env.BUILD_STAMP || "NO_STAMP";
  return (
    <main style={{ minHeight: "100vh", background: "black", color: "white", padding: 24, fontFamily: "ui-sans-serif, system-ui" }}>
      <div style={{ display: "inline-block", padding: "6px 10px", borderRadius: 999, border: "1px solid rgba(255,255,255,0.18)", background: "rgba(255,255,255,0.06)", fontSize: 12 }}>
        DOMAINS_ROUTE_PROOF_V1
      </div>

      <h1 style={{ marginTop: 16, fontSize: 36, lineHeight: 1.1 }}>
        /domains is LIVE
      </h1>

      <p style={{ marginTop: 10, color: "rgba(255,255,255,0.72)", maxWidth: 760 }}>
        If this renders on production, then the 404 was either a deployment mismatch or middleware rewrite.
      </p>

      <div style={{ marginTop: 18, padding: 14, borderRadius: 14, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.04)" }}>
        <div style={{ fontSize: 12, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,255,255,0.55)" }}>Deploy proof</div>
        <div style={{ marginTop: 8, fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace", color: "rgba(255,255,255,0.82)" }}>
          BUILD_STAMP: {stamp}
        </div>
      </div>

      <div style={{ marginTop: 18, fontSize: 12, color: "rgba(255,255,255,0.55)" }}>
        Next: we re-enable the full Domain Wizard UI once routing is confirmed.
      </div>
    </main>
  );
}