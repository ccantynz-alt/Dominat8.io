"use client";

import { useState } from "react";

export default function SeoAIGeneratePage({
  params,
}: {
  params: { projectId: string };
}) {
  const [keyword, setKeyword] = useState("");
  const [count, setCount] = useState(10);
  const [locale, setLocale] = useState("en-NZ");
  const [tone, setTone] = useState("professional");
  const [out, setOut] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function run() {
    setLoading(true);
    setOut(null);

    const res = await fetch(`/api/projects/${params.projectId}/seo/generate-ai`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ keyword, count, locale, tone }),
    });

    const data = await res.json();
    setOut(data);
    setLoading(false);
  }

  return (
    <div style={{ padding: 16, maxWidth: 720 }}>
      <h1>AI SEO Generator</h1>

      <div style={{ marginTop: 12 }}>
        <div>Keyword</div>
        <input
          style={{ width: "100%", padding: 8 }}
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="e.g. AI website builder"
        />
      </div>

      <div style={{ marginTop: 12, display: "flex", gap: 12 }}>
        <div style={{ flex: 1 }}>
          <div>Count (max 25)</div>
          <input
            style={{ width: "100%", padding: 8 }}
            type="number"
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
          />
        </div>

        <div style={{ flex: 1 }}>
          <div>Locale</div>
          <input
            style={{ width: "100%", padding: 8 }}
            value={locale}
            onChange={(e) => setLocale(e.target.value)}
          />
        </div>
      </div>

      <div style={{ marginTop: 12 }}>
        <div>Tone</div>
        <input
          style={{ width: "100%", padding: 8 }}
          value={tone}
          onChange={(e) => setTone(e.target.value)}
        />
      </div>

      <button
        style={{ marginTop: 16, padding: "10px 14px" }}
        onClick={run}
        disabled={loading || keyword.trim().length < 2}
      >
        {loading ? "Generating..." : "Generate AI Pages"}
      </button>

      {out ? (
        <pre style={{ marginTop: 16, whiteSpace: "pre-wrap" }}>
          {JSON.stringify(out, null, 2)}
        </pre>
      ) : null}

      <p style={{ marginTop: 18, opacity: 0.8 }}>
        After generating, visit: <code>/site/{params.projectId}/&lt;slug&gt;</code>
      </p>
    </div>
  );
}
