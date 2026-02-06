export const dynamic = "force-dynamic";

export default function IOCockpit() {
  const STAMP = "D8_IO_PR_FIX_044_20260207_070340";
  const SHA = process.env.VERCEL_GIT_COMMIT_SHA || process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA || "local";
  return (
    <main style={{ padding: 24, fontFamily: "ui-sans-serif, system-ui" }}>
      <h1 style={{ fontSize: 22, marginBottom: 8 }}>Dominat8.io — Cockpit</h1>
      <div style={{ opacity: 0.75, marginBottom: 16 }}>
        <div><b>stamp:</b> {STAMP}</div>
        <div><b>sha:</b> {SHA}</div>
      </div>

      <h2 style={{ fontSize: 16, marginTop: 20, marginBottom: 8 }}>/api/io endpoints</h2>
      <ul style={{ lineHeight: 1.7 }}>
        <li><a href="/api/io/health">/api/io/health</a></li>
        <li><a href="/api/io/ping">/api/io/ping</a></li>
        <li><a href="/api/io/state">/api/io/state</a></li>
      </ul>

      <p style={{ marginTop: 18, opacity: 0.75 }}>
        Goal: keep this green so the doctor loop can actually repair forward.
      </p>
    </main>
  );
}