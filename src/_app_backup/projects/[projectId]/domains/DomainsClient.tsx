// src/app/projects/[projectId]/domains/DomainsClient.tsx
"use client";

import * as React from "react";

type RecordV1 = {
  version: 1;
  projectId: string;
  domain: string;
  token: string;
  createdAt: string;
  verifiedAt: string | null;
};

type GetRes = { ok: true; projectId: string; record: RecordV1 | null } | { ok: false; error: string };
type SaveRes = { ok: true; projectId: string; record: RecordV1 } | { ok: false; error: string };
type VerifyRes =
  | { ok: true; verified: true; record: RecordV1; message?: string }
  | { ok: true; verified: false; domain: string; host: string; expected: string; seen: string[]; message?: string }
  | { ok: false; error: string };

export default function DomainsClient({ projectId }: { projectId: string }) {
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [verifying, setVerifying] = React.useState(false);
  const [disconnecting, setDisconnecting] = React.useState(false);

  const [domainInput, setDomainInput] = React.useState("");
  const [record, setRecord] = React.useState<RecordV1 | null>(null);

  const [status, setStatus] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  async function refresh() {
    setLoading(true);
    setError(null);
    setStatus(null);
    try {
      const res = await fetch(`/api/projects/${projectId}/domain`, { cache: "no-store" });
      const json = (await res.json()) as GetRes;
      if (!res.ok || (json as any).ok === false) throw new Error((json as any).error || "Failed to load domain");
      const r = (json as any).record as RecordV1 | null;
      setRecord(r);
      setDomainInput(r?.domain || "");
    } catch (e: any) {
      setError(e?.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onSave() {
    setSaving(true);
    setError(null);
    setStatus(null);
    try {
      const res = await fetch(`/api/projects/${projectId}/domain`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain: domainInput }),
      });
      const json = (await res.json()) as SaveRes;
      if (!res.ok || (json as any).ok === false) throw new Error((json as any).error || "Save failed");
      setRecord((json as any).record);
      setStatus("Saved ✅ Now add the TXT record and click Verify.");
    } catch (e: any) {
      setError(e?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function onVerify() {
    setVerifying(true);
    setError(null);
    setStatus(null);
    try {
      const res = await fetch(`/api/projects/${projectId}/domain/verify`, { method: "POST" });
      const json = (await res.json()) as VerifyRes;

      if (!res.ok || (json as any).ok === false) throw new Error((json as any).error || "Verify failed");

      if ((json as any).verified === true) {
        setStatus("Verified ✅ Domain ownership confirmed.");
        await refresh();
      } else {
        const j = json as any;
        setStatus(`Not verified yet. Looking for TXT on ${j.host}. (DNS can take time.)`);
      }
    } catch (e: any) {
      setError(e?.message || "Verify failed");
    } finally {
      setVerifying(false);
    }
  }

  async function onDisconnect() {
    setDisconnecting(true);
    setError(null);
    setStatus(null);
    try {
      const res = await fetch(`/api/projects/${projectId}/domain/disconnect`, { method: "POST" });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ok) throw new Error(json?.error || "Disconnect failed");
      setRecord(null);
      setDomainInput("");
      setStatus("Disconnected ✅ Domain removed and routing cleared.");
    } catch (e: any) {
      setError(e?.message || "Disconnect failed");
    } finally {
      setDisconnecting(false);
    }
  }

  const host = record ? `_rovez-verification.${record.domain}` : null;
  const value = record ? `rovez=${record.token}` : null;

  return (
    <div style={{ maxWidth: 980, margin: "0 auto", padding: 24 }}>
      <h1 style={{ fontSize: 28, fontWeight: 950, marginBottom: 6 }}>Custom Domain</h1>
      <div style={{ opacity: 0.8, marginBottom: 18 }}>
        Project: <b>{projectId}</b>
      </div>

      {loading ? <div>Loading…</div> : null}

      <div style={{ border: "1px solid rgba(0,0,0,0.12)", borderRadius: 14, padding: 16 }}>
        <div style={{ fontWeight: 900, marginBottom: 10 }}>1) Enter your domain</div>

        <input
          value={domainInput}
          onChange={(e) => setDomainInput(e.target.value)}
          placeholder="example.com"
          style={{
            width: "100%",
            padding: 12,
            borderRadius: 12,
            border: "1px solid rgba(0,0,0,0.18)",
            outline: "none",
          }}
        />

        <div style={{ display: "flex", gap: 10, marginTop: 12, flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={onSave}
            disabled={saving || verifying || disconnecting}
            style={{
              padding: "10px 14px",
              borderRadius: 12,
              border: "1px solid rgba(0,0,0,0.22)",
              background: "black",
              color: "white",
              fontWeight: 900,
              cursor: (saving || verifying || disconnecting) ? "not-allowed" : "pointer",
              opacity: (saving || verifying || disconnecting) ? 0.7 : 1,
            }}
          >
            {saving ? "Saving…" : "Save domain"}
          </button>

          <button
            type="button"
            onClick={onDisconnect}
            disabled={!record || disconnecting || saving || verifying}
            style={{
              padding: "10px 14px",
              borderRadius: 12,
              border: "1px solid rgba(0,0,0,0.22)",
              background: "white",
              fontWeight: 900,
              cursor: (!record || disconnecting || saving || verifying) ? "not-allowed" : "pointer",
              opacity: (!record || disconnecting || saving || verifying) ? 0.7 : 1,
            }}
          >
            {disconnecting ? "Disconnecting…" : "Disconnect domain"}
          </button>
        </div>

        {record ? (
          <div style={{ marginTop: 16, opacity: 0.85, fontSize: 14 }}>
            Current status:{" "}
            <b>{record.verifiedAt ? "Verified ✅" : "Not verified yet"}</b>
          </div>
        ) : null}
      </div>

      {record ? (
        <div style={{ marginTop: 14, border: "1px solid rgba(0,0,0,0.12)", borderRadius: 14, padding: 16 }}>
          <div style={{ fontWeight: 900, marginBottom: 10 }}>2) Add this DNS TXT record</div>
          <div style={{ fontSize: 14, opacity: 0.9, marginBottom: 10 }}>
            Go to your domain registrar → DNS settings → add a TXT record:
          </div>

          <div style={{ display: "grid", gap: 10 }}>
            <div>
              <div style={{ fontWeight: 900, opacity: 0.7 }}>Host / Name</div>
              <div style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace" }}>
                {host}
              </div>
            </div>

            <div>
              <div style={{ fontWeight: 900, opacity: 0.7 }}>Value</div>
              <div style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace" }}>
                {value}
              </div>
            </div>

            <div style={{ opacity: 0.75, fontSize: 13 }}>
              DNS can take time to propagate. After adding it, click Verify.
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={onVerify}
              disabled={verifying || saving || disconnecting}
              style={{
                padding: "10px 14px",
                borderRadius: 12,
                border: "1px solid rgba(0,0,0,0.22)",
                background: "#0b5",
                color: "white",
                fontWeight: 950,
                cursor: (verifying || saving || disconnecting) ? "not-allowed" : "pointer",
                opacity: (verifying || saving || disconnecting) ? 0.7 : 1,
              }}
            >
              {verifying ? "Verifying…" : "Verify DNS"}
            </button>
          </div>
        </div>
      ) : null}

      {status ? (
        <div style={{ marginTop: 14, border: "1px solid rgba(0,128,0,0.25)", background: "rgba(0,128,0,0.06)", padding: 10, borderRadius: 12 }}>
          {status}
        </div>
      ) : null}

      {error ? (
        <div style={{ marginTop: 14, border: "1px solid rgba(255,0,0,0.25)", background: "rgba(255,0,0,0.06)", padding: 10, borderRadius: 12 }}>
          <b>Error:</b> {error}
        </div>
      ) : null}
    </div>
  );
}
