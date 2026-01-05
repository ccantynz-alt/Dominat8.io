"use client";

import { useEffect, useState } from "react";

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
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function call(action: "get" | "attach" | "remove", extra?: any) {
    const res = await fetch("/api/domain", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action, projectId, ...(extra || {}) }),
    });
    return { res, parsed: await safeJson(res) };
  }

  async function load() {
    setMsg(null);
    const { res, parsed } = await call("get");
    if (!parsed.ok) {
      setMsg(`❌ Non-JSON response (${res.status})`);
      return;
    }
    if (!parsed.data?.ok) {
      setMsg(`❌ ${parsed.data?.error || "Failed to load"}`);
      return;
    }
    setSavedDomain(parsed.data.domain || null);
  }

  useEffect(() => {
    load().catch((e) => setMsg(`❌ ${String(e?.message || e)}`));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function attach() {
    setBusy(true);
    setMsg(null);
    try {
      const { res, parsed } = await call("attach", { domain });
      if (!parsed.ok) throw new Error(`Non-JSON response (${res.status})`);
      if (!parsed.data?.ok) throw new Error(parsed.data?.error || "Attach failed");
      setSavedDomain(parsed.data.domain);
      setMsg("✅ Domain attached");
    } catch (e: any) {
      setMsg(`❌ ${e?.message || "Failed"}`);
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    setBusy(true);
    setMsg(null);
    try {
      const { res, parsed } = await call("remove");
      if (!parsed.ok) throw new Error(`Non-JSON response (${res.status})`);
      if (!parsed.data?.ok) throw new Error(parsed.data?.error || "Remove failed");
      setSavedDomain(null);
      setDomain("");
      setMsg("✅ Domain removed");
    } catch (e: any) {
      setMsg(`❌ ${e?.message || "Failed"}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ border: "1px solid #ddd", padding: 16, borderRadius: 12, marginTop: 16 }}>
      <h3>Domain</h3>

      <input
        value={domain}
        onChange={(e) => setDomain(e.target.value)}
        placeholder="example.com"
        style={{ padding: 8, marginRight: 8 }}
      />

      <button onClick={attach} disabled={busy}>
        Attach
      </button>

      <button onClick={remove} disabled={busy || !savedDomain} style={{ marginLeft: 8 }}>
        Remove
      </button>

      <div style={{ marginTop: 8 }}>
        <b>Attached:</b> {savedDomain || "none"}
      </div>

      {savedDomain && (
        <div style={{ marginTop: 8 }}>
          <b>DNS:</b>
          <div>A → 76.76.21.21</div>
          <div>CNAME www → cname.vercel-dns.com</div>
        </div>
      )}

      {msg && <div style={{ marginTop: 8 }}>{msg}</div>}
    </div>
  );
}
