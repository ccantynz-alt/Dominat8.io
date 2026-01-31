import React from "react";

export function D8Section(props: {
  id?: string;
  eyebrow?: string;
  title: string;
  lead?: string;
  children?: React.ReactNode;
  tone?: "default" | "deep" | "glass";
}) {
  const tone = props.tone ?? "default";

  const sectionBg =
    tone === "deep"
      ? "linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))"
      : tone === "glass"
      ? "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.03))"
      : "transparent";

  const sectionBorder =
    tone === "deep" || tone === "glass" ? "1px solid rgba(255,255,255,0.10)" : "1px solid rgba(255,255,255,0.06)";

  return (
    <section
      id={props.id}
      style={{
        marginTop: 26,
        padding: "22px 0",
        borderTop: "1px solid rgba(255,255,255,0.08)",
      }}
      aria-label={props.title}
    >
      <div style={{ width: "100%", maxWidth: 1160, margin: "0 auto" }}>
        <div
          style={{
            borderRadius: 22,
            padding: "18px 14px",
            background: sectionBg,
            border: sectionBorder,
            boxShadow: tone === "glass" ? "0 30px 90px rgba(0,0,0,0.45)" : "0 18px 55px rgba(0,0,0,0.35)",
            overflow: "hidden",
          }}
        >
          {props.eyebrow ? (
            <div
              style={{
                fontSize: 11,
                fontWeight: 900,
                letterSpacing: "0.20em",
                textTransform: "uppercase",
                color: "rgba(237,234,247,0.72)",
              }}
            >
              {props.eyebrow}
            </div>
          ) : null}
          <div
            style={{
              marginTop: props.eyebrow ? 10 : 0,
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "space-between",
              gap: 14,
              flexWrap: "wrap",
            }}
          >
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontSize: 24,
                  fontWeight: 950,
                  letterSpacing: "-0.02em",
                  color: "rgba(246,242,255,0.98)",
                  textShadow: "0 18px 80px rgba(168,85,247,0.12)",
                }}
              >
                {props.title}
              </div>
              {props.lead ? (
                <div
                  style={{
                    marginTop: 10,
                    fontSize: 14,
                    lineHeight: 1.65,
                    color: "rgba(237,234,247,0.74)",
                    maxWidth: 860,
                  }}
                >
                  {props.lead}
                </div>
              ) : null}
            </div>
          </div>

          {props.children ? <div style={{ marginTop: 14 }}>{props.children}</div> : null}
        </div>
      </div>
    </section>
  );
}

export function D8Grid(props: { cols?: 2 | 3 | 4; children: React.ReactNode }) {
  const cols = props.cols ?? 3;
  const gridTemplate =
    cols === 4 ? "repeat(4, minmax(0, 1fr))" : cols === 2 ? "repeat(2, minmax(0, 1fr))" : "repeat(3, minmax(0, 1fr))";

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: gridTemplate,
        gap: 12,
      }}
    >
      {props.children}
    </div>
  );
}

export function D8Divider() {
  return <div style={{ marginTop: 18, borderTop: "1px dashed rgba(255,255,255,0.10)" }} />;
}