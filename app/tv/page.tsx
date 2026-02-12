export const runtime = "edge";

export default function TVPage() {
  return (
    <main style={{
      minHeight: "100vh",
      background: "#000",
      color: "#fff",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "system-ui, Segoe UI, Roboto, Helvetica, Arial, sans-serif"
    }}>
      <div style={{ textAlign: "center", maxWidth: 760, padding: 24 }}>
        <div style={{ fontSize: 12, opacity: 0.7, position: "fixed", top: 10, right: 12, zIndex: 999999 }}>
          PROOF: D8_IO_MEGA_FIX_033_20260207_000752
        </div>
        <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700 }}>Dominat8 TV</h1>
        <p style={{ marginTop: 12, opacity: 0.85, lineHeight: 1.5 }}>
          TV route is live. This page exists to keep deployments green and provide a stable staging surface.
        </p>
      </div>
    </main>
  );
}