import React from "react";

export default function AboutPage() {
  const linkStyle: React.CSSProperties = {
    margin: "0 15px",
    textDecoration: "none",
    color: "#0070f3",
    transition: "opacity 0.3s",
  };

  const card: React.CSSProperties = {
    border: "1px solid #eee",
    borderRadius: 10,
    padding: 16,
    background: "#fff",
  };

  const cta: React.CSSProperties = {
    display: "inline-block",
    padding: "10px 20px",
    backgroundColor: "#0070f3",
    color: "#fff",
    borderRadius: 6,
    textDecoration: "none",
  };

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: 20 }}>
      <header style={{ textAlign: "center", marginBottom: 20 }}>
        <h1 style={{ fontSize: "2.2rem", margin: 0 }}>About</h1>
        <p style={{ fontSize: "1.1rem", color: "#666" }}>
          We help you build and redesign real websites by talking to an AI—while you stay in control.
        </p>
      </header>

      <nav style={{ textAlign: "center", marginBottom: 30 }}>
        <a href="/generated" style={linkStyle}>Home</a>
        <a href="/generated/pricing" style={linkStyle}>Pricing</a>
        <a href="/generated/about" style={linkStyle}>About</a>
        <a href="/generated/contact" style={linkStyle}>Contact</a>
      </nav>

      <section style={{ maxWidth: 900, margin: "0 auto", marginBottom: 30 }}>
        <h2 style={{ fontSize: "1.8rem" }}>Mission</h2>
        <p style={{ color: "#444", lineHeight: 1.7 }}>
          Make website building fast, safe, and iterative—so you can launch quickly and improve anytime
          without being locked into a proprietary system.
        </p>
      </section>

      <section style={{ maxWidth: 900, margin: "0 auto", marginBottom: 30 }}>
        <h2 style={{ fontSize: "1.8rem" }}>Core values</h2>
        <div style={{ display: "grid", gap: 12 }}>
          <div style={card}><b>Ownership</b><div style={{ color: "#555", marginTop: 6 }}>You own the code. Export anytime.</div></div>
          <div style={card}><b>Control</b><div style={{ color: "#555", marginTop: 6 }}>Review changes before applying.</div></div>
          <div style={card}><b>Iteration</b><div style={{ color: "#555", marginTop: 6 }}>Redesign without starting over.</div></div>
        </div>
      </section>

      <section style={{ maxWidth: 900, margin: "0 auto", marginBottom: 40 }}>
        <h2 style={{ fontSize: "1.8rem" }}>Our story</h2>
        <ol style={{ color: "#444", lineHeight: 1.7 }}>
          <li><b>Prototype:</b> Runs → Apply → Project memory</li>
          <li><b>Preview:</b> Live preview while building</li>
          <li><b>Publish:</b> Export to repo as real Next.js files</li>
        </ol>

        <div style={{ textAlign: "center", marginTop: 20 }}>
          <a href="/generated/pricing" style={cta}>See Pricing</a>
        </div>
      </section>

      <footer style={{ textAlign: "center", padding: "20px 0", borderTop: "1px solid #ddd" }}>
        <p style={{ margin: 0, color: "#666" }}>
          &copy; {new Date().getFullYear()} Our SaaS Platform. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
