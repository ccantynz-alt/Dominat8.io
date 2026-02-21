export const metadata = {
  title: "Gallery — AI-Generated Websites | Dominat8.io",
  description: "Real websites built by AI in under 30 seconds. 18+ industries. Click any example to generate yours instantly.",
};

const EXAMPLES = [
  { prompt: "A luxury plumbing company in Auckland — premium, trustworthy, modern", industry: "Construction", vibe: "Luxury", time: "24s", grad: "linear-gradient(145deg,#0c0818 0%,#160d2e 50%,#0a1020 100%)", accent: "#C09A5C", sections: ["Services", "About", "Pricing", "Contact"] },
  { prompt: "A boutique coffee roastery in Brooklyn with a subscription service", industry: "Food & Drink", vibe: "Playful", time: "19s", grad: "linear-gradient(145deg,#120800 0%,#2a1000 50%,#1a0e00 100%)", accent: "#C8834A", sections: ["Our Coffee", "Subscribe", "Events", "Shop"] },
  { prompt: "A personal injury law firm that wins cases and takes no prisoners", industry: "Law Firm", vibe: "Bold", time: "22s", grad: "linear-gradient(145deg,#080e1a 0%,#0c1830 50%,#0a1220 100%)", accent: "#4A90E2", sections: ["Practice Areas", "Results", "Team", "Free Consult"] },
  { prompt: "A cutting-edge SaaS tool that automates customer support with AI", industry: "SaaS", vibe: "Dark", time: "28s", grad: "linear-gradient(145deg,#040810 0%,#080f22 50%,#050a18 100%)", accent: "#3DF0FF", sections: ["Features", "Pricing", "Integrations", "Docs"] },
  { prompt: "A high-end wedding photography studio in Melbourne", industry: "Portfolio", vibe: "Luxury", time: "21s", grad: "linear-gradient(145deg,#120808 0%,#200c0c 50%,#160a0a 100%)", accent: "#FF4D6D", sections: ["Portfolio", "Packages", "About", "Book"] },
  { prompt: "A fitness studio in Manhattan specialising in reformer Pilates", industry: "Fitness", vibe: "Minimal", time: "17s", grad: "linear-gradient(145deg,#060808 0%,#0c1010 50%,#080c0c 100%)", accent: "#38F8A6", sections: ["Classes", "Trainers", "Membership", "Schedule"] },
  { prompt: "An artisan bakery in Paris offering bespoke wedding cakes", industry: "Food & Drink", vibe: "Playful", time: "23s", grad: "linear-gradient(145deg,#120e04 0%,#201800 50%,#160e00 100%)", accent: "#FFD166", sections: ["Our Cakes", "Gallery", "Order", "Contact"] },
  { prompt: "A luxury real estate agency on the Gold Coast of Australia", industry: "Real Estate", vibe: "Luxury", time: "26s", grad: "linear-gradient(145deg,#0a0a06 0%,#161200 50%,#100c00 100%)", accent: "#C9A84C", sections: ["Listings", "Sold", "Team", "Appraisal"] },
  { prompt: "A telemedicine platform connecting patients with specialists", industry: "Medical", vibe: "Corporate", time: "29s", grad: "linear-gradient(145deg,#040c10 0%,#081820 50%,#060e14 100%)", accent: "#38C9A4", sections: ["How it Works", "Specialties", "Pricing", "Sign Up"] },
  { prompt: "A sustainable architecture firm specialising in net-zero residential builds", industry: "Architecture", vibe: "Minimal", time: "25s", grad: "linear-gradient(145deg,#060a06 0%,#0e160e 50%,#081008 100%)", accent: "#76E87A", sections: ["Projects", "Process", "Studio", "Contact"] },
  { prompt: "A venture capital firm focused on climate tech and deep science", industry: "Finance", vibe: "Corporate", time: "27s", grad: "linear-gradient(145deg,#080a12 0%,#101220 50%,#0c0e18 100%)", accent: "#6B7FD4", sections: ["Portfolio", "Thesis", "Team", "Apply"] },
  { prompt: "A luxury day spa and wellness retreat in Queenstown, NZ", industry: "Wellness", vibe: "Luxury", time: "20s", grad: "linear-gradient(145deg,#120610 0%,#200e1a 50%,#180a14 100%)", accent: "#FFB5C8", sections: ["Treatments", "Retreats", "Gift Cards", "Book"] },
  { prompt: "A cybersecurity startup protecting enterprises from AI-powered threats", industry: "Technology", vibe: "Dark", time: "31s", grad: "linear-gradient(145deg,#030610 0%,#060c1c 50%,#040a14 100%)", accent: "#00E5FF", sections: ["Platform", "Solutions", "Pricing", "Demo"] },
  { prompt: "A premium online education platform for executive leadership skills", industry: "Education", vibe: "Corporate", time: "26s", grad: "linear-gradient(145deg,#0a0804 0%,#160e06 50%,#100c04 100%)", accent: "#F0924A", sections: ["Programs", "Faculty", "Outcomes", "Enroll"] },
  { prompt: "A luxury safari and wildlife photography tour operator in Kenya", industry: "Travel", vibe: "Bold", time: "24s", grad: "linear-gradient(145deg,#0c0a04 0%,#181406 50%,#140e04 100%)", accent: "#D4A843", sections: ["Tours", "Gallery", "Conservation", "Book"] },
  { prompt: "A family-owned vineyard and cellar door in Marlborough, NZ", industry: "Food & Drink", vibe: "Luxury", time: "22s", grad: "linear-gradient(145deg,#120814 0%,#1e1020 50%,#160c18 100%)", accent: "#C078D4", sections: ["Wines", "Cellar Door", "Events", "Shop"] },
  { prompt: "A D2C skincare brand using AI to personalise routines", industry: "E-commerce", vibe: "Minimal", time: "28s", grad: "linear-gradient(145deg,#0c0c14 0%,#16162a 50%,#101020 100%)", accent: "#E8ACFF", sections: ["Quiz", "Products", "Science", "Reviews"] },
  { prompt: "A global recruitment agency placing C-suite executives", industry: "Business", vibe: "Corporate", time: "25s", grad: "linear-gradient(145deg,#060a0e 0%,#0e1620 50%,#0a1018 100%)", accent: "#4A90E2", sections: ["For Executives", "For Boards", "Process", "Contact"] },
];

