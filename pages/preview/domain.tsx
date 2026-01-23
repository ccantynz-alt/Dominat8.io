import React, { useEffect, useMemo, useState } from "react";

function useQueryParam(name: string): string {
  const [val, setVal] = useState("");
  useEffect(() => {
    if (typeof window === "undefined") return;
    const u = new URL(window.location.href);
    setVal(u.searchParams.get(name) || "");
  }, [name]);
  return val;
}

export default function DomainPreviewPage() {
  const projectId = useQueryParam("projectId");
  const debug = useQueryParam("debug");
  const debugOn = debug === "1" || debug.toLowerCase() === "true";

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string>("");
  const [statusPayload, setStatusPayload] = useState<any>(null);
  const [checkPayload, setCheckPayload] = useState<any>(null);

  const statusUrl = useMemo(() => {
    if (!projectId) return "";
    return `/api/projects/${encodeURIComponent(projectId)}/domain/status?ts=${Date.now()}`;
  }, [projectId]);

  const checkUrl = useMemo(() => {
    const domain = statusPayload?.domain;
    if (!domain) return "";
    return `/api/domains/check?domain=${encodeURIComponent(domain)}&ts=${Date.now()}`;
  }, [statusPayload]);

  async function refreshAll() {
    if (!statusUrl) return;
    setLoading(true);
    setErr("");
    try {
      const r1 = await fetch(statusUrl, { cache: "no-store" });
      const j1 = await r1.json().catch(() => null);
      if (!j1) throw new Error("Failed to parse domain/status JSON");
      setStatusPayload(j1);

      const dom = j1?.domain;
      if (dom) {
        const u2 = `/api/domains/check?domain=${encodeURIComponent(dom)}&ts=${Date.now()}`;
        const r2 = await fetch(u2, { cache: "no-store" });
        const j2 = await r2.json().catch(() => null);
        setCheckPayload(j2);
      } else {
        setCheckPayload(null);
      }
    } catch (e: any) {
      setErr(String(e?.message || e));
      setStatusPayload(null);
      setCheckPayload(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refreshAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusUrl]);

  const domain = statusPayload?.domain || "";
  const token = statusPayload?.token || "";
  const txtName = statusPayload?.txtRecordName || "";
  const txtValue = statusPayload?.txtRecordValue || "";
  const st = (checkPayload?.status || statusPayload?.status || "pending") as string;
  const verified = Boolean(checkPayload?.verified);

  return (
    <main style={{ maxWidth: 980, margin: "0 auto", padding: 24, fontFamily: "ui-sans-serif, system-ui" }}>
      <h1 style={{ fontSize: 28, marginBottom: 6 }}>Domain Verification</h1>
      <div style={{ opacity: 0.75, marginBottom: 18 }}>
        <div><b>projectId</b>: {projectId || "(missing)"} </div>
      </div>

      {!projectId && (
        <div style={{ border: "1px solid #ddd", borderRadius: 12, padding: 16 }}>
          Missing <code>projectId</code>. Use: <code>/preview/domain?projectId=YOUR_PROJECT_ID&amp;debug=1</code>
        </div>
      )}

      {projectId && (
        <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 18 }}>
          <button
            onClick={() => {
              window.location.href = `/preview/domain?projectId=${encodeURIComponent(projectId)}&debug=${debugOn ? "1" : "0"}&ts=${Date.now()}`;
            }}
            style={{ padding: "10px 14px", borderRadius: 10, border: "1px solid #ddd", background: "#fff", cursor: "pointer" }}
          >
            Refresh
          </button>
          <span style={{ opacity: 0.75 }}>
            {loading ? "Loading…" : domain ? (verified ? "✅ Verified" : `⏳ ${st}`) : "No domain bound to this project yet."}
          </span>
        </div>
      )}

      {err && (
        <div style={{ border: "1px solid #f0b4b4", background: "#fff7f7", borderRadius: 12, padding: 16, marginBottom: 18 }}>
          <b>Error:</b> {err}
        </div>
      )}

      {projectId && (
        <section style={{ border: "1px solid #ddd", borderRadius: 12, padding: 16, marginBottom: 18 }}>
          <h2 style={{ fontSize: 18, margin: "0 0 12px 0" }}>Status</h2>
          <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", rowGap: 8, columnGap: 12 }}>
            <div style={{ opacity: 0.75 }}>domain</div><div>{domain || "(none)"}</div>
            <div style={{ opacity: 0.75 }}>status</div><div>{verified ? "verified" : st}</div>
            <div style={{ opacity: 0.75 }}>token</div><div style={{ wordBreak: "break-all" }}>{token || "(none)"}</div>
          </div>
        </section>
      )}

      {projectId && domain && (
        <section style={{ border: "1px solid #ddd", borderRadius: 12, padding: 16, marginBottom: 18 }}>
          <h2 style={{ fontSize: 18, margin: "0 0 12px 0" }}>Required DNS TXT record</h2>
          <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", rowGap: 8, columnGap: 12 }}>
            <div style={{ opacity: 0.75 }}>Name</div><div><code>{txtName}</code></div>
            <div style={{ opacity: 0.75 }}>Value</div><div style={{ wordBreak: "break-all" }}><code>{txtValue}</code></div>
          </div>
          <div style={{ opacity: 0.75, marginTop: 12 }}>
            After you add the TXT record at your DNS provider, click Refresh. DNS propagation can take time.
          </div>
        </section>
      )}

      {projectId && debugOn && (
        <section style={{ border: "1px solid #ddd", borderRadius: 12, padding: 16 }}>
          <h2 style={{ fontSize: 18, margin: "0 0 12px 0" }}>Raw JSON (debug=1)</h2>
          <details open>
            <summary style={{ cursor: "pointer", marginBottom: 10 }}>domain/status</summary>
            <pre style={{ margin: 0, whiteSpace: "pre-wrap", background: "#fafafa", border: "1px solid #eee", borderRadius: 10, padding: 10, fontSize: 12 }}>
              {JSON.stringify(statusPayload, null, 2)}
            </pre>
          </details>
          <details>
            <summary style={{ cursor: "pointer", margin: "12px 0 10px 0" }}>domains/check</summary>
            <pre style={{ margin: 0, whiteSpace: "pre-wrap", background: "#fafafa", border: "1px solid #eee", borderRadius: 10, padding: 10, fontSize: 12 }}>
              {JSON.stringify(checkPayload, null, 2)}
            </pre>
          </details>
        </section>
      )}
    </main>
  );
}
