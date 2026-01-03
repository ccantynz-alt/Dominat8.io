"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

type LocalProject = {
  id: string;
  name: string;
  templateId?: string;
  templateName?: string;
  seedPrompt?: string;
  createdAt?: string;
};

export default function ProjectDetailPage() {
  const params = useParams();
  const projectId = String(params?.projectId || "");

  const [project, setProject] = useState<LocalProject | null>(null);
  const [prompt, setPrompt] = useState(
    "Build a modern landing page with pricing, FAQ, and a contact form. Use clean, minimal styling."
  );

  useEffect(() => {
    try {
      const raw = localStorage.getItem(`project:${projectId}`);
      if (raw) {
        const p = JSON.parse(raw) as LocalProject;
        setProject(p);
        if (p?.seedPrompt) setPrompt(p.seedPrompt);
        return;
      }
    } catch {}

    setProject({ id: projectId, name: `Project ${projectId.slice(0, 6)}` });
  }, [projectId]);

  return (
    <main style={{ padding: "3rem", fontFamily: "sans-serif", maxWidth: 980, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "baseline" }}>
        <div>
          <h1 style={{ fontSize: "2.2rem", margin: 0 }}>{project?.name || "Project"}</h1>
          <div style={{ marginTop: 8, color: "#666", fontSize: 14 }}>
            ID: <code>{projectId}</code>
          </div>
          {project?.templateName && (
            <div style={{ marginTop: 8, color: "#111", fontSize: 14 }}>
              Template: <b>{project.templateName}</b>
            </div>
          )}
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          <a href="/templates" style={linkStyle}>Templates</a>
          <a href="/projects" style={linkStyle}>Projects</a>
          <a href="/dashboard" style={linkStyle}>Dashboard</a>
        </div>
      </div>

      <section style={{ marginTop: 22 }}>
        <h2 style={{ fontSize: "1.2rem" }}>Run Prompt</h2>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={8}
          style={{
            width: "100%",
            padding: 12,
            borderRadius: 10,
            border: "1px solid #ddd",
            fontSize: 14,
            lineHeight: 1.4,
          }}
        />

        <div style={{ marginTop: 10, color: "#666", fontSize: 13 }}>
          Next step: wire the real backend run creation. For now, this is your project workspace.
        </div>
      </section>
    </main>
  );
}

const linkStyle: React.CSSProperties = {
  color: "#111",
  textDecoration: "underline",
  fontSize: 14,
};
