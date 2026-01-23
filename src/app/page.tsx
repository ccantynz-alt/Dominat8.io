export default function HomePage() {
  return (
    <main style={{ minHeight: "100vh", padding: 32, background: "#000", color: "#fff" }}>
      <div style={{ position: "fixed", top: 16, left: 16, padding: "8px 12px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.15)", background: "rgba(0,0,0,0.6)" }}>
        <div style={{ fontWeight: 700, fontSize: 12 }}>Dominat8 LIVE</div>
        <div style={{ opacity: 0.8, fontSize: 12 }}>HOME_MARKER: D8_HOME_REPAIR_MIN_v1_2026-01-23</div>
      </div>

      <h1 style={{ fontSize: 44, marginTop: 40, marginBottom: 12 }}>Dominat8</h1>
      <p style={{ fontSize: 18, opacity: 0.8, maxWidth: 720 }}>
        This is a repair build to prove deployments are updating. Once this is live, we swap back to the fancy mountain hero.
      </p>
    </main>
  );
}
