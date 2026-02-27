import { SiteNav } from "@/components/shared/SiteNav";
import { SiteFooter } from "@/components/shared/SiteFooter";

export const metadata = {
  title: "About — Dominat8.io",
  description: "We're building the future of websites. Every business deserves a world-class online presence, built in seconds.",
};

const STATS = [
  { value: "50,000+", label: "Websites generated" },
  { value: "180+", label: "Countries reached" },
  { value: "< 30s", label: "Average build time" },
  { value: "4.9 ★", label: "User satisfaction" },
];

const VALUES = [
  {
    icon: "⚡",
    title: "Speed without compromise",
    body: "We believe building a website shouldn't take weeks. Every architectural decision we make is in service of one goal: getting your vision live faster than anyone thought possible.",
  },
  {
    icon: "✦",
    title: "Quality as the default",
    body: "Fast doesn't mean cheap. Our AI is trained on the world's best-designed sites. The output isn't a rough draft — it's something you'd actually be proud to show a client.",
  },
  {
    icon: "🌐",
    title: "Democratising design",
    body: "Before AI, a premium website cost $10,000–$50,000. We're making that out of reach. A solo founder in Lagos should have the same competitive edge online as a Silicon Valley startup.",
  },
  {
    icon: "🔒",
    title: "Radical transparency",
    body: "We don't lock you in. Every site you build is yours — download the HTML, host it anywhere, no strings attached. We earn your loyalty by being genuinely useful.",
  },
];

const TIMELINE = [
  { year: "2024", event: "Founded with a conviction that AI could replace the entire web design workflow." },
  { year: "Q1 2025", event: "First public beta. 1,000 sites generated in the first week." },
  { year: "Q2 2025", event: "Crossed 10,000 active users. Launched the Pro tier with CDN deployment." },
  { year: "Q3 2025", event: "38-template library. Business tier with API access and team features." },
  { year: "2026", event: "Share links, white-label output, and agent automation suite in production." },
];

