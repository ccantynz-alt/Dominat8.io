import React, { useEffect, useMemo, useState } from "react";

type StepRecord = {
  step?: string;
  ok?: boolean;
  status?: number;
  ms?: number;
  contentType?: string;
  bodyFirst200?: string;
  url?: string;
};

type Runlog = {
  ok?: boolean;
  marker?: string;
  projectId?: string;
  jobId?: string;
  createdAtIso?: string;
  finishedAtIso?: string;
  seedMode?: string;
  templateId?: string | null;
  steps?: StepRecord[];
  error?: string;
  [k: string]: any;
};

function useQueryParam(name: string): string {
  const [val, setVal] = useState("");
  useEffect(() => {
    if (typeof window === "undefined") return;
    const u = new URL(window.location.href);
    setVal(u.searchParams.get(name) || "");
  }, [name]);
  return val;
}

export default function RunlogPreviewPage() {
  const projectId = useQueryParam("projectId");
  const debug = useQueryParam("debug");
  const debugOn = debug === "1" || debug.toLowerCase() === "true";

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string>("");
  const [payload, setPayload] = useState<any>(null);

  const apiUrl = useMemo(() => {
    if (!projectId) return "";
    return `/api/projects/${encodeURIComponent(projectId)}/runlog/latest?ts=${Date.now()}`;
  }, [projectId]);

  useEffect(() => {
    let cancelled = false;
    async function go() {
      if (!apiUrl) return;
      setLoading(true);
      setErr("");
      try {
        const r = await fetch(apiUrl, { cache: "no-store" });
        const j = await r.json().catch(() => null);
        if (cancelled) return;
        if (!j) {
          setErr(`Failed to parse JSON from ${apiUrl}`);
          setPayload(null);
          return;
        }
        setPayload(j);
      } catch (e: any) {
        if (cancelled) return;
        setErr(String(e?.message || e));
        setPayload(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    go();
    return () => { cancelled = true; };
  }, [apiUrl]);

  const runlog: Runlog | null = payload?.value || null;
  const exists = Boolean(payload?.exists);

  return (
    <main style={{ maxWidth: 980, margin: "0 auto", padding: 24, fontFamily: "ui-sans-serif, system-ui" }}>
      <h1 style={{ fontSize: 28, marginBottom: 6 }}>Runlog Preview</h1>
      <div style={{ opacity: 0.75, marginBottom: 18 }}>
        <div><b>projectId</b>: {projectId || "(missing)"} </div>
        <div><b>api</b>: {apiUrl || "(missing)"} </div>
      </div>

      {!projectId && (
        <div style={{ border: "1px solid #ddd", borderRadius: 12, padding: 16 }}>
          Missing <code>projectId</code>. Use: <code>/preview/runlog?projectId=YOUR_PROJECT_ID&amp;debug=1</code>
        </div>
      )}

      {projectId && (
        <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 18 }}>
          <button
            onClick={() => {
              if (!apiUrl) return;
              // force refresh by changing URL ts via location reload
              window.location.href = `/preview/runlog?projectId=${encodeURIComponent(projectId)}&debug=${debugOn ? "1" : "0"}&ts=${Date.now()}`;
            }}
            style={{ padding: "10px 14px", borderRadius: 10, border: "1px solid #ddd", background: "#fff", cursor: "pointer" }}
          >
            Refresh
          </button>
          <span style={{ opacity: 0.75 }}>
            {loading ? "Loading…" : exists ? "Latest runlog found." : "No runlog stored yet (exists=false)."}
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
          <h2 style={{ fontSize: 18, margin: "0 0 12px 0" }}>Summary</h2>
          <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", rowGap: 8, columnGap: 12 }}>
            <div style={{ opacity: 0.75 }}>marker</div><div>{runlog?.marker || "(none)"}</div>
            <div style={{ opacity: 0.75 }}>jobId</div><div>{runlog?.jobId || "(none)"}</div>
            <div style={{ opacity: 0.75 }}>createdAtIso</div><div>{runlog?.createdAtIso || "(none)"}</div>
            <div style={{ opacity: 0.75 }}>finishedAtIso</div><div>{runlog?.finishedAtIso || "(none)"}</div>
            <div style={{ opacity: 0.75 }}>seedMode</div><div>{runlog?.seedMode || "(none)"}</div>
            <div style={{ opacity: 0.75 }}>templateId</div><div>{(runlog?.templateId ?? "(none)") as any}</div>
            <div style={{ opacity: 0.75 }}>steps</div><div>{Array.isArray(runlog?.steps) ? runlog!.steps!.length : 0}</div>
            <div style={{ opacity: 0.75 }}>error</div><div>{runlog?.error || "(none)"}</div>
          </div>
        </section>
      )}

      {projectId && Array.isArray(runlog?.steps) && runlog!.steps!.length > 0 && (
        <section style={{ marginBottom: 18 }}>
          <h2 style={{ fontSize: 18, marginBottom: 12 }}>Steps</h2>
          <div style={{ display: "grid", gap: 12 }}>
            {runlog!.steps!.map((s, idx) => (
              <div key={idx} style={{ border: "1px solid #ddd", borderRadius: 12, padding: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, marginBottom: 8 }}>
                  <div>
                    <b style={{ fontSize: 16 }}>{s.step || `step_${idx}`}</b>
                    <div style={{ opacity: 0.75, fontSize: 13 }}>{s.url || ""}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div><b>Status:</b> {typeof s.status === "number" ? s.status : "(n/a)"}</div>
                    <div style={{ opacity: 0.75, fontSize: 13 }}>
                      {typeof s.ms === "number" ? `${s.ms}ms` : ""} {s.ok === true ? "✅" : s.ok === false ? "❌" : ""}
                    </div>
                  </div>
                </div>
                {s.bodyFirst200 && (
                  <pre style={{ margin: 0, whiteSpace: "pre-wrap", background: "#fafafa", border: "1px solid #eee", borderRadius: 10, padding: 10, fontSize: 12 }}>
                    {s.bodyFirst200}
                  </pre>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {projectId && debugOn && (
        <section style={{ border: "1px solid #ddd", borderRadius: 12, padding: 16 }}>
          <h2 style={{ fontSize: 18, margin: "0 0 12px 0" }}>Raw JSON (debug=1)</h2>
          <details open>
            <summary style={{ cursor: "pointer", marginBottom: 10 }}>API response</summary>
            <pre style={{ margin: 0, whiteSpace: "pre-wrap", background: "#fafafa", border: "1px solid #eee", borderRadius: 10, padding: 10, fontSize: 12 }}>
              {JSON.stringify(payload, null, 2)}
            </pre>
          </details>
          <details>
            <summary style={{ cursor: "pointer", margin: "12px 0 10px 0" }}>Runlog value</summary>
            <pre style={{ margin: 0, whiteSpace: "pre-wrap", background: "#fafafa", border: "1px solid #eee", borderRadius: 10, padding: 10, fontSize: 12 }}>
              {JSON.stringify(runlog, null, 2)}
            </pre>
          </details>
        </section>
      )}
    </main>
  );
}
