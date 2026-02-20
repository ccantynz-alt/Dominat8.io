export const metadata = {
  title: "Pricing — Dominat8.io",
  description: "Start free. Scale as you grow. No credit card required.",
};

const PLANS = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    desc: "Try it out, no card needed",
    accent: "rgba(255,255,255,0.04)",
    accentBorder: "rgba(255,255,255,0.10)",
    accentBtn: "rgba(255,255,255,0.08)",
    accentBtnBorder: "rgba(255,255,255,0.14)",
    accentBtnColor: "rgba(255,255,255,0.75)",
    highlight: false,
    badge: null,
    features: [
      "3 AI generations / month",
      "Vibe & style presets",
      "HTML download",
      "Mobile-responsive output",
      "Share link (7-day)",
    ],
    cta: "Get started free",
  },
  {
    name: "Starter",
    price: "$9",
    period: "per month",
    desc: "For individuals & side projects",
    accent: "rgba(255,209,102,0.05)",
    accentBorder: "rgba(255,209,102,0.22)",
    accentBtn: "rgba(255,209,102,0.18)",
    accentBtnBorder: "rgba(255,209,102,0.35)",
    accentBtnColor: "rgba(255,220,120,0.95)",
    highlight: false,
    badge: null,
    features: [
      "20 AI generations / month",
      "Refine & iterate (unlimited)",
      "Fix agent",
      "SEO scan + score",
      "Embed / iframe export",
      "Share links (90-day)",
      "Site history",
    ],
    cta: "Start Starter — $9/mo",
  },
  {
    name: "Pro",
    price: "$29",
    period: "per month",
    desc: "For freelancers & growing businesses",
    accent: "rgba(61,240,255,0.06)",
    accentBorder: "rgba(61,240,255,0.28)",
    accentBtn: "linear-gradient(135deg,#00C97A,#00B36B)",
    accentBtnBorder: "transparent",
    accentBtnColor: "#fff",
    highlight: true,
    badge: "MOST POPULAR",
    features: [
      "100 AI generations / month",
      "Everything in Starter",
      "A/B variants (2 versions, pick one)",
      "Seasonal variants (Christmas, EOFY…)",
      "Scheduled auto-rebuild (monthly)",
      "Password-protected share links",
      "Deploy to Dominat8 CDN",
      "Custom domain + auto-SSL",
      "Priority generation queue",
      "Email support",
    ],
    cta: "Start Pro — $29/mo",
  },
  {
    name: "Agency",
    price: "$99",
    period: "per month",
    desc: "For teams & high-volume builders",
    accent: "rgba(124,92,255,0.06)",
    accentBorder: "rgba(124,92,255,0.28)",
    accentBtn: "rgba(124,92,255,0.22)",
    accentBtnBorder: "rgba(124,92,255,0.40)",
    accentBtnColor: "rgba(255,255,255,0.90)",
    highlight: false,
    badge: null,
    features: [
      "500 AI generations / month",
      "Everything in Pro",
      "Scheduled rebuild (weekly)",
      "White-label output",
      "API access",
      "Bulk generation",
      "5 team seats",
      "Multi-site dashboard",
      "SLA + dedicated support",
    ],
    cta: "Start Agency — $99/mo",
  },
];

