"use client";

import { useEffect, useState } from "react";

export default function SeoManager({
  params,
}: {
  params: { projectId: string };
}) {
  const [keyword, setKeyword] = useState("");
  const [count, setCount] = useState(100);
  const [done, setDone] = useState(false);

  const [indexing, setIndexing] = useState<"on" | "off">("on");
  const [saving, setSaving] = useState(false);

  async function loadSettings() {
    const res = await fetch(`/api/projects/${params.projectId}/seo/settings`, {
      cache: "no-store",
    });
    const data = await res.json();
    if (data?.ok && data?.settings?.indexing) {
      setIndexing(data.settings.indexing);
    }
  }

  async function saveSettings(next: "on" | "off") {
    setSaving(true);
    setIndexing(next);

    await fetch(`/api/projects/${params.projectId}/seo/settings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ indexing: next }),
    });

    setSaving(false);
  }

  async function generate() {
    setDone(false);
    await fetch(`/api/projects/${params.projectId}/seo/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ keyword, count }),
    });
    setDone(true);
  }

  useEffect(() => {
    loadSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const robotsUrl = `/site/${params.projectId}/robots.txt`;
  const sitemapUrl = `/site/${params.projectId}/sitemap.xml`;

  return (
    <div style={{ padding: 16 }}>
      <h1>Nuclear SEO</h1>

      <div style={{ marginTop: 16, border: "1px solid #ddd", padding: 12 }}>
        <h2>Indexing Controls</h2>

        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button
            onClick={() => saveSettings("on")}
            disabled={saving}
            style={{
              padding: "6px 10px",
              border: "1px solid #ccc",
              background: indexing === "on" ? "#e7ffe7" : "white",
            }}
          >
            Index ON
          </button>

          <button
            onClick={() => saveSettings("off")}
            disabled={saving}
            style={{
              padding: "6px 10px",
              border: "1px solid #ccc",
              background: indexing === "off" ? "#ffe7e7" : "white",
            }}
          >
            Index OFF
          </button>

          <span style={{ opacity: 0.8 }}>
            Current: <strong>{indexing}</strong>
          </span>
        </div>

        <div style={{ marginTop: 10 }}>
          <div>
            Robots: <a href={robotsUrl}>{robotsUrl}</a>
          </div>
          <div>
            Sitemap: <a href={sitemapUrl}>{sitemapUrl}</a>
          </div>
        </div>

        {indexing === "off" ? (
          <p style={{ marginTop: 10 }}>
            ⚠️ Indexing is OFF: search engines will be told to ignore all pages for this project.
          </p>
        ) : (
          <p style={{ marginTop: 10 }}>
            ✅ Indexing is ON: pages can be discovered via sitemap + robots.
          </p>
        )}
      </div>

      <div style={{ marginTop: 24, border: "1px solid #ddd", padding: 12 }}>
        <h2>Generate SEO Pages</h2>

        <input
          style={{ width: "100%", padding: 8 }}
          placeholder="Core keyword (e.g. AI website builder)"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />

        <div style={{ marginTop: 8 }}>
          <input
            style={{ width: 140, padding: 8 }}
            type="number"
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
          />
        </div>

        <button style={{ marginTop: 12 }} onClick={generate}>
          Generate Pages
        </button>

        {done && <p style={{ marginTop: 10 }}>✅ SEO pages generated.</p>}
      </div>
    </div>
  );
}
