"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type Status = "loading" | "ready" | "error";

type PreviewState =
  | { state: "idle"; message: string }
  | { state: "loading"; message: string }
  | { state: "ready"; html: string }
  | { state: "error"; message: string };

type ToastTone = "neutral" | "success" | "danger";

type Toast = {
  tone: ToastTone;
  title: string;
  message: string;
};

type Modal =
  | { open: false }
  | { open: true; kind: "importHtml" }
  | { open: true; kind: "importZip" };

export default function ProjectBuilderPage() {
  const router = useRouter();
  const params = useParams();

  const projectId = useMemo(() => {
    const raw = params?.projectId;
    if (typeof raw === "string") return raw;
    if (Array.isArray(raw)) return raw[0];
    return null;
  }, [params]);

  const [status, setStatus] = useState<Status>("loading");
  const [busy, setBusy] = useState(false);

  const [preview, setPreview] = useState<PreviewState>({
    state: "idle",
    message: "Preview not loaded yet.",
  });

  const [toast, setToast] = useState<Toast | null>(null);

  const [modal, setModal] = useState<Modal>({ open: false });

  const [htmlToImport, setHtmlToImport] = useState<string>("");
  const [zipFile, setZipFile] = useState<File | null>(null);

  useEffect(() => {
    if (!projectId) {
      setStatus("error");
      return;
    }
    setStatus("ready");
  }, [projectId]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 5000);
    return () => clearTimeout(t);
  }, [toast]);

  const headerBadge = (() => {
    if (status === "loading") return { label: "Loading", tone: "neutral" as const };
    if (status === "ready") return { label: "Ready", tone: "success" as const };
    return { label: "Error", tone: "danger" as const };
  })();

  const badgeStyle = (tone: "neutral" | "success" | "danger") => {
    const base: React.CSSProperties = {
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
      padding: "6px 10px",
      borderRadius: 999,
      fontSize: 12,
      border: "1px solid #ddd",
      background: "#fff",
    };

    if (tone === "success") return { ...base, borderColor: "#b7ebc6", background: "#f0fff4" };
    if (tone === "danger") return { ...base, borderColor: "#ffd1d1", background: "#fff5f5" };
    return base;
  };

  async function loadPreview() {
    if (!projectId) return;

    setPreview({ state: "loading", message: "Loading preview from server…" });

    try {
      const res = await fetch(`/api/projects/${projectId}/preview`, { method: "GET" });
      const text = await res.text();

      if (!res.ok) {
        setPreview({
          state: "error",
          message: `Preview API error (${res.status}): ${text}`,
        });
        return;
      }

      let data: any = null;
      try {
        data = JSON.parse(text);
      } catch {
        setPreview({ state: "ready", html: text });
        return;
      }

      if (data?.ok && typeof data?.html === "string") {
        setPreview({ state: "ready", html: data.html });
        return;
      }

      setPreview({
        state: "error",
        message: `Unexpected preview response: ${text}`,
      });
    } catch (err: any) {
      setPreview({
        state: "error",
        message: err?.message ? String(err.message) : "Unknown error while loading preview.",
      });
    }
  }

  async function generateNow() {
    if (!projectId) return;

    setBusy(true);
    setToast(null);

    try {
      const res = await fetch(`/api/projects/${projectId}/generate`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          prompt:
            "Create a professional business website with hero, services, testimonials, about, and contact. Clean modern styling.",
        }),
      });

      const text = await res.text();

      if (!res.ok) {
        setToast({
          tone: "danger",
          title: "Generate failed",
          message: `(${res.status}) ${text}`,
        });
        return;
      }

      setToast({
        tone: "success",
        title: "Generated",
        message: "Generation completed. Loading preview…",
      });

      await loadPreview();
    } catch (err: any) {
      setToast({
        tone: "danger",
        title: "Generate error",
        message: err?.message ? String(err.message) : "Unknown error during generate.",
      });
    } finally {
      setBusy(false);
    }
  }

  async function importHtmlNow() {
    if (!projectId) return;

    const html = htmlToImport.trim();
    if (!html) {
      setToast({
        tone: "danger",
        title: "Import HTML",
        message: "Paste some HTML first.",
      });
      return;
    }

    setBusy(true);
    setToast(null);

    try {
      // Expected route (already in your repo):
      // POST /api/projects/:projectId/import/html
      const res = await fetch(`/api/projects/${projectId}/import/html`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ html }),
      });

      const text = await res.text();

      if (!res.ok) {
        setToast({
          tone: "danger",
          title: "HTML import failed",
          message: `(${res.status}) ${text}`,
        });
        return;
      }

      setToast({
        tone: "success",
        title: "HTML imported",
        message: "Import completed. Loading preview…",
      });

      setModal({ open: false });
      await loadPreview();
    } catch (err: any) {
      setToast({
        tone: "danger",
        title: "HTML import error",
        message: err?.message ? String(err.message) : "Unknown error importing HTML.",
      });
    } finally {
      setBusy(false);
    }
  }

  async function importZipNow() {
    if (!projectId) return;

    if (!zipFile) {
      setToast({
        tone: "danger",
        title: "Import ZIP",
        message: "Choose a .zip file first.",
      });
      return;
    }

    setBusy(true);
    setToast(null);

    try {
      // Expected route (already in your repo):
      // POST /api/projects/:projectId/import/zip
      // We send FormData so the server can read the uploaded zip.
      const form = new FormData();
      form.append("file", zipFile);

      const res = await fetch(`/api/projects/${projectId}/import/zip`, {
        method: "POST",
        body: form,
      });

      const text = await res.text();

      if (!res.ok) {
        setToast({
          tone: "danger",
          title: "ZIP import failed",
          message: `(${res.status}) ${text}`,
        });
        return;
      }

      setToast({
        tone: "success",
        title: "ZIP imported",
        message: "Import completed. Loading preview…",
      });

      setModal({ open: false });
      await loadPreview();
    } catch (err: any) {
      setToast({
        tone: "danger",
        title: "ZIP import error",
        message: err?.message ? String(err.message) : "Unknown error importing ZIP.",
      });
    } finally {
      setBusy(false);
    }
  }

  function closeModal() {
    setModal({ open: false });
  }

  if (status === "loading") {
    return (
      <div style={{ minHeight: "100vh", background: "#fafafa" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: 24 }}>
          <div
            style={{
              border: "1px solid #eee",
              borderRadius: 16,
              background: "white",
              padding: 20,
              fontFamily: "system-ui",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 999,
                  background: "#999",
                }}
              />
              <div style={{ fontSize: 14, color: "#333" }}>Loading project…</div>
            </div>
            <div
              style={{
                marginTop: 16,
                height: 10,
                borderRadius: 999,
                background: "#f1f1f1",
                overflow: "hidden",
              }}
            >
              <div style={{ width: "60%", height: "100%", background: "#e7e7e7" }} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div style={{ minHeight: "100vh", background: "#fafafa", fontFamily: "system-ui" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: 24 }}>
          <div
            style={{
              border: "1px solid #eee",
              borderRadius: 16,
              background: "white",
              padding: 20,
            }}
          >
            <h1 style={{ margin: 0, fontSize: 20 }}>Invalid project</h1>
            <p style={{ marginTop: 10, marginBottom: 0, color: "#444" }}>
              We couldn’t read the project id from the URL.
            </p>

            <div style={{ marginTop: 16, display: "flex", gap: 10 }}>
              <button
                onClick={() => router.push("/projects")}
                style={{
                  padding: "10px 14px",
                  borderRadius: 12,
                  border: "1px solid #ddd",
                  background: "white",
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                Back to projects
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#fafafa", fontFamily: "system-ui" }}>
      {/* Toast */}
      {toast ? (
        <div
          style={{
            position: "fixed",
            top: 18,
            right: 18,
            zIndex: 60,
            width: 380,
            borderRadius: 16,
            border: "1px solid #eee",
            background:
              toast.tone === "success"
                ? "#f0fff4"
                : toast.tone === "danger"
                  ? "#fff5f5"
                  : "white",
            padding: 14,
            boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
          }}
        >
          <div style={{ fontWeight: 800, color: "#111" }}>{toast.title}</div>
          <div style={{ marginTop: 6, fontSize: 13, color: "#333", whiteSpace: "pre-wrap" }}>
            {toast.message}
          </div>
        </div>
      ) : null}

      {/* Modal overlay */}
      {modal.open ? (
        <div
          onClick={() => closeModal()}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.35)",
            zIndex: 55,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "min(920px, 100%)",
              background: "white",
              borderRadius: 16,
              border: "1px solid #eee",
              boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: 14,
                borderBottom: "1px solid #eee",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 10,
              }}
            >
              <div style={{ fontWeight: 900, color: "#111" }}>
                {modal.kind === "importHtml" ? "Import HTML" : "Import ZIP"}
              </div>
              <button
                onClick={() => closeModal()}
                style={{
                  padding: "8px 12px",
                  borderRadius: 12,
                  border: "1px solid #ddd",
                  background: "white",
                  cursor: "pointer",
                  fontWeight: 700,
                }}
              >
                Close
              </button>
            </div>

            <div style={{ padding: 14 }}>
              {modal.kind === "importHtml" ? (
                <>
                  <div style={{ fontSize: 13, color: "#555", lineHeight: 1.4 }}>
                    Paste a full HTML document. Then click <b>Import HTML</b>.
                  </div>
                  <textarea
                    value={htmlToImport}
                    onChange={(e) => setHtmlToImport(e.target.value)}
                    placeholder="Paste HTML here…"
                    style={{
                      marginTop: 12,
                      width: "100%",
                      height: 380,
                      resize: "vertical",
                      borderRadius: 14,
                      border: "1px solid #ddd",
                      padding: 12,
                      fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                      fontSize: 12,
                      lineHeight: 1.5,
                    }}
                  />
                  <div style={{ marginTop: 12, display: "flex", gap: 10, justifyContent: "flex-end" }}>
                    <button
                      disabled={busy}
                      onClick={() => importHtmlNow()}
                      style={{
                        padding: "12px 14px",
                        borderRadius: 14,
                        border: "1px solid #ddd",
                        background: busy ? "#f3f4f6" : "#111",
                        color: busy ? "#777" : "white",
                        cursor: busy ? "not-allowed" : "pointer",
                        fontWeight: 800,
                      }}
                    >
                      {busy ? "Working…" : "Import HTML"}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div style={{ fontSize: 13, color: "#555", lineHeight: 1.4 }}>
                    Choose a <b>.zip</b> file, then click <b>Import ZIP</b>.
                  </div>

                  <div
                    style={{
                      marginTop: 12,
                      border: "1px solid #eee",
                      borderRadius: 14,
                      background: "#fafafa",
                      padding: 12,
                    }}
                  >
                    <input
                      type="file"
                      accept=".zip,application/zip"
                      onChange={(e) => setZipFile(e.target.files?.[0] ?? null)}
                    />
                    <div style={{ marginTop: 10, fontSize: 12, color: "#444" }}>
                      Selected:{" "}
                      <b>{zipFile ? `${zipFile.name} (${Math.round(zipFile.size / 1024)} KB)` : "none"}</b>
                    </div>
                  </div>

                  <div style={{ marginTop: 12, display: "flex", gap: 10, justifyContent: "flex-end" }}>
                    <button
                      disabled={busy}
                      onClick={() => importZipNow()}
                      style={{
                        padding: "12px 14px",
                        borderRadius: 14,
                        border: "1px solid #ddd",
                        background: busy ? "#f3f4f6" : "#111",
                        color: busy ? "#777" : "white",
                        cursor: busy ? "not-allowed" : "pointer",
                        fontWeight: 800,
                      }}
                    >
                      {busy ? "Working…" : "Import ZIP"}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      ) : null}

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: 24 }}>
        {/* Top bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            marginBottom: 16,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <h1 style={{ margin: 0, fontSize: 22, letterSpacing: -0.2 }}>Project Builder</h1>

            <span style={badgeStyle(headerBadge.tone)}>
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 999,
                  background:
                    headerBadge.tone === "success"
                      ? "#22c55e"
                      : headerBadge.tone === "danger"
                        ? "#ef4444"
                        : "#6b7280",
                }}
              />
              <span style={{ color: "#111" }}>{headerBadge.label}</span>
            </span>

            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                padding: "6px 10px",
                borderRadius: 999,
                fontSize: 12,
                border: "1px solid #e5e5e5",
                background: "white",
                color: "#111",
              }}
              title="Project ID"
            >
              {projectId}
            </span>
          </div>

          <button
            onClick={() => router.push("/projects")}
            style={{
              padding: "10px 14px",
              borderRadius: 12,
              border: "1px solid #ddd",
              background: "white",
              cursor: "pointer",
              fontWeight: 600,
              whiteSpace: "nowrap",
            }}
          >
            Back
          </button>
        </div>

        {/* Main layout */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "360px 1fr",
            gap: 16,
          }}
        >
          {/* Left panel */}
          <div
            style={{
              border: "1px solid #eee",
              borderRadius: 16,
              background: "white",
              padding: 16,
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 700, color: "#111" }}>Actions</div>
            <div style={{ marginTop: 10, fontSize: 13, color: "#555", lineHeight: 1.4 }}>
              Generate → writes HTML → Preview reads KV via <b>/api/projects/&lt;projectId&gt;/preview</b>.
              Imports call:
              <br />
              <b>POST /api/projects/&lt;projectId&gt;/import/html</b>
              <br />
              <b>POST /api/projects/&lt;projectId&gt;/import/zip</b>
            </div>

            <div style={{ marginTop: 14, display: "grid", gap: 10 }}>
              <button
                disabled={busy}
                onClick={() => generateNow()}
                style={{
                  padding: "12px 14px",
                  borderRadius: 14,
                  border: "1px solid #ddd",
                  background: busy ? "#f3f4f6" : "#111",
                  color: busy ? "#777" : "white",
                  cursor: busy ? "not-allowed" : "pointer",
                  fontWeight: 700,
                }}
              >
                {busy ? "Working…" : "Generate"}
              </button>

              <button
                disabled={busy}
                onClick={() => setModal({ open: true, kind: "importHtml" })}
                style={{
                  padding: "12px 14px",
                  borderRadius: 14,
                  border: "1px solid #ddd",
                  background: "white",
                  cursor: busy ? "not-allowed" : "pointer",
                  fontWeight: 700,
                }}
              >
                Import HTML
              </button>

              <button
                disabled={busy}
                onClick={() => setModal({ open: true, kind: "importZip" })}
                style={{
                  padding: "12px 14px",
                  borderRadius: 14,
                  border: "1px solid #ddd",
                  background: "white",
                  cursor: busy ? "not-allowed" : "pointer",
                  fontWeight: 700,
                }}
              >
                Import ZIP
              </button>

              <button
                disabled={busy}
                onClick={() => loadPreview()}
                style={{
                  padding: "12px 14px",
                  borderRadius: 14,
                  border: "1px solid #ddd",
                  background: "white",
                  cursor: busy ? "not-allowed" : "pointer",
                  fontWeight: 700,
                }}
              >
                Load Preview
              </button>

              <button
                disabled={busy}
                onClick={() =>
                  setPreview({ state: "idle", message: "Preview cleared. Click Load Preview." })
                }
                style={{
                  padding: "12px 14px",
                  borderRadius: 14,
                  border: "1px solid #ddd",
                  background: "white",
                  cursor: "pointer",
                  fontWeight: 700,
                }}
              >
                Clear Preview
              </button>
            </div>

            <div style={{ marginTop: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#111" }}>Status</div>
              <div
                style={{
                  marginTop: 10,
                  border: "1px solid #eee",
                  borderRadius: 14,
                  padding: 12,
                  background: "#fafafa",
                  fontSize: 13,
                  color: "#333",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                  <span>Builder</span>
                  <span style={{ fontWeight: 700 }}>{status}</span>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 10,
                    marginTop: 6,
                  }}
                >
                  <span>Preview</span>
                  <span style={{ fontWeight: 700 }}>{preview.state}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right panel */}
          <div
            style={{
              border: "1px solid #eee",
              borderRadius: 16,
              background: "white",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: 14,
                borderBottom: "1px solid #eee",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
              }}
            >
              <div>
                <div style={{ fontSize: 13, fontWeight: 800, color: "#111" }}>Preview</div>
                <div style={{ marginTop: 4, fontSize: 13, color: "#555" }}>
                  srcDoc iframe from KV-backed API route.
                </div>
              </div>
            </div>

            <div style={{ padding: 14 }}>
              {preview.state === "ready" ? (
                <iframe
                  title="Preview"
                  style={{
                    width: "100%",
                    height: 560,
                    border: "1px solid #eee",
                    borderRadius: 14,
                    background: "white",
                  }}
                  sandbox="allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox allow-same-origin"
                  srcDoc={preview.html}
                />
              ) : (
                <div
                  style={{
                    height: 560,
                    border: "1px dashed #ddd",
                    borderRadius: 14,
                    background: "#fafafa",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#666",
                    fontSize: 13,
                    textAlign: "center",
                    padding: 20,
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {preview.state === "loading"
                    ? preview.message
                    : preview.state === "error"
                      ? preview.message
                      : preview.message}
                </div>
              )}
            </div>
          </div>
        </div>

        <div style={{ marginTop: 14, fontSize: 12, color: "#666" }}>
          Next: wire <b>Publish</b> to your publish API route and show the public URL.
        </div>
      </div>
    </div>
  );
}
