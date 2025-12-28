import Link from "next/link";

function Card({ title, price, items, cta }: { title: string; price: string; items: string[]; cta: string }) {
  return (
    <div style={{ border: "1px solid rgba(0,0,0,0.10)", borderRadius: 20, padding: 18 }}>
      <div style={{ fontWeight: 800, fontSize: 16 }}>{title}</div>
      <div style={{ fontSize: 34, letterSpacing: -1, marginTop: 8 }}>
        {price}
        <span style={{ fontSize: 14, color: "rgba(0,0,0,0.6)" }}>/mo</span>
      </div>
      <div style={{ marginTop: 10, color: "rgba(0,0,0,0.72)", fontWeight: 650 }}>You own your code on every plan.</div>
      <ul style={{ marginTop: 12, color: "rgba(0,0,0,0.75)" }}>
        {items.map((x) => (
          <li key={x}>{x}</li>
        ))}
      </ul>
      <Link
        href="/dashboard"
        style={{
          display: "inline-flex",
          background: "black",
          color: "white",
          padding: "10px 14px",
          borderRadius: 14,
          textDecoration: "none",
          fontWeight: 650,
          marginTop: 10,
        }}
      >
        {cta} →
      </Link>
      <div style={{ marginTop: 10, fontSize: 13, color: "rgba(0,0,0,0.6)" }}>7-day money-back guarantee.</div>
    </div>
  );
}

export default function PricingPage() {
  return (
    <main style={{ maxWidth: 980, margin: "0 auto", padding: "40px 18px" }}>
      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <Link href="/" style={{ fontWeight: 800, letterSpacing: -0.3 }}>
          AI Website Builder
        </Link>
        <nav style={{ display: "flex", gap: 14, fontSize: 14 }}>
          <Link href="/trust">Trust</Link>
          <Link href="/dashboard">Dashboard</Link>
        </nav>
      </header>

      <h1 style={{ fontSize: 40, letterSpacing: -1, marginTop: 34, marginBottom: 10 }}>Pricing</h1>
      <p style={{ marginTop: 0, color: "rgba(0,0,0,0.72)", maxWidth: 720 }}>
        Simple plans. Real outcomes. No lock-in. Publish to GitHub and deploy live when you’re ready.
      </p>

      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 14, marginTop: 18 }}>
        <Card
          title="Starter"
          price="$29"
          items={[
            "3 active projects",
            "AI website generation",
            "Multi-page support",
            "Preview (visual + source)",
            "GitHub publishing",
          ]}
          cta="Start building"
        />
        <Card
          title="Pro"
          price="$79"
          items={[
            "Unlimited projects",
            "Higher AI usage",
            "Faster runs (priority)",
            "Versioned drafts (coming soon)",
            "Priority support",
          ]}
          cta="Go Pro"
        />
        <Card
          title="Team"
          price="$199"
          items={[
            "Team access (coming soon)",
            "Shared projects",
            "Higher concurrency",
            "Org support",
            "Priority support",
          ]}
          cta="Contact us"
        />
      </section>

      <section style={{ marginTop: 26, border: "1px solid rgba(0,0,0,0.10)", borderRadius: 20, padding: 18 }}>
        <h2 style={{ margin: 0, fontSize: 18 }}>What you’re really buying</h2>
        <p style={{ marginTop: 10, color: "rgba(0,0,0,0.75)" }}>
          AI that generates <strong>real</strong> Next.js code you can keep, edit, and scale — not mockups or demos.
        </p>
      </section>
    </main>
  );
}