export default function GalleryPage() {
  return (
    <main style={{
      minHeight: "100vh",
      background: "#06080e",
      color: "#e9eef7",
      fontFamily: "'Outfit', ui-sans-serif,system-ui,-apple-system,sans-serif",
      padding: "0 0 80px",
    }}>

      {/* Ambient background */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
        <div style={{ position: "absolute", width: 700, height: 500, top: -200, left: -100, borderRadius: "50%", background: "radial-gradient(circle, rgba(61,240,255,0.04) 0%, transparent 70%)" }} />
        <div style={{ position: "absolute", width: 600, height: 400, top: 100, right: -150, borderRadius: "50%", background: "radial-gradient(circle, rgba(0,201,122,0.035) 0%, transparent 70%)" }} />
      </div>

      {/* Nav */}
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 32px", borderBottom: "1px solid rgba(255,255,255,0.06)", position: "sticky", top: 0, zIndex: 50, background: "rgba(6,8,14,0.80)", backdropFilter: "blur(20px)" }}>
        <a href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none", color: "inherit" }}>
          <span style={{ fontSize: 17, fontWeight: 800, letterSpacing: "-0.04em" }}>D8</span>
          <span style={{ width: 5, height: 5, borderRadius: "50%", background: "rgba(61,240,255,0.7)", display: "inline-block" }} />
          <span style={{ fontSize: 13, fontWeight: 500, color: "rgba(255,255,255,0.45)" }}>Dominat8.io</span>
        </a>
        <div style={{ display: "flex", gap: 8 }}>
          <a href="/templates" style={{ padding: "8px 16px", borderRadius: 999, border: "1px solid rgba(255,255,255,0.10)", background: "rgba(255,255,255,0.03)", color: "rgba(255,255,255,0.60)", textDecoration: "none", fontSize: 13 }}>Templates</a>
          <a href="/pricing" style={{ padding: "8px 16px", borderRadius: 999, border: "1px solid rgba(255,255,255,0.10)", background: "rgba(255,255,255,0.03)", color: "rgba(255,255,255,0.60)", textDecoration: "none", fontSize: 13 }}>Pricing</a>
          <a href="/" style={{ padding: "8px 16px", borderRadius: 999, background: "linear-gradient(135deg,#00C97A,#00B36B)", color: "#fff", textDecoration: "none", fontSize: 13, fontWeight: 700, boxShadow: "0 2px 10px rgba(0,201,122,0.30)" }}>Start building →</a>
        </div>
      </nav>

      {/* Hero */}
      <div style={{ textAlign: "center", padding: "64px 24px 48px", position: "relative", zIndex: 1 }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "5px 14px", borderRadius: 999, border: "1px solid rgba(61,240,255,0.25)", background: "rgba(61,240,255,0.06)", color: "rgba(61,240,255,0.85)", fontSize: 11, fontWeight: 700, letterSpacing: "0.10em", textTransform: "uppercase", marginBottom: 22 }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "rgba(61,240,255,0.85)", display: "inline-block" }} />
          Gallery — {EXAMPLES.length} examples
        </div>
        <h1 style={{ fontSize: "clamp(34px,5.5vw,58px)", fontWeight: 800, margin: "0 0 16px", letterSpacing: "-0.04em", lineHeight: 1.05 }}>
          Real sites. Real prompts.<br />
          <span style={{ background: "linear-gradient(95deg,#3DF0FF 0%,#38F8A6 55%,#00D47A 100%)", WebkitBackgroundClip: "text", backgroundClip: "text", WebkitTextFillColor: "transparent" }}>Generated in seconds.</span>
        </h1>
        <p style={{ fontSize: 16, color: "rgba(255,255,255,0.40)", margin: 0, lineHeight: 1.6, maxWidth: 500, marginLeft: "auto", marginRight: "auto" }}>
          Every site below was created from a single text description. No editing, no templates. Click any card to generate one like it.
        </p>

        {/* Stats */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 32, marginTop: 32, flexWrap: "wrap" }}>
          {[
            { v: `${EXAMPLES.length}+`, l: "examples shown" },
            { v: "~24s", l: "avg generation" },
            { v: "100%", l: "AI-authored" },
          ].map((s, i) => (
            <div key={i} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: "#fff", letterSpacing: "-0.03em" }}>{s.v}</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: 18, maxWidth: 1200, margin: "0 auto", padding: "0 24px", position: "relative", zIndex: 1 }}>
        {EXAMPLES.map((ex, i) => (
          <a
            key={i}
            href={`/?prompt=${encodeURIComponent(ex.prompt)}`}
            style={{
              borderRadius: 20,
              border: "1px solid rgba(255,255,255,0.08)",
              overflow: "hidden",
              textDecoration: "none",
              color: "inherit",
              display: "block",
              transition: "transform 200ms ease, border-color 200ms ease, box-shadow 200ms ease",
              background: ex.grad,
            }}
            onMouseEnter={e => {
              const el = e.currentTarget as HTMLElement;
              el.style.transform = "translateY(-5px)";
              el.style.borderColor = `${ex.accent}40`;
              el.style.boxShadow = `0 16px 50px rgba(0,0,0,0.50), 0 0 0 1px ${ex.accent}18`;
            }}
            onMouseLeave={e => {
              const el = e.currentTarget as HTMLElement;
              el.style.transform = "translateY(0)";
              el.style.borderColor = "rgba(255,255,255,0.08)";
              el.style.boxShadow = "none";
            }}
          >
            {/* Browser chrome mockup */}
            <div style={{ height: 200, position: "relative", overflow: "hidden" }}>
              {/* Browser bar */}
              <div style={{ padding: "8px 12px", background: "rgba(0,0,0,0.30)", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ display: "flex", gap: 4 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: "rgba(255,90,80,0.55)" }} />
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: "rgba(255,180,0,0.55)" }} />
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: "rgba(40,210,40,0.55)" }} />
                </div>
                <div style={{ flex: 1, height: 16, borderRadius: 4, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", padding: "0 8px" }}>
                  <div style={{ width: 80, height: 5, borderRadius: 2, background: "rgba(255,255,255,0.15)" }} />
                </div>
              </div>

              {/* Site preview content */}
              <div style={{ padding: "12px 14px", display: "flex", flexDirection: "column", gap: 8 }}>
                {/* Nav */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ width: 44, height: 7, borderRadius: 3, background: ex.accent, opacity: 0.75 }} />
                  <div style={{ display: "flex", gap: 5 }}>
                    {[40, 32, 28, 36].map((w, j) => <div key={j} style={{ width: w, height: 5, borderRadius: 2, background: "rgba(255,255,255,0.18)" }} />)}
                  </div>
                </div>

                {/* Hero block */}
                <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 8, padding: "10px 12px", display: "flex", flexDirection: "column", gap: 5 }}>
                  <div style={{ width: "80%", height: 9, borderRadius: 4, background: "rgba(255,255,255,0.50)" }} />
                  <div style={{ width: "60%", height: 6, borderRadius: 3, background: "rgba(255,255,255,0.22)" }} />
                  <div style={{ width: "45%", height: 5, borderRadius: 3, background: "rgba(255,255,255,0.14)" }} />
                  <div style={{ display: "flex", gap: 5, marginTop: 4 }}>
                    <div style={{ width: 48, height: 14, borderRadius: 5, background: ex.accent }} />
                    <div style={{ width: 38, height: 14, borderRadius: 5, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.14)" }} />
                  </div>
                </div>

                {/* Section cards */}
                <div style={{ display: "flex", gap: 6 }}>
                  {ex.sections.slice(0, 3).map((s, j) => (
                    <div key={j} style={{ flex: 1, background: "rgba(255,255,255,0.035)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 6, padding: "6px 7px" }}>
                      <div style={{ width: "100%", height: 4, borderRadius: 2, background: ex.accent, opacity: 0.4, marginBottom: 4 }} />
                      <div style={{ width: "70%", height: 3, borderRadius: 2, background: "rgba(255,255,255,0.15)" }} />
                      <div style={{ width: "50%", height: 3, borderRadius: 2, background: "rgba(255,255,255,0.08)", marginTop: 2 }} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Time badge */}
              <div style={{ position: "absolute", top: 38, right: 12, padding: "3px 9px", borderRadius: 999, background: "rgba(0,0,0,0.60)", border: `1px solid ${ex.accent}30`, fontSize: 10, color: ex.accent, backdropFilter: "blur(6px)", fontWeight: 700 }}>
                ⚡ {ex.time}
              </div>

              {/* Try badge */}
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", opacity: 0, transition: "opacity 200ms ease", background: "rgba(0,0,0,0.35)", backdropFilter: "blur(2px)" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = "1"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = "0"; }}
              >
                <div style={{ padding: "8px 20px", borderRadius: 12, background: ex.accent, color: "#000", fontSize: 13, fontWeight: 800 }}>
                  Generate this →
                </div>
              </div>
            </div>

            {/* Meta */}
            <div style={{ padding: "14px 16px 16px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 8, flexWrap: "wrap" }}>
                <span style={{ fontSize: 10, padding: "3px 9px", borderRadius: 999, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.10)", color: "rgba(255,255,255,0.55)", fontWeight: 600, letterSpacing: "0.03em" }}>{ex.industry}</span>
                <span style={{ fontSize: 10, padding: "3px 9px", borderRadius: 999, background: `${ex.accent}10`, border: `1px solid ${ex.accent}28`, color: ex.accent, fontWeight: 600 }}>{ex.vibe}</span>
                <span style={{ marginLeft: "auto", fontSize: 10, color: "rgba(255,255,255,0.25)" }}>AI generated</span>
              </div>
              <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.60)", lineHeight: 1.55, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                &ldquo;{ex.prompt}&rdquo;
              </p>
            </div>
          </a>
        ))}
      </div>

      {/* CTA */}
      <div style={{ textAlign: "center", padding: "64px 24px 0", position: "relative", zIndex: 1 }}>
        <div style={{ maxWidth: 480, margin: "0 auto" }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(61,240,255,0.55)", marginBottom: 12 }}>Your turn</div>
          <h2 style={{ fontSize: "clamp(24px,3.5vw,36px)", fontWeight: 800, letterSpacing: "-0.03em", margin: "0 0 12px" }}>Describe your business.<br />Watch it appear.</h2>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.40)", margin: "0 0 28px", lineHeight: 1.6 }}>No account required. First 3 sites are free.</p>
          <a href="/" style={{ display: "inline-block", padding: "14px 36px", borderRadius: 14, background: "linear-gradient(135deg,#00C97A,#00B36B)", color: "#fff", textDecoration: "none", fontSize: 15, fontWeight: 800, boxShadow: "0 4px 24px rgba(0,201,122,0.40)", letterSpacing: "-0.01em" }}>
            Start building for free →
          </a>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) { main > div:nth-of-type(3) { grid-template-columns: repeat(2,minmax(0,1fr)) !important; } }
        @media (max-width: 560px) { main > div:nth-of-type(3) { grid-template-columns: 1fr !important; } }
      `}</style>
    </main>
  );
}
