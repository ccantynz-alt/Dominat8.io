// app/templates/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Template = {
  id: string;
  name: string;
  description: string;
  prompt: string;
};

export default function TemplatesPage() {
  const router = useRouter();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setError(null);
        const res = await fetch("/api/templates", { cache: "no-store" });
        const data = await res.json();
        if (!data?.ok) throw new Error("Failed to load templates");
        setTemplates(data.templates || []);
      } catch (e: any) {
        setError(e?.message || "Failed to load templates");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function useTemplate(t: Template) {
    setBusyId(t.id);
    setError(null);
    try {
      const res = await fetch("/api/projects/from-template", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          templateId: t.id,
          name: `${t.name} Project`,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data?.ok) {
        throw new Error(data?.error || "Failed to create project");
      }

      const projectId = data.project?.id;
      if (!projectId) throw new Error("Project created but no id returned");

      // ✅ Go to the project page (adjust path if your app uses a different route)
      router.push(`/projects/${projectId}`);
    } catch (e: any) {
      setError(e?.message || "Failed to create project");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div style={{ padding: 24, maxWidth: 1000, margin: "0 auto" }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Templates</h1>
      <p style={{ marginBottom: 18 }}>
        Pick a template and click <b>Use Template</b> to generate a new project.
      </p>

      {error ? (
        <div style={{ padding: 12, border: "1px solid #f99", background: "#fff5f5", marginBottom: 16 }}>
          <b>Error:</b> {error}
        </div>
      ) : null}

      {loading ? (
        <p>Loading templates…</p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
          {templates.map((t) => (
            <div
              key={t.id}
              style={{
                border: "1px solid #e5e5e5",
                borderRadius: 12,
                padding: 16,
                background: "white",
              }}
            >
              <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>{t.name}</div>
              <div style={{ opacity: 0.8, marginBottom: 12 }}>{t.description}</div>

              <button
                onClick={() => useTemplate(t)}
                disabled={busyId === t.id}
                style={{
                  padding: "10px 12px",
                  borderRadius: 10,
                  border: "1px solid #ddd",
                  cursor: busyId === t.id ? "not-allowed" : "pointer",
                  width: "100%",
                  fontWeight: 600,
                }}
              >
                {busyId === t.id ? "Creating…" : "Use Template"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
