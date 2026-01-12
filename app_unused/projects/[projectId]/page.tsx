"use client";

import React, { useMemo, useState } from "react";

type ToastTone = "success" | "danger" | "info";

type Toast = {
  tone: ToastTone;
  title: string;
  message: string;
};

type AuditState =
  | { state: "idle" }
  | { state: "checking" }
  | { state: "error"; message: string }
  | {
      state: "ready";
      ok: boolean;
      missing: string[];
      warnings: string[];
      notes: string[];
    };

export default function ProjectPage({
  params,
}: {
  params: { projectId: string };
}) {
  const projectId = params?.projectId || "";

  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);

  const [bizName, setBizName] = useState("");
  const [bizNiche, setBizNiche] = useState("");
  const [bizLocation, setBizLocation] = useState("");
  const [bizPhone, setBizPhone] = useState("");
  const [bizEmail, setBizEmail] = useState("");
  const [bizTagline, setBizTagline] = useState("");

  const [audit, setAudit] = useState<AuditState>({ state: "idle" });

  const [previewHtml, setPreviewHtml] = useState<string>("");
  const [lastFinishRaw, setLastFinishRaw] = useState<string>("");
  const [lastAuditRaw, setLastAuditRaw] = useState<string>("");
  const [lastPublishRaw, setLastPublishRaw] = useState<string>("");

  // Conversion Agent (always-clickable section)
  const [agentBusy, setAgentBusy] = useState(false);
  const [agentInstructions, setAgentInstructions] = useState(
    "Improve conversion ethically (clear CTA, trust strip, pricing teaser). Remove calls/meetings language. Keep it automation-first and website-only."
  );
  const [lastAgentRaw, setLastAgentRaw] = useState<string>("");

  const canFinish = useMemo(() => {
    return bizName.trim().length > 0 && bizNiche.trim().length > 0;
  }, [bizName, bizNiche]);

  async function loadPreview() {
    try {
      const res = await fetch(`/api/projects/${projectId}/preview`, {
        method: "GET",
      });

      if (!res.ok) {
        return;
      }

      const text = await res.text();

      // Accept either raw HTML or JSON with { html }.
      try {
        const j = JSON.parse(text);
        if (j && typeof j.html === "string") {
          setPreviewHtml(j.html);
          return;
        }
      } catch {
        // ignore
      }

      setPreviewHtml(text);
    } catch {
      // ignore
    }
  }

  // IMPORTANT: returns boolean so Finish can decide publish immediately (no race with React state updates)
  async function runAuditOnly(): Promise<boolean> {
    if (!projectId) return false;

    setAudit({ state: "checking" });

    try {
      const auditRes = await fetch(`/api/projects/${projectId}/audit`, {
        method: "POST",
      });
      const auditText = await auditRes.text();
      setLastAuditRaw(auditText);

      if (!auditRes.ok) {
        setAudit({ state: "error", message: `(${auditRes.status}) ${auditText}` });
        setToast({
          tone: "danger",
          title: "Quality check failed",
          message: `(${auditRes.status}) ${auditText}`,
        });
        return false;
      }

      let auditData: any = null;
      try {
        auditData = JSON.parse(auditText);
      } catch {
        setAudit({ state: "error", message: `Unexpected response: ${auditText}` });
        setToast({
          tone: "danger",
          title: "Quality check error",
          message: `Unexpected response: ${auditText}`,
        });
        return false;
      }

      if (!auditData?.ok) {
        setAudit({ state: "error", message: `Audit error: ${auditText}` });
        setToast({
          tone: "danger",
          title: "Quality check error",
          message: `Audit error: ${auditText}`,
        });
        return false;
      }

      const readyToPublish = Boolean(auditData.readyToPublish);
      const missing = Array.isArray(auditData.missing) ? auditData.missing : [];
      const warnings = Array.isArray(auditData.warnings) ? auditData.warnings : [];
      const notes = Array.isArray(auditData.notes) ? auditData.notes : [];

      setAudit({
        state: "ready",
        ok: readyToPublish,
        missing,
        warnings,
        notes,
      });

      setToast({
        tone: readyToPublish ? "success" : "danger",
        title: readyToPublish ? "Quality check passed" : "Not ready to publish",
        message: readyToPublish
          ? "Your site meets the minimum publish requirements."
          : "Quality check found issues. Fix missing items, then click Publish.",
      });

      return readyToPublish;
    } catch (err: any) {
      setAudit({
        state: "error",
        message: err?.message ? String(err.message) : "Unknown audit error.",
      });
      setToast({
        tone: "danger",
        title: "Quality check error",
        message: err?.message ? String(err.message) : "Unknown audit error.",
      });
      return false;
    }
  }

  async function publishNow() {
    if (!projectId) return;

    setBusy(true);
    setToast(null);

    try {
      const res = await fetch(`/api/projects/${projectId}/publish`, {
        method: "POST",
      });

      const text = await res.text();
      setLastPublishRaw(text);

      if (res.status === 402) {
        let upgradeUrl = "";
        try {
          const j = JSON.parse(text);
          upgradeUrl = typeof j?.upgradeUrl === "string" ? j.upgradeUrl : "";
        } catch {
          // ignore
        }

        setToast({
          tone: "danger",
          title: "Upgrade required",
          message: upgradeUrl
            ? `Publishing is a Pro feature.\n\nOpen this upgrade link:\n${upgradeUrl}`
            : `Publishing is a Pro feature. (${res.status}) ${text}`,
        });
        return;
      }

      if (!res.ok) {
        setToast({
          tone: "danger",
          title: "Publish failed",
          message: `(${res.status}) ${text}`,
        });
        return;
      }

      let publicUrl = `/p/${projectId}`;
      try {
        const j = JSON.parse(text);
        if (typeof j?.publicUrl === "string") publicUrl = j.publicUrl;
        if (typeof j?.url === "string") publicUrl = j.url;
      } catch {
        // ignore
      }

      setToast({
        tone: "success",
        title: "Published",
        message: `Your site is live.\n${publicUrl}`,
      });
    } catch (err: any) {
      setToast({
        tone: "danger",
        title: "Publish error",
        message: err?.message ? String(err.message) : "Unknown publish error.",
      });
    } finally {
      setBusy(false);
    }
  }

  async function runConversionAgent() {
    if (!projectId) return;

    setAgentBusy(true);
    setToast(null);

    try {
      const res = await fetch(`/api/projects/${projectId}/agents/conversion`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          instructions: agentInstructions,
        }),
      });

      const text = await res.text();
      setLastAgentRaw(text);

      if (!res.ok) {
        setToast({
          tone: "danger",
          title: "Conversion agent failed",
          message: `(${res.status}) ${text}`,
        });
        return;
      }

      setToast({
        tone: "success",
        title: "Conversion agent ran",
        message: "Reloading preview and rerunning quality check…",
      });

      // Auto: reload preview then re-audit
      await loadPreview();
      await runAuditOnly();
    } catch (err: any) {
      setToast({
        tone: "danger",
        title: "Conversion agent error",
        message: err?.message ? String(err.message) : "Unknown agent error.",
      });
    } finally {
      setAgentBusy(false);
    }
  }

  async function finishForMe() {
    if (!projectId) return;

    const businessName = bizName.trim();
    const niche = bizNiche.trim();
    const location = bizLocation.trim();
    const phone = bizPhone.trim();
    const email = bizEmail.trim();
    const tagline = bizTagline.trim();

    if (!businessName || !niche) {
      setToast({
        tone: "danger",
        title: "Finish for me",
        message: "Please fill Business name and Niche (required).",
      });
      return;
    }

    setBusy(true);
    setToast(null);

    try {
      // 1) Generate conversion-ready HTML via Level-2 finish endpoint
      const res = await fetch(`/api/projects/${projectId}/finish`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          businessName,
          niche,
          location,
          phone,
          email,
          tagline,
          tone: "premium",
        }),
      });

      const text = await res.text();
      setLastFinishRaw(text);

      if (!res.ok) {
        setToast({
          tone: "danger",
          title: "Finish failed",
          message: `(${res.status}) ${text}`,
        });
        return;
      }

      // 2) Load preview
      setToast({
        tone: "success",
        title: "Site generated",
        message: "Loading preview and running quality check…",
      });

      await loadPreview();

      // 3) Run audit (returns boolean)
      const ready = await runAuditOnly();

      // 4) Publish only if audit passes
      if (ready) {
        setToast({
          tone: "success",
          title: "Quality check passed",
          message: "Publishing now…",
        });
        await publishNow();
      }
    } catch (err: any) {
      setToast({
        tone: "danger",
        title: "Finish error",
        message: err?.message ? String(err.message) : "Unknown error during Finish for me.",
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <main style={{ maxWidth: 980, margin: "0 auto", padding: 20 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <div>
          <h1 style={{ fontSize: 24, margin: 0 }}>Project</h1>
          <div style={{ opacity: 0.7, marginTop: 6 }}>ID: {projectId}</div>
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <a
            href={`/p/${projectId}`}
            style={{
              textDecoration: "none",
              padding: "10px 12px",
              borderRadius: 10,
              border: "1px solid #ddd",
            }}
          >
            Open public page
          </a>

          <button
            onClick={publishNow}
            disabled={busy || !projectId}
            style={{
              padding: "10px 12px",
              borderRadius: 10,
              border: "1px solid #111",
              background: busy ? "#eee" : "#111",
              color: busy ? "#333" : "#fff",
              cursor: busy ? "not-allowed" : "pointer",
            }}
          >
            Publish
          </button>
        </div>
      </div>

      {toast ? (
        <div
          style={{
            marginTop: 16,
            padding: 12,
            borderRadius: 12,
            border: "1px solid #ddd",
            whiteSpace: "pre-wrap",
          }}
        >
          <div style={{ fontWeight: 700 }}>
            {toast.tone === "danger"
              ? "⚠ "
              : toast.tone === "success"
              ? "✅ "
              : "ℹ "}
            {toast.title}
          </div>
          <div style={{ marginTop: 6, opacity: 0.85 }}>{toast.message}</div>
        </div>
      ) : null}

      <section
        style={{
          marginTop: 18,
          padding: 16,
          borderRadius: 16,
          border: "1px solid #eee",
        }}
      >
        <h2 style={{ marginTop: 0 }}>Finish-for-me (Level 2)</h2>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <label>
            <div style={{ fontSize: 12, opacity: 0.75, marginBottom: 6 }}>
              Business name *
            </div>
            <input
              value={bizName}
              onChange={(e) => setBizName(e.target.value)}
              placeholder="e.g., Book A Ride"
              style={{
                width: "100%",
                padding: 10,
                borderRadius: 10,
                border: "1px solid #ddd",
              }}
            />
          </label>

          <label>
            <div style={{ fontSize: 12, opacity: 0.75, marginBottom: 6 }}>
              Niche *
            </div>
            <input
              value={bizNiche}
              onChange={(e) => setBizNiche(e.target.value)}
              placeholder="e.g., Airport shuttle"
              style={{
                width: "100%",
                padding: 10,
                borderRadius: 10,
                border: "1px solid #ddd",
              }}
            />
          </label>

          <label>
            <div style={{ fontSize: 12, opacity: 0.75, marginBottom: 6 }}>
              Location
            </div>
            <input
              value={bizLocation}
              onChange={(e) => setBizLocation(e.target.value)}
              placeholder="e.g., Auckland, NZ"
              style={{
                width: "100%",
                padding: 10,
                borderRadius: 10,
                border: "1px solid #ddd",
              }}
            />
          </label>

          <label>
            <div style={{ fontSize: 12, opacity: 0.75, marginBottom: 6 }}>
              Tagline
            </div>
            <input
              value={bizTagline}
              onChange={(e) => setBizTagline(e.target.value)}
              placeholder="e.g., Reliable rides. Simple booking."
              style={{
                width: "100%",
                padding: 10,
                borderRadius: 10,
                border: "1px solid #ddd",
              }}
            />
          </label>

          <label>
            <div style={{ fontSize: 12, opacity: 0.75, marginBottom: 6 }}>
              Phone
            </div>
            <input
              value={bizPhone}
              onChange={(e) => setBizPhone(e.target.value)}
              placeholder="Optional"
              style={{
                width: "100%",
                padding: 10,
                borderRadius: 10,
                border: "1px solid #ddd",
              }}
            />
          </label>

          <label>
            <div style={{ fontSize: 12, opacity: 0.75, marginBottom: 6 }}>
              Email
            </div>
            <input
              value={bizEmail}
              onChange={(e) => setBizEmail(e.target.value)}
              placeholder="Optional"
              style={{
                width: "100%",
                padding: 10,
                borderRadius: 10,
                border: "1px solid #ddd",
              }}
            />
          </label>
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
          <button
            onClick={finishForMe}
            disabled={busy || !projectId || !canFinish}
            style={{
              padding: "10px 14px",
              borderRadius: 12,
              border: "1px solid #111",
              background: busy ? "#eee" : "#111",
              color: busy ? "#333" : "#fff",
              cursor: busy ? "not-allowed" : "pointer",
              fontWeight: 700,
            }}
          >
            Finish → Quality Check
          </button>

          <button
            onClick={loadPreview}
            disabled={busy || !projectId}
            style={{
              padding: "10px 14px",
              borderRadius: 12,
              border: "1px solid #ddd",
              background: "#fff",
              cursor: busy ? "not-allowed" : "pointer",
            }}
          >
            Reload preview
          </button>

          <button
            onClick={runAuditOnly}
            disabled={busy || !projectId}
            style={{
              padding: "10px 14px",
              borderRadius: 12,
              border: "1px solid #ddd",
              background: "#fff",
              cursor: busy ? "not-allowed" : "pointer",
            }}
          >
            Run quality check
          </button>
        </div>

        <div style={{ marginTop: 14 }}>
          <h3 style={{ marginBottom: 8 }}>Audit status</h3>

          {audit.state === "idle" ? (
            <div style={{ opacity: 0.7 }}>No quality check run yet.</div>
          ) : null}

          {audit.state === "checking" ? (
            <div style={{ opacity: 0.7 }}>Running quality check…</div>
          ) : null}

          {audit.state === "error" ? (
            <div
              style={{
                whiteSpace: "pre-wrap",
                border: "1px solid #f0caca",
                padding: 12,
                borderRadius: 12,
              }}
            >
              ⚠ {audit.message}
            </div>
          ) : null}

          {audit.state === "ready" ? (
            <div style={{ border: "1px solid #ddd", padding: 12, borderRadius: 12 }}>
              <div style={{ fontWeight: 700 }}>
                {audit.ok ? "✅ Ready to publish" : "⚠ Not ready to publish"}
              </div>

              {audit.missing.length ? (
                <>
                  <div style={{ marginTop: 10, fontWeight: 700 }}>Missing</div>
                  <ul style={{ marginTop: 6 }}>
                    {audit.missing.map((x, i) => (
                      <li key={`m-${i}`}>{x}</li>
                    ))}
                  </ul>
                </>
              ) : null}

              {audit.warnings.length ? (
                <>
                  <div style={{ marginTop: 10, fontWeight: 700 }}>Warnings</div>
                  <ul style={{ marginTop: 6 }}>
                    {audit.warnings.map((x, i) => (
                      <li key={`w-${i}`}>{x}</li>
                    ))}
                  </ul>
                </>
              ) : null}

              {audit.notes.length ? (
                <>
                  <div style={{ marginTop: 10, fontWeight: 700 }}>Notes</div>
                  <ul style={{ marginTop: 6 }}>
                    {audit.notes.map((x, i) => (
                      <li key={`n-${i}`}>{x}</li>
                    ))}
                  </ul>
                </>
              ) : null}
            </div>
          ) : null}
        </div>
      </section>

      <section
        style={{
          marginTop: 18,
          padding: 16,
          borderRadius: 16,
          border: "1px solid #eee",
        }}
      >
        <h2 style={{ marginTop: 0 }}>Conversion Agent (website-only)</h2>

        <div style={{ opacity: 0.75, marginBottom: 10 }}>
          Runs server-side, updates generated HTML, then reloads preview and reruns quality check.
        </div>

        <label style={{ display: "block" }}>
          <div style={{ fontSize: 12, opacity: 0.75, marginBottom: 6 }}>
            Instructions
          </div>
          <textarea
            value={agentInstructions}
            onChange={(e) => setAgentInstructions(e.target.value)}
            rows={4}
            style={{
              width: "100%",
              padding: 10,
              borderRadius: 10,
              border: "1px solid #ddd",
              resize: "vertical",
            }}
          />
        </label>

        <div style={{ display: "flex", gap: 10, marginTop: 12, flexWrap: "wrap" }}>
          <button
            onClick={runConversionAgent}
            disabled={agentBusy || !projectId}
            style={{
              padding: "10px 14px",
              borderRadius: 12,
              border: "1px solid #111",
              background: agentBusy ? "#eee" : "#111",
              color: agentBusy ? "#333" : "#fff",
              cursor: agentBusy ? "not-allowed" : "pointer",
              fontWeight: 700,
            }}
          >
            {agentBusy ? "Running…" : "Run Agent → Reload → Re-check"}
          </button>

          <button
            onClick={loadPreview}
            disabled={busy || agentBusy || !projectId}
            style={{
              padding: "10px 14px",
              borderRadius: 12,
              border: "1px solid #ddd",
              background: "#fff",
              cursor: busy || agentBusy ? "not-allowed" : "pointer",
            }}
          >
            Reload preview
          </button>
        </div>
      </section>

      <section style={{ marginTop: 18 }}>
        <h2>Preview</h2>

        {previewHtml ? (
          <iframe
            title="preview"
            style={{
              width: "100%",
              height: 720,
              border: "1px solid #ddd",
              borderRadius: 14,
            }}
            srcDoc={previewHtml}
          />
        ) : (
          <div style={{ opacity: 0.7 }}>
            No preview HTML loaded yet. Click <b>Finish → Quality Check</b> or{" "}
            <b>Reload preview</b>.
          </div>
        )}
      </section>

      <section style={{ marginTop: 18 }}>
        <h2>Debug (raw responses)</h2>

        <details style={{ marginTop: 10 }}>
          <summary>Finish response</summary>
          <pre
            style={{
              whiteSpace: "pre-wrap",
              border: "1px solid #eee",
              padding: 12,
              borderRadius: 12,
            }}
          >
            {lastFinishRaw || "(empty)"}
          </pre>
        </details>

        <details style={{ marginTop: 10 }}>
          <summary>Audit response</summary>
          <pre
            style={{
              whiteSpace: "pre-wrap",
              border: "1px solid #eee",
              padding: 12,
              borderRadius: 12,
            }}
          >
            {lastAuditRaw || "(empty)"}
          </pre>
        </details>

        <details style={{ marginTop: 10 }}>
          <summary>Publish response</summary>
          <pre
            style={{
              whiteSpace: "pre-wrap",
              border: "1px solid #eee",
              padding: 12,
              borderRadius: 12,
            }}
          >
            {lastPublishRaw || "(empty)"}
          </pre>
        </details>

        <details style={{ marginTop: 10 }}>
          <summary>Conversion agent response</summary>
          <pre
            style={{
              whiteSpace: "pre-wrap",
              border: "1px solid #eee",
              padding: 12,
              borderRadius: 12,
            }}
          >
            {lastAgentRaw || "(empty)"}
          </pre>
        </details>
      </section>
    </main>
  );
}
