"use client";

import { useEffect, useState } from "react";

type Template = {
  id: string;
  name: string;
  description: string;
  seedPrompt: string;
  published: boolean;
  createdAt?: string;
};

function makeId(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60);
}

export default function AdminTemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [seedPrompt, setSeedPrompt] = useState(
    "Build a modern landing page with pricing, FAQ, and a contact form. Use clean, minimal styling."
  );
  const [published, setPublished] = useState(true);
  const [saving, setSaving] = useState(false);

  async function loadTemplates() {
    try {
      setLoading(true);
      setMsg(null);

      const res = await fetch("/api/templates", { cache: "no-store" });
      if (!res.ok) {
        setTemplates([]);
        setMsg("Templates API not available yet — you can still draft templates here.");
        return;
      }

      const data = await res.json();
      const list = Array.isArray(data?.templates) ? data.templates : Array.isArray(data) ? data : [];
      setTemplates(list);
    } catch (e: any) {
      setTemplates([]);
      setMsg(e?.message || "Could not load templates — API not available yet.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTemplates();
  }, []);

  async function createTemplate() {
    try {
      setSaving(true);
      setMsg(null);

      const id = makeId(name) || `template-${Date.now()}`;

      const newTemplate: Template = {
        id,
        name: name.trim(),
        description: description.trim(),
        seedPrompt: seedPrompt.trim(),
        published,
      };

      if (!newTemplate.name) throw new Error("Template name is required.");
      if (!newTemplate.description) throw new Error("Template description is required.");
      if (!newTemplate.seedPrompt) throw new Error("Seed prompt is required.");

      // Try API first
      const res = await fetch("/api/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTemplate),
      });

      if (res.ok) {
        await loadTemplates();
        setName("");
        setDescription("");
        setSeedPrompt(
          "Build a modern landing page with pricing, FAQ, and a contact form. Use clean, minimal styling."
        );
        setPublished(true);
        setMsg("✅ Template saved to API.");
        return;
      }

      // If API not available, save locally in UI so it feels productive
      setTemplates((prev) => [{ ...newTemplate, createdAt: new Date().toISOString() }, ...prev]);
      setMsg("⚠️ Templates API not available — saved locally in the UI for now.");
      setName("");
      setDescription("");
      setPublished(true);
    } catch (e: any) {
      setMsg(e?.message || "Failed to create template.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main style={{ padding: "3rem", fontFamily: "sans-serif", maxWidth: 1100, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "baseline" }}>
        <div>
          <h1 style={{ fontSize: "2.2rem", margin: 0 }}>Admin • Templates</h1>
          <p style={{ marginTop: 10, color: "#555" }}>
            Create and publish templates for users to use on <code>/templates</code>.
          </p>
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          <a href="/admin" style={linkStyle}>Admin</a>
          <a href="/templates" style={linkStyle}>Public Templates</a>
          <a href="/dashboard" style={linkStyle}>Dashboard</a>
        </div>
      </div>

      {msg && (
        <div style={{ ...panelStyle, marginTop: 16, borderColor: "#f3e2a6", background: "#fffdf2" }}>
          {msg}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 18 }}>
        <section style={panelStyle}>
          <h2 style={h2Style}>Create template</h2>

          <label style={labelStyle}>Template name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Minimal Landing Page"
            style={inputStyle}
          />

          <label style={labelStyle}>Description</label>
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Short description users will see"
            style={inputStyle}
          />

          <label style={labelStyle}>Seed prompt</label>
          <textarea
            value={seedPrompt}
            onChange={(e) => setSeedPrompt(e.target.value)}
            rows={8}
            style={{ ...inputStyle, fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace" }}
          />

          <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 10 }}>
            <input
              id="published"
              type="checkbox"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
            />
            <label htmlFor="published" style={{ color: "#111" }}>
              Published (visible to users)
            </label>
          </div>

          <button
            onClick={createTemplate}
            disabled={saving}
            style={{
              ...btnStyle,
              marginTop: 14,
              opacity: saving ? 0.7 : 1,
              cursor: saving ? "not-allowed" : "pointer",
            }}
          >
            {saving ? "Saving…" : "Create template"}
          </button>

          <div style={{ marginTop: 10, color: "#666", fontSize: 13 }}>
            If your API isn’t wired yet, this page still works — it will save locally in the UI for now.
          </div>
        </section>

        <section style={panelStyle}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10 }}>
            <h2 style={h2Style}>Templates</h2>
            <button
              onClick={loadTemplates}
              style={{ ...btnStyle, background: "#fff", color: "#111", border: "1px solid #ddd" }}
            >
              Refresh
            </button>
          </div>

          {loading ? (
            <div style={{ color: "#666" }}>Loading…</div>
          ) : templates.length === 0 ? (
            <div style={{ color: "#666" }}>No templates yet.</div>
          ) : (
            <div style={{ display: "grid", gap: 10 }}>
              {templates.map((t) => (
                <div key={t.id} style={{ border: "1px solid #eee", borderRadius: 12, padding: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                    <div>
                      <div style={{ fontWeight: 800 }}>{t.name}</div>
                      <div style={{ color: "#666", fontSize: 13 }}>{t.description}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 12, color: "#666" }}>
                        <code>{t.id}</code>
                      </div>
                      <div style={{ fontSize: 12 }}>
                        {t.published ? "✅ Published" : "⛔ Draft"}
                      </div>
                    </div>
                  </div>

                  <details style={{ marginTop: 10 }}>
                    <summary style={{ cursor: "pointer" }}>View seed prompt</summary>
                    <pre style={{ marginTop: 8, whiteSpace: "pre-wrap", background: "#f7f7f7", padding: 10, borderRadius: 10 }}>
                      {t.seedPrompt}
                    </pre>
                  </details>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

const panelStyle: React.CSSProperties = {
  padding: 16,
  border: "1px solid #eee",
  borderRadius: 12,
  background: "#fff",
};

const h2Style: React.CSSProperties = {
  marginTop: 0,
  marginBottom: 10,
  fontSize: "1.1rem",
};

const linkStyle: React.CSSProperties = {
  color: "#111",
  textDecoration: "underline",
  fontSize: 14,
};

const labelStyle: React.CSSProperties = {
  display: "block",
  marginTop: 12,
  marginBottom: 6,
  color: "#111",
  fontWeight: 700,
  fontSize: 13,
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid #ddd",
  fontSize: 14,
};

const btnStyle: React.CSSProperties = {
  padding: "10px 14px",
  borderRadius: 10,
  border: "1px solid #111",
  background: "#111",
  color: "#fff",
  fontSize: 14,
};
