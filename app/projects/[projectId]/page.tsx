"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type Project = { id: string; name: string; createdAt?: string };
type Run = { id: string; status: string; createdAt?: string; prompt?: string };

export default function ProjectDetailPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = String(params?.projectId || "");

  const [project, setProject] = useState<Project | null>(null);
  const [runs, setRuns] = useState<Run[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [prompt, setPrompt] = useState(
    "Build a modern landing page with pricing, FAQ, and a contact form. Use clean, minimal styling."
  );
  const [running, setRunning] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setErr(null);

        // Try to load a real project (if your API exists)
        const pr = await fetch(`/api/projects/${encodeURIComponent(projectId)}`, { cache: "no-store" });

        if (pr.ok) {
          const pj = await pr.json();
          const p = pj?.project || pj;
          if (!cancelled && p?.id) setProject(p);
        } else {
          // Fallback: still show a usable page
          if (!cancelled) setProject({ id: projectId, name: `Project ${projectId.slice(0, 6)}` });
        }

        // Try to load runs (if endpoint exists)
        const rr = await fetch(`/api/projects/${encodeURIComponent(projectId)}/runs`, { cache: "no-store" });
        if (rr.ok) {
          const rj = await rr.json();
          const list = Array.isArray(rj?.runs) ? rj.runs : Array.isArray(rj) ? rj : [];
          if (!cancelled) setRuns(list);
        }
      } catch (e: any) {
        if (!cancelled) {
          setErr(e?.message || "Could not load project.");
          setProject({ id: projectId, name: `Project ${projectId.slice(0, 6)}` });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    if (projectId) load();

    return () => {
      cancelled = true;
    };
  }, [projectId]);

  async function createRun() {
    try {
      setRunning(true);
      setErr(null);

      const res = await fetch(`/api/projects/${encodeURIComponent(projectId)}/runs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      if (!res.ok) {
        throw new Error(
          "Run creation failed. (This usually means the /api/projects/[projectId]/runs endpoint isn’t ready yet.)"
        );
      }

      const data = await res.json();
      const newRun = data?.run || data;
      if (newRun?.id) {
        setRuns((prev) => [newRun, ...prev]);
      }
    } catch (e: any) {
      setErr(e?.message || "Failed to create run.");
    } finally {
      setRunning(false);
    }
  }

  return (
    <main style={{ padding: "3rem", fontFamily: "sans-serif", maxWidth: 980, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "baseline" }}>
        <div>
          <h1 style={{ fontSize: "2.2rem", margin: 0 }}>
            {project?.name || "Project"}
          </h1>
          <div style={{ marginTop: 6, color: "#666", fontSize: 14 }}>
            ID: <code>{projectId}</code>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <a href="/templates" style={linkStyle}>Templates</a>
          <a href="/projects" style={linkStyle}>Projects</a>
          <button
            onClick={() => router.push("/dashboard")}
            style={{ ...btnStyle, background: "#fff", color: "#111", border: "1px solid #111" }}
          >
            Dashboard
          </button>
        </div>
      </div>

      {loading && (
        <div style={panelStyle}>Loading project…</div>
      )}

      {err && (
        <div style={{ ...panelStyle, borderColor: "#f3c2c2", background: "#fff7f7", color: "#8a1f1f" }}>
          {err}
        </div>
      )}

      <section style={{ marginTop: 22 }}>
        <h2 style={{ fontSize: "1.2rem" }}>Create a Run</h2>

        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={6}
          style={{
            width: "100%",
            padding: 12,
            borderRadius: 10,
            border: "1px solid #ddd",
            fontSize: 14,
            lineHeight: 1.4,
          }}
        />

        <div style={{ marginTop: 10, display: "flex", gap: 10 }}>
          <button
            onClick={createRun}
            disabled={running || !prompt.trim()}
            style={{
              ...btnStyle,
              opacity: running || !prompt.trim() ? 0.6 : 1,
              cursor: running || !prompt.trim() ? "not-allowed" : "pointer",
            }}
          >
            {running ? "Creating…" : "Create Run"}
          </button>

          <button
            onClick={() => setPrompt("")}
            style={{ ...btnStyle, background: "#fff", color: "#111", border: "1px solid #ddd" }}
          >
            Clear
          </button>
        </div>

        <div style={{ marginTop: 10, color: "#666", fontSize: 13 }}>
          If the runs API isn’t ready yet, you’ll still have a working page — we’ll wire the backend next.
        </div>
      </section>

      <section style={{ marginTop: 26 }}>
        <h2 style={{ fontSize: "1.2rem" }}>Runs</h2>

        {runs.length === 0 ? (
          <div style={panelStyle}>No runs yet.</div>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            {runs.map((r) => (
              <div key={r.id} style={panelStyle}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                  <div>
                    <div style={{ fontWeight: 700 }}>
                      Run: <code>{r.id}</code>
                    </div>
                    <div style={{ color: "#666", fontSize: 13 }}>
                      Status: <b>{r.status}</b>
                      {r.createdAt ? ` • ${new Date(r.createdAt).toLocaleString()}` : ""}
                    </div>
                  </div>
                </div>

                {r.prompt && (
                  <details style={{ marginTop: 8 }}>
                    <summary style={{ cursor: "pointer" }}>View prompt</summary>
                    <pre style={{ marginTop: 8, whiteSpace: "pre-wrap", background: "#f7f7f7", padding: 10, borderRadius: 8 }}>
                      {r.prompt}
                    </pre>
                  </details>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

const panelStyle: React.CSSProperties = {
  marginTop: 14,
  padding: 14,
  border: "1px solid #eee",
  borderRadius: 12,
  background: "#fff",
};

const btnStyle: React.CSSProperties = {
  padding: "10px 14px",
  borderRadius: 10,
  border: "1px solid #111",
  background: "#111",
  color: "#fff",
  fontSize: 14,
};

const linkStyle: React.CSSProperties = {
  color: "#111",
  textDecoration: "underline",
  fontSize: 14,
};
