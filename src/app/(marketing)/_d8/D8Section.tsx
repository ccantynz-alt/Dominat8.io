import React from "react";

export type D8SectionProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  children?: React.ReactNode;
  id?: string;
};

export function D8Section(props: D8SectionProps) {
  const { title, subtitle, children, id } = props;

  // Keep server-safe: no "use client", no browser-only APIs.
  return (
    <section
      id={id}
      style={{
        width: "100%",
        maxWidth: 1160,
        margin: "0 auto",
        padding: "18px 16px",
      }}
    >
      {(title || subtitle) && (
        <header style={{ marginBottom: 12 }}>
          {title && (
            <h2
              style={{
                margin: 0,
                fontSize: 22,
                lineHeight: 1.15,
                fontWeight: 900,
                color: "rgba(246,242,255,0.95)",
                letterSpacing: "-0.01em",
              }}
            >
              {title}
            </h2>
          )}
          {subtitle && (
            <p
              style={{
                margin: "8px 0 0 0",
                fontSize: 14,
                lineHeight: 1.6,
                color: "rgba(237,234,247,0.72)",
              }}
            >
              {subtitle}
            </p>
          )}
        </header>
      )}

      <div>{children}</div>
    </section>
  );
}

export default D8Section;