import Link from "next/link";

export default function TrustPage() {
  return (
    <main style={{ maxWidth: 980, margin: "0 auto", padding: "40px 18px" }}>
      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <Link href="/" style={{ fontWeight: 800, letterSpacing: -0.3 }}>
          AI Website Builder
        </Link>
        <nav style={{ display: "flex", gap: 14, fontSize: 14 }}>
          <Link href="/pricing">Pricing</Link>
          <Link href="/dashboard">Dashboard</Link>
        </nav>
      </header>

      <h1 style={{ fontSize: 40, letterSpacing: -1, marginTop: 34, marginBottom: 10 }}>Trust & Ownership</h1>
      <p style={{ marginTop: 0, color: "rgba(0,0,0,0.72)", maxWidth: 780 }}>
        This product is built around one idea: <strong>you should own what you build</strong>.
      </p>

      <section style={{ marginTop: 18, display: "grid", gap: 14 }}>
        <div style={{ border: "1px solid rgba(0,0,0,0.10)", borderRadius: 20, padding: 18 }}>
          <h2 style={{ margin: 0, fontSize: 18 }}>You own the code</h2>
          <ul style={{ marginTop: 10, color: "rgba(0,0,0,0.75)" }}>
            <li>Real Next.js files are generated</li>
            <li>Published to your GitHub repo</li>
            <li>No proprietary formats</li>
            <li>No platform lock-in</li>
          </ul>
        </div>

        <div style={{ border: "1px solid rgba(0,0,0,0.10)", borderRadius: 20, padding: 18 }}>
          <h2 style={{ margin: 0, fontSize: 18 }}>Safe iteration</h2>
          <p style={{ marginTop: 10, color: "rgba(0,0,0,0.75)" }}>
            Changes are applied merge-safe by file path. You can preview drafts before publishing.
          </p>
        </div>

        <div style={{ border: "1px solid rgba(0,0,0,0.10)", borderRadius: 20, padding: 18 }}>
          <h2 style={{ margin: 0, fontSize: 18 }}>Security basics</h2>
          <ul style={{ marginTop: 10, color: "rgba(0,0,0,0.75)" }}>
            <li>Secrets live in environment variables (not committed)</li>
            <li>GitHub token should be rotated periodically</li>
            <li>Don’t paste tokens into chat or public logs</li>
          </ul>
        </div>
      </section>

      <section style={{ marginTop: 26, borderRadius: 24, padding: 22, background: "rgba(0,0,0,0.04)" }}>
        <h2 style={{ margin: 0, fontSize: 22 }}>Build once. Own it forever.</h2>
        <p style={{ marginTop: 10, color: "rgba(0,0,0,0.75)" }}>
          Generate real code, preview instantly, publish with confidence.
        </p>
        <Link
          href="/dashboard"
          style={{
            display: "inline-flex",
            background: "black",
            color: "white",
            padding: "12px 16px",
            borderRadius: 14,
            textDecoration: "none",
            fontWeight: 650,
            marginTop: 10,
          }}
        >
          Go to dashboard →
        </Link>
      </section>
    </main>
  );
}
