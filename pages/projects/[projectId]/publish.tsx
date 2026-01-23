// pages/projects/[projectId]/publish.tsx
import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";

type Step = {
  step?: string;
  ok?: boolean;
  status?: number;
  ms?: number;
  contentType?: string;
  bodyFirst200?: string;
  url?: string;
  error?: string;
};

type LaunchRunResponse =
  | {
      ok: true;
      marker?: string;
      jobId?: string;
      runId?: string;
      projectId: string;
      createdAtIso?: string;
      nowIso?: string;
      steps?: Step[];
      config?: any;
    }
  | {
      ok: false;
      error: string;
      runId?: string;
      projectId?: string;
      nowIso?: string;
      steps?: Step[];
    };

type RunMeta = {
  runId: string;
  projectId: string;
  createdAtIso: string;
  status: "running" | "ok" | "fail";
  marker?: string;
  jobId?: string;
};

type RunDetail = RunMeta & { steps: Step[] };

export default function PublishPage() {
  const router = useRouter();
  const projectId = (router.query.projectId as string) || "";

  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<LaunchRunResponse | null>(null);
  const [rawText, setRawText] = useState<string | null>(null);

  const [runId, setRunId] = useState<string | null>(null);
  const [runDetail, setRunDetail] = useState<RunDetail | null>(null);
  const [pollError, setPollError] = useState<string | null>(null);

  const pollTimer = useRef<any>(null);

  const steps = useMemo(() => result?.steps || [], [result]);

  function stopPoll() {
    if (pollTimer.current) {
      clearInterval(pollTimer.current);
      pollTimer.current = null;
    }
  }

  async function pollOnce(pid: string, rid: string) {
    try {
      const r = await fetch(`/api/projects/${pid}/runs/${rid}?ts=` + Date.now(), { cache: "no-store" });
      const j = await r.json();
      if (!r.ok || !j?.ok) throw new Error(j?.error || "Failed to load run");
      const run = j.run as RunDetail;
      setRunDetail(run);
      setPollError(null);

      if (run.status === "ok" || run.status === "fail") {
        stopPoll();
      }
    } catch (e: any) {
      setPollError(e?.message || "Polling failed");
    }
  }

  function startPoll(pid: string, rid: string) {
    stopPoll();
    pollOnce(pid, rid);
    pollTimer.current = setInterval(() => pollOnce(pid, rid), 2000);
  }

  async function runPipeline() {
    if (!projectId) return;

    stopPoll();

    setRunning(true);
    setResult(null);
    setRawText(null);
    setRunId(null);
    setRunDetail(null);
    setPollError(null);

    try {
      const r = await fetch(`/api/projects/${projectId}/agents/launch-run?ts=` + Date.now(), {
        method: "POST",
        cache: "no-store",
      });

      const text = await r.text();
      setRawText(text);

      let j: any = null;
      try { j = JSON.parse(text); } catch {}

      if (!r.ok || !j) {
        throw new Error(`launch-run failed (${r.status}). Body: ${text.slice(0, 200)}`);
      }

      setResult(j as LaunchRunResponse);

      const rid = j?.runId as string | undefined;
      if (rid) {
        setRunId(rid);
        startPoll(projectId, rid);
      }
    } catch (e: any) {
      setResult({
        ok: false,
        error: e?.message || "Unknown error",
        projectId,
        nowIso: new Date().toISOString(),
      });
    } finally {
      setRunning(false);
    }
  }

  const ok = result?.ok === true;

  const liveStatus = runDetail?.status;
  const liveBadge =
    liveStatus === "ok" ? { text: "✅ ok", cls: "border-green-200 bg-green-50 text-green-700" } :
    liveStatus === "fail" ? { text: "❌ fail", cls: "border-red-200 bg-red-50 text-red-700" } :
    liveStatus === "running" ? { text: "⏳ running", cls: "border-gray-200 bg-gray-50 text-gray-700" } :
    null;

  return (
    <div style={{ maxWidth: 980, margin: "0 auto", padding: "40px 16px" }}>
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 12, letterSpacing: 0.8, textTransform: "uppercase", color: "#6b7280" }}>
          Project
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 12, marginTop: 8 }}>
          <h1 style={{ fontSize: 28, margin: 0 }}>One Button Publish</h1>
          <span style={{
            border: "1px solid #e5e7eb",
            borderRadius: 999,
            padding: "6px 10px",
            fontSize: 13,
            color: "#374151",
          }}>
            {projectId || "(loading...)"}
          </span>
        </div>

        <p style={{ marginTop: 10, fontSize: 14, color: "#4b5563" }}>
          Triggers the full pipeline via <code>/agents/launch-run</code>, logs a run, and shows live progress.
        </p>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 18 }}>
        <button
          onClick={runPipeline}
          disabled={running || !projectId}
          style={{
            borderRadius: 12,
            padding: "10px 14px",
            fontSize: 14,
            fontWeight: 700,
            border: "1px solid #111827",
            background: running ? "#d1d5db" : "#111827",
            color: running ? "#111827" : "#ffffff",
            cursor: running ? "not-allowed" : "pointer",
          }}
        >
          {running ? "Running pipeline..." : "Run full publish pipeline"}
        </button>

        <Link
          href={projectId ? `/projects/${projectId}/runs` : "/projects"}
          style={{
            borderRadius: 12,
            padding: "10px 14px",
            fontSize: 14,
            fontWeight: 700,
            border: "1px solid #e5e7eb",
            background: "#ffffff",
            color: "#111827",
            textDecoration: "none",
          }}
        >
          Runs
        </Link>

        <Link
          href={projectId ? `/projects/${projectId}/terminal` : "/projects"}
          style={{
            borderRadius: 12,
            padding: "10px 14px",
            fontSize: 14,
            fontWeight: 700,
            border: "1px solid #e5e7eb",
            background: "#ffffff",
            color: "#111827",
            textDecoration: "none",
          }}
        >
          Terminal
        </Link>

        <a
          href={projectId ? `/api/projects/${projectId}/debug/spec?ts=${Date.now()}` : "#"}
          target="_blank"
          rel="noreferrer"
          style={{
            borderRadius: 12,
            padding: "10px 14px",
            fontSize: 14,
            fontWeight: 700,
            border: "1px solid #e5e7eb",
            background: "#ffffff",
            color: "#111827",
            textDecoration: "none",
          }}
        >
          Open debug/spec
        </a>

        {runId ? (
          <Link
            href={`/projects/${projectId}/runs/${runId}`}
            style={{
              borderRadius: 12,
              padding: "10px 14px",
              fontSize: 14,
              fontWeight: 700,
              border: "1px solid #e5e7eb",
              background: "#ffffff",
              color: "#111827",
              textDecoration: "none",
            }}
          >
            Open run detail
          </Link>
        ) : null}
      </div>

      {runId ? (
        <div style={{ marginBottom: 14, border: "1px solid #e5e7eb", borderRadius: 16, padding: 14, background: "#ffffff" }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
            <div style={{ fontSize: 14, fontWeight: 800 }}>Live run</div>
            <span style={{ border: "1px solid #e5e7eb", borderRadius: 999, padding: "6px 10px", fontSize: 12 }}>
              runId: {runId}
            </span>

            {liveBadge ? (
              <span className={""} style={{ border: "1px solid #e5e7eb", borderRadius: 999, padding: "6px 10px", fontSize: 12 }}>
                {liveBadge.text}
              </span>
            ) : (
              <span style={{ border: "1px solid #e5e7eb", borderRadius: 999, padding: "6px 10px", fontSize: 12 }}>
                ⏳ polling...
              </span>
            )}

            {pollError ? (
              <span style={{ color: "#b91c1c", fontSize: 12, fontWeight: 700 }}>
                {pollError}
              </span>
            ) : null}
          </div>

          {runDetail?.steps?.length ? (
            <div style={{ marginTop: 10, display: "grid", gap: 8 }}>
              {runDetail.steps.slice(0, 8).map((s, idx) => (
                <div key={idx} style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: 10 }}>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
                    <div style={{ fontSize: 13, fontWeight: 800 }}>{s.step || `step-${idx + 1}`}</div>
                    {typeof s.ok === "boolean" ? (
                      <span style={{
                        fontSize: 12,
                        borderRadius: 999,
                        padding: "4px 8px",
                        border: "1px solid",
                        borderColor: s.ok ? "#bbf7d0" : "#fecaca",
                        background: s.ok ? "#f0fdf4" : "#fef2f2",
                        color: s.ok ? "#166534" : "#991b1b",
                        fontWeight: 700,
                      }}>
                        {s.ok ? "OK" : "FAIL"}
                      </span>
                    ) : null}
                    {typeof s.status === "number" ? (
                      <span style={{ fontSize: 12, borderRadius: 999, padding: "4px 8px", border: "1px solid #e5e7eb", color: "#374151", fontWeight: 700 }}>
                        status {s.status}
                      </span>
                    ) : null}
                  </div>

                  {s.error ? <div style={{ marginTop: 6, color: "#b91c1c", fontSize: 12, fontWeight: 700 }}>{s.error}</div> : null}
                </div>
              ))}
            </div>
          ) : (
            <div style={{ marginTop: 10, fontSize: 13, color: "#4b5563" }}>
              Waiting for run data…
            </div>
          )}
        </div>
      ) : null}

      {result ? (
        <div style={{ border: "1px solid #e5e7eb", borderRadius: 16, padding: 16, background: "#ffffff" }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: ok ? "#047857" : "#b91c1c" }}>
              {ok ? "✅ launch-run returned ok" : "❌ launch-run returned failure"}
            </div>

            {"marker" in result && (result as any).marker ? (
              <span style={{ border: "1px solid #e5e7eb", borderRadius: 999, padding: "6px 10px", fontSize: 12 }}>
                marker: {(result as any).marker}
              </span>
            ) : null}

            {"jobId" in result && (result as any).jobId ? (
              <span style={{ border: "1px solid #e5e7eb", borderRadius: 999, padding: "6px 10px", fontSize: 12 }}>
                jobId: {(result as any).jobId}
              </span>
            ) : null}

            {"runId" in result && (result as any).runId ? (
              <span style={{ border: "1px solid #e5e7eb", borderRadius: 999, padding: "6px 10px", fontSize: 12 }}>
                runId: {(result as any).runId}
              </span>
            ) : null}
          </div>

          <div style={{ marginTop: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 800 }}>Steps</div>

            {steps.length === 0 ? (
              <div style={{ marginTop: 8, fontSize: 14, color: "#4b5563" }}>
                No steps returned.
              </div>
            ) : (
              <div style={{ marginTop: 10, display: "grid", gap: 10 }}>
                {steps.map((s, idx) => (
                  <div key={idx} style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: 12 }}>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
                      <div style={{ fontSize: 14, fontWeight: 800 }}>
                        {s.step || `step-${idx + 1}`}
                      </div>

                      {typeof s.ok === "boolean" ? (
                        <span style={{
                          fontSize: 12,
                          borderRadius: 999,
                          padding: "4px 8px",
                          border: "1px solid",
                          borderColor: s.ok ? "#bbf7d0" : "#fecaca",
                          background: s.ok ? "#f0fdf4" : "#fef2f2",
                          color: s.ok ? "#166534" : "#991b1b",
                          fontWeight: 700,
                        }}>
                          {s.ok ? "OK" : "FAIL"}
                        </span>
                      ) : null}

                      {typeof s.status === "number" ? (
                        <span style={{
                          fontSize: 12,
                          borderRadius: 999,
                          padding: "4px 8px",
                          border: "1px solid #e5e7eb",
                          color: "#374151",
                          fontWeight: 700,
                        }}>
                          status {s.status}
                        </span>
                      ) : null}

                      {typeof s.ms === "number" ? (
                        <span style={{
                          fontSize: 12,
                          borderRadius: 999,
                          padding: "4px 8px",
                          border: "1px solid #e5e7eb",
                          color: "#374151",
                          fontWeight: 700,
                        }}>
                          {s.ms} ms
                        </span>
                      ) : null}
                    </div>

                    {s.url ? (
                      <div style={{ marginTop: 8, fontSize: 12, color: "#4b5563", wordBreak: "break-all" }}>
                        <b>url:</b> {s.url}
                      </div>
                    ) : null}

                    {s.error ? (
                      <div style={{ marginTop: 8, fontSize: 13, color: "#b91c1c", fontWeight: 700 }}>
                        {s.error}
                      </div>
                    ) : null}

                    {s.bodyFirst200 ? (
                      <pre style={{
                        marginTop: 10,
                        background: "#f9fafb",
                        borderRadius: 10,
                        padding: 10,
                        fontSize: 12,
                        overflow: "auto",
                      }}>
{s.bodyFirst200}
                      </pre>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </div>

          {rawText ? (
            <details style={{ marginTop: 16 }}>
              <summary style={{ cursor: "pointer", fontSize: 14, fontWeight: 800 }}>Raw response</summary>
              <pre style={{
                marginTop: 10,
                background: "#f9fafb",
                borderRadius: 10,
                padding: 10,
                fontSize: 12,
                overflow: "auto",
              }}>
{rawText}
              </pre>
            </details>
          ) : null}
        </div>
      ) : (
        <div style={{ border: "1px solid #e5e7eb", borderRadius: 16, padding: 16, background: "#f9fafb", fontSize: 14, color: "#374151" }}>
          Click <b>Run full publish pipeline</b>. A run will be logged and live progress will appear.
        </div>
      )}
    </div>
  );
}
