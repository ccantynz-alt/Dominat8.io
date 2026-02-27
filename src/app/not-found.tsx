export default function NotFound() {
  return (
    <main style={{
      minHeight: "100vh",
      background: "#08080c",
      color: "#c8c8d4",
      fontFamily: "ui-sans-serif,system-ui,-apple-system,sans-serif",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px",
      textAlign: "center",
    }}>
      {/* Glowing orb */}
      <div style={{
        width: 120,
        height: 120,
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(124,90,255,0.25) 0%, rgba(124,90,255,0.05) 60%, transparent 100%)",
        border: "1px solid rgba(124,90,255,0.20)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 32,
        position: "relative",
      }}>
        <span style={{ fontSize: 42, fontWeight: 900, letterSpacing: "-0.05em", color: "rgba(124,90,255,0.90)" }}>404</span>
        {/* Pulse ring */}
        <div style={{
          position: "absolute",
          inset: -8,
          borderRadius: "50%",
          border: "1px solid rgba(124,90,255,0.12)",
          animation: "nf-pulse 2.5s ease-in-out infinite",
        }} />
      </div>

      <h1 style={{
        fontSize: "clamp(28px,5vw,44px)",
        fontWeight: 800,
        margin: "0 0 12px",
        letterSpacing: "-0.04em",
        lineHeight: 1.1,
      }}>
        Page not found.
      </h1>

      <p style={{
        fontSize: 16,
        color: "rgba(255,255,255,0.42)",
        margin: "0 0 36px",
        lineHeight: 1.6,
        maxWidth: 400,
      }}>
        The page you're looking for doesn't exist, or it may have been moved.
      </p>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
        <a href="/" style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          padding: "12px 24px",
          borderRadius: 12,
          background: "linear-gradient(135deg,#7C5AFF,#6347FF)",
          color: "#fff",
          textDecoration: "none",
          fontSize: 14,
          fontWeight: 700,
          boxShadow: "0 4px 20px rgba(124,90,255,0.35)",
        }}>
          ← Back to builder
        </a>
        <a href="/gallery" style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          padding: "12px 24px",
          borderRadius: 12,
          border: "1px solid rgba(255,255,255,0.12)",
          background: "rgba(255,255,255,0.04)",
          color: "rgba(255,255,255,0.70)",
          textDecoration: "none",
          fontSize: 14,
          fontWeight: 600,
        }}>
          Browse gallery
        </a>
      </div>

      {/* Nav hint */}
      <div style={{ marginTop: 56, display: "flex", gap: 20, opacity: 0.30, fontSize: 13 }}>
        <a href="/pricing" style={{ color: "inherit", textDecoration: "none" }}>Pricing</a>
        <a href="/gallery" style={{ color: "inherit", textDecoration: "none" }}>Gallery</a>
        <a href="/templates" style={{ color: "inherit", textDecoration: "none" }}>Templates</a>
      </div>

      <style>{`
        @keyframes nf-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(1.08); }
        }
      `}</style>
    </main>
  );
}
