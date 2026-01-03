export default function TemplatesPage() {
  return (
    <main style={{ padding: "3rem", fontFamily: "sans-serif" }}>
      <h1 style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>
        Templates
      </h1>

      <p style={{ marginBottom: "2rem", color: "#555" }}>
        Pick a starting point, then generate a site from it.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: "1.5rem",
        }}
      >
        {/* Template 1 */}
        <div style={cardStyle}>
          <h2>Landing Page</h2>
          <p>
            A clean landing page with hero, pricing, FAQ, and contact form.
          </p>
          <button style={buttonStyle}>Use Template</button>
        </div>

        {/* Template 2 */}
        <div style={cardStyle}>
          <h2>Business Website</h2>
          <p>
            Professional business site with services, testimonials, and contact.
          </p>
          <button style={buttonStyle}>Use Template</button>
        </div>

        {/* Template 3 */}
        <div style={cardStyle}>
          <h2>Portfolio</h2>
          <p>
            Portfolio for creators with projects, about section, and contact.
          </p>
          <button style={buttonStyle}>Use Template</button>
        </div>
      </div>
    </main>
  );
}

const cardStyle: React.CSSProperties = {
  border: "1px solid #ddd",
  borderRadius: "8px",
  padding: "1.5rem",
  background: "#fff",
};

const buttonStyle: React.CSSProperties = {
  marginTop: "1rem",
  padding: "0.6rem 1rem",
  background: "#000",
  color: "#fff",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
};
