"use client";

import { useEffect, useState } from "react";

export default function HomeClient() {
  const [p, setP] = useState(0);

  useEffect(() => {
    let i = 0;
    const steps = [6, 14, 26, 38, 52, 66, 78, 88, 96, 100];
    const t = setInterval(() => {
      setP(steps[i] ?? 100);
      i++;
      if (i >= steps.length) clearInterval(t);
    }, 320);
    return () => clearInterval(t);
  }, []);

  return (
    <main style={{
      minHeight: "100vh",
      background:
        "radial-gradient(1200px 700px at 10% 5%, rgba(120,160,255,0.12), transparent 60%)," +
        "radial-gradient(1000px 600px at 90% 30%, rgba(180,120,255,0.10), transparent 55%)," +
        "linear-gradient(180deg,#04050a 0%,#07080d 55%,#05060b 100%)",
      color: "white",
      fontFamily: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial",
      overflow: "hidden"
    }}>
      <div style={{
        maxWidth: 1240,
        margin: "0 auto",
        padding: "0 36px",
        minHeight: "100vh",
        display: "grid",
        gridTemplateColumns: "1.15fr 0.85fr",
        gap: 64,
        alignItems: "center"
      }}>

        {/* LEFT */}
        <div>
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            padding: "10px 18px",
            borderRadius: 999,
            border: "1px solid rgba(255,255,255,0.16)",
            background: "rgba(255,255,255,0.06)",
            fontSize: 12,
            letterSpacing: 2.6,
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.75)"
          }}>
            AI Website Automation
          </div>

          <h1 style={{
            marginTop: 26,
            fontSize: 64,
            lineHeight: 1.02,
            fontWeight: 950,
            letterSpacing: -1.8
          }}>
            This is how websites
            <br />are made now.
          </h1>

          <p style={{
            marginTop: 22,
            fontSize: 20,
            lineHeight: 1.65,
            color: "rgba(255,255,255,0.72)",
            maxWidth: 560
          }}>
            Describe your business. Your website assembles itself. Publish.
          </p>

          <div style={{ marginTop: 36, display: "flex", alignItems: "center", gap: 18 }}>
            <a href="/builder" style={{
              padding: "18px 28px",
              borderRadius: 18,
              background: "linear-gradient(180deg,#ffffff,#eaeaf0)",
              color: "black",
              fontWeight: 950,
              fontSize: 16,
              textDecoration: "none",
              boxShadow: "0 28px 70px rgba(0,0,0,0.55)",
              transform: "translateY(0)",
              transition: "transform 160ms ease, box-shadow 160ms ease"
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 36px 90px rgba(0,0,0,0.7)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 28px 70px rgba(0,0,0,0.55)";
            }}>
              Build my site
            </a>

            <span style={{ fontSize: 14, color: "rgba(255,255,255,0.6)" }}>
              No templates. No setup.
            </span>
          </div>

          <div style={{
            marginTop: 34,
            display: "flex",
            gap: 22,
            fontSize: 13,
            color: "rgba(255,255,255,0.55)"
          }}>
            <span>⚡ Fast launch</span>
            <span>🔒 Production-ready</span>
            <span>📈 Conversion-focused</span>
          </div>

          <div style={{ marginTop: 26, fontSize: 11, color: "rgba(255,255,255,0.45)" }}>
            POLISH_20260126_085947
          </div>
        </div>

        {/* RIGHT */}
        <div style={{
          borderRadius: 24,
          border: "1px solid rgba(255,255,255,0.16)",
          background: "rgba(0,0,0,0.40)",
          backdropFilter: "blur(22px)",
          boxShadow: "0 50px 140px rgba(0,0,0,0.75)",
          overflow: "hidden"
        }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "14px 16px",
            borderBottom: "1px solid rgba(255,255,255,0.10)",
            background: "rgba(0,0,0,0.45)"
          }}>
            <span style={{ width: 10, height: 10, borderRadius: 999, background: "#ff5f56" }} />
            <span style={{ width: 10, height: 10, borderRadius: 999, background: "#ffbd2e" }} />
            <span style={{ width: 10, height: 10, borderRadius: 999, background: "#27c93f" }} />
            <div style={{
              margin: "0 auto",
              padding: "6px 12px",
              borderRadius: 999,
              border: "1px solid rgba(255,255,255,0.12)",
              background: "rgba(255,255,255,0.06)",
              fontSize: 11,
              color: "rgba(255,255,255,0.7)"
            }}>
              dominat8.com / preview
            </div>
          </div>

          <div style={{ padding: 22 }}>
            <div style={{
              fontSize: 11,
              letterSpacing: 2.6,
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.6)"
            }}>
              Generating website
            </div>

            <div style={{
              marginTop: 12,
              height: 8,
              borderRadius: 999,
              background: "rgba(255,255,255,0.12)",
              overflow: "hidden"
            }}>
              <div style={{
                width: p + "%",
                height: "100%",
                background: "linear-gradient(90deg,#22d3ee,#a855f7)",
                transition: "width 420ms cubic-bezier(.22,.61,.36,1)"
              }} />
            </div>

            <div style={{
              marginTop: 20,
              fontSize: 18,
              fontWeight: 800
            }}>
              Building your homepage…
            </div>

            <div style={{
              marginTop: 18,
              display: "flex",
              flexWrap: "wrap",
              gap: 10
            }}>
              {["SEO Ready","Sitemap Generated","Published"].map(x => (
                <span key={x} style={{
                  padding: "8px 14px",
                  borderRadius: 999,
                  fontSize: 13,
                  border: "1px solid rgba(255,255,255,0.18)",
                  background: "rgba(255,255,255,0.06)"
                }}>
                  ✓ {x}
                </span>
              ))}
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}