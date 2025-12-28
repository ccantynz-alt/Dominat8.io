import React from "react";

export default function PricingPage() {
  const linkStyle: React.CSSProperties = {
    margin: "0 15px",
    textDecoration: "none",
    color: "#0070f3",
    transition: "opacity 0.3s",
  };

  const card: React.CSSProperties = {
    border: "1px solid #ddd",
    borderRadius: 8,
    padding: 20,
    width: 320,
    maxWidth: "100%",
  };

  const cta: React.CSSProperties = {
    display: "inline-block",
    padding: "10px 15px",
    backgroundColor: "#0070f3",
    color: "#fff",
    borderRadius: 6,
    textDecoration: "none",
  };

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: 20 }}>
      <header style={{ textAlign: "center", marginBottom: 20 }}>
        <h1 style={{ fontSize: "2.2rem", margin: 0 }}>Pricing</h1>
        <p style={{ fontSize: "1.1rem", color: "#666" }}>
          Choose a plan that fits where you’re at today. Upgrade anytime.
        </p>
      </header>

      <nav style={{ textAlign: "center", marginBottom: 30 }}>
        <a href="/generated" style={linkStyle}>Home</a>
        <a href="/generated/pricing" style={linkStyle}>Pricing</a>
        <a href="/generated/about" style={linkStyle}>About</a>
        <a href="/generated/contact" style={linkStyle}>Contact</a>
      </nav>

      <section style={{ marginBottom: 40 }}>
        <div
          style={{
            display: "flex",
            gap: 16,
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          <div style={card}>
            <h3 style={{ marginTop: 0 }}>Basic</h3>
            <p style={{ fontSize: "1.4rem", margin: "8px 0" }}>$19/mo</p>
            <ul style={{ paddingLeft: 18, color: "#444" }}>
              <li>1 website project</li>
              <li>Core AI edits</li>
              <li>ZIP export</li>
            </ul>
            <a href="/generated/contact" style={cta}>Choose Basic</a>
          </div>

          <div style={{ ...card, borderColor: "#0070f3" }}>
            <h3 style={{ marginTop: 0 }}>Pro</h3>
            <p style={{ fontSize: "1.4rem", margin: "8px 0" }}>$49/mo</p>
            <ul style={{ paddingLeft: 18, color: "#444" }}>
              <li>Unlimited runs</li>
              <li>Multiple pages</li>
              <li>Priority improvements</li>
            </ul>
            <a href="/generated/contact" style={cta}>Choose Pro</a>
          </div>

          <div style={card}>
            <h3 style={{ marginTop: 0 }}>Business</h3>
            <p style={{ fontSize: "1.4rem", margin: "8px 0" }}>$99/mo</p>
            <ul style={{ paddingLeft: 18, color: "#444" }}>
              <li>Team projects</li>
              <li>Templates + brand rules</li>
              <li>Support & onboarding</li>
            </ul>
            <a href="/generated/contact" style={cta}>Talk to Sales</a>
          </div>
        </div>
      </section>

      <section style={{ maxWidth: 900, margin: "0 auto", marginBottom: 40 }}>
        <h2 style={{ fontSize: "1.8rem", textAlign: "center" }}>FAQ</h2>
        <div style={{ display: "grid", gap: 12 }}>
          <div style={{ border: "1px solid #eee", borderRadius: 8, padding: 14 }}>
            <b>Can I redesign later?</b>
            <div style={{ color: "#555", marginTop: 6 }}>
              Yes—run the agent with your new direction, review, and apply.
            </div>
          </div>
          <div style={{ border: "1px solid #eee", borderRadius: 8, padding: 14 }}>
            <b>Do I own the code?</b>
            <div style={{ color: "#555", marginTop: 6 }}>
              Yes—your site is real Next.js files you can export and deploy anywhere.
            </div>
          </div>
          <div style={{ border: "1px solid #eee", borderRadius: 8, padding: 14 }}>
            <b>Can I cancel?</b>
            <div style={{ color: "#555", marginTop: 6 }}>
              Anytime. You can always export your project files.
            </div>
          </div>
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
