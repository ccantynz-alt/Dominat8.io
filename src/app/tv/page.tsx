export const dynamic = "force-dynamic";

async function fetchStatus() {
  try {
    const ts = Math.floor(Date.now() / 1000);
    const r = await fetch(`/api/tv/status?ts=${ts}`, {
      cache: "no-store",
      headers: { "cache-control": "no-cache", pragma: "no-cache" },
    });
    const j = await r.json();
    return { ok: true, data: j };
  } catch (e: any) {
    return { ok: false, data: { ok: false, error: String(e?.message || e) } };
  }
}

export default async function TvPage() {
  const s = await fetchStatus();

  return (
    <main style={{ minHeight: "100vh", padding: 24, fontFamily: "ui-sans-serif, system-ui" }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 16 }}>
        <h1 style={{ margin: 0, fontSize: 28, letterSpacing: "-0.02em" }}>TV</h1>
        <div style={{ opacity: 0.75, fontSize: 12 }}>
          Auto-refresh: 5s (client)
        </div>
      </div>

      <div style={{ marginTop: 16, borderRadius: 16, border: "1px solid rgba(0,0,0,0.08)", padding: 16 }}>
        <div style={{ fontSize: 13, opacity: 0.7, marginBottom: 8 }}>GET /api/tv/status</div>
        <pre style={{
          margin: 0,
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
          fontSize: 13,
          lineHeight: 1.45
        }}>
{s.ok ? JSON.stringify(s.data, null, 2) : JSON.stringify(s.data, null, 2)}
        </pre>
      </div>

      <script
        dangerouslySetInnerHTML={{
          __html: `
            (function(){
              function tick(){ window.location.reload(); }
              setTimeout(tick, 5000);
            })();
          `,
        }}
      />
    </main>
  );
}