cat > src/app/p/[projectId]/PublicRenderer.tsx <<'EOF'
// src/app/p/[projectId]/PublicRenderer.tsx

import type { TemplateScaffoldSection } from "@/app/lib/templateScaffolds";
import AutoScroll from "./AutoScroll";

type Props = {
  sections: TemplateScaffoldSection[];
  initialSectionId?: string | null;
};

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        border: "1px solid rgba(0,0,0,0.10)",
        borderRadius: 18,
        padding: 18,
        background: "white",
      }}
    >
      {children}
    </div>
  );
}

function sectionAnchorId(type: string): string {
  const t = (type || "").toLowerCase();
  if (t === "hero") return "hero";
  if (t === "features") return "features";
  if (t === "pricing") return "pricing";
  if (t === "testimonials") return "testimonials";
  if (t === "faq") return "faq";
  if (t === "contact") return "contact";
  if (t === "cta") return "cta";
  return "about";
}

export default function PublicRenderer({ sections, initialSectionId }: Props) {
  return (
    <div style={{ background: "linear-gradient(180deg, #fafafa, #ffffff)" }}>
      <AutoScroll targetId={initialSectionId || null} />

      <div style={{ maxWidth: 1020, margin: "0 auto", padding: 24 }}>
        {/* Top bar */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "10px 0 22px",
          }}
        >
          <a href="/" style={{ fontWeight: 900, letterSpacing: -0.2, color: "inherit", textDecoration: "none" }}>
            YourSite
          </a>
          <div style={{ display: "flex", gap: 14, opacity: 0.8, fontSize: 14 }}>
            <a href="/features" style={{ color: "inherit", textDecoration: "none" }}>Features</a>
            <a href="/pricing" style={{ color: "inherit", textDecoration: "none" }}>Pricing</a>
            <a href="/faq" style={{ color: "inherit", textDecoration: "none" }}>FAQ</a>
            <a href="/contact" style={{ color: "inherit", textDecoration: "none" }}>Contact</a>
          </div>
        </div>

        {/* Render sections */}
        <div style={{ display: "grid", gap: 16 }}>
          {sections.map((sec) => {
            const anchorId = sectionAnchorId(sec.type);
            const key = sec.id || `${sec.type}:${anchorId}`;

            switch (sec.type) {
              case "hero":
                return (
                  <section
                    key={key}
                    id={anchorId}
                    style={{
                      scrollMarginTop: 90,
                      borderRadius: 22,
                      padding: 22,
                      border: "1px solid rgba(0,0,0,0.10)",
                      background: "white",
                    }}
                  >
                    <div style={{ display: "grid", gap: 10 }}>
                      <h1 style={{ fontSize: 44, lineHeight: 1.05, margin: 0, fontWeight: 950, letterSpacing: -0.8 }}>
                        {sec.heading || "Welcome"}
                      </h1>
                      {sec.subheading ? (
                        <p style={{ margin: 0, fontSize: 18, opacity: 0.85, maxWidth: 720 }}>
                          {sec.subheading}
                        </p>
                      ) : null}

                      <div style={{ display: "flex", gap: 10, marginTop: 10, flexWrap: "wrap" }}>
                        <a
                          href="/contact"
                          style={{
                            display: "inline-block",
                            padding: "12px 16px",
                            borderRadius: 14,
                            background: "black",
                            color: "white",
                            textDecoration: "none",
                            fontWeight: 900,
                          }}
                        >
                          Get Started
                        </a>
                        <a
                          href="/features"
                          style={{
                            display: "inline-block",
                            padding: "12px 16px",
                            borderRadius: 14,
                            background: "white",
                            color: "black",
                            textDecoration: "none",
                            fontWeight: 900,
                            border: "1px solid rgba(0,0,0,0.18)",
                          }}
                        >
                          See Features
                        </a>
                      </div>
                    </div>
                  </section>
                );

              case "features":
                return (
                  <section key={key} id={anchorId} style={{ scrollMarginTop: 90 }}>
                    <Card>
                      <h2 style={{ margin: 0, fontSize: 26, fontWeight: 950, letterSpacing: -0.4 }}>
                        {sec.heading || "Features"}
                      </h2>
                      {sec.subheading ? (
                        <p style={{ marginTop: 8, marginBottom: 0, opacity: 0.8 }}>
                          {sec.subheading}
                        </p>
                      ) : null}

                      <div style={{ display: "grid", gap: 10, marginTop: 14 }}>
                        {(sec.items || []).map((it, idx) => (
                          <div
                            key={idx}
                            style={{
                              padding: 14,
                              borderRadius: 14,
                              border: "1px solid rgba(0,0,0,0.10)",
                              background: "#fcfcfc",
                              fontWeight: 700,
                            }}
                          >
                            {it}
                          </div>
                        ))}
                      </div>
                    </Card>
                  </section>
                );

              case "pricing":
                return (
                  <section key={key} id={anchorId} style={{ scrollMarginTop: 90 }}>
                    <Card>
                      <h2 style={{ margin: 0, fontSize: 26, fontWeight: 950, letterSpacing: -0.4 }}>
                        {sec.heading || "Pricing"}
                      </h2>

                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12, marginTop: 14 }}>
                        {(sec.items || ["Starter", "Pro", "Business"]).map((plan, idx) => (
                          <div
                            key={idx}
                            style={{
                              borderRadius: 16,
                              padding: 16,
                              border: "1px solid rgba(0,0,0,0.12)",
                              background: idx === 1 ? "black" : "white",
                              color: idx === 1 ? "white" : "black",
                            }}
                          >
                            <div style={{ fontWeight: 950, fontSize: 18 }}>{plan}</div>
                            <div style={{ opacity: 0.85, marginTop: 6, fontSize: 14 }}>
                              Great for {idx === 0 ? "getting started" : idx === 1 ? "growing fast" : "teams at scale"}.
                            </div>
                            <div style={{ marginTop: 12, fontWeight: 950 }}>
                              {idx === 0 ? "$0" : idx === 1 ? "$19" : "$49"}{" "}
                              <span style={{ opacity: 0.75, fontWeight: 700 }}>/mo</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </Card>
                  </section>
                );

              case "testimonials":
                return (
                  <section key={key} id={anchorId} style={{ scrollMarginTop: 90 }}>
                    <Card>
                      <h2 style={{ margin: 0, fontSize: 26, fontWeight: 950, letterSpacing: -0.4 }}>
                        {sec.heading || "Testimonials"}
                      </h2>

                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 12, marginTop: 14 }}>
                        {(sec.items || []).map((q, idx) => (
                          <div
                            key={idx}
                            style={{
                              borderRadius: 16,
                              padding: 16,
                              border: "1px solid rgba(0,0,0,0.10)",
                              background: "#fcfcfc",
                            }}
                          >
                            <div style={{ fontWeight: 800 }}>"{q}"</div>
                            <div style={{ marginTop: 10, opacity: 0.75, fontSize: 14 }}>
                              — Customer
                            </div>
                          </div>
                        ))}
                      </div>
                    </Card>
                  </section>
                );

              case "faq":
                return (
                  <section key={key} id={anchorId} style={{ scrollMarginTop: 90 }}>
                    <Card>
                      <h2 style={{ margin: 0, fontSize: 26, fontWeight: 950, letterSpacing: -0.4 }}>
                        {sec.heading || "FAQ"}
                      </h2>

                      <div style={{ display: "grid", gap: 10, marginTop: 14 }}>
                        {(sec.items || []).map((q, idx) => (
                          <details
                            key={idx}
                            style={{
                              padding: 14,
                              borderRadius: 14,
                              border: "1px solid rgba(0,0,0,0.10)",
                              background: "#fcfcfc",
                            }}
                          >
                            <summary style={{ cursor: "pointer", fontWeight: 900 }}>
                              {q}
                            </summary>
                            <div style={{ marginTop: 10, opacity: 0.8 }}>
                              Answer placeholder — next build we’ll generate real answers with your AI “Finish-for-me”.
                            </div>
                          </details>
                        ))}
                      </div>
                    </Card>
                  </section>
                );

              case "cta":
                return (
                  <section key={key} id={anchorId} style={{ scrollMarginTop: 90 }}>
                    <div
                      style={{
                        borderRadius: 22,
                        padding: 22,
                        border: "1px solid rgba(0,0,0,0.10)",
                        background: "black",
                        color: "white",
                      }}
                    >
                      <h2 style={{ margin: 0, fontSize: 28, fontWeight: 950, letterSpacing: -0.4 }}>
                        {sec.heading || "Ready to start?"}
                      </h2>
                      {sec.subheading ? (
                        <p style={{ marginTop: 8, marginBottom: 0, opacity: 0.9 }}>
                          {sec.subheading}
                        </p>
                      ) : null}
                      <div style={{ marginTop: 14 }}>
                        <a
                          href="/contact"
                          style={{
                            display: "inline-block",
                            padding: "12px 16px",
                            borderRadius: 14,
                            background: "white",
                            color: "black",
                            textDecoration: "none",
                            fontWeight: 950,
                          }}
                        >
                          Continue
                        </a>
                      </div>
                    </div>
                  </section>
                );

              case "contact":
                return (
                  <section key={key} id={anchorId} style={{ scrollMarginTop: 90 }}>
                    <Card>
                      <h2 style={{ margin: 0, fontSize: 26, fontWeight: 950, letterSpacing: -0.4 }}>
                        {sec.heading || "Contact"}
                      </h2>
                      {sec.subheading ? (
                        <p style={{ marginTop: 8, opacity: 0.8 }}>
                          {sec.subheading}
                        </p>
                      ) : null}

                      <div style={{ display: "grid", gap: 10, marginTop: 12, maxWidth: 520 }}>
                        <input
                          placeholder="Your email"
                          style={{
                            padding: 12,
                            borderRadius: 14,
                            border: "1px solid rgba(0,0,0,0.18)",
                            outline: "none",
                          }}
                          disabled
                        />
                        <textarea
                          placeholder="Message"
                          rows={4}
                          style={{
                            padding: 12,
                            borderRadius: 14,
                            border: "1px solid rgba(0,0,0,0.18)",
                            outline: "none",
                          }}
                          disabled
                        />
                        <button
                          type="button"
                          disabled
                          style={{
                            padding: "12px 14px",
                            borderRadius: 14,
                            border: "1px solid rgba(0,0,0,0.18)",
                            background: "black",
                            color: "white",
                            fontWeight: 950,
                            cursor: "not-allowed",
                            opacity: 0.7,
                          }}
                        >
                          Submit (wire up next build)
                        </button>
                      </div>
                    </Card>
                  </section>
                );

              case "about":
              default:
                return (
                  <section key={key} id={anchorId} style={{ scrollMarginTop: 90 }}>
                    <Card>
                      <h2 style={{ margin: 0, fontSize: 26, fontWeight: 950, letterSpacing: -0.4 }}>
                        {sec.heading || "About"}
                      </h2>
                      {sec.subheading ? (
                        <p style={{ marginTop: 8, opacity: 0.85 }}>
                          {sec.subheading}
                        </p>
                      ) : null}
                      {sec.items && sec.items.length ? (
                        <ul style={{ marginTop: 12 }}>
                          {sec.items.map((it, idx) => (
                            <li key={idx} style={{ marginBottom: 6 }}>
                              {it}
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </Card>
                  </section>
                );
            }
          })}
        </div>

        {/* Footer */}
        <div style={{ opacity: 0.6, fontSize: 13, padding: "26px 0 10px" }}>
          © {new Date().getFullYear()} YourSite. All rights reserved.
        </div>
      </div>
    </div>
  );
}
EOF
