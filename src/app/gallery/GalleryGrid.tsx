"use client";

const EXAMPLES = [
  { prompt: "A luxury plumbing company in Auckland — premium, trustworthy, modern", industry: "Construction", grad: "linear-gradient(135deg,#1a0a2e,#2d1654,#0a1628)", accent: "#7C5CFF" },
  { prompt: "A boutique coffee roastery in Brooklyn with a subscription service", industry: "Restaurant", grad: "linear-gradient(135deg,#1a0800,#3d1a08,#2a1200)", accent: "#C09A5C" },
  { prompt: "A personal injury law firm that wins cases and takes no prisoners", industry: "Law Firm", grad: "linear-gradient(135deg,#0a0f1a,#0f1e38,#152244)", accent: "#4A90E2" },
  { prompt: "A cutting-edge SaaS tool that automates customer support with AI", industry: "SaaS", grad: "linear-gradient(135deg,#050814,#0a1030,#061224)", accent: "#3DF0FF" },
  { prompt: "A high-end wedding photography studio in Melbourne", industry: "Portfolio", grad: "linear-gradient(135deg,#140808,#2a1010,#1a0c0c)", accent: "#FF4D6D" },
  { prompt: "A fitness studio in Manhattan specialising in reformer Pilates", industry: "Fitness", grad: "linear-gradient(135deg,#080808,#141414,#101010)", accent: "#38F8A6" },
  { prompt: "An artisan bakery in Paris offering bespoke wedding cakes", industry: "Restaurant", grad: "linear-gradient(135deg,#1a1008,#2d1e0a,#1a1208)", accent: "#FFD166" },
  { prompt: "A luxury real estate agency on the Gold Coast of Australia", industry: "Real Estate", grad: "linear-gradient(135deg,#0a0a08,#1a1808,#141200)", accent: "#C9A84C" },
  { prompt: "A telemedicine platform connecting patients with specialists", industry: "Medical", grad: "linear-gradient(135deg,#040d14,#081a26,#061018)", accent: "#38C9A4" },
  { prompt: "A sustainable architecture firm specialising in net-zero residential builds", industry: "Construction", grad: "linear-gradient(135deg,#081408,#102210,#0a1a0a)", accent: "#76E87A" },
  { prompt: "A venture capital firm focused on climate tech and deep science", industry: "Business", grad: "linear-gradient(135deg,#0c0c14,#141428,#0c0c1e)", accent: "#9B7FD4" },
  { prompt: "A luxury day spa and wellness retreat in Queenstown, NZ", industry: "Hospitality", grad: "linear-gradient(135deg,#14080e,#280e1a,#1a0a12)", accent: "#FFB5C8" },
  { prompt: "A cybersecurity startup protecting enterprises from AI-powered threats", industry: "Technology", grad: "linear-gradient(135deg,#040810,#080f20,#040c18)", accent: "#00E5FF" },
  { prompt: "A premium online education platform for executive leadership skills", industry: "Education", grad: "linear-gradient(135deg,#0e0a04,#201408,#180e04)", accent: "#F0924A" },
  { prompt: "A luxury safari and wildlife photography tour operator in Kenya", industry: "Travel", grad: "linear-gradient(135deg,#100c04,#201808,#180e04)", accent: "#D4A843" },
  { prompt: "A family-owned vineyard and cellar door in Marlborough, NZ", industry: "Hospitality", grad: "linear-gradient(135deg,#140a14,#281428,#1e101e)", accent: "#C078D4" },
  { prompt: "A D2C skincare brand using AI to personalise routines", industry: "E-commerce", grad: "linear-gradient(135deg,#0e0e14,#1a1a28,#121220)", accent: "#E8ACFF" },
  { prompt: "A global recruitment agency placing C-suite executives", industry: "Business", grad: "linear-gradient(135deg,#080c10,#101820,#0c1418)", accent: "#4A90E2" },
];

export default function GalleryGrid() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: 16, maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
      {EXAMPLES.map((ex, i) => (
        <a
          key={i}
          href={`/?prompt=${encodeURIComponent(ex.prompt)}`}
          style={{
            borderRadius: 18,
            border: "1px solid rgba(255,255,255,0.08)",
            overflow: "hidden",
            textDecoration: "none",
            color: "inherit",
            display: "block",
            transition: "transform 200ms ease, border-color 200ms ease",
            background: ex.grad,
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-4px)"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.18)"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.08)"; }}
        >
          <div style={{ height: 180, position: "relative", overflow: "hidden", padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 10px", borderRadius: 8, background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <div style={{ width: 40, height: 6, borderRadius: 3, background: ex.accent, opacity: 0.8 }} />
              <div style={{ display: "flex", gap: 6 }}>
                {[0,1,2].map(j => <div key={j} style={{ width: 22, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.20)" }} />)}
              </div>
            </div>
            <div style={{ flex: 1, borderRadius: 8, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", padding: "12px 14px", display: "flex", flexDirection: "column", justifyContent: "flex-end", gap: 6 }}>
              <div style={{ width: "75%", height: 8, borderRadius: 4, background: "rgba(255,255,255,0.55)" }} />
              <div style={{ width: "55%", height: 5, borderRadius: 3, background: "rgba(255,255,255,0.25)" }} />
              <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
                <div style={{ width: 52, height: 16, borderRadius: 4, background: ex.accent }} />
                <div style={{ width: 44, height: 16, borderRadius: 4, background: "rgba(255,255,255,0.10)", border: "1px solid rgba(255,255,255,0.15)" }} />
              </div>
            </div>
            <div style={{ position: "absolute", top: 12, right: 12, padding: "3px 8px", borderRadius: 999, background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.12)", fontSize: 10, color: "rgba(255,255,255,0.55)", backdropFilter: "blur(6px)" }}>
              Try this →
            </div>
          </div>
          <div style={{ padding: "12px 16px 14px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 6 }}>
              <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 999, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.10)", color: "rgba(255,255,255,0.55)" }}>{ex.industry}</span>
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.30)" }}>AI generated</span>
            </div>
            <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.65)", lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
              {ex.prompt}
            </p>
          </div>
        </a>
      ))}
      <style>{`
        @media (max-width: 900px) { .gallery-grid { grid-template-columns: 1fr 1fr !important; } }
        @media (max-width: 560px) { .gallery-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  );
}
