"use client";

import { useState } from "react";

export default function PublishButton({ projectId }: { projectId: string }) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string>("");
  const [body, setBody] = useState<string>("");

  async function publish() {
    setLoading(true);
    setStatus("");
    setBody("");

    try {
      const res = await fetch(`/api/projects/${projectId}/publish`, {
        method: "POST",
      });

      const text = await res.text();
      setStatus(String(res.status));
      setBody(text);

      if (res.ok) {
        // Open the public page in a new tab
        window.open(`/p/${projectId}`, "_blank");
      }
    } catch (e: any) {
      setStatus("ERROR");
      setBody(e?.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section
      style={{
        border: "1px solid #e5e5e5",
        borderRadius: 12,
        padding: 16,
        marginTop: 16,
        maxWidth: 900,
      }}
    >
      <h2 style={{ margin: 0, marginBottom: 10 }}>Publish</h2>

      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <button
          onClick={publish}
          disabled={loading}
          style={{
            padding: "10px 14px",
            borderRadius: 10,
            border: "1px solid #ddd",
            background: loading ? "#f3f3f3" : "white",
            cursor: loading ? "not-allowed" : "pointer",
            fontWeight: 600,
          }}
        >
          {loading ? "Publishing..." : "Publish"}
        </button>

        <a href={`/p/${projectId}`} target="_blank" rel="noreferrer">
          Open public page
        </a>
      </div>

      {status ? (
        <div style={{ marginTop: 12, fontFamily: "system-ui" }}>
          <div>
            <b>Status:</b> {status}
          </div>

          {body ? (
            <pre
              style={{
                marginTop: 8,
                padding: 12,
                borderRadius: 10,
                background: "#f6f6f6",
                overflowX: "auto",
                maxWidth: 900,
              }}
            >
              {body}
            </pre>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
