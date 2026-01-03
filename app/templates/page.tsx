"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Template = {
  id: string;
  name: string;
  description: string;
  seedPrompt: string;
};

const TEMPLATES: Template[] = [
  {
    id: "landing",
    name: "Landing Page",
    description: "A clean landing page with hero, pricing, FAQ, and contact form.",
    seedPrompt: "Build a modern landing page with pricing, FAQ, and a contact form. Clean minimal styling.",
  },
  {
    id: "business",
    name: "Business Website",
    description: "Professional business site with services, testimonials, and contact.",
    seedPrompt: "Create a professional business website with hero, services, testimonials, about, and contact. Clean modern styling.",
  },
  {
    id: "portfolio",
    name: "Portfolio",
    description: "Portfolio for creators with projects, about section, and contact.",
    seedPrompt: "Create a modern portfolio website with a hero, projects section, about, and contact. Clean styling.",
  },
];

export default function TemplatesPage() {
  const router = useRouter();

  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function createProjectFromTemplate(t: Template) {
    try {
      setErr(null);
      setLoadingId(t.id);

      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // ✅ IMPORTANT: Always include "name"
        body: JSON.stringify({
          name: `${t.name} Project`,
          templateId: t.id,
          templateName: t.name,
          seedPrompt: t.seedPrompt,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data?.ok || !data?.project?.id) {
        const msg = data?.error || data?.message || "Failed to create project";
        throw new Error(msg);
      }

      // ✅ Go to the new project page
      router.push(`/projects/${data.project.id}`);
    } catch (e: any) {
      setErr(e?.message || "Something went wrong");
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 16px" }}>
      <h1 style={{ fontSize: 40, fontWeight: 700, marginBottom: 10 }}>Templates</h1>
      <p style={{ marginBottom: 18 }}>Choose a template to start a new project.</p>

      {err ? (
        <div
          style={{
            background: "#ffe5e5",
            border: "1px solid #ffb3b3",
            color: "#7a0000",
            padding: 12,
            borderRadius: 8,
            marginBottom: 16,
          }}
        >
          Error: {err}
        </div>
      ) : null}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: 16,
        }}
      >
        {TEMPLATES.map((t) => {
          const isLoading = loadingId === t.id;

          return (
            <div
              key={t.id}
              style={{
                border: "1px solid #e5e5e5",
                borderRadius: 12,
                padding: 16,
                background: "white",
              }}
            >
              <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 6 }}>{t.name}</h2>
              <p style={{ marginBottom: 14 }}>{t.description}</p>

              <button
                onClick={() => createProjectFromTemplate(t)}
                disabled={!!loadingId}
                style={{
                  padding: "10px 12px",
                  borderRadius: 10,
                  border: "1px solid #111",
                  background: isLoading ? "#f3f3f3" : "#111",
                  color: isLoading ? "#111" : "#fff",
                  cursor: loadingId ? "not-allowed" : "pointer",
                  width: "100%",
                  fontWeight: 700,
                }}
              >
                {isLoading ? "Creating..." : "Use Template"}
              </button>

              <details style={{ marginTop: 12 }}>
                <summary style={{ cursor: "pointer" }}>View seed prompt</summary>
                <pre
                  style={{
                    whiteSpace: "pre-wrap",
                    background: "#f7f7f7",
                    padding: 12,
                    borderRadius: 10,
                    marginTop: 10,
                    fontSize: 13,
                  }}
                >
                  {t.seedPrompt}
                </pre>
              </details>
            </div>
          );
        })}
      </div>
    </div>
  );
}
