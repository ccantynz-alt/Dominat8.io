"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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
  const router = useRouter();

  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setErr(null);

    const res = await fetch("/api/templates", { cache: "no-store" });
    const data = await res.json();
    setTemplates((data.templates || []).filter((t: Template) => t.published));
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function useTemplate(t: Template) {
    const name =
      prompt(
        `Project name for "${t.name}"`,
        `${t.name} Site`
      ) || "";

    if (!name.trim()) return;

    setBusyId(t.id);
    setErr(null);

    try {
      const res = await fetch(`/api/templates/${t.id}/use`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectName: name.trim(), createRun: true }),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || "Failed to use template");

      // Redirect to the project
      router.push(`/projects/${data.projectId}`);
    } catch (e: any) {
      setErr(e?.message || "Failed");
      setBusyId(null);
    }
  }

  return (
    <div style={{ padding: 16, maxWidth: 1000 }}>
      <h1>Templates</h1>
      <p style={{ opacity: 0.8 }}>
        Pick a starting point, then generate a site from it.
      </p>

      {loading ? <p>Loading...</p> : null}
      {err ? <p style={{ marginTop: 12 }}>❌ {err}</p> : null}

      <div style={{ marginTop: 16, display: "grid", gap: 12 }}>
        {templates.map((t) => {
          const busy = busyId === t.id;

          return (
            <div key={t.id} style={{ border: "1px solid #ddd", padding: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 18 }}>{t.name}</div>
                  <div style={{ opacity: 0.8 }}>{t.category}</div>
                  <p style={{ marginTop: 8 }}>{t.description}</p>

                  <details style={{ marginTop: 8 }}>
                    <summary>View seed prompt</summary>
                    <pre style={{ whiteSpace: "pre-wrap" }}>{t.seedPrompt}</pre>
                  </details>
                </div>

                <div style={{ minWidth: 160, display: "flex", flexDirection: "column", gap: 8 }}>
                  <button onClick={() => useTemplate(t)} disabled={busy}>
                    {busy ? "Creating..." : "Use Template"}
                  </button>

                  <button onClick={load} disabled={busy}>
                    Refresh
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
