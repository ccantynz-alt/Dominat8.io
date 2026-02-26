import GalleryGrid from "./GalleryGrid";

export const metadata = {
  title: "Gallery — AI-Generated Websites | Dominat8.io",
  description: "Real websites built by AI in under 30 seconds. 18+ industries. Click any example to generate yours instantly.",
};

export default function GalleryPage() {
  return (
    <main style={{
      minHeight: "100vh",
      background: "#06080e",
      color: "#e9eef7",
      fontFamily: "'Outfit', ui-sans-serif,system-ui,-apple-system,sans-serif",
      padding: "0 0 80px",
    }}>

      {/* Ambient background */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
        <div style={{ position: "absolute", width: 700, height: 500, top: -200, left: -100, borderRadius: "50%", background: "radial-gradient(circle, rgba(61,240,255,0.04) 0%, transparent 70%)" }} />
        <div style={{ position: "absolute", width: 600, height: 400, top: 100, right: -150, borderRadius: "50%", background: "radial-gradient(circle, rgba(0,201,122,0.035) 0%, transparent 70%)" }} />
      </div>

      {/* Nav */}
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 32px", borderBottom: "1px solid rgba(255,255,255,0.06)", position: "sticky", top: 0, zIndex: 50, background: "rgba(6,8,14,0.80)", backdropFilter: "blur(20px)" }}>
        <a href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none", color: "inherit" }}>
          <span style={{ fontSize: 17, fontWeight: 800, letterSpacing: "-0.04em" }}>D8</span>
          <span style={{ width: 5, height: 5, borderRadius: "50%", background: "rgba(61,240,255,0.7)", display: "inline-block" }} />
          <span style={{ fontSize: 13, fontWeight: 500, color: "rgba(255,255,255,0.45)" }}>Dominat8.io</span>
        </a>
        <div style={{ display: "flex", gap: 8 }}>
          <a href="/templates" style={{ padding: "8px 16px", borderRadius: 999, border: "1px solid rgba(255,255,255,0.10)", background: "rgba(255,255,255,0.03)", color: "rgba(255,255,255,0.60)", textDecoration: "none", fontSize: 13 }}>Templates</a>
          <a href="/pricing" style={{ padding: "8px 16px", borderRadius: 999, border: "1px solid rgba(255,255,255,0.10)", background: "rgba(255,255,255,0.03)", color: "rgba(255,255,255,0.60)", textDecoration: "none", fontSize: 13 }}>Pricing</a>
          <a href="/" style={{ padding: "8px 16px", borderRadius: 999, background: "linear-gradient(135deg,#00C97A,#00B36B)", color: "#fff", textDecoration: "none", fontSize: 13, fontWeight: 700, boxShadow: "0 2px 10px rgba(0,201,122,0.30)" }}>Start building →</a>
        </div>
      </nav>

      {/* Hero */}
      <div style={{ textAlign: "center", padding: "64px 24px 48px", position: "relative", zIndex: 1 }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "5px 14px", borderRadius: 999, border: "1px solid rgba(61,240,255,0.25)", background: "rgba(61,240,255,0.06)", color: "rgba(61,240,255,0.85)", fontSize: 11, fontWeight: 700, letterSpacing: "0.10em", textTransform: "uppercase", marginBottom: 22 }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "rgba(61,240,255,0.85)", display: "inline-block" }} />
          Gallery — 18 examples
        </div>
        <h1 style={{ fontSize: "clamp(34px,5.5vw,58px)", fontWeight: 800, margin: "0 0 16px", letterSpacing: "-0.04em", lineHeight: 1.05 }}>
          Real sites. Real prompts.<br />
          <span style={{ background: "linear-gradient(95deg,#3DF0FF 0%,#38F8A6 55%,#00D47A 100%)", WebkitBackgroundClip: "text", backgroundClip: "text", WebkitTextFillColor: "transparent" }}>Generated in seconds.</span>
        </h1>
        <p style={{ fontSize: 16, color: "rgba(255,255,255,0.40)", margin: 0, lineHeight: 1.6, maxWidth: 500, marginLeft: "auto", marginRight: "auto" }}>
          Every site below was created from a single text description. No editing, no templates. Click any card to generate one like it.
        </p>

        {/* Stats */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 32, marginTop: 32, flexWrap: "wrap" }}>
          {[
            { v: "18+", l: "examples shown" },
            { v: "~24s", l: "avg generation" },
            { v: "100%", l: "AI-authored" },
          ].map((s, i) => (
            <div key={i} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: "#fff", letterSpacing: "-0.03em" }}>{s.v}</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Grid */}
      <GalleryGrid />

      {/* CTA */}
      <div style={{ textAlign: "center", padding: "64px 24px 0", position: "relative", zIndex: 1 }}>
        <div style={{ maxWidth: 480, margin: "0 auto" }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(61,240,255,0.55)", marginBottom: 12 }}>Your turn</div>
          <h2 style={{ fontSize: "clamp(24px,3.5vw,36px)", fontWeight: 800, letterSpacing: "-0.03em", margin: "0 0 12px" }}>Describe your business.<br />Watch it appear.</h2>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.40)", margin: "0 0 28px", lineHeight: 1.6 }}>No account required. First 3 sites are free.</p>
          <a href="/" style={{ display: "inline-block", padding: "14px 36px", borderRadius: 14, background: "linear-gradient(135deg,#00C97A,#00B36B)", color: "#fff", textDecoration: "none", fontSize: 15, fontWeight: 800, boxShadow: "0 4px 24px rgba(0,201,122,0.40)", letterSpacing: "-0.01em" }}>
            Start building for free →
          </a>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) { main > div:nth-of-type(3) { grid-template-columns: repeat(2,minmax(0,1fr)) !important; } }
        @media (max-width: 560px) { main > div:nth-of-type(3) { grid-template-columns: 1fr !important; } }
      `}</style>
    </main>
  );
}
