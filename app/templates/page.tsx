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
    seedPrompt:
      "Build a modern landing page with a hero section, pricing, FAQ, and a contact form. Use clean, minimal styling.",
  },
  {
    id: "business",
    name: "Business Website",
    description: "Professional business site with services, testimonials, and contact.",
    seedPrompt:
      "Create a professional business website with sections: hero, services, testimonials, about, and contact. Clean modern styling.",
  },
  {
    id: "portfolio",
    name: "Portfolio",
    description: "Portfolio for creators with projects, about section, and contact.",
    seedPrompt:
      "Create a portfolio website with hero, projects grid, about section, and contact form. Minimal modern design.",
  },
];

function makeProjectId() {
  return "proj_" + Math.random().toString(16).slice(2) + Date.now().toString(16);
}

export default function TemplatesPage() {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);

  async function useTemplate(t: Template) {
    try {
      setBusyId(t.id);

      const projectName = window.prompt("Name your new project:", `${t.name} Project`) || "";
      if (!projectName.trim()) return;

      const projectId = makeProjectId();

      // Save selection locally so the Project page can show it + prefill prompt
      try {
        localStorage.setItem(
          `project:${projectId}`,
          JSON.stringify({
            id: projectId,
            name: projectName.trim(),
            templateId: t.id,
            templateName: t.name,
            seedPrompt: t.seedPrompt,
            createdAt: new Date().toISOString(),
          })
        );
      } catch {
        // ignore if storage blocked
      }

      router.push(`/projects/${projectId}`);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <main style={{ padding: "3rem", fontFamily: "sans-serif", maxWidth: 980, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "baseline" }}>
        <div>
          <h1 style={{ fontSize: "2.5rem", margin: 0 }}>Templates</h1>
          <p style={{ marginTop: 10, color: "#555" }}>Choose a template to start a new project.</p>
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          <a href="/" style={linkStyle}>Home</a>
          <a href="/projects" style={linkStyle}>Projects</a>
          <a href="/dashboard" style={linkStyle}>Dashboard</a>
        </div>
      </div>

      <div
        style={{
          marginTop: 18,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: 14,
        }}
      >
        {TEMPLATES.map((t) => (
          <div key={t.id} style={cardStyle}>
            <h2 style={{ marginTop: 0 }}>{t.name}</h2>
            <p style={{ color: "#555" }}>{t.description}</p>

            <details style={{ marginTop: 10 }}>
              <summary style={{ cursor: "pointer" }}>View seed prompt</summary>
              <pre style={preStyle}>{t.seedPrompt}</pre>
            </details>

            <button
              onClick={() => useTemplate(t)}
              disabled={busyId === t.id}
              style={{
                ...buttonStyle,
                background: busyId === t.id ? "#ddd" : "#000",
                color: busyId === t.id ? "#333" : "#fff",
                cursor: busyId === t.id ? "not-allowed" : "pointer",
              }}
            >
              {busyId === t.id ? "Creating…" : "Use Template"}
            </button>
          </div>
        ))}
      </div>
    </main>
  );
}

const linkStyle: React.CSSProperties = {
  color: "#111",
  textDecoration: "underline",
  fontSize: 14,
};

const cardStyle: React.CSSProperties = {
  border: "1px solid #ddd",
  borderRadius: 12,
  padding: "1.25rem",
  background: "#fff",
};

const buttonStyle: React.CSSProperties = {
  marginTop: "1rem",
  width: "100%",
  padding: "0.7rem 1rem",
  border: "none",
  borderRadius: 8,
  fontSize: 14,
};

const preStyle: React.CSSProperties = {
  marginTop: 10,
  padding: 12,
  background: "#f7f7f7",
  borderRadius: 10,
  whiteSpace: "pre-wrap",
  fontSize: 13,
  lineHeight: 1.4,
};