const COMPARISON = [
  { feature: "AI generations / month",        free: "3",   starter: "20",   pro: "100",  agency: "500" },
  { feature: "Overage per generation",         free: "—",   starter: "$0.49", pro: "$0.49", agency: "$0.49" },
  { feature: "Vibe / style presets",           free: "✓",   starter: "✓",    pro: "✓",    agency: "✓" },
  { feature: "HTML download",                  free: "✓",   starter: "✓",    pro: "✓",    agency: "✓" },
  { feature: "Refine & iterate",               free: "✓",   starter: "✓",    pro: "✓",    agency: "✓" },
  { feature: "Fix agent",                      free: "—",   starter: "✓",    pro: "✓",    agency: "✓" },
  { feature: "SEO scan",                       free: "—",   starter: "✓",    pro: "✓",    agency: "✓" },
  { feature: "Embed / iframe export",          free: "—",   starter: "✓",    pro: "✓",    agency: "✓" },
  { feature: "Share links",                    free: "7-day", starter: "90-day", pro: "✓", agency: "✓" },
  { feature: "Password-protected shares",      free: "—",   starter: "—",    pro: "✓",    agency: "✓" },
  { feature: "A/B variants",                   free: "—",   starter: "—",    pro: "✓",    agency: "✓" },
  { feature: "Seasonal variants",              free: "—",   starter: "—",    pro: "✓",    agency: "✓" },
  { feature: "Scheduled rebuild (monthly)",    free: "—",   starter: "—",    pro: "✓",    agency: "✓" },
  { feature: "Scheduled rebuild (weekly)",     free: "—",   starter: "—",    pro: "—",    agency: "✓" },
  { feature: "Deploy to CDN",                  free: "—",   starter: "—",    pro: "✓",    agency: "✓" },
  { feature: "Custom domain + SSL",            free: "—",   starter: "—",    pro: "✓",    agency: "✓" },
  { feature: "White-label output",             free: "—",   starter: "—",    pro: "—",    agency: "✓" },
  { feature: "API access",                     free: "—",   starter: "—",    pro: "—",    agency: "✓" },
  { feature: "Team seats",                     free: "1",   starter: "1",    pro: "1",    agency: "5" },
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
        <div style={{ display: "flex", gap: 8 }}>
          <a href="/templates" style={{ padding: "8px 18px", borderRadius: 999, border: "1px solid rgba(255,255,255,0.10)", background: "rgba(255,255,255,0.03)", color: "rgba(255,255,255,0.60)", textDecoration: "none", fontSize: 13 }}>Templates</a>
          <a href="/gallery" style={{ padding: "8px 18px", borderRadius: 999, border: "1px solid rgba(255,255,255,0.10)", background: "rgba(255,255,255,0.03)", color: "rgba(255,255,255,0.60)", textDecoration: "none", fontSize: 13 }}>Gallery</a>
          <a href="/" style={{ padding: "8px 18px", borderRadius: 999, background: "linear-gradient(135deg,#00C97A,#00B36B)", color: "#fff", textDecoration: "none", fontSize: 13, fontWeight: 600 }}>Start building →</a>
        </div>
      </nav>

      {/* Hero */}
      <div style={{ textAlign: "center", padding: "64px 24px 48px" }}>
        <div style={{ display: "inline-block", padding: "4px 14px", borderRadius: 999, border: "1px solid rgba(61,240,255,0.25)", background: "rgba(61,240,255,0.06)", color: "rgba(61,240,255,0.85)", fontSize: 12, fontWeight: 600, letterSpacing: "0.06em", marginBottom: 20 }}>
          PRICING
        </div>
        <h1 style={{ fontSize: "clamp(36px,6vw,58px)", fontWeight: 800, margin: "0 0 16px", letterSpacing: "-0.04em", lineHeight: 1.05 }}>
          Simple, honest pricing.
        </h1>
        <p style={{ fontSize: 17, color: "rgba(255,255,255,0.45)", margin: "0 0 12px", lineHeight: 1.6, maxWidth: 520, marginLeft: "auto", marginRight: "auto" }}>
          Start free. Scale as you grow. Every generation counts against your quota — no surprises.
        </p>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.28)", margin: 0 }}>
          Need more? $0.49 / generation overage on all paid plans.
        </p>
      </div>

      {/* Plans */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,minmax(0,1fr))", gap: 14, maxWidth: 1160, margin: "0 auto", padding: "0 24px" }}>
        {PLANS.map((plan) => (
          <div key={plan.name} style={{
            borderRadius: 20,
            border: `1px solid ${plan.accentBorder}`,
            background: plan.accent,
            padding: 22,
            position: "relative",
            boxShadow: plan.highlight ? "0 0 0 1px rgba(61,240,255,0.18), 0 24px 60px rgba(0,0,0,0.40)" : "0 8px 32px rgba(0,0,0,0.25)",
          }}>
            {plan.badge && (
              <div style={{ position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)", padding: "4px 14px", borderRadius: 999, background: "linear-gradient(135deg,#00C97A,#00B36B)", color: "#fff", fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", whiteSpace: "nowrap" }}>
                {plan.badge}
              </div>
            )}
            <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.50)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>{plan.name}</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 4 }}>
              <span style={{ fontSize: 38, fontWeight: 800, letterSpacing: "-0.04em" }}>{plan.price}</span>
              <span style={{ fontSize: 13, color: "rgba(255,255,255,0.38)" }}>/ {plan.period}</span>
            </div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", marginBottom: 18, lineHeight: 1.4 }}>{plan.desc}</div>
            <a href="/" style={{
              display: "block", textAlign: "center", padding: "11px 0",
              borderRadius: 11, border: `1px solid ${plan.accentBtnBorder}`,
              background: plan.accentBtn, color: plan.accentBtnColor,
              fontSize: 12, fontWeight: 600, textDecoration: "none",
              marginBottom: 18,
            }}>
              {plan.cta}
            </a>
            <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
              {plan.features.map((f) => (
                <div key={f} style={{ display: "flex", alignItems: "flex-start", gap: 7, fontSize: 12, color: "rgba(255,255,255,0.72)", lineHeight: 1.4 }}>
                  <span style={{ color: "rgba(56,248,166,0.90)", flexShrink: 0, marginTop: 1 }}>✓</span>
                  {f}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Comparison table */}
      <div style={{ maxWidth: 1060, margin: "60px auto 0", padding: "0 24px" }}>
        <h2 style={{ textAlign: "center", fontSize: 26, fontWeight: 700, letterSpacing: "-0.03em", marginBottom: 24, color: "#fff" }}>
          Full comparison
        </h2>
        <div style={{ borderRadius: 16, border: "1px solid rgba(255,255,255,0.08)", overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr", background: "rgba(255,255,255,0.04)", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
            <div style={{ padding: "11px 16px", fontSize: 11, color: "rgba(255,255,255,0.40)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>Feature</div>
            {["Free", "Starter", "Pro", "Agency"].map((h) => (
              <div key={h} style={{ padding: "11px 12px", textAlign: "center", fontSize: 12, fontWeight: 700, color: h === "Pro" ? "rgba(61,240,255,0.90)" : h === "Starter" ? "rgba(255,209,102,0.85)" : h === "Agency" ? "rgba(124,92,255,0.85)" : "rgba(255,255,255,0.55)" }}>{h}</div>
            ))}
          </div>
          {COMPARISON.map((row, i) => (
            <div key={row.feature} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr", borderBottom: i < COMPARISON.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none", background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.02)" }}>
              <div style={{ padding: "10px 16px", fontSize: 12, color: "rgba(255,255,255,0.72)" }}>{row.feature}</div>
              {[row.free, row.starter, row.pro, row.agency].map((val, j) => (
                <div key={j} style={{ padding: "10px 12px", textAlign: "center", fontSize: 12, color: val === "✓" ? "rgba(56,248,166,0.85)" : val === "—" ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.78)" }}>{val}</div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Overage callout */}
      <div style={{ maxWidth: 700, margin: "32px auto 0", padding: "0 24px" }}>
        <div style={{ borderRadius: 14, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", padding: "16px 20px", display: "flex", alignItems: "center", gap: 14 }}>
          <span style={{ fontSize: 22, flexShrink: 0 }}>⚡</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.85)", marginBottom: 4 }}>Need to go over your quota?</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", lineHeight: 1.6 }}>
              Any paid plan can generate beyond its monthly quota at <strong style={{ color: "rgba(255,255,255,0.75)" }}>$0.49 per extra generation</strong> — billed at end of month. No surprises, no upgrade pressure.
            </div>
          </div>
        </div>
      </div>

      {/* FAQ mini */}
      <div style={{ maxWidth: 640, margin: "48px auto 0", padding: "0 24px", textAlign: "center" }}>
        <p style={{ color: "rgba(255,255,255,0.38)", fontSize: 13, lineHeight: 1.7 }}>
          All plans include a <strong style={{ color: "rgba(255,255,255,0.60)" }}>14-day money-back guarantee</strong>. Questions? <a href="mailto:hello@dominat8.io" style={{ color: "rgba(61,240,255,0.75)" }}>hello@dominat8.io</a>
        </p>
      </div>

      <style>{`
        @media (max-width: 900px) {
          div[style*="gridTemplateColumns: repeat(4"] { grid-template-columns: 1fr 1fr !important; }
          div[style*="gridTemplateColumns: 2fr 1fr 1fr 1fr 1fr"] { grid-template-columns: 2fr 1fr 1fr !important; }
          div[style*="gridTemplateColumns: 2fr 1fr 1fr 1fr 1fr"] > div:nth-child(4),
          div[style*="gridTemplateColumns: 2fr 1fr 1fr 1fr 1fr"] > div:nth-child(5) { display: none; }
        }
        @media (max-width: 560px) {
          div[style*="gridTemplateColumns: repeat(4"] { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </main>
  );
}
