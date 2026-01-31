"use client";

import { useEffect, useMemo, useState } from "react";

type AgentItem = { id: string; title: string; file: string };
type RunResponse = {
  ok: boolean;
  projectId?: string;
  agentId?: string;
  runId?: string;
  status?: string;
  patchSaved?: boolean;
  patchMode?: string;
  patchChars?: number;
  patchKeys?: { patchLatest: string; patchById: string };
  error?: string;
};

type PatchResponse = {
  ok: boolean;
  patch?: {
    runId: string;
    projectId: string;
    agentId: string;
    createdAt: string;
    status: string;
    mode: string;
    script: string;
  };
  foundKey?: string;
  error?: string;
};

function clamp(s: string, n: number) {
  if (!s) return "";
  return s.length > n ? s.slice(0, n) + "…(truncated)" : s;
}

function nowTs() {
  return Math.floor(Date.now() / 1000);
}

function downloadText(filename: string, text: string) {
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export default function AdminCockpitPage() {
  const [agents, setAgents] = useState<AgentItem[]>([]);
  const [agentsErr, setAgentsErr] = useState<string>("");

  const [projectId, setProjectId] = useState("demo");
  const [agentId, setAgentId] = useState("04_frontend_engineer");

  // Guardrail: force target file path (prevents generic garbage patches)
  const [targetPath, setTargetPath] = useState("src/app/admin/projects/page.tsx");

  const [task, setTask] = useState(
`CLOSE this page with a friendly empty state + CTA.
Admin-only. No public homepage changes. No design drift.
Output ONLY a single fenced PowerShell patch that OVERWRITES the target file path.`
  );

  const [runResp, setRunResp] = useState<RunResponse | null>(null);
  const [runRaw, setRunRaw] = useState<string>("");

  const [runId, setRunId] = useState<string>("");
  const [patchResp, setPatchResp] = useState<PatchResponse | null>(null);
  const [patchRaw, setPatchRaw] = useState<string>("");
  const [busy, setBusy] = useState(false);

  const effectivePrompt = useMemo(() => {
    const header = `EDIT ONLY THIS FILE:\n${targetPath}\n\nRules (STRICT):\n- Admin-only change. NO homepage edits.\n- Keep existing styling system.\n- If linking, use next/link.\n- Output ONLY one fenced PowerShell code block.\n- Patch MUST overwrite exactly: ${targetPath}\n\nTask:\n`;
    return header + task.trim();
  }, [task, targetPath]);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch(`/api/admin/agents/list?ts=${nowTs()}`, { cache: "no-store" });
        const j = await r.json();
        if (!j.ok) throw new Error(j.error || "Failed to list agents");
        setAgents(j.agents || []);
      } catch (e: any) {
        setAgentsErr(String(e?.message || e));
      }
    })();
  }, []);

  async function runAgent() {
    setBusy(true);
    setRunResp(null);
    setRunRaw("");
    setPatchResp(null);
    setPatchRaw("");
    setRunId("");

    try {
      if (!targetPath.trim()) throw new Error("Target file path is required.");
      if (!targetPath.trim().toLowerCase().startsWith("src/") && !targetPath.trim().toLowerCase().startsWith("src\\")) {
        throw new Error("Target must be under src/ (guardrail).");
      }

      const body = {
        projectId,
        agentId,
        // IMPORTANT: our server route accepts input/prompt/task/etc
        input: effectivePrompt,
        // Big output for real patches (route also has defaults)
        reasoningEffort: "minimal",
        maxOutputTokens: 6000,
      };

      const r = await fetch(`/api/agents/run?ts=${nowTs()}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });

      const text = await r.text();
      setRunRaw(text);

      let j: any = null;
      try { j = JSON.parse(text); } catch {}
      if (!j) throw new Error("Non-JSON response from /api/agents/run");

      setRunResp(j);

      if (j?.runId) {
        setRunId(String(j.runId));
      } else {
        throw new Error("No runId returned.");
      }
    } catch (e: any) {
      setRunResp({ ok: false, error: String(e?.message || e) });
    } finally {
      setBusy(false);
    }
  }

  async function fetchPatch() {
    setBusy(true);
    setPatchResp(null);
    setPatchRaw("");

    try {
      const rid = (runId || "").trim();
      if (!rid) throw new Error("Run ID is required.");
      const url = `/api/agents/patch?projectId=${encodeURIComponent(projectId)}&runId=${encodeURIComponent(rid)}&ts=${nowTs()}`;
      const r = await fetch(url, { cache: "no-store" });
      const text = await r.text();
      setPatchRaw(text);

      let j: any = null;
      try { j = JSON.parse(text); } catch {}
      if (!j) throw new Error("Non-JSON response from /api/agents/patch");

      setPatchResp(j);
    } catch (e: any) {
      setPatchResp({ ok: false, error: String(e?.message || e) });
    } finally {
      setBusy(false);
    }
  }

  function savePatchToDownloads() {
    const script = patchResp?.patch?.script || "";
    if (!script) return;
    const name = `agent_patch_${projectId}_${runId || "run"}.ps1`;
    downloadText(name, script);
  }

  const patchScriptPreview = patchResp?.patch?.script || "";

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-xs font-semibold tracking-[0.25em] text-white/60">ADMIN</div>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">Agile Cockpit</h1>
            <p className="mt-2 text-sm text-white/70">
              Run agents with strict guardrails. Patches are generated for you to apply locally (PowerShell).
            </p>
            <p className="mt-2 text-xs text-white/50">
              Tip: Use Windows voice dictation to speak into the task box (Win+H).
            </p>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-white/70">
            <div className="font-semibold text-white/80">Guardrails</div>
            <div className="mt-1">• Admin-only changes</div>
            <div>• Target file required</div>
            <div>• Output must be PS patch</div>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="text-sm font-semibold">Run Agent</div>

            <div className="mt-4 grid grid-cols-1 gap-3">
              <label className="text-xs text-white/60">Project ID</label>
              <input
                className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none"
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
              />

              <label className="text-xs text-white/60">Agent</label>
              <select
                className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none"
                value={agentId}
                onChange={(e) => setAgentId(e.target.value)}
              >
                {agents.length ? (
                  agents.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.id} — {a.title}
                    </option>
                  ))
                ) : (
                  <>
                    <option value="04_frontend_engineer">04_frontend_engineer</option>
                    <option value="02_creative_director">02_creative_director</option>
                  </>
                )}
              </select>
              {agentsErr ? <div className="text-xs text-red-300">Agents list error: {agentsErr}</div> : null}

              <label className="text-xs text-white/60">Target file path (required)</label>
              <input
                className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none"
                value={targetPath}
                onChange={(e) => setTargetPath(e.target.value)}
              />

              <label className="text-xs text-white/60">Task (speak here with Win+H)</label>
              <textarea
                className="min-h-[180px] w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none"
                value={task}
                onChange={(e) => setTask(e.target.value)}
              />

              <div className="rounded-lg border border-white/10 bg-black/30 p-3 text-xs text-white/70">
                <div className="font-semibold text-white/80">Effective prompt preview</div>
                <pre className="mt-2 whitespace-pre-wrap text-[11px] leading-relaxed text-white/70">
                  {clamp(effectivePrompt, 1200)}
                </pre>
              </div>

              <button
                disabled={busy}
                onClick={runAgent}
                className="mt-2 inline-flex items-center justify-center rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-white/90 disabled:opacity-50"
              >
                {busy ? "Running…" : "Run agent now"}
              </button>

              {runResp ? (
                <div className="mt-3 rounded-xl border border-white/10 bg-black/30 p-4">
                  <div className="text-xs font-semibold text-white/70">Run response</div>
                  <pre className="mt-2 whitespace-pre-wrap text-[11px] leading-relaxed text-white/70">
                    {JSON.stringify(runResp, null, 2)}
                  </pre>
                  {runResp.runId ? (
                    <div className="mt-2 text-xs text-white/70">
                      Run ID: <span className="font-mono text-white">{runResp.runId}</span>
                    </div>
                  ) : null}
                </div>
              ) : null}

              {runRaw ? (
                <details className="mt-2 rounded-xl border border-white/10 bg-black/30 p-3">
                  <summary className="cursor-pointer text-xs font-semibold text-white/70">Raw /api/agents/run body</summary>
                  <pre className="mt-2 whitespace-pre-wrap text-[11px] leading-relaxed text-white/70">{runRaw}</pre>
                </details>
              ) : null}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="text-sm font-semibold">Patch Viewer</div>

            <div className="mt-4 grid grid-cols-1 gap-3">
              <label className="text-xs text-white/60">Run ID</label>
              <input
                className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none"
                value={runId}
                onChange={(e) => setRunId(e.target.value)}
                placeholder="resp_..."
              />

              <button
                disabled={busy}
                onClick={fetchPatch}
                className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-black/30 px-4 py-2 text-sm font-semibold text-white transition hover:bg-black/40 disabled:opacity-50"
              >
                {busy ? "Fetching…" : "Fetch patch"}
              </button>

              {patchResp ? (
                <div className="rounded-xl border border-white/10 bg-black/30 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-xs font-semibold text-white/70">Patch status</div>
                    {patchResp?.patch?.script ? (
                      <button
                        onClick={savePatchToDownloads}
                        className="rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-black hover:bg-white/90"
                      >
                        Save patch to downloads
                      </button>
                    ) : null}
                  </div>

                  <pre className="mt-2 whitespace-pre-wrap text-[11px] leading-relaxed text-white/70">
                    {JSON.stringify(
                      {
                        ok: patchResp.ok,
                        foundKey: patchResp.foundKey,
                        runId: patchResp.patch?.runId,
                        status: patchResp.patch?.status,
                        mode: patchResp.patch?.mode,
                        scriptChars: patchResp.patch?.script?.length || 0,
                        error: patchResp.error,
                      },
                      null,
                      2
                    )}
                  </pre>

                  {patchScriptPreview ? (
                    <div className="mt-3 rounded-lg border border-white/10 bg-black/40 p-3">
                      <div className="text-xs font-semibold text-white/70">Patch script preview</div>
                      <pre className="mt-2 max-h-[420px] overflow-auto whitespace-pre text-[11px] leading-relaxed text-white/70">
                        {patchScriptPreview}
                      </pre>
                    </div>
                  ) : null}
                </div>
              ) : null}

              {patchRaw ? (
                <details className="rounded-xl border border-white/10 bg-black/30 p-3">
                  <summary className="cursor-pointer text-xs font-semibold text-white/70">Raw /api/agents/patch body</summary>
                  <pre className="mt-2 whitespace-pre-wrap text-[11px] leading-relaxed text-white/70">{patchRaw}</pre>
                </details>
              ) : null}

              <div className="mt-2 rounded-xl border border-white/10 bg-black/30 p-4 text-xs text-white/70">
                <div className="font-semibold text-white/80">Apply flow (local)</div>
                <div className="mt-2 font-mono text-[11px] leading-relaxed text-white/70">
                  1) Save patch<br />
                  2) Run it locally in PowerShell<br />
                  3) git add -A / commit / push / vercel --prod --force
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="text-sm font-semibold">Direct link</div>
          <div className="mt-2 text-xs text-white/70">
            Open: <span className="font-mono text-white">/admin/cockpit</span>
          </div>
        </div>
      </div>
    </div>
  );
}
