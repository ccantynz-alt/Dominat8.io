// src/app/(marketing)/page.tsx
export const runtime = "nodejs";

export const metadata = {
  title: "Dominat8 — AI Website Automation Builder",
  description: "Dominat8 builds and launches high-converting websites automatically.",
};

export default function MarketingHomePage() {
  return (
    <main style={{ minHeight: "100vh", padding: "48px 24px", fontFamily: "ui-sans-serif, system-ui" }}>
      {/* =========================================
          HOME_OK MARKER (do not remove)
          This is used to verify routing + deploy.
          ========================================= */}
      <div
        style={{
          display: "inline-block",
          padding: "10px 14px",
          borderRadius: 12,
          border: "1px solid rgba(0,0,0,0.15)",
          background: "rgba(0,0,0,0.04)",
          fontWeight: 700,
          letterSpacing: 0.2,
          marginBottom: 18,
        }}
      >
        ✅ HOME_OK — / is served by <code>src/app/(marketing)/page.tsx</code> — 2026-01-24
      </div>

      <h1 style={{ fontSize: 42, lineHeight: 1.1, margin: "8px 0 10px" }}>
        Dominat8
      </h1>

      <p style={{ fontSize: 18, lineHeight: 1.6, maxWidth: 820, opacity: 0.85, margin: "0 0 26px" }}>
        Your homepage routing is restored. Next step is the ultra-luxury hero.
      </p>

      <div style={{ display: "grid", gap: 12, maxWidth: 900 }}>
        <div style={{ padding: 16, borderRadius: 16, border: "1px solid rgba(0,0,0,0.12)" }}>
          <div style={{ fontWeight: 700, marginBottom: 6 }}>Phase 1 — Stability</div>
          <div style={{ opacity: 0.85 }}>
            Confirm this page renders on both the Vercel deploy URL and https://www.dominat8.com
          </div>
        </div>

        <div style={{ padding: 16, borderRadius: 16, border: "1px solid rgba(0,0,0,0.12)" }}>
          <div style={{ fontWeight: 700, marginBottom: 6 }}>Phase 2 — Ultra-Luxury Hero</div>
          <div style={{ opacity: 0.85 }}>
            We’ll replace this placeholder with the pedestal-level hero once routing is 100% confirmed.
          </div>
        </div>
      </div>
    </main>
  );
}
