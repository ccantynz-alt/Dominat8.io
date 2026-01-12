// app/dashboard/projects/error.tsx
"use client";

import { useEffect } from "react";

export default function ProjectsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // shows in browser console too
    console.error("Projects route error:", error);
  }, [error]);

  return (
    <div style={{ padding: 24, fontFamily: "system-ui, sans-serif" }}>
      <h1>Projects error</h1>
      <p>This page shows the real error message instead of a generic digest.</p>

      <div
        style={{
          marginTop: 12,
          padding: 12,
          border: "1px solid #ddd",
          borderRadius: 8,
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
        }}
      >
        <strong>Message</strong>
        {"\n"}
        {error?.message || "(no message)"}
        {"\n\n"}
        <strong>Digest</strong>
        {"\n"}
        {error?.digest || "(none)"}
      </div>

      <div style={{ marginTop: 16 }}>
        <button
          onClick={() => reset()}
          style={{
            padding: "10px 14px",
            borderRadius: 8,
            border: "1px solid #ccc",
            cursor: "pointer",
          }}
        >
          Retry
        </button>
      </div>

      <p style={{ marginTop: 18 }}>
        Next: open <code>/api/projects</code> and paste the response here if it
        still fails.
      </p>
    </div>
  );
}
