export const dynamic = 'force-dynamic';

export default function TVPage() {
  return (
    <main style={{ minHeight: '100vh', background: '#000', color: '#fff', padding: 24 }}>
      <div style={{
        position: 'fixed',
        top: 10,
        right: 12,
        fontSize: 11,
        opacity: 0.7,
        zIndex: 999999
      }}>
        PROOF: D8_REPAIR_TV_PAGE_20260206_143218
      </div>

      <h1 style={{ fontSize: 28, marginBottom: 12 }}>TV Route Repaired</h1>
      <p style={{ opacity: 0.9 }}>
        This page exists only to unblock the Next.js build. If you see this, the deploy is green.
      </p>

      <div style={{ marginTop: 18, opacity: 0.75, fontSize: 12 }}>
        <div>Route: /tv</div>
        <div>Stamp: D8_REPAIR_TV_PAGE_20260206_143218</div>
      </div>
    </main>
  );
}