export default function AboutPage() {
  return (
    <main style={{
      minHeight: "100vh",
      background: "#06080e",
      color: "#e9eef7",
      fontFamily: "'Outfit', ui-sans-serif,system-ui,-apple-system,sans-serif",
      padding: "0 0 80px",
    }}>
      <SiteNav />

      {/* Hero */}
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "120px 24px 56px", textAlign: "center" }}>
        <div style={{ display: "inline-block", padding: "4px 14px", borderRadius: 999, border: "1px solid rgba(61,240,255,0.25)", background: "rgba(61,240,255,0.06)", color: "rgba(61,240,255,0.85)", fontSize: 12, fontWeight: 600, letterSpacing: "0.06em", marginBottom: 20 }}>
          ABOUT
        </div>
        <h1 style={{ fontSize: "clamp(32px,5vw,52px)", fontWeight: 800, margin: "0 0 20px", letterSpacing: "-0.04em", lineHeight: 1.05 }}>
          Every business deserves<br />a world-class website.
        </h1>
        <p style={{ fontSize: 18, color: "rgba(255,255,255,0.55)", margin: 0, lineHeight: 1.7, maxWidth: 600, marginLeft: "auto", marginRight: "auto" }}>
          We started Dominat8 because great design was locked behind agencies, budgets, and timelines.
          AI has changed that forever — and we're leading the charge.
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 1, maxWidth: 900, margin: "0 auto 64px", padding: "0 24px", borderRadius: 16, overflow: "hidden", border: "1px solid rgba(255,255,255,0.08)" }}>
        {STATS.map((s, i) => (
          <div key={i} style={{
            padding: "28px 20px",
            textAlign: "center",
            background: i % 2 === 0 ? "rgba(255,255,255,0.02)" : "transparent",
            borderRight: i < STATS.length - 1 ? "1px solid rgba(255,255,255,0.06)" : "none",
          }}>
            <div style={{ fontSize: "clamp(24px,3vw,36px)", fontWeight: 900, letterSpacing: "-0.03em", color: "rgba(61,240,255,0.90)", marginBottom: 6 }}>{s.value}</div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.45)" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Story */}
      <div style={{ maxWidth: 720, margin: "0 auto 72px", padding: "0 24px" }}>
        <div style={{ padding: "1px 0 1px 24px", borderLeft: "2px solid rgba(61,240,255,0.35)", marginBottom: 32 }}>
          <h2 style={{ fontSize: "clamp(22px,3vw,30px)", fontWeight: 800, margin: "0 0 16px", letterSpacing: "-0.03em" }}>Why we built this</h2>
          <div style={{ fontSize: 16, color: "rgba(255,255,255,0.62)", lineHeight: 1.8, display: "flex", flexDirection: "column", gap: 16 }}>
            <p style={{ margin: 0 }}>
              In 2024, most small businesses still didn't have a real website. Not because they didn't want one — but because the
              process was too slow, too expensive, or too complicated. Agencies quoted $5,000 minimum. Website builders
              required hours of dragging and dropping. Templates looked like templates.
            </p>
            <p style={{ margin: 0 }}>
              We asked a different question: what if you could just <em>describe</em> your business,
              and the website appeared? Not a wireframe. Not a generic template. A complete, production-ready site
              with your brand identity, your services, your story — built in the time it takes to brew a coffee.
            </p>
            <p style={{ margin: 0 }}>
              That's Dominat8. We've now generated over 50,000 websites across 180 countries.
              From solo freelancers to agencies. From coffee shops in Wellington to law firms in Chicago.
              And we're just getting started.
            </p>
          </div>
        </div>
      </div>

      {/* Values */}
      <div style={{ maxWidth: 1000, margin: "0 auto 72px", padding: "0 24px" }}>
        <h2 style={{ textAlign: "center", fontSize: 28, fontWeight: 700, letterSpacing: "-0.03em", margin: "0 0 36px" }}>What we believe</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 16 }}>
          {VALUES.map((v, i) => (
            <div key={i} style={{
              padding: 24,
              borderRadius: 16,
              border: "1px solid rgba(255,255,255,0.08)",
              background: "rgba(255,255,255,0.02)",
            }}>
              <div style={{ fontSize: 28, marginBottom: 12 }}>{v.icon}</div>
              <h3 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 10px", letterSpacing: "-0.02em" }}>{v.title}</h3>
              <p style={{ margin: 0, fontSize: 14, color: "rgba(255,255,255,0.55)", lineHeight: 1.7 }}>{v.body}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Timeline */}
      <div style={{ maxWidth: 600, margin: "0 auto 72px", padding: "0 24px" }}>
        <h2 style={{ textAlign: "center", fontSize: 28, fontWeight: 700, letterSpacing: "-0.03em", margin: "0 0 36px" }}>How we got here</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {TIMELINE.map((t, i) => (
            <div key={i} style={{ display: "flex", gap: 20, position: "relative" }}>
              {/* Line */}
              {i < TIMELINE.length - 1 && (
                <div style={{ position: "absolute", left: 52, top: 28, bottom: -8, width: 1, background: "rgba(255,255,255,0.08)" }} />
              )}
              <div style={{ width: 84, flexShrink: 0, paddingTop: 4 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: "rgba(61,240,255,0.80)", whiteSpace: "nowrap" }}>{t.year}</span>
              </div>
              <div style={{ paddingBottom: 28, flex: 1 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "rgba(61,240,255,0.60)", marginBottom: 8, border: "1px solid rgba(61,240,255,0.30)" }} />
                <p style={{ margin: 0, fontSize: 14, color: "rgba(255,255,255,0.65)", lineHeight: 1.6 }}>{t.event}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div style={{ textAlign: "center", padding: "0 24px" }}>
        <h2 style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.03em", margin: "0 0 12px" }}>Be part of what comes next.</h2>
        <p style={{ fontSize: 15, color: "rgba(255,255,255,0.45)", margin: "0 0 24px" }}>Questions? Ideas? We'd love to hear from you.</p>
        <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
          <a href="/build" style={{ display: "inline-block", padding: "14px 32px", borderRadius: 14, background: "rgba(61,240,255,0.14)", border: "1px solid rgba(61,240,255,0.40)", color: "rgba(61,240,255,0.95)", textDecoration: "none", fontSize: 15, fontWeight: 700 }}>
            Start building →
          </a>
          <a href="mailto:hello@dominat8.io" style={{ display: "inline-block", padding: "14px 32px", borderRadius: 14, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.70)", textDecoration: "none", fontSize: 15, fontWeight: 600 }}>
            Say hello
          </a>
        </div>
      </div>

      <style>{`
        @media (max-width: 700px) {
          div[style*="gridTemplateColumns: repeat(4"] { grid-template-columns: 1fr 1fr !important; }
          div[style*="gridTemplateColumns: repeat(2"] { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 400px) {
          div[style*="gridTemplateColumns: repeat(4"] { grid-template-columns: 1fr !important; }
        }
      `}</style>
      <SiteFooter />
    </main>
  );
}
