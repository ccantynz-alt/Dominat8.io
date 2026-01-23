import React from "react";

export default function ContactPage() {
  const linkStyle: React.CSSProperties = {
    margin: "0 15px",
    textDecoration: "none",
    color: "#0070f3",
    transition: "opacity 0.3s",
  };

  const input: React.CSSProperties = {
    width: "100%",
    padding: 10,
    borderRadius: 8,
    border: "1px solid #ddd",
    fontSize: 14,
  };

  const card: React.CSSProperties = {
    border: "1px solid #eee",
    borderRadius: 10,
    padding: 16,
    background: "#fff",
  };

  const button: React.CSSProperties = {
    padding: "10px 16px",
    backgroundColor: "#0070f3",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 700,
  };

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: 20 }}>
      <header style={{ textAlign: "center", marginBottom: 20 }}>
        <h1 style={{ fontSize: "2.2rem", margin: 0 }}>Contact</h1>
        <p style={{ fontSize: "1.1rem", color: "#666" }}>
          Tell us what you’re building and we’ll help you ship faster.
        </p>
      </header>

      <nav style={{ textAlign: "center", marginBottom: 30 }}>
        <a href="/generated" style={linkStyle}>Home</a>
        <a href="/generated/pricing" style={linkStyle}>Pricing</a>
        <a href="/generated/about" style={linkStyle}>About</a>
        <a href="/generated/contact" style={linkStyle}>Contact</a>
      </nav>

      <div style={{ display: "grid", gap: 16, gridTemplateColumns: "1fr", maxWidth: 900, margin: "0 auto" }}>
        <section style={card}>
          <h2 style={{ marginTop: 0 }}>Send a message</h2>
          <div style={{ display: "grid", gap: 12 }}>
            <div>
              <label style={{ fontWeight: 700, display: "block", marginBottom: 6 }}>Name</label>
              <input style={input} placeholder="Your name" />
            </div>
            <div>
              <label style={{ fontWeight: 700, display: "block", marginBottom: 6 }}>Email</label>
              <input style={input} placeholder="you@company.com" />
            </div>
            <div>
              <label style={{ fontWeight: 700, display: "block", marginBottom: 6 }}>Message</label>
              <textarea style={{ ...input, minHeight: 110 }} placeholder="What do you want to build?" />
            </div>
            <button style={button} type="button" onClick={() => alert("Demo form — no backend yet.")}>
              Send
            </button>
          </div>
        </section>

        <section style={card}>
          <h2 style={{ marginTop: 0 }}>Contact options</h2>
          <div style={{ display: "grid", gap: 10 }}>
            <div><b>Email:</b> support@yourdomain.com</div>
            <div><b>Response time:</b> Usually within 24 hours</div>
            <div><b>Support hours:</b> Mon–Fri</div>
          </div>
        </section>

        <section style={card}>
          <h2 style={{ marginTop: 0 }}>Support FAQ</h2>
          <div style={{ display: "grid", gap: 10, color: "#444" }}>
            <div><b>Can you help redesign my site?</b> Yes—tell the agent what you want and iterate.</div>
            <div><b>Do I need to code?</b> No. You describe changes; the agent writes files.</div>
            <div><b>Can I export?</b> Yes—ZIP export gives you the full code.</div>
          </div>
        </section>
      </div>

      <footer style={{ textAlign: "center", padding: "20px 0", borderTop: "1px solid #ddd", marginTop: 30 }}>
        <p style={{ margin: 0, color: "#666" }}>
          &copy; {new Date().getFullYear()} Our SaaS Platform. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
