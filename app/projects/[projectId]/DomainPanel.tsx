// app/projects/[projectId]/DomainPanel.tsx
"use client";

import React, { useEffect, useState } from "react";

async function safeJson(res: Response) {
  const text = await res.text();
  try {
    return { ok: true as const, data: JSON.parse(text), text };
  } catch {
    return { ok: false as const, data: null, text };
  }
}

export default function DomainPanel({ projectId }: { projectId: string }) {
  const [domain, setDomain] = useState("");
  const [savedDomain, setSavedDomain] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function refresh() {
    const res = await fetch(`/api/projects/${projectId}/domain`, { cache: "no-store" });
    const parsed = await safeJson(res);

    if (!parsed.ok) {
      setMsg(`❌ Non-JSON response. Status ${res.status}. Body: ${parsed.text.slice(0, 300)}`);
      return;
    }

    if (!res.ok || !parsed.data?.ok) {
      setMsg(`❌ API error. Status ${res.status}. ${parsed.data?.error || "Unknown error"}`);
      return;
    }

    setSavedDomain(parsed.data.domain || null);
  }

  useEffect(() => {
    refresh().catch((e) => setMsg(`❌ Refresh failed: ${String(e?.message || e)}`));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function attachDomain() {
    setBusy(true);
    setMsg(null);

    try {
      const res = await fetch(`/api/projects/${projectId}/domain/attach`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ domain }),
      });

      const parsed = await safeJson(res);

      if (!parsed.ok) throw new Error(`Non-JSON response. Status ${res.status}. Body: ${parsed.text.slice(0, 300)}`);
      if (!res.ok || !parsed.data?.ok) throw new Error(parsed.data?.error || `Attach failed (status ${res.status})`);

      setSavedDomain(parsed.data.domain);
      setMsg("✅ Domain attached. Now add the DNS records below.");
    } catch (e: any) {
      setMsg(`❌ ${e?.message || "Failed"}`);
    } finally {
      setBusy(false);
    }
  }

  async function removeDomain() {
    setBusy(true);
    setMsg(null);

    try {
      const res = await fetch(`/api/projects/${projectId}/domain/remove`, { method: "POST" });
      const parsed = await safeJson(res);

      if (!parsed.ok) throw new Error(`Non-JSON response. Status ${res.status}. Body: ${parsed.text.slice(0, 300)}`);
      if (!res.ok || !parsed.data?.ok) throw new Error(parsed.data?.error || `Remove failed (status ${res.status})`);

      setSavedDomain(null);
      setDomain("");
      setMsg("✅ Domain removed.");
    } catch (e: any) {
      setMsg(`❌ ${e?.message || "Failed"}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ border: "1px solid #e5e5e5", borderRadius: 12, padding: 16, marginTop: 16 }}>
      <div style={{ fontWeight: 700, marginBottom: 8 }}>Domain</div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
        <input
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          placeholder="example.com"
          style={{
            padding: "10px 12px",
            borderRadius: 10,
            border: "1px solid #ddd",
            minWidth: 260,
          }}
        />

        <button
          onClick={attachDomain}
          disabled={busy}
          style={{
            padding: "10px 12px",
            borderRadius: 10,
            border: "1px solid #ddd",
            cursor: busy ? "not-allowed" : "pointer",
            fontWeight: 600,
          }}
        >
          {busy ? "Saving…" : "Attach domain"}
        </button>

        <button
          onClick={removeDomain}
          disabled={busy || !savedDomain}
          style={{
            padding: "10px 12px",
            borderRadius: 10,
            border: "1px solid #ddd",
            cursor: busy || !savedDomain ? "not-allowed" : "pointer",
            fontWeight: 600,
          }}
        >
          Remove
        </button>
      </div>

      <div style={{ marginTop: 10, fontSize: 14, opacity: 0.9 }}>
        <b>Attached domain:</b> {savedDomain ? savedDomain : "none"}
      </div>

      {savedDomain ? (
        <div style={{ marginTop: 12, fontSize: 14 }}>
          <div style={{ fontWeight: 700, marginBottom: 6 }}>DNS instructions (manual for now)</div>

          <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 12 }}>
            <ul style={{ marginTop: 0 }}>
              <li>
                A record: <code>@</code> → <code>76.76.21.21</code>
              </li>
              <li style={{ marginTop: 8 }}>
                CNAME record: <code>www</code> → <code>cname.vercel-dns.com</code>
              </li>
            </ul>
          </div>
        </div>
      ) : null}

      {msg ? <div style={{ marginTop: 10, fontSize: 14 }}>{msg}</div> : null}
    </div>
  );
}
