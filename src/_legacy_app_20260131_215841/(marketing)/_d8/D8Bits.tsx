import React from "react";

export type D8CardProps = React.PropsWithChildren<{
  kicker?: string;
  title?: string;
  body?: string;
}>;

export function D8Card({ kicker, title, body, children }: D8CardProps) {
  const hasProps = Boolean(kicker || title || body);

  return (
    <div
      style={{
        padding: 18,
        borderRadius: 20,
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.10)',
        boxShadow: '0 14px 48px rgba(0,0,0,0.30)',
      }}
    >
      {hasProps ? (
        <>
          {kicker ? (
            <div style={{ fontSize: 12, fontWeight: 900, letterSpacing: '.12em', opacity: 0.75, textTransform: 'uppercase' }}>
              {kicker}
            </div>
          ) : null}

          {title ? (
            <div style={{ marginTop: kicker ? 6 : 0, fontSize: 16, fontWeight: 950, letterSpacing: '-0.02em' }}>
              {title}
            </div>
          ) : null}

          {body ? (
            <div style={{ marginTop: 8, fontSize: 14, lineHeight: 1.6, opacity: 0.78 }}>
              {body}
            </div>
          ) : null}
        </>
      ) : (
        children
      )}
    </div>
  );
}

export function D8P(props: { children?: React.ReactNode }) {
  return (
    <p style={{ margin: "10px 0", lineHeight: 1.6, color: "rgba(237,234,247,0.76)", fontSize: 14 }}>
      {props.children}
    </p>
  );
}