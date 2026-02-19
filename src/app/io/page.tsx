export const dynamic = "force-dynamic";

export default function IoHome() {
  const now = new Date().toISOString();
  const env = process.env.VERCEL_ENV || "unknown";
  const commit = (process.env.VERCEL_GIT_COMMIT_SHA || "unknown").substring(0, 12);

  return (
    <main style={{ minHeight: "100vh", padding: 24, fontFamily: "ui-sans-serif, system-ui" }}>
      <h1 style={{ margin: 0, fontSize: 28, letterSpacing: "-0.02em" }}>Dominat8.io Cockpit</h1>
      <div style={{ marginTop: 12, opacity: 0.8, fontSize: 14 }}>
        env: <b>{env}</b> &nbsp; commit: <b>{commit}</b> &nbsp; now: <b>{now}</b>
      </div>

      <div style={{ marginTop: 18, display: "flex", gap: 10, flexWrap: "wrap" }}>
        <a href="/tv" style={{ padding: "10px 14px", borderRadius: 12, border: "1px solid rgba(0,0,0,0.12)", textDecoration: "none" }}>TV</a>
        <a href="/sites" style={{ padding: "10px 14px", borderRadius: 12, border: "1px solid rgba(0,0,0,0.12)", textDecoration: "none" }}>Sites</a>
        <a href="/api/tv/status" style={{ padding: "10px 14px", borderRadius: 12, border: "1px solid rgba(0,0,0,0.12)", textDecoration: "none" }}>/api/tv/status</a>
      </div>
    </main>
  );
}