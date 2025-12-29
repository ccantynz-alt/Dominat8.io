// app/error.tsx
"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Logs to browser console for quick visibility
    console.error("App error:", error);
  }, [error]);

  return (
    <main style={{ padding: 24, fontFamily: "ui-sans-serif, system-ui" }}>
      <h1 style={{ fontSize: 20, fontWeight: 800 }}>Application error</h1>
      <p style={{ marginTop: 10 }}>
        A server-side exception occurred. This page is here so you can see the actual error message instead
        of a generic digest screen.
      </p>

      <div style={{ marginTop: 16 }}>
        <div style={{ fontWeight: 700 }}>Message</div>
        <pre
          style={{
            marginTop: 8,
            padding: 12,
            background: "#111",
            color: "#fff",
            borderRadius: 10,
            overflowX: "auto",
            fontSize: 12,
          }}
        >
          {String(error?.message || error)}
        </pre>
      </div>

      <div style={{ marginTop: 16 }}>
        <div style={{ fontWeight: 700 }}>Digest</div>
        <pre
          style={{
            marginTop: 8,
            padding: 12,
            background: "#111",
            color: "#fff",
            borderRadius: 10,
            overflowX: "auto",
            fontSize: 12,
          }}
        >
          {String((error as any)?.digest || "no digest")}
        </pre>
      </div>

      <button
        onClick={() => reset()}
        style={{
          marginTop: 16,
          padding: "10px 14px",
          borderRadius: 10,
          border: "1px solid #ccc",
          cursor: "pointer",
          fontWeight: 700,
        }}
      >
        Retry
      </button>

      <p style={{ marginTop: 16 }}>
        Next: open <code>/api/kv-test</code> and <code>/api/projects</code> and paste the JSON here.
      </p>
    </main>
  );
}
