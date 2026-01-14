// src/app/projects/[projectId]/EditorClient.tsx
"use client";

import * as React from "react";
import type { TemplateScaffoldSection } from "@/app/lib/templateScaffolds";
import type { ProjectContentV1 } from "@/app/lib/projectContentStore";

type Props = {
  projectId: string;
  initialTemplateId: string | null;
  initialSections: TemplateScaffoldSection[];
  source: "saved-content" | "scaffold";
};

export default function EditorClient({
  projectId,
  initialTemplateId,
  initialSections,
  source,
}: Props) {
  const [templateId] = React.useState<string | null>(initialTemplateId);
  const [sections, setSections] = React.useState<TemplateScaffoldSection[]>(initialSections);

  const [saving, setSaving] = React.useState(false);
  const [publishing, setPublishing] = React.useState(false);

  const [status, setStatus] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  function updateSection(idx: number, patch: Partial<TemplateScaffoldSection>) {
    setSections((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], ...patch };
      return next;
    });
  }

  function updateItem(idx: number, itemIdx: number, value: string) {
    setSections((prev) => {
      const next = [...prev];
      const sec = next[idx];
      const items = Array.isArray(sec.items) ? [...sec.items] : [];
      items[itemIdx] = value;
      next[idx] = { ...sec, items };
      return next;
    });
  }

  function addItem(idx: number) {
    setSections((prev) => {
      const next = [...prev];
      const sec = next[idx];
      const items = Array.isArray(sec.items) ? [...sec.items] : [];
      items.push("New item");
      next[idx] = { ...sec, items };
      return next;
    });
  }

  function removeItem(idx: number, itemIdx: number) {
    setSections((prev) => {
      const next = [...prev];
      const sec = next[idx];
      const items = Array.isArray(sec.items) ? [...sec.items] : [];
      items.splice(itemIdx, 1);
      next[idx] = { ...sec, items };
      return next;
    });
  }

  async function onSave() {
    setSaving(true);
    setError(null);
    setStatus(null);
    try {
      const content: ProjectContentV1 = {
        version: 1,
        updatedAt: new Date().toISOString(),
        templateId,
        sections,
      };

      const res = await fetch(`/api/projects/${projectId}/content`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });

      const json = await res.json().catch(() => null);

      if (!res.ok || !json?.ok) {
        throw new Error(json?.error || `Save failed (HTTP ${res.status})`);
      }

      setStatus("Saved ✅");
    } catch (e: any) {
      setError(e?.message || "Save failed.");
    } finally {
      setSaving(false);
    }
  }

  async function onPublish() {
    setPublishing(true);
    setError(null);
    setStatus(null);
    try {
      // Publish uses saved content if present; otherwise scaffold fallback
      const res = await fetch(`/api/projects/${projectId}/publish`, { method: "POST" });
      const json = await res.json().catch(() => null);

      if (!res.ok || !json?.ok) {
        throw new Error(json?.error || `Publish failed (HTTP ${res.status})`);
      }

      const url = json?.publicUrl || `/p/${projectId}`;
      setStatus(`Published ✅  ${url}`);
      window.open(url, "_blank");
    } catch (e: any) {
      setError(e?.message || "Publish failed.");
    } finally {
      setPublishing(false);
    }
  }

  async function onResetToScaffold() {
    setSaving(true);
    setError(null);
    setStatus(null);
    try {
      const res = await fetch(`/api/projects/${projectId}/content`, { method: "DELETE" });
      const json = await res.json().catch(() => null);

      if (!res.ok || !json?.ok) {
        throw new Error(json?.error || `Reset failed (HTTP ${res.status})`);
      }

      window.location.reload();
    } catch (e: any) {
      setError(e?.message || "Reset failed.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ maxWidth: 980, margin: "0 auto", padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 6 }}>Builder (V1)</h1>
          <div style={{ opacity: 0.8 }}>
            <div><b>projectId:</b> {projectId}</div>
            <div><b>templateId:</b> {templateId ?? "null"}</div>
            <div><b>loaded from:</b> {source}</div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", justifyContent: "flex-end" }}>
          <button
            type="button"
            onClick={onResetToScaffold}
            disabled={saving || publishing}
            style={{
              padding: "10px 12px",
              borderRadius: 12,
              border: "1px solid rgba(0,0,0,0.22)",
              background: "white",
              fontWeight: 800,
              cursor: (saving || publishing) ? "not-allowed" : "pointer",
              opacity: (saving || publishing) ? 0.7 : 1,
            }}
          >
            Reset to scaffold
          </button>

          <button
            type="button"
            onClick={onSave}
            disabled={saving || publishing}
            style={{
              padding: "10px 14px",
              borderRadius: 12,
              border: "1px solid rgba(0,0,0,0.22)",
              background: "black",
              color: "white",
              fontWeight: 900,
              cursor: (saving || publishing) ? "not-allowed" : "pointer",
              opacity: (saving || publishing) ? 0.7 : 1,
              minWidth: 110,
            }}
          >
            {saving ? "Saving..." : "Save"}
          </button>

          <button
            type="button"
            onClick={onPublish}
            disabled={publishing || saving}
            style={{
              padding: "10px 14px",
              borderRadius: 12,
              border: "1px solid rgba(0,0,0,0.22)",
              background: "#0b5",
              color: "white",
              fontWeight: 900,
              cursor: (publishing || saving) ? "not-allowed" : "pointer",
              opacity: (publishing || saving) ? 0.7 : 1,
              minWidth: 120,
            }}
          >
            {publishing ? "Publishing..." : "Publish"}
          </button>
        </div>
      </div>

      {status ? (
        <div style={{ marginTop: 12, border: "1px solid rgba(0,128,0,0.25)", background: "rgba(0,128,0,0.06)", padding: 10, borderRadius: 12 }}>
          {status}
        </div>
      ) : null}

      {error ? (
        <div style={{ marginTop: 12, border: "1px solid rgba(255,0,0,0.25)", background: "rgba(255,0,0,0.06)", padding: 10, borderRadius: 12 }}>
          <b>Error:</b> {error}
        </div>
      ) : null}

      <div style={{ marginTop: 18, display: "grid", gap: 12 }}>
        {sections.map((sec, idx) => (
          <div key={sec.id || idx} style={{ border: "1px solid rgba(0,0,0,0.12)", borderRadius: 14, padding: 14 }}>
            <div style={{ fontWeight: 900 }}>
              {sec.type.toUpperCase()} <span style={{ opacity: 0.6, fontWeight: 700 }}>(id: {sec.id})</span>
            </div>

            <div style={{ marginTop: 10, display: "grid", gap: 10 }}>
              <label style={{ display: "grid", gap: 6 }}>
                <span style={{ fontWeight: 800, opacity: 0.8 }}>Heading</span>
                <input
                  value={sec.heading || ""}
                  onChange={(e) => updateSection(idx, { heading: e.target.value })}
                  placeholder="Heading"
                  style={{
                    width: "100%",
                    padding: 10,
                    borderRadius: 12,
                    border: "1px solid rgba(0,0,0,0.18)",
                    outline: "none",
                  }}
                />
              </label>

              <label style={{ display: "grid", gap: 6 }}>
                <span style={{ fontWeight: 800, opacity: 0.8 }}>Subheading</span>
                <input
                  value={sec.subheading || ""}
                  onChange={(e) => updateSection(idx, { subheading: e.target.value })}
                  placeholder="Subheading"
                  style={{
                    width: "100%",
                    padding: 10,
                    borderRadius: 12,
                    border: "1px solid rgba(0,0,0,0.18)",
                    outline: "none",
                  }}
                />
              </label>

              <div style={{ display: "grid", gap: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontWeight: 800, opacity: 0.8 }}>Items</span>
                  <button
                    type="button"
                    onClick={() => addItem(idx)}
                    style={{
                      padding: "8px 10px",
                      borderRadius: 12,
                      border: "1px solid rgba(0,0,0,0.22)",
                      background: "white",
                      fontWeight: 800,
                      cursor: "pointer",
                    }}
                  >
                    + Add item
                  </button>
                </div>

                {(sec.items || []).map((it, itemIdx) => (
                  <div key={itemIdx} style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <input
                      value={it}
                      onChange={(e) => updateItem(idx, itemIdx, e.target.value)}
                      style={{
                        flex: 1,
                        padding: 10,
                        borderRadius: 12,
                        border: "1px solid rgba(0,0,0,0.18)",
                        outline: "none",
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => removeItem(idx, itemIdx)}
                      style={{
                        padding: "10px 12px",
                        borderRadius: 12,
                        border: "1px solid rgba(0,0,0,0.22)",
                        background: "white",
                        fontWeight: 900,
                        cursor: "pointer",
                      }}
                    >
                      ✕
                    </button>
                  </div>
                ))}

                {!sec.items || sec.items.length === 0 ? (
                  <div style={{ opacity: 0.65, fontSize: 13 }}>No items yet (optional).</div>
                ) : null}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 18, opacity: 0.7, fontSize: 13 }}>
        Publish V1 stores a published snapshot in KV and serves it at /p/[projectId].
      </div>
    </div>
  );
}
