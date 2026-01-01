import Link from "next/link";

export default function HomePage() {
  return (
    <main style={{ padding: 32 }}>
      <h1 style={{ fontSize: 32, fontWeight: 700 }}>
        Welcome to My SaaS App
      </h1>

      <p style={{ marginTop: 16, fontSize: 18 }}>
        This is your home page. Navigate to where you want to go:
      </p>

      <div style={{ marginTop: 20, display: "flex", gap: 12 }}>
        <Link
          href="/admin"
          style={{
            padding: "10px 14px",
            border: "1px solid #ccc",
            borderRadius: 8,
            textDecoration: "none",
          }}
        >
          Admin
        </Link>
        <Link
          href="/builder"
          style={{
            padding: "10px 14px",
            border: "1px solid #ccc",
            borderRadius: 8,
            textDecoration: "none",
          }}
        >
          Builder
        </Link>
        <Link
          href="/pricing"
          style={{
            padding: "10px 14px",
            border: "1px solid #ccc",
            borderRadius: 8,
            textDecoration: "none",
          }}
        >
          Pricing
        </Link>
      </div>
    </main>
  );
}
