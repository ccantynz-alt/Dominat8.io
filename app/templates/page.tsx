"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Template = {
  id: string;
  name: string;
  description: string;
  seedPrompt: string;
  published?: boolean;
};

export default function TemplatesPage() {
  const router = useRouter();

  // Fallback templates (so your site works even if APIs aren’t ready yet)
  const fallbackTemplates: Template[] = useMemo(
    () => [
      {
        id: "landing-minimal",
        name: "Minimal Landing Page",
        description: "A clean landing page with pricing, FAQ, and a contact form.",
        seedPrompt:
          "Build a modern landing page with a hero section, pricing, FAQ, and a contact form. Use clean, minimal styling.",
        published: true,
      },
      {
        id: "business-site",
        name: "Business Website",
        description: "A professional multi-section business website with services and testimonials.",
        seedPrompt:
          "Create a professional business website with sections: hero, services, testimonials, about, and contact. Clean modern styling.",
        published: true,
      },
      {
        id: "portfolio",
        name: "Creator Portfolio",
        description: "A portfolio layout for creators with projects and contact.",
        seedPrompt:
          "Create a portfolio website with hero, projects grid, about section, and contact form. Minimal modern design.",
        published: true,
      },
    ],
    []
  );

  const [templates, setTemplates] = useState<Template[]>(fallbackTemplates);
  const [loading, setLoading] = useState(true);
  const [usingId, setUsingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Try to load real templates from your API, but don’t break if it’s not ready.
  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch("/api/templates", { cache: "no-store" });
        if (!res.ok) throw new Error("Templates API not available yet.");

        const data = await res.json();
        const list = Array.isArray(data?.templates) ? data.templates : null;

        if (!cancelled && list && list.length > 0) {
          setTemplates(list);
        }
      } catch (e: any) {
        // Keep fallback templates — this is OK.
        if (!cancelled) setError(e?.message || "Could not load templates.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [fallbackTemplates]);

  async function onUseTemplate(t: Template) {
    try {
      setUsingId(t.id);
      setError(null);

      const projectName =
        window.prompt("Name your new project:", `${t.name} Project`) || "";
      if (!projectName.trim()) {
        setUsingId(null);
        return;
      }

      // Preferred flow: orchestrator endpoint (if you have it)
      const tryOrchestrator = await fetch(`/api/templates/${encodeURIComponent(t.id)}/use`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: projectName }),
      });

      if (tryOrchestrator.ok) {
        const data = await tryOrchestrator.json();
        if (data?.ok && data?.projectId) {
          router.push(`/projects/${data.projectId}`);
          return;
        }
      }

      // Fallback flow: create project directly (if your /api/projects exists)
      const createProject = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: projectName }),
      });

      if (!createProject.ok) {
        throw new Error("Could not create project. API may not be set up yet.");
      }

      const projectData = await createProject.json();
      const projectId = projectData?.project?.id || projectData?.projectId;

      if (!projectId) throw new Error("Project created but no projectId returned.");

      // Optional: create a run automatically (if your runs endpoint exists)
      await fetch(`/api/projects/${encodeURIComponent(projectId)}/runs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: t.seedPrompt }),
      }).catch(() => {
        // Ignore if runs API not ready yet
      });

      router.push(`/projects/${projectId}`);
    } catch (e: any) {
      setError(e?.message || "Something went wrong using this template.");
    } finally {
      setUsingId(null);
    }
  }

  return (
    <main style={{ padding: "3rem 1.5rem", fontFamily: "sans-serif", maxWidth: 980, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12 }}>
        <h1 style={{ fontSize: "2.25rem", margin: 0 }}>Templates</h1>
        <a href="/" style={{ color: "#111", textDecoration: "underline" }}>
          Back to Home
        </a>
      </div>

      <p style={{ marginTop: 12, color: "#444", maxWidth: 720 }}>
        Choose a template to instantly start a new project. We’ll create the project for you and (if enabled)
        auto-run the first generation.
      </p>

      {loading && (
        <div style={{ marginTop: 18, padding: 12, border: "1px solid #eee", borderRadius: 8 }}>
          Loading templates…
        </div>
      )}

      {error && (
        <div
          style={{
            marginTop: 18,
            padding: 12,
            border: "1px solid #f3c2c2",
            background: "#fff7f7",
            borderRadius: 8,
            color: "#8a1f1f",
          }}
        >
          {error}
          <div style={{ marginTop: 6, color: "#555" }}>
            (If you haven’t built the templates API yet, that’s fine — fallback templates are shown.)
          </div>
        </div>
      )}

      <div
        style={{
          marginTop: 22,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: 14,
        }}
      >
        {templates
          .filter((t) => t?.published !== false)
          .map((t) => (
            <div
              key={t.id}
              style={{
                border: "1px solid #eee",
                borderRadius: 12,
                padding: 16,
                background: "#fff",
              }}
            >
              <h2 style={{ margin: 0, fontSize: "1.25rem" }}>{t.name}</h2>
              <p style={{ marginTop: 8, color: "#555", minHeight: 44 }}>{t.description}</p>

              <details style={{ marginTop: 10 }}>
                <summary style={{ cursor: "pointer", color: "#111" }}>View seed prompt</summary>
                <pre
                  style={{
                    marginTop: 10,
                    padding: 12,
                    background: "#f7f7f7",
                    borderRadius: 8,
                    whiteSpace: "pre-wrap",
                    fontSize: 13,
                    lineHeight: 1.4,
                  }}
                >
                  {t.seedPrompt}
                </pre>
              </details>

              <button
                onClick={() => onUseTemplate(t)}
                disabled={usingId === t.id}
                style={{
                  marginTop: 14,
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: 8,
                  border: "1px solid #111",
                  background: usingId === t.id ? "#ddd" : "#111",
                  color: usingId === t.id ? "#333" : "#fff",
                  cursor: usingId === t.id ? "not-allowed" : "pointer",
                  fontSize: 14,
                }}
              >
                {usingId === t.id ? "Creating…" : "Use Template"}
              </button>
            </div>
          ))}
      </div>

      <div style={{ marginTop: 28, color: "#666", fontSize: 13 }}>
        Tip: If you later enable your real templates API, this page will automatically switch to showing those.
      </div>
    </main>
  );
}
