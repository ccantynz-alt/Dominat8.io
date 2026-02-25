"use client";

/** Global error boundary — minimal, on-brand. */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#06080e",
        color: "#e9eef7",
        fontFamily: "ui-sans-serif,system-ui,sans-serif",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        textAlign: "center",
      }}
    >
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: 12,
          background: "rgba(255,100,100,0.08)",
          border: "1px solid rgba(255,100,100,0.25)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 24,
          fontSize: 24,
        }}
      >
        !
      </div>
      <h1 style={{ fontSize: 22, fontWeight: 700, margin: "0 0 8px" }}>Something went wrong</h1>
      <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", margin: "0 0 24px", maxWidth: 360 }}>
        {error.message || "An unexpected error occurred."}
      </p>
      <button
        type="button"
        onClick={reset}
        style={{
          padding: "12px 24px",
          borderRadius: 12,
          background: "linear-gradient(135deg,#00C97A,#00B36B)",
          color: "#fff",
          border: "none",
          fontSize: 14,
          fontWeight: 600,
          cursor: "pointer",
        }}
      >
        Try again
      </button>
      <a
        href="/"
        style={{
          display: "inline-block",
          marginTop: 16,
          fontSize: 13,
          color: "rgba(61,240,255,0.85)",
          textDecoration: "none",
        }}
      >
        ← Back to builder
      </a>
    </main>
  );
}
