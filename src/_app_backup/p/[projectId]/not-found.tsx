export default function PublishedNotFound() {
  return (
    <main style={{ padding: 24, maxWidth: 960, margin: "0 auto" }}>
      <h1 style={{ fontSize: 28, fontWeight: 800, margin: 0 }}>Page not found</h1>
      <p style={{ marginTop: 10, opacity: 0.85 }}>
        This published site doesn’t have that page.
      </p>

      <div style={{ marginTop: 18, display: "flex", flexWrap: "wrap", gap: 10 }}>
        <a
          href="./"
          style={{
            textDecoration: "none",
            padding: "10px 12px",
            borderRadius: 12,
            border: "1px solid #e5e7eb",
            display: "inline-block",
            fontSize: 14,
          }}
        >
          Go to Home
        </a>

        <a
          href="./about"
          style={{
            textDecoration: "none",
            padding: "10px 12px",
            borderRadius: 12,
            border: "1px solid #e5e7eb",
            display: "inline-block",
            fontSize: 14,
          }}
        >
          About
        </a>

        <a
          href="./pricing"
          style={{
            textDecoration: "none",
            padding: "10px 12px",
            borderRadius: 12,
            border: "1px solid #e5e7eb",
            display: "inline-block",
            fontSize: 14,
          }}
        >
          Pricing
        </a>

        <a
          href="./faq"
          style={{
            textDecoration: "none",
            padding: "10px 12px",
            borderRadius: 12,
            border: "1px solid #e5e7eb",
            display: "inline-block",
            fontSize: 14,
          }}
        >
          FAQ
        </a>

        <a
          href="./contact"
          style={{
            textDecoration: "none",
            padding: "10px 12px",
            borderRadius: 12,
            border: "1px solid #e5e7eb",
            display: "inline-block",
            fontSize: 14,
          }}
        >
          Contact
        </a>
      </div>

      <p style={{ marginTop: 20, opacity: 0.6, fontSize: 13 }}>
        Published via my-saas-app
      </p>
    </main>
  );
}
