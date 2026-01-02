// app/projects/[projectId]/settings/page.tsx
"use client";

import { useEffect, useState } from "react";

type Visibility = "public" | "private";

export default function ProjectSettingsPage({
  params,
}: {
  params: { projectId: string };
}) {
  const [visibility, setVisibility] = useState<Visibility>("private");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setErr(null);
    setOk(null);
    try {
      const res = await fetch(`/api/projects/${params.projectId}/visibility`, {
        cache: "no-store",
      });
      const data = await res.json();
      if (!data?.ok) throw new Error(data?.error || "Failed to load visibility");
      setVisibility(data.visibility === "public" ? "public" : "private");
    } catch (e: any) {
      setErr(e?.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  async function save(next: Visibility) {
    setSaving(true);
    setErr(null);
    setOk(null);
    try {
      const res = await fetch(`/api/projects/${params.projectId}/visibility`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visibility: next }),
      });
      const data = await res.json();
      if (!res.ok || !data?.ok) throw new Error(data?.error || "Failed to save");
      setVisibility(data.visibility === "public" ? "public" : "private");
      setOk(`Saved: visibility is now ${data.visibility.toUpperCase()}`);
    } catch (e: any) {
      setErr(e?.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const publicUrl = `/site/${params.projectId}`;

  return (
    <div style={{ padding: 16, maxWidth: 900 }}>
      <h1 style={{ fontSize: 28, fontWeight: 900, margin: 0 }}>
        Project Settings
      </h1>
      <p style={{ marginTop: 8, opacity: 0.75 }}>
        Control whether this project is publicly viewable.
      </p>

      <div
        style={{
          marginTop: 16,
          border: "1px solid rgba(255,255,255,0.10)",
          borderRadius: 16,
          padding: 16,
        }}
      >
        {loading ? (
          <div style={{ opacity: 0.75 }}>Loading…</div>
        ) : (
          <>
            <div style={{ fontWeight: 900, fontSize: 16 }}>
              Visibility: {visibility.toUpperCase()}
            </div>
            <div style={{ marginTop: 8, fontSize: 13, opacity: 0.75, lineHeight: 1.6 }}>
              <ul style={{ margin: 0, paddingLeft: 18 }}>
                <li>
                  <b>PRIVATE</b>: only admins can view <code>{publicUrl}</code>
                </li>
                <li>
                  <b>PUBLIC</b>: anyone can view <code>{publicUrl}</code>
                </li>
              </ul>
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
              <button
                onClick={() => save("public")}
                disabled={saving || visibility === "public"}
                style={{
                  padding: "10px 14px",
                  borderRadius: 12,
                  border: "1px solid rgba(255,255,255,0.12)",
                  background: visibility === "public" ? "rgba(255,255,255,0.08)" : "transparent",
                  cursor: saving || visibility === "public" ? "not-allowed" : "pointer",
                  opacity: saving ? 0.65 : 1,
                  fontWeight: 800,
                }}
              >
                Make Public
              </button>

              <button
                onClick={() => save("private")}
                disabled={saving || visibility === "private"}
                style={{
                  padding: "10px 14px",
                  borderRadius: 12,
                  border: "1px solid rgba(255,255,255,0.12)",
                  background: visibility === "private" ? "rgba(255,255,255,0.08)" : "transparent",
                  cursor: saving || visibility === "private" ? "not-allowed" : "pointer",
                  opacity: saving ? 0.65 : 1,
                  fontWeight: 800,
                }}
              >
                Make Private
              </button>

              <a
                href={publicUrl}
                style={{
                  padding: "10px 14px",
                  borderRadius: 12,
                  border: "1px solid rgba(255,255,255,0.12)",
                  textDecoration: "none",
                  fontWeight: 800,
                }}
              >
                View Public URL
              </a>
            </div>
          </>
        )}

        {(err || ok) && (
          <div style={{ marginTop: 14 }}>
            {err && (
              <div
                style={{
                  padding: "10px 12px",
                  borderRadius: 12,
                  border: "1px solid rgba(255,0,0,0.25)",
                  background: "rgba(255,0,0,0.08)",
                  fontSize: 13,
                }}
              >
                {err}
              </div>
            )}
            {ok && (
              <div
                style={{
                  marginTop: err ? 10 : 0,
                  padding: "10px 12px",
                  borderRadius: 12,
                  border: "1px solid rgba(0,255,0,0.18)",
                  background: "rgba(0,255,0,0.07)",
                  fontSize: 13,
                }}
              >
                {ok}
              </div>
            )}
          </div>
        )}
      </div>

      <div style={{ marginTop: 16, opacity: 0.8, fontSize: 13, lineHeight: 1.6 }}>
        Tip: You can link directly to this page from your project UI later:
        <code style={{ marginLeft: 6 }}>/projects/{params.projectId}/settings</code>
      </div>
    </div>
  );
}
