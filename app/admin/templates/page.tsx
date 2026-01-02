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
  updatedAt?: string;
};

const blank: Partial<Template> = {
  name: "",
  description: "",
  category: "General",
  seedPrompt:
    "Build a modern landing page with a hero, benefits, testimonials, pricing, and a contact form.",
  published: false,
};

export default function AdminTemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [editing, setEditing] = useState<Partial<Template>>(blank);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/templates", { cache: "no-store" });
    const data = await res.json();
    setTemplates(data.templates || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function save() {
    setBusy(true);
    const res = await fetch("/api/templates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editing),
    });
    await res.json();
    setEditing(blank);
    await load();
    setBusy(false);
  }

  async function del(id: string) {
    if (!confirm("Delete this template?")) return;
    setBusy(true);
    await fetch(`/api/templates/${id}`, { method: "DELETE" });
    await load();
    setBusy(false);
  }

  return (
    <div style={{ padding: 16, maxWidth: 1100 }}>
      <h1>Admin Templates</h1>

      <div style={{ marginTop: 12, border: "1px solid #ddd", padding: 12 }}>
        <h2>{editing.id ? "Edit template" : "New template"}</h2>

        <div style={{ display: "grid", gap: 8 }}>
          <input
            style={{ padding: 8 }}
            placeholder="Name"
            value={editing.name || ""}
            onChange={(e) => setEditing({ ...editing, name: e.target.value })}
          />
          <input
            style={{ padding: 8 }}
            placeholder="Category"
            value={editing.category || ""}
            onChange={(e) => setEditing({ ...editing, category: e.target.value })}
          />
          <textarea
            style={{ padding: 8, minHeight: 70 }}
            placeholder="Description"
            value={editing.description || ""}
            onChange={(e) => setEditing({ ...editing, description: e.target.value })}
          />
          <textarea
            style={{ padding: 8, minHeight: 140 }}
            placeholder="Seed prompt"
            value={editing.seedPrompt || ""}
            onChange={(e) => setEditing({ ...editing, seedPrompt: e.target.value })}
          />
          <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input
              type="checkbox"
              checked={Boolean(editing.published)}
              onChange={(e) => setEditing({ ...editing, published: e.target.checked })}
            />
            Published
          </label>

          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={save} disabled={busy}>
              {busy ? "Saving..." : "Save"}
            </button>
            <button onClick={() => setEditing(blank)} disabled={busy}>
              Clear
            </button>
          </div>
        </div>
      </div>

      <h2 style={{ marginTop: 18 }}>All templates</h2>
      {loading ? <p>Loading...</p> : null}

      <div style={{ display: "grid", gap: 10, marginTop: 10 }}>
        {templates.map((t) => (
          <div key={t.id} style={{ border: "1px solid #ddd", padding: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
              <div>
                <div style={{ fontWeight: 700 }}>{t.name}</div>
                <div style={{ opacity: 0.8 }}>
                  {t.category} • {t.published ? "Published" : "Draft"}
                </div>
                <p style={{ marginTop: 8 }}>{t.description}</p>
                <div style={{ opacity: 0.8 }}>
                  <code>{t.id}</code>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 8, minWidth: 140 }}>
                <button onClick={() => setEditing(t)} disabled={busy}>
                  Edit
                </button>
                <button onClick={() => del(t.id)} disabled={busy}>
                  Delete
                </button>
              </div>
            </div>

            <details style={{ marginTop: 8 }}>
              <summary>Seed prompt</summary>
              <pre style={{ whiteSpace: "pre-wrap" }}>{t.seedPrompt}</pre>
            </details>
          </div>
        ))}
      </div>
    </div>
  );
}
