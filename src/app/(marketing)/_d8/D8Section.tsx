import React from "react";

export type D8SectionProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  children?: React.ReactNode;
  id?: string;
};

export function D8Section(props: D8SectionProps) {
  const { eyebrow, title, subtitle, children, id } = props;

  return (
    <section
      id={id}
      style={{
        width: "100%",
        maxWidth: 1160,
        margin: "0 auto",
        padding: "26px 16px",
      }}
    >
      <div
        style={{
          borderRadius: 24,
          padding: "20px 18px",
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.10)",
          boxShadow: "0 30px 90px rgba(0,0,0,0.35)",
        }}
      >
        {(eyebrow || title || subtitle) && (
          <header style={{ marginBottom: 14 }}>
            {eyebrow && (
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "8px 12px",
                  borderRadius: 999,
                  background:
                    "linear-gradient(90deg, rgba(168,85,247,0.18), rgba(59,130,246,0.10))",
                  border: "1px solid rgba(255,255,255,0.12)",
                  color: "rgba(237,234,247,0.92)",
                  fontSize: 12,
                  letterSpacing: "0.10em",
                  textTransform: "uppercase",
                  fontWeight: 800,
                }}
              >
                {eyebrow}
              </div>
            )}

            {title && (
              <h2
                style={{
                  marginTop: 14,
                  fontSize: 28,
                  lineHeight: 1.15,
                  letterSpacing: "-0.02em",
                  fontWeight: 900,
                  color: "rgba(246,242,255,0.98)",
                  textShadow: "0 18px 70px rgba(168,85,247,0.14)",
                }}
              >
                {title}
              </h2>
            )}

            {subtitle && (
              <p
                style={{
                  marginTop: 10,
                  maxWidth: 820,
                  color: "rgba(237,234,247,0.74)",
                  lineHeight: 1.6,
                }}
              >
                {subtitle}
              </p>
            )}
          </header>
        )}

        <div>{children}</div>
      </div>
    </section>
  );
}

export default D8Section;