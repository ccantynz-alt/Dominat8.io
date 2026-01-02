"use client";

import { useEffect, useState } from "react";

type Template = {
  id: string;
  name: string;
  description: string;
  category: string;
  previewImage?: string;
  seedPrompt: string;
  published: boolean;
};

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/templates", { cache: "no-store" });
    const data = await res.json();
    setTemplates((data.templates || []).filter((t: Template) => t.published));
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div style={{ padding: 16, maxWidth: 1000 }}>
      <h1>Templates</h1>
      <p style={{ opacity: 0.8 }}>
        Pick a starting point, then generate a site from it.
      </p>

      {loading ? <p>Loading...</p> : null}

      <div style={{ marginTop: 16, display: "grid", gap: 12 }}>
        {templates.map((t) => (
          <div key={t.id} style={{ border: "1px solid #ddd", padding: 12 }}>
            <div style={{ fontWeight: 700 }}>{t.name}</div>
            <div style={{ opacity: 0.8 }}>{t.category}</div>
            <p style={{ marginTop: 8 }}>{t.description}</p>

            <details style={{ marginTop: 8 }}>
              <summary>View seed prompt</summary>
              <pre style={{ whiteSpace: "pre-wrap" }}>{t.seedPrompt}</pre>
            </details>
          </div>
        ))}
      </div>
    </div>
  );
}
