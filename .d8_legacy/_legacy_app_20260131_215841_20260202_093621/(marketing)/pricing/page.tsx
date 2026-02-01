import Link from "next/link";
import { D8Section } from "../_d8/D8Section";
import { D8Card } from "../_d8/D8Bits";

export default function Page() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(1200px 800px at 65% 5%, rgba(168,85,247,0.20), rgba(0,0,0,0) 60%), radial-gradient(900px 700px at 15% 20%, rgba(59,130,246,0.12), rgba(0,0,0,0) 62%), linear-gradient(180deg, #07070B 0%, #07070B 40%, #05050A 100%)",
        color: "#EDEAF7",
        fontFamily:
          "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, 'Apple Color Emoji', 'Segoe UI Emoji'",
        padding: "28px 16px 56px",
      }}
    >
      <div style={{ width: "100%", maxWidth: 1160, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "10px 0 18px" }}>
          <Link href="/" style={{ color: "rgba(243,238,255,0.95)", textDecoration: "none", fontWeight: 900, letterSpacing: "0.14em", textTransform: "uppercase", fontSize: 12 }}>
            Dominat8
          </Link>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Link href="/templates" style={{ color: "rgba(237,234,247,0.82)", textDecoration: "none", padding: "8px 10px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", fontSize: 13 }}>
              Templates
            </Link>
            <Link href="/pricing" style={{ color: "rgba(237,234,247,0.82)", textDecoration: "none", padding: "8px 10px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", fontSize: 13 }}>
              Pricing
            </Link>
          </div>
        </div>

        <D8Section eyebrow="Premium SaaS" title="Pricing" lead="Choose a plan and ship a premium site quickly â€” with consistent section framing and depth." tone="glass">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 12 }}>
            <D8Card>
  <div style={{ fontSize: 12, fontWeight: 900, letterSpacing: ".12em", opacity: 0.75, textTransform: "uppercase" }}>SYSTEM</div>
  <div style={{ marginTop: 6, fontSize: 16, fontWeight: 950, letterSpacing: "-0.02em" }}>Consistent sections</div>
  <div style={{ marginTop: 8, fontSize: 14, lineHeight: 1.6, opacity: 0.78 }}>Premium framing and hierarchy across marketing pages.</div>
</D8Card>
            <D8Card>
  <div style={{ fontSize: 12, fontWeight: 900, letterSpacing: ".12em", opacity: 0.75, textTransform: "uppercase" }}>LOCKED</div>
  <div style={{ marginTop: 6, fontSize: 16, fontWeight: 950, letterSpacing: "-0.02em" }}>Inline-safe</div>
  <div style={{ marginTop: 8, fontSize: 14, lineHeight: 1.6, opacity: 0.78 }}>Core content renders intentionally even if utility classes fail.</div>
</D8Card>
            <D8Card>
  <div style={{ fontSize: 12, fontWeight: 900, letterSpacing: ".12em", opacity: 0.75, textTransform: "uppercase" }}>CONVERT</div>
  <div style={{ marginTop: 6, fontSize: 16, fontWeight: 950, letterSpacing: "-0.02em" }}>Conversion-first</div>
  <div style={{ marginTop: 8, fontSize: 14, lineHeight: 1.6, opacity: 0.78 }}>Clear CTAs and predictable page rhythm.</div>
</D8Card>
          </div>
        </D8Section>

        <div style={{ marginTop: 34, opacity: 0.85, fontSize: 12, color: "rgba(237,234,247,0.65)", display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div>Â© 2026 Dominat8</div>
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
            <Link href="/privacy" style={{ color: "rgba(237,234,247,0.70)", textDecoration: "none", borderBottom: "1px solid rgba(237,234,247,0.20)", paddingBottom: 2 }}>Privacy</Link>
            <Link href="/terms" style={{ color: "rgba(237,234,247,0.70)", textDecoration: "none", borderBottom: "1px solid rgba(237,234,247,0.20)", paddingBottom: 2 }}>Terms</Link>
            <Link href="/contact" style={{ color: "rgba(237,234,247,0.70)", textDecoration: "none", borderBottom: "1px solid rgba(237,234,247,0.20)", paddingBottom: 2 }}>Contact</Link>
          </div>
        </div>
      </div>
    </main>
  );
}