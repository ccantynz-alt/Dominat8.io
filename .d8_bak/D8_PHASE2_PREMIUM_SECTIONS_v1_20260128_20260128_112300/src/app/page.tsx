/* eslint-disable react/no-unescaped-entities */
export const dynamic = "force-static";

type BuildInfo = {
  env: string;
  deployId: string;
  sha: string;
};

function getBuildInfo(): BuildInfo {
  // These are evaluated at build time on the server.
  const env = process.env.VERCEL_ENV || "unknown";
  const deployId = process.env.VERCEL_DEPLOYMENT_ID || process.env.VERCEL_DEPLOYMENT_URL || "unknown";
  const sha = process.env.VERCEL_GIT_COMMIT_SHA || "unknown";
  return { env, deployId, sha };
}

export default function HomePage() {
  const build = getBuildInfo();

  const styles: Record<string, any> = {
    page: {
      minHeight: "100vh",
      background: "radial-gradient(1200px 800px at 65% 5%, rgba(168,85,247,0.22), rgba(0,0,0,0) 60%), radial-gradient(900px 700px at 15% 20%, rgba(59,130,246,0.14), rgba(0,0,0,0) 62%), linear-gradient(180deg, #07070B 0%, #07070B 40%, #05050A 100%)",
      color: "#EDEAF7",
      fontFamily: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, 'Apple Color Emoji', 'Segoe UI Emoji'",
      padding: "28px 16px 56px",
    },
    container: {
      width: "100%",
      maxWidth: 1160,
      margin: "0 auto",
    },
    topbar: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
      padding: "10px 0 22px",
    },
    brand: {
      display: "flex",
      alignItems: "center",
      gap: 10,
      textDecoration: "none",
      color: "#F3EEFF",
    },
    logo: {
      width: 34,
      height: 34,
      borderRadius: 12,
      background: "linear-gradient(135deg, rgba(168,85,247,0.95), rgba(59,130,246,0.75))",
      boxShadow: "0 10px 30px rgba(168,85,247,0.25), 0 10px 30px rgba(59,130,246,0.12)",
      border: "1px solid rgba(255,255,255,0.18)",
    },
    brandText: {
      display: "flex",
      flexDirection: "column",
      lineHeight: 1.05,
    },
    brandName: {
      fontSize: 13,
      letterSpacing: "0.22em",
      textTransform: "uppercase",
      opacity: 0.9,
      fontWeight: 700,
    },
    brandSub: {
      fontSize: 12,
      opacity: 0.7,
      marginTop: 3,
    },
    nav: {
      display: "flex",
      alignItems: "center",
      gap: 14,
      flexWrap: "wrap",
      justifyContent: "flex-end",
    },
    navLink: {
      fontSize: 13,
      color: "rgba(237,234,247,0.82)",
      textDecoration: "none",
      padding: "8px 10px",
      borderRadius: 10,
      border: "1px solid rgba(255,255,255,0.08)",
      background: "rgba(255,255,255,0.03)",
    },
    heroGrid: {
      display: "grid",
      gridTemplateColumns: "1.15fr 0.85fr",
      gap: 18,
      alignItems: "stretch",
      marginTop: 6,
    },
    heroLeft: {
      padding: "18px 8px 8px",
    },
    kicker: {
      display: "inline-flex",
      alignItems: "center",
      gap: 10,
      padding: "8px 12px",
      borderRadius: 999,
      background: "linear-gradient(90deg, rgba(168,85,247,0.18), rgba(59,130,246,0.10))",
      border: "1px solid rgba(255,255,255,0.12)",
      boxShadow: "0 10px 40px rgba(168,85,247,0.08)",
      color: "rgba(237,234,247,0.92)",
      fontSize: 12,
      letterSpacing: "0.08em",
      textTransform: "uppercase",
      fontWeight: 700,
    },
    h1: {
      marginTop: 16,
      fontSize: 50,
      lineHeight: 1.02,
      letterSpacing: "-0.02em",
      fontWeight: 900,
      color: "#F6F2FF",
      textShadow: "0 20px 80px rgba(168,85,247,0.18)",
    },
    h1Accent: {
      background: "linear-gradient(90deg, rgba(168,85,247,1), rgba(59,130,246,1))",
      WebkitBackgroundClip: "text",
      backgroundClip: "text",
      color: "transparent",
    },
    sub: {
      marginTop: 14,
      maxWidth: 640,
      fontSize: 16,
      lineHeight: 1.55,
      color: "rgba(237,234,247,0.78)",
    },
    ctas: {
      display: "flex",
      gap: 12,
      flexWrap: "wrap",
      marginTop: 18,
      alignItems: "center",
    },
    btnPrimary: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
      padding: "12px 16px",
      borderRadius: 14,
      textDecoration: "none",
      fontWeight: 800,
      fontSize: 14,
      color: "#07070B",
      background: "linear-gradient(90deg, rgba(168,85,247,1), rgba(59,130,246,1))",
      boxShadow: "0 18px 55px rgba(168,85,247,0.26), 0 10px 24px rgba(59,130,246,0.16)",
      border: "1px solid rgba(255,255,255,0.10)",
    },
    btnGhost: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
      padding: "12px 16px",
      borderRadius: 14,
      textDecoration: "none",
      fontWeight: 800,
      fontSize: 14,
      color: "rgba(237,234,247,0.88)",
      background: "rgba(255,255,255,0.04)",
      border: "1px solid rgba(255,255,255,0.12)",
      boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
    },
    bullets: {
      marginTop: 16,
      display: "grid",
      gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
      gap: 10,
      maxWidth: 640,
    },
    bullet: {
      borderRadius: 16,
      padding: "12px 12px",
      background: "rgba(255,255,255,0.03)",
      border: "1px solid rgba(255,255,255,0.10)",
      boxShadow: "0 12px 40px rgba(0,0,0,0.35)",
    },
    bulletTitle: {
      fontSize: 12,
      fontWeight: 900,
      letterSpacing: "0.18em",
      textTransform: "uppercase",
      color: "rgba(237,234,247,0.88)",
    },
    bulletText: {
      marginTop: 6,
      fontSize: 13,
      lineHeight: 1.45,
      color: "rgba(237,234,247,0.70)",
    },
    rightCard: {
      borderRadius: 20,
      padding: 14,
      background: "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.03))",
      border: "1px solid rgba(255,255,255,0.12)",
      boxShadow: "0 30px 90px rgba(0,0,0,0.45), 0 20px 55px rgba(168,85,247,0.10)",
      position: "relative",
      overflow: "hidden",
    },
    rightGlow: {
      position: "absolute",
      inset: -60,
      background: "radial-gradient(closest-side at 70% 30%, rgba(168,85,247,0.32), rgba(0,0,0,0) 70%), radial-gradient(closest-side at 30% 70%, rgba(59,130,246,0.20), rgba(0,0,0,0) 70%)",
      filter: "blur(14px)",
      pointerEvents: "none",
    },
    badgeRow: {
      display: "flex",
      gap: 8,
      flexWrap: "wrap",
      position: "relative",
      zIndex: 2,
    },
    badge: {
      fontSize: 11,
      fontWeight: 900,
      letterSpacing: "0.16em",
      textTransform: "uppercase",
      padding: "8px 10px",
      borderRadius: 999,
      background: "rgba(0,0,0,0.35)",
      border: "1px solid rgba(255,255,255,0.12)",
      color: "rgba(237,234,247,0.85)",
    },
    liveOk: {
      background: "linear-gradient(90deg, rgba(34,197,94,0.25), rgba(34,197,94,0.10))",
      border: "1px solid rgba(34,197,94,0.35)",
      color: "rgba(214,255,226,0.92)",
    },
    previewTitle: {
      marginTop: 14,
      fontSize: 14,
      fontWeight: 900,
      letterSpacing: "0.14em",
      textTransform: "uppercase",
      color: "rgba(237,234,247,0.84)",
      position: "relative",
      zIndex: 2,
    },
    previewFrame: {
      marginTop: 12,
      borderRadius: 16,
      border: "1px solid rgba(255,255,255,0.12)",
      background: "rgba(0,0,0,0.35)",
      boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05)",
      overflow: "hidden",
      position: "relative",
      zIndex: 2,
    },
    previewHeader: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 10,
      padding: "10px 12px",
      borderBottom: "1px solid rgba(255,255,255,0.10)",
      background: "rgba(255,255,255,0.03)",
    },
    dots: { display: "flex", gap: 6, alignItems: "center" },
    dot: (c: string) => ({
      width: 10,
      height: 10,
      borderRadius: 999,
      background: c,
      boxShadow: "0 6px 20px rgba(0,0,0,0.35)",
    }),
    previewBody: {
      padding: 12,
      fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
      fontSize: 12,
      lineHeight: 1.55,
      color: "rgba(237,234,247,0.80)",
    },
    keyRow: {
      display: "flex",
      justifyContent: "space-between",
      gap: 10,
      padding: "8px 0",
      borderBottom: "1px dashed rgba(255,255,255,0.10)",
    },
    keyName: { color: "rgba(237,234,247,0.70)" },
    keyVal: { color: "rgba(237,234,247,0.92)", fontWeight: 700 },
    section: {
      marginTop: 26,
      paddingTop: 22,
      borderTop: "1px solid rgba(255,255,255,0.08)",
    },
    sectionTitle: {
      fontSize: 12,
      fontWeight: 900,
      letterSpacing: "0.18em",
      textTransform: "uppercase",
      color: "rgba(237,234,247,0.80)",
    },
    sectionText: {
      marginTop: 10,
      color: "rgba(237,234,247,0.72)",
      lineHeight: 1.6,
      fontSize: 14,
      maxWidth: 820,
    },
    footerRow: {
      marginTop: 34,
      display: "flex",
      justifyContent: "space-between",
      gap: 12,
      flexWrap: "wrap",
      alignItems: "center",
      opacity: 0.85,
      fontSize: 12,
      color: "rgba(237,234,247,0.65)",
    },
    fineLink: {
      color: "rgba(237,234,247,0.70)",
      textDecoration: "none",
      borderBottom: "1px solid rgba(237,234,247,0.20)",
      paddingBottom: 2,
    },
  };

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <div style={styles.topbar}>
          <a href="/" style={styles.brand} aria-label="Dominat8 Home">
            <div style={styles.logo} />
            <div style={styles.brandText}>
              <div style={styles.brandName}>Dominat8</div>
              <div style={styles.brandSub}>AI website builder for conversion-first sites</div>
            </div>
          </a>

          <nav style={styles.nav} aria-label="Top navigation">
            <a href="#preview" style={styles.navLink}>Preview</a>
            <a href="/templates" style={styles.navLink}>Templates</a>
            <a href="/pricing" style={styles.navLink}>Pricing</a>
          </nav>
        </div>

        <div style={styles.heroGrid}>
          <section style={styles.heroLeft}>
            <div style={styles.kicker}>
              <span style={{ opacity: 0.95 }}>Craftify-style hero</span>
              <span style={{ opacity: 0.65 }}>inline-styled fallback</span>
            </div>

            <h1 style={styles.h1}>
              Your site should do more than{" "}
              <span style={styles.h1Accent}>look good</span>.
            </h1>

            <p style={styles.sub}>
              Dominat8 builds polished, conversion-first pages fast — with a locked visual layer that
              still renders properly even if Tailwind/classes fail to load.
            </p>

            <div style={styles.ctas}>
              <a href="/builder" style={styles.btnPrimary}>
                Start Building Now <span aria-hidden="true">→</span>
              </a>
              <a href="#preview" style={styles.btnGhost}>
                Watch video <span aria-hidden="true">↘</span>
              </a>
            </div>

            <div style={styles.bullets}>
              <div style={styles.bullet}>
                <div style={styles.bulletTitle}>FAST</div>
                <div style={styles.bulletText}>From idea → publish in minutes.</div>
              </div>
              <div style={styles.bullet}>
                <div style={styles.bulletTitle}>POLISHED</div>
                <div style={styles.bulletText}>Craft-grade spacing & glow.</div>
              </div>
              <div style={styles.bullet}>
                <div style={styles.bulletTitle}>LOCKED</div>
                <div style={styles.bulletText}>Inline fallback styling.</div>
              </div>
            </div>

            <div style={styles.section}>
              <div style={styles.sectionTitle}>Why this patch exists</div>
              <div style={styles.sectionText}>
                If your homepage ever appears “unstyled” (black text, blue links), this hero still looks intentional
                because it does not depend on Tailwind being applied. This is a visual safety net.
              </div>
            </div>
          </section>

          <aside style={styles.rightCard} id="preview" aria-label="Preview card">
            <div style={styles.rightGlow} />

            <div style={styles.badgeRow}>
              <div style={{ ...styles.badge, ...styles.liveOk }}>LIVE_OK</div>
              <div style={styles.badge}>BUILD PROOF</div>
              <div style={styles.badge}>NO-TAILWIND SAFE</div>
            </div>

            <div style={styles.previewTitle}>Live Preview (Proof)</div>

            <div style={styles.previewFrame}>
              <div style={styles.previewHeader}>
                <div style={styles.dots}>
                  <span style={styles.dot("rgba(244,63,94,0.85)")} />
                  <span style={styles.dot("rgba(250,204,21,0.85)")} />
                  <span style={styles.dot("rgba(34,197,94,0.85)")} />
                </div>
                <div style={{ fontSize: 12, opacity: 0.82, fontWeight: 800 }}>
                  dominat8.com
                </div>
              </div>

              <div style={styles.previewBody}>
                <div style={{ marginBottom: 10, fontWeight: 900, opacity: 0.95 }}>
                  HOME_OK · Locked Hero Render
                </div>

                <div style={styles.keyRow}>
                  <span style={styles.keyName}>VERCEL_ENV</span>
                  <span style={styles.keyVal}>{build.env}</span>
                </div>
                <div style={styles.keyRow}>
                  <span style={styles.keyName}>VERCEL_DEPLOYMENT_ID</span>
                  <span style={styles.keyVal}>{build.deployId}</span>
                </div>
                <div style={{ ...styles.keyRow, borderBottom: "none" }}>
                  <span style={styles.keyName}>VERCEL_GIT_COMMIT_SHA</span>
                  <span style={styles.keyVal}>{build.sha}</span>
                </div>

                <div style={{ marginTop: 12, opacity: 0.70 }}>
                  If you see this card styled, your homepage can’t “go plain” anymore.
                </div>
              </div>
            </div>

            <div style={{ marginTop: 14, fontSize: 13, lineHeight: 1.5, color: "rgba(237,234,247,0.72)", position: "relative", zIndex: 2 }}>
              Tip: add <span style={{ fontWeight: 900, color: "rgba(237,234,247,0.90)" }}>?ts=</span> to bust cache.
              This page is intentionally “locked” visually.
            </div>
          </aside>
        </div>

        <div style={styles.footerRow}>
          <div>© {new Date().getFullYear()} Dominat8</div>
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
            <a href="/privacy" style={styles.fineLink}>Privacy</a>
            <a href="/terms" style={styles.fineLink}>Terms</a>
            <a href="/contact" style={styles.fineLink}>Contact</a>
          </div>
        </div>
      </div>

      {/* Mobile fallback: if the grid is too tight, keep it readable */}
      <style>{`
        @media (max-width: 980px) {
          main > div > div:nth-child(2) { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </main>
  );
}