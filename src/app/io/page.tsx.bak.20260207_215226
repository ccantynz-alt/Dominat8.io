export default function IOPage() {
  const stamp = process.env.NEXT_PUBLIC_BUILD_STAMP || "NO_STAMP";
  const sha = process.env.NEXT_PUBLIC_BUILD_SHA || process.env.NEXT_PUBLIC_BUILD_COMMIT || "NO_SHA";

  return (
    <main style={{ padding: 24, fontFamily: "system-ui" }}>
      <h1 style={{ fontSize: 22, marginBottom: 8 }}>
        Dominat8.io — Cockpit
      </h1>

      <div style={{ opacity: 0.75, marginBottom: 16 }}>
        <div><b>stamp:</b> {stamp}</div>
        <div><b>sha:</b> {sha}</div>
      </div>

      <div>System ready.</div>
    </main>
  );
}
