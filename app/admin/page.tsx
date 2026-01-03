export default function AdminHomePage() {
  return (
    <main style={{ padding: "3rem", fontFamily: "sans-serif", maxWidth: 1000, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "baseline" }}>
        <div>
          <h1 style={{ fontSize: "2.5rem", margin: 0 }}>Admin</h1>
          <p style={{ marginTop: 10, color: "#555" }}>
            Manage templates and platform settings.
          </p>
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          <a href="/" style={linkStyle}>Home</a>
          <a href="/dashboard" style={linkStyle}>Dashboard</a>
          <a href="/templates" style={linkStyle}>Templates</a>
          <a href="/projects" style={linkStyle}>Projects</a>
        </div>
      </div>

      <div style={{ marginTop: 18, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 14 }}>
        <a href="/admin/templates" style={cardStyle}>
          <h2 style={{ marginTop: 0 }}>Templates</h2>
          <p style={{ color: "#555" }}>
            Create and publish templates that users can use from <code>/templates</code>.
          </p>
          <div style={{ marginTop: 10, fontWeight: 700 }}>Go to Templates →</div>
        </a>

        <div style={cardStyle}>
          <h2 style={{ marginTop: 0 }}>Status</h2>
          <p style={{ color: "#555" }}>
            If your backend endpoints aren’t wired yet, admin pages still load and you can add them next.
          </p>
          <ul style={{ color: "#555", lineHeight: 1.6, marginBottom: 0 }}>
            <li>Templates UI: <code>/admin/templates</code></li>
            <li>Public templates: <code>/templates</code></li>
            <li>Projects: <code>/projects</code></li>
          </ul>
        </div>
      </div>
    </main>
  );
}

const linkStyle: React.CSSProperties = {
  color: "#111",
  textDecoration: "underline",
  fontSize: 14,
};

const cardStyle: React.CSSProperties = {
  display: "block",
  padding: 16,
  border: "1px solid #eee",
  borderRadius: 12,
  background: "#fff",
  textDecoration: "none",
  color: "#111",
};
