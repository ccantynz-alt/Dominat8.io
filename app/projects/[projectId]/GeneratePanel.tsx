"use client";

import { useState } from "react";

export default function GeneratePanel({ projectId }: { projectId: string }) {
  const [prompt, setPrompt] = useState(
    "Create a professional business website with hero, services, testimonials, about, and contact. Clean modern styling."
  );
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string>("");
  const [body, setBody] = useState<string>("");
  const [publicUrl, setPublicUrl] = useState<string>("");

  async function generateAndPublish() {
    setLoading(true);
    setStatus("");
    setBody("");
    setPublicUrl("");

    try {
      // 1) Generate via AI
      const genRes = await fetch(`/api/projects/${projectId}/generate`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const genText = await genRes.text();
      if (!genRes.ok) {
        setStatus(String(genRes.status));
        setBody(genText);
        setLoading(false);
        return;
      }

      const genJson = JSON.parse(genText);
      const html = String(genJson.html || "");

      if (!html || html.length < 200) {
        setStatus("ERROR");
        setBody("AI did not return usable HTML.");
        setLoading(false);
        return;
      }

      // 2) Save a VERSION (history)
      const verRes = await fetch(`/api/projects/${projectId}/versions`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ html, prompt }),
      });

      const verText = await verRes.text();
      if (!verRes.ok) {
        setStatus(String(verRes.status));
        setBody(verText);
        setLoading(false);
        return;
      }

      // 3) Set LATEST (live draft)
      const saveRes = await fetch(`/api/projects/${projectId}/html`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ html }),
      });

      const saveText = await saveRes.text();
      if (!saveRes.ok) {
        setStatus(String(saveRes.status));
        setBody(saveText);
        setLoading(false);
        return;
      }

      // 4) Auto-publish
      const publishRes = await fetch(`/api/projects/${projectId}/publish`, {
        method: "POST",
      });

      const publishText = await publishRes.text();
      setStatus(String(publishRes.status));
      setBody(publishText);

      if (publishRes.ok) {
        // Always set publicUrl so user can click it (no popups needed)
        const url = `/p/${projectId}`;
        setPublicUrl(url);

        // Try to open a new tab, but don't rely on it (may be blocked)
        try {
          window.open(url, "_blank");
        } catch {}

        // Also navigate in the SAME tab after success (guaranteed)
        // Comment this out if you prefer staying on the project page.
        window.location.href = url;
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
      <h2 style={{ margin: 0, marginBottom: 10 }}>Generate & Publish (AI)</h2>

      <label style={{ display: "block", fontWeight: 600, marginBottom: 8 }}>
        Prompt
      </label>
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        rows={5}
        style={{
          width: "100%",
          maxWidth: 900,
          padding: 12,
          borderRadius: 10,
          border: "1px solid #ddd",
          fontFamily: "inherit",
        }}
      />

      <div style={{ marginTop: 12, display: "flex", gap: 12, alignItems: "center" }}>
        <button
          onClick={generateAndPublish}
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
          {loading ? "Generating & Publishing..." : "Generate & Publish"}
        </button>

        {/* Always useful even if popup blocked */}
        <a href={`/p/${projectId}`} target="_blank" rel="noreferrer">
          Open public page
        </a>
      </div>

      {publicUrl ? (
        <div style={{ marginTop: 12 }}>
          ✅ Published. Open:{" "}
          <a href={publicUrl} target="_blank" rel="noreferrer">
            {publicUrl}
          </a>
        </div>
      ) : null}

      {status ? (
        <div style={{ marginTop: 12 }}>
          <b>Status:</b> {status}
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

