export const metadata = {
  title: "Pricing — Dominat8.io",
  description: "Start free. Scale as you grow. No credit card required.",
};

const PLANS = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    desc: "Perfect for trying it out",
    accent: "rgba(255,255,255,0.10)",
    accentBorder: "rgba(255,255,255,0.12)",
    accentBtn: "rgba(255,255,255,0.10)",
    accentBtnBorder: "rgba(255,255,255,0.15)",
    accentBtnColor: "rgba(255,255,255,0.80)",
    features: [
      "5 AI-generated websites / month",
      "HTML download",
      "Mobile-responsive output",
      "Basic SEO metadata",
      "Community support",
    ],
    cta: "Get started free",
    highlight: false,
  },
  {
    name: "Pro",
    price: "$29",
    period: "per month",
    desc: "For freelancers & agencies",
    accent: "rgba(61,240,255,0.08)",
    accentBorder: "rgba(61,240,255,0.30)",
    accentBtn: "linear-gradient(135deg,#00C97A,#00B36B)",
    accentBtnBorder: "transparent",
    accentBtnColor: "#fff",
    features: [
      "Unlimited AI website generation",
      "One-click deploy to Dominat8 CDN",
      "Custom domain connection",
      "Auto-SSL provisioning",
      "Priority AI generation",
      "Advanced SEO + Open Graph",
      "Site history & versioning",
      "Email support",
    ],
    cta: "Start Pro — $29/mo",
    highlight: true,
  },
  {
    name: "Business",
    price: "$99",
    period: "per month",
    desc: "For teams & high-volume builders",
    accent: "rgba(124,92,255,0.08)",
    accentBorder: "rgba(124,92,255,0.30)",
    accentBtn: "rgba(124,92,255,0.25)",
    accentBtnBorder: "rgba(124,92,255,0.40)",
    accentBtnColor: "rgba(255,255,255,0.90)",
    features: [
      "Everything in Pro",
      "10 team members",
      "White-label output",
      "API access",
      "Agent automation suite",
      "Bulk generation",
      "Custom AI training prompts",
      "SLA + dedicated support",
    ],
    cta: "Contact sales",
    highlight: false,
  },
];

const COMPARISON = [
  { feature: "AI generations / month", free: "5", pro: "Unlimited", biz: "Unlimited" },
  { feature: "HTML download", free: "✓", pro: "✓", biz: "✓" },
  { feature: "Deploy to CDN", free: "—", pro: "✓", biz: "✓" },
  { feature: "Custom domain", free: "—", pro: "✓", biz: "✓" },
  { feature: "Auto-SSL", free: "—", pro: "✓", biz: "✓" },
  { feature: "Site history", free: "—", pro: "✓", biz: "✓" },
  { feature: "API access", free: "—", pro: "—", biz: "✓" },
  { feature: "Agent automation", free: "—", pro: "—", biz: "✓" },
  { feature: "White-label", free: "—", pro: "—", biz: "✓" },
  { feature: "Team members", free: "1", pro: "3", biz: "10" },
];

