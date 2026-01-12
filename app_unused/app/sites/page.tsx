"use client";

import { useEffect, useState } from "react";

type ProjectRow = {
  projectId: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  publishedUrl?: string;
};

export default function SitesPage() {
  const [projects, setProjects] = useState<ProjectRow[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setErr(null);
    setLoading(true);

    try {
      const res = await fetch("/api/projects/list");
      const text = await res.text();
      const json = text ? JSON.parse(text) : null;

      if (!json?.ok) throw new Error(json?.error || "Failed to load projects");

      setProjects(json.projects || []);
      setLoading(false);
    } catch (e: any) {
      setErr(e?.message || "Something went wrong");
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div style={{ maxWidth: 980, margin: "40px auto", padding: 24 }}>
      <h1 style={{ fontSize: 40, margin: 0 }}>My Sites</h1>
      <p style={{ marginTop: 10, opacity: 0.75 }}>
        Your websites and published links in one place.
      </p>

      <div style={{ marginTop: 16 }}>
        <a
          href="/app"
          style={{
            display: "inline-block",
            padding: "12px 16px",
            borderRadius: 12,
            border: "1px solid rgba(0,0,0,0.15)",
            textDecoration: "none",
          }}
        >
          + Create new website
        </a>
      </div>

      {loading && <div style={{ marginTop: 18, opacity: 0.7 }}>Loading…</div>}

      {err && (
        <div style={{ marginTop: 16, padding: 12, border: "1px solid #f99", borderRadius: 10 }}>
          {err}
        </div>
      )}

      {!loading && !err && (
        <div style={{ marginTop: 18, display: "grid", gap: 12 }}>
          {projects.length === 0 ? (
            <div style={{ opacity: 0.75 }}>
              No projects yet. Click “Create new website”.
            </div>
          ) : (
            projects.map((p) => (
              <div
                key={p.projectId}
                style={{
                  padding: 16,
                  border: "1px solid rgba(0,0,0,0.12)",
                  borderRadius: 14,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 700 }}>
                      {p.name || "Untitled site"}
                    </div>
                    <div style={{ marginTop: 6, opacity: 0.7, fontSize: 13 }}>
                      Project: <code>{p.projectId}</code>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                    <a
                      href={`/app/create?projectId=${encodeURIComponent(p.projectId)}`}
                      style={{
                        padding: "10px 12px",
                        borderRadius: 12,
                        border: "1px solid rgba(0,0,0,0.15)",
                        textDecoration: "none",
                      }}
                    >
                      Edit
                    </a>

                    <a
                      href={p.publishedUrl ? p.publishedUrl : `/p/${p.projectId}`}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        padding: "10px 12px",
                        borderRadius: 12,
                        border: "1px solid rgba(0,0,0,0.15)",
                        textDecoration: "none",
                        opacity: p.publishedUrl ? 1 : 0.8,
                      }}
                    >
                      View
                    </a>
                  </div>
                </div>

                <div style={{ marginTop: 10, opacity: 0.65, fontSize: 13 }}>
                  Updated: {new Date(p.updatedAt).toLocaleString()}
                </div>

                {p.publishedUrl && (
                  <div style={{ marginTop: 10, fontSize: 13 }}>
                    Published:{" "}
                    <a href={p.publishedUrl} target="_blank" rel="noreferrer">
                      {p.publishedUrl}
                    </a>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