export default function PricingPage() {
  return (
    <main style={{
      minHeight: "100vh",
      background: "radial-gradient(1000px 700px at 50% -10%, rgba(61,240,255,0.05), transparent 55%), #06080e",
      color: "#e9eef7",
      fontFamily: "ui-sans-serif,system-ui,-apple-system,sans-serif",
      padding: "0 0 80px",
    }}>
      {/* Nav */}
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 32px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <a href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none", color: "inherit" }}>
          <span style={{ fontSize: 17, fontWeight: 800, letterSpacing: "-0.04em" }}>D8</span>
          <span style={{ width: 5, height: 5, borderRadius: "50%", background: "rgba(61,240,255,0.7)", display: "inline-block" }} />
          <span style={{ fontSize: 13, fontWeight: 500, color: "rgba(255,255,255,0.45)" }}>Dominat8.io</span>
        </a>
        <a href="/" style={{ padding: "8px 18px", borderRadius: 999, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.70)", textDecoration: "none", fontSize: 13 }}>
          ← Back to builder
        </a>
      </nav>

      {/* Hero */}
      <div style={{ textAlign: "center", padding: "64px 24px 48px" }}>
        <div style={{ display: "inline-block", padding: "4px 14px", borderRadius: 999, border: "1px solid rgba(61,240,255,0.25)", background: "rgba(61,240,255,0.06)", color: "rgba(61,240,255,0.85)", fontSize: 12, fontWeight: 600, letterSpacing: "0.06em", marginBottom: 20 }}>
          PRICING
        </div>
        <h1 style={{ fontSize: "clamp(36px,6vw,58px)", fontWeight: 800, margin: "0 0 16px", letterSpacing: "-0.04em", lineHeight: 1.05 }}>
          Simple, honest pricing.
        </h1>
        <p style={{ fontSize: 17, color: "rgba(255,255,255,0.45)", margin: 0, lineHeight: 1.6, maxWidth: 520, marginLeft: "auto", marginRight: "auto" }}>
          Start free. Scale as you grow. No hidden fees, no credit card required to start.
        </p>
      </div>

      {/* Plans */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: 16, maxWidth: 1000, margin: "0 auto", padding: "0 24px" }}>
        {PLANS.map((plan) => (
          <div key={plan.name} style={{
            borderRadius: 20,
            border: `1px solid ${plan.accentBorder}`,
            background: plan.accent,
            padding: 24,
            position: "relative",
            boxShadow: plan.highlight ? "0 0 0 1px rgba(61,240,255,0.20), 0 24px 60px rgba(0,0,0,0.40)" : "0 8px 32px rgba(0,0,0,0.25)",
          }}>
            {plan.highlight && (
              <div style={{ position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)", padding: "4px 16px", borderRadius: 999, background: "linear-gradient(135deg,#00C97A,#00B36B)", color: "#fff", fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", whiteSpace: "nowrap" }}>
                MOST POPULAR
              </div>
            )}
            <div style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.55)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 8 }}>{plan.name}</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 6 }}>
              <span style={{ fontSize: 42, fontWeight: 800, letterSpacing: "-0.04em" }}>{plan.price}</span>
              <span style={{ fontSize: 14, color: "rgba(255,255,255,0.40)" }}>/ {plan.period}</span>
            </div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.50)", marginBottom: 20 }}>{plan.desc}</div>
            <a href="/" style={{
              display: "block", textAlign: "center", padding: "12px 0",
              borderRadius: 12, border: `1px solid ${plan.accentBtnBorder}`,
              background: plan.accentBtn, color: plan.accentBtnColor,
              fontSize: 13, fontWeight: 600, textDecoration: "none",
              marginBottom: 20, transition: "opacity 140ms ease",
            }}>
              {plan.cta}
            </a>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {plan.features.map((f) => (
                <div key={f} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 13, color: "rgba(255,255,255,0.75)" }}>
                  <span style={{ color: "rgba(56,248,166,0.90)", flexShrink: 0, marginTop: 1 }}>✓</span>
                  {f}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Comparison table */}
      <div style={{ maxWidth: 900, margin: "60px auto 0", padding: "0 24px" }}>
        <h2 style={{ textAlign: "center", fontSize: 28, fontWeight: 700, letterSpacing: "-0.03em", marginBottom: 24, color: "#fff" }}>
          Full comparison
        </h2>
        <div style={{ borderRadius: 16, border: "1px solid rgba(255,255,255,0.08)", overflow: "hidden" }}>
          {/* Header */}
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", background: "rgba(255,255,255,0.04)", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
            <div style={{ padding: "12px 16px", fontSize: 12, color: "rgba(255,255,255,0.45)", fontWeight: 600 }}>Feature</div>
            {["Free", "Pro", "Business"].map(h => (
              <div key={h} style={{ padding: "12px 16px", textAlign: "center", fontSize: 12, fontWeight: 700, color: h === "Pro" ? "rgba(61,240,255,0.90)" : "rgba(255,255,255,0.70)" }}>{h}</div>
            ))}
          </div>
          {COMPARISON.map((row, i) => (
            <div key={row.feature} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", borderBottom: i < COMPARISON.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none", background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.02)" }}>
              <div style={{ padding: "11px 16px", fontSize: 13, color: "rgba(255,255,255,0.75)" }}>{row.feature}</div>
              {[row.free, row.pro, row.biz].map((val, j) => (
                <div key={j} style={{ padding: "11px 16px", textAlign: "center", fontSize: 13, color: val === "✓" ? "rgba(56,248,166,0.85)" : val === "—" ? "rgba(255,255,255,0.20)" : "rgba(255,255,255,0.80)" }}>{val}</div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* FAQ mini */}
      <div style={{ maxWidth: 640, margin: "60px auto 0", padding: "0 24px", textAlign: "center" }}>
        <p style={{ color: "rgba(255,255,255,0.40)", fontSize: 14, lineHeight: 1.7 }}>
          Questions? Email us at <a href="mailto:hello@dominat8.io" style={{ color: "rgba(61,240,255,0.80)" }}>hello@dominat8.io</a> · All plans include a 14-day money-back guarantee.
        </p>
      </div>

      {/* Mobile grid fix */}
      <style>{`
        @media (max-width: 768px) {
          div[style*="gridTemplateColumns: repeat(3"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </main>
  );
}
