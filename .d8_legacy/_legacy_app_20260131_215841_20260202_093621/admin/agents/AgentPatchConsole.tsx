"use client";

import React, { useMemo, useState } from "react";

type RunResponse = {
  ok?: boolean;
  projectId?: string;
  agentId?: string;
  runId?: string;
  status?: string;
  patchSaved?: boolean;
  patchMode?: string;
  patchChars?: number;
  patchKeys?: { patchLatest?: string; patchById?: string };
  error?: string;
};

type PatchResponse = {
  ok?: boolean;
  patch?: {
    runId?: string;
    projectId?: string;
    agentId?: string;
    createdAt?: string;
    status?: string;
    mode?: string;
    script?: string;
  };
  foundKey?: string;
  error?: string;
  triedKeys?: string[];
  hint?: string;
};

type BundleRunResponse = {
  ok?: boolean;
  projectId?: string;
  bundleRunId?: string;
  startedAt?: string;
  finishedAt?: string;
  scriptsCount?: number;
  steps?: Array<{
    agentId: string;
    runId?: string;
    status?: string;
    patchSaved?: boolean;
    patchMode?: string;
    patchChars?: number;
    error?: string;
  }>;
  error?: string;
};

type BundlePatchResponse = {
  ok?: boolean;
  patch?: {
    ok?: boolean;
    projectId?: string;
    bundleRunId?: string;
    createdAt?: string;
    goal?: string;
    script?: string;
    scriptsMeta?: Array<{ agentId: string; runId: string; chars: number }>;
  };
  foundKey?: string;
  error?: string;
  triedKeys?: string[];
};

function isoShort(s?: string) {
  if (!s) return "";
  try {
    const d = new Date(s);
    return d.toISOString().replace("T", " ").replace("Z", "Z");
  } catch {
    return s;
  }
}

function buildApplyBlockSingle(baseUrl: string, projectId: string, runId: string) {
  return [
    "Set-StrictMode -Version Latest",
    '$ErrorActionPreference = "Stop"',
    "",
    `$base = "${baseUrl}"`,
    `$projectId = "${projectId}"`,
    `$runId = "${runId}"`,
    "",
    'Write-Host "Fetching patch..."',
    "try {",
    '  $p = Invoke-RestMethod -Uri "$base/api/agents/patch?projectId=$projectId&runId=$runId"',
    "} catch {",
    '  Write-Host "PATCH FETCH FAILED."',
    "  if ($_.Exception.Response -and $_.Exception.Response.GetResponseStream()) {",
    "    $sr = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())",
    "    $errBody = $sr.ReadToEnd()",
    "    $sr.Close()",
    "    Write-Host $errBody",
    "  }",
    "  throw",
    "}",
    "",
    'if (-not $p -or -not $p.patch -or -not $p.patch.script) { throw "Patch payload missing patch.script" }',
    "",
    '$out = Join-Path (Get-Location) ("agent_patch_" + $runId + ".ps1")',
    "Set-Content -LiteralPath $out -Value ([string]$p.patch.script) -Encoding UTF8",
    'Write-Host ("WROTE: " + $out)',
    'Write-Host "RUNNING PATCH..."',
    "powershell -ExecutionPolicy Bypass -File $out",
    "",
  ].join("\r\n");
}

function buildApplyBlockBundle(baseUrl: string, projectId: string, bundleRunId: string) {
  return [
    "Set-StrictMode -Version Latest",
    '$ErrorActionPreference = "Stop"',
    "",
    `$base = "${baseUrl}"`,
    `$projectId = "${projectId}"`,
    `$bundleRunId = "${bundleRunId}"`,
    "",
    'Write-Host "Fetching BUNDLE patch..."',
    "try {",
    '  $p = Invoke-RestMethod -Uri "$base/api/agents/bundle/patch?projectId=$projectId&bundleRunId=$bundleRunId"',
    "} catch {",
    '  Write-Host "BUNDLE PATCH FETCH FAILED."',
    "  if ($_.Exception.Response -and $_.Exception.Response.GetResponseStream()) {",
    "    $sr = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())",
    "    $errBody = $sr.ReadToEnd()",
    "    $sr.Close()",
    "    Write-Host $errBody",
    "  }",
    "  throw",
    "}",
    "",
    'if (-not $p -or -not $p.patch -or -not $p.patch.script) { throw "Bundle payload missing patch.script" }',
    "",
    '$out = Join-Path (Get-Location) ("agent_bundle_patch_" + $bundleRunId + ".ps1")',
    "Set-Content -LiteralPath $out -Value ([string]$p.patch.script) -Encoding UTF8",
    'Write-Host ("WROTE: " + $out)',
    'Write-Host "RUNNING BUNDLE PATCH..."',
    "powershell -ExecutionPolicy Bypass -File $out",
    "",
  ].join("\r\n");
}

export default function AgentPatchConsole() {
  const [projectId, setProjectId] = useState("demo");
  const [agentId, setAgentId] = useState("02_creative_director");
  const [prompt, setPrompt] = useState(
    'Create a PowerShell patch script that adds a file ".\\\\PATCH_PROOF_UI.txt" containing "UI_OK".'
  );

  const [busy, setBusy] = useState(false);
  const [run, setRun] = useState<RunResponse | null>(null);

  const [runIdInput, setRunIdInput] = useState("");
  const [patch, setPatch] = useState<PatchResponse | null>(null);

  // Bundle
  const [bundleGoal, setBundleGoal] = useState(
    "Make a safe, high-impact improvement to Dominat8's homepage polish or admin tooling. Output PowerShell-only patches."
  );
  const [bundleRun, setBundleRun] = useState<BundleRunResponse | null>(null);
  const [bundlePatch, setBundlePatch] = useState<BundlePatchResponse | null>(null);

  const baseUrl = useMemo(() => {
    if (typeof window === "undefined") return "https://www.dominat8.com";
    return window.location.origin || "https://www.dominat8.com";
  }, []);

  const effectiveRunId = useMemo(() => {
    const fromRun = (run?.runId || "").trim();
    const fromInput = (runIdInput || "").trim();
    return fromInput || fromRun;
  }, [run?.runId, runIdInput]);

  const applyBlockSingle = useMemo(() => {
    const rid = effectiveRunId;
    if (!rid) return "";
    return buildApplyBlockSingle(baseUrl, projectId.trim() || "demo", rid);
  }, [baseUrl, projectId, effectiveRunId]);

  const applyBlockBundle = useMemo(() => {
    const bid = (bundleRun?.bundleRunId || "").trim();
    if (!bid) return "";
    return buildApplyBlockBundle(baseUrl, projectId.trim() || "demo", bid);
  }, [baseUrl, projectId, bundleRun?.bundleRunId]);

  async function doRun() {
    setBusy(true);
    setPatch(null);
    try {
      const body = {
        projectId: projectId.trim() || "demo",
        agentId: agentId.trim() || "02_creative_director",
        prompt: prompt,
        maxOutputTokens: 900,
      };

      const res = await fetch("/api/agents/run", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });

      const json = (await res.json()) as RunResponse;
      setRun(json);

      if (json?.runId) setRunIdInput(json.runId);
      if (json?.runId) await fetchPatchByRunId(json.runId);
    } catch (e: any) {
      setRun({ ok: false, error: e?.message || "RUN_FAILED" });
    } finally {
      setBusy(false);
    }
  }

  async function fetchPatchByRunId(runId: string) {
    const pid = projectId.trim() || "demo";
    const rid = (runId || "").trim();
    if (!rid) return;

    setBusy(true);
    try {
      const res = await fetch(`/api/agents/patch?projectId=${encodeURIComponent(pid)}&runId=${encodeURIComponent(rid)}`, {
        method: "GET",
      });
      const json = (await res.json()) as PatchResponse;
      setPatch(json);
    } catch (e: any) {
      setPatch({ ok: false, error: e?.message || "PATCH_FETCH_FAILED" });
    } finally {
      setBusy(false);
    }
  }

  async function fetchPatchLatest() {
    const pid = projectId.trim() || "demo";
    setBusy(true);
    try {
      const res = await fetch(`/api/agents/patch?projectId=${encodeURIComponent(pid)}`, { method: "GET" });
      const json = (await res.json()) as PatchResponse;
      setPatch(json);
      if (json?.patch?.runId) setRunIdInput(json.patch.runId);
    } catch (e: any) {
      setPatch({ ok: false, error: e?.message || "PATCH_LATEST_FAILED" });
    } finally {
      setBusy(false);
    }
  }

  async function doRunBundle() {
    setBusy(true);
    setBundleRun(null);
    setBundlePatch(null);
    try {
      const body = { projectId: projectId.trim() || "demo", goal: bundleGoal };

      const res = await fetch("/api/agents/bundle/run", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });

      const json = (await res.json()) as BundleRunResponse;
      setBundleRun(json);

      const bid = (json?.bundleRunId || "").trim();
      if (bid) {
        await fetchBundlePatch(bid);
      }
    } catch (e: any) {
      setBundleRun({ ok: false, error: e?.message || "BUNDLE_RUN_FAILED" });
    } finally {
      setBusy(false);
    }
  }

  async function fetchBundlePatch(bundleRunId: string) {
    const pid = projectId.trim() || "demo";
    const bid = (bundleRunId || "").trim();
    if (!bid) return;

    setBusy(true);
    try {
      const res = await fetch(`/api/agents/bundle/patch?projectId=${encodeURIComponent(pid)}&bundleRunId=${encodeURIComponent(bid)}`, {
        method: "GET",
      });
      const json = (await res.json()) as BundlePatchResponse;
      setBundlePatch(json);
    } catch (e: any) {
      setBundlePatch({ ok: false, error: e?.message || "BUNDLE_PATCH_FETCH_FAILED" } as any);
    } finally {
      setBusy(false);
    }
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
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  }

  async function copyToClipboard(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      alert("Copied to clipboard.");
    } catch {
      alert("Clipboard failed (browser permissions). You can still select + copy manually.");
    }
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* LEFT: Single Agent */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-xs font-semibold tracking-[0.24em] text-white/60">RUN AGENT</div>
            <div className="mt-1 text-base font-semibold text-white">Generate patch</div>
          </div>
          <button
            onClick={doRun}
            disabled={busy}
            className="rounded-xl border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/15 disabled:opacity-50"
          >
            {busy ? "Working..." : "Run"}
          </button>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3">
          <label className="block">
            <div className="text-xs text-white/60">Project ID</div>
            <input
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-white/25"
              placeholder="demo"
            />
          </label>

          <label className="block">
            <div className="text-xs text-white/60">Agent ID</div>
            <input
              value={agentId}
              onChange={(e) => setAgentId(e.target.value)}
              className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-white/25"
              placeholder="02_creative_director"
            />
          </label>

          <label className="block">
            <div className="text-xs text-white/60">Prompt</div>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={6}
              className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-white/25"
            />
          </label>
        </div>

        <div className="mt-4 rounded-xl border border-white/10 bg-black/30 p-4">
          <div className="text-xs font-semibold tracking-[0.24em] text-white/60">RUN RESULT</div>
          {!run ? (
            <div className="mt-2 text-sm text-white/60">No run yet.</div>
          ) : (
            <div className="mt-3 space-y-1 text-sm text-white/80">
              <div><span className="text-white/60">ok:</span> {String(run.ok)}</div>
              <div><span className="text-white/60">runId:</span> <span className="break-all">{run.runId || "-"}</span></div>
              <div><span className="text-white/60">status:</span> {run.status || "-"}</div>
              <div><span className="text-white/60">patchSaved:</span> {String(run.patchSaved)}</div>
              <div><span className="text-white/60">patchMode:</span> {run.patchMode || "-"}</div>
              <div><span className="text-white/60">patchChars:</span> {String(run.patchChars ?? "-")}</div>
              {run.error ? <div className="text-red-300"><span className="text-white/60">error:</span> {run.error}</div> : null}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT: Single Patch + Apply */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-xs font-semibold tracking-[0.24em] text-white/60">PATCH</div>
            <div className="mt-1 text-base font-semibold text-white">Fetch / download / apply</div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => fetchPatchByRunId(effectiveRunId)}
              disabled={busy || !effectiveRunId}
              className="rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-sm font-semibold text-white hover:bg-white/15 disabled:opacity-50"
            >
              Fetch by runId
            </button>
            <button
              onClick={fetchPatchLatest}
              disabled={busy}
              className="rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-sm font-semibold text-white hover:bg-white/15 disabled:opacity-50"
            >
              Fetch latest
            </button>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3">
          <label className="block">
            <div className="text-xs text-white/60">Run ID (optional; auto-filled)</div>
            <input
              value={runIdInput}
              onChange={(e) => setRunIdInput(e.target.value)}
              className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-white/25"
              placeholder="resp_..."
            />
          </label>
        </div>

        <div className="mt-4 rounded-xl border border-white/10 bg-black/30 p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="text-xs font-semibold tracking-[0.24em] text-white/60">PATCH RESULT</div>
            <div className="flex gap-2">
              <button
                onClick={() => downloadText(`agent_patch_${patch?.patch?.runId || effectiveRunId || "unknown"}.ps1`, patch?.patch?.script || "")}
                disabled={!patch?.patch?.script}
                className="rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-xs font-semibold text-white hover:bg-white/15 disabled:opacity-50"
              >
                Download .ps1
              </button>
              <button
                onClick={() => copyToClipboard(patch?.patch?.script || "")}
                disabled={!patch?.patch?.script}
                className="rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-xs font-semibold text-white hover:bg-white/15 disabled:opacity-50"
              >
                Copy script
              </button>
            </div>
          </div>

          {!patch ? (
            <div className="mt-2 text-sm text-white/60">No patch fetched yet.</div>
          ) : patch.ok ? (
            <div className="mt-3 space-y-1 text-sm text-white/80">
              <div><span className="text-white/60">foundKey:</span> <span className="break-all">{patch.foundKey || "-"}</span></div>
              <div><span className="text-white/60">runId:</span> <span className="break-all">{patch.patch?.runId || "-"}</span></div>
              <div><span className="text-white/60">createdAt:</span> {isoShort(patch.patch?.createdAt) || "-"}</div>
              <div><span className="text-white/60">mode:</span> {patch.patch?.mode || "-"}</div>
              <div className="mt-3">
                <div className="text-xs text-white/60">patch.script</div>
                <textarea
                  readOnly
                  value={patch.patch?.script || ""}
                  rows={10}
                  className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 font-mono text-xs text-white outline-none"
                />
              </div>
            </div>
          ) : (
            <div className="mt-3 space-y-2 text-sm text-white/80">
              <div className="text-red-300"><span className="text-white/60">error:</span> {patch.error || "NOT_OK"}</div>
              {patch.triedKeys && patch.triedKeys.length ? (
                <div>
                  <div className="text-xs text-white/60">triedKeys</div>
                  <div className="mt-1 space-y-1 text-xs text-white/70">
                    {patch.triedKeys.map((k) => (
                      <div key={k} className="break-all">{k}</div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </div>

        <div className="mt-4 rounded-xl border border-white/10 bg-black/30 p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-xs font-semibold tracking-[0.24em] text-white/60">APPLY LOCALLY</div>
              <div className="mt-1 text-sm text-white/70">Hard-stops on 404. Writes a .ps1 then runs it.</div>
            </div>
            <button
              onClick={() => copyToClipboard(applyBlockSingle)}
              disabled={!applyBlockSingle}
              className="rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-xs font-semibold text-white hover:bg-white/15 disabled:opacity-50"
            >
              Copy apply block
            </button>
          </div>

          <textarea
            readOnly
            value={applyBlockSingle || "Run an agent or paste a runId to generate the apply block."}
            rows={12}
            className="mt-3 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 font-mono text-xs text-white outline-none"
          />
        </div>
      </div>

      {/* FULL WIDTH: Bundle Runner */}
      <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-white/5 p-5 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-xs font-semibold tracking-[0.24em] text-white/60">INSTALL C</div>
            <div className="mt-1 text-base font-semibold text-white">9-Agent Bundle Runner</div>
            <div className="mt-2 text-sm text-white/70">
              Runs 9 agents in order, saves ONE combined PowerShell script to KV, and lets you download/apply it.
            </div>
          </div>
          <button
            onClick={doRunBundle}
            disabled={busy}
            className="rounded-xl border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/15 disabled:opacity-50"
          >
            {busy ? "Working..." : "Run 9-agent bundle"}
          </button>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3">
          <label className="block">
            <div className="text-xs text-white/60">Bundle Goal</div>
            <textarea
              value={bundleGoal}
              onChange={(e) => setBundleGoal(e.target.value)}
              rows={4}
              className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-white/25"
            />
          </label>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-xl border border-white/10 bg-black/30 p-4">
            <div className="text-xs font-semibold tracking-[0.24em] text-white/60">BUNDLE RUN RESULT</div>
            {!bundleRun ? (
              <div className="mt-2 text-sm text-white/60">No bundle run yet.</div>
            ) : (
              <div className="mt-3 space-y-1 text-sm text-white/80">
                <div><span className="text-white/60">ok:</span> {String(bundleRun.ok)}</div>
                <div><span className="text-white/60">bundleRunId:</span> <span className="break-all">{bundleRun.bundleRunId || "-"}</span></div>
                <div><span className="text-white/60">startedAt:</span> {isoShort(bundleRun.startedAt) || "-"}</div>
                <div><span className="text-white/60">finishedAt:</span> {isoShort(bundleRun.finishedAt) || "-"}</div>
                <div><span className="text-white/60">scriptsCount:</span> {String(bundleRun.scriptsCount ?? "-")}</div>
                {bundleRun.error ? <div className="text-red-300"><span className="text-white/60">error:</span> {bundleRun.error}</div> : null}

                {bundleRun.steps && bundleRun.steps.length ? (
                  <div className="mt-3">
                    <div className="text-xs text-white/60">steps</div>
                    <div className="mt-2 space-y-2">
                      {bundleRun.steps.map((s) => (
                        <div key={s.agentId} className="rounded-lg border border-white/10 bg-black/40 p-2">
                          <div className="text-xs text-white/70">{s.agentId}</div>
                          <div className="mt-1 text-xs text-white/80 break-all">runId: {s.runId || "-"}</div>
                          <div className="mt-1 text-xs text-white/80">patchSaved: {String(s.patchSaved)} {s.error ? <span className="text-red-300">({s.error})</span> : null}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            )}
          </div>

          <div className="rounded-xl border border-white/10 bg-black/30 p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="text-xs font-semibold tracking-[0.24em] text-white/60">BUNDLE PATCH</div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    const bid = (bundleRun?.bundleRunId || "").trim();
                    if (bid) fetchBundlePatch(bid);
                  }}
                  disabled={busy || !(bundleRun?.bundleRunId || "").trim()}
                  className="rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-xs font-semibold text-white hover:bg-white/15 disabled:opacity-50"
                >
                  Fetch bundle patch
                </button>
                <button
                  onClick={() => {
                    const s = bundlePatch?.patch?.script || "";
                    const bid = bundlePatch?.patch?.bundleRunId || bundleRun?.bundleRunId || "unknown";
                    if (s) downloadText(`agent_bundle_patch_${bid}.ps1`, s);
                  }}
                  disabled={!bundlePatch?.patch?.script}
                  className="rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-xs font-semibold text-white hover:bg-white/15 disabled:opacity-50"
                >
                  Download .ps1
                </button>
                <button
                  onClick={() => copyToClipboard(applyBlockBundle)}
                  disabled={!applyBlockBundle}
                  className="rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-xs font-semibold text-white hover:bg-white/15 disabled:opacity-50"
                >
                  Copy apply block
                </button>
              </div>
            </div>

            {!bundlePatch ? (
              <div className="mt-2 text-sm text-white/60">No bundle patch fetched yet.</div>
            ) : bundlePatch.ok ? (
              <div className="mt-3 space-y-1 text-sm text-white/80">
                <div><span className="text-white/60">foundKey:</span> <span className="break-all">{bundlePatch.foundKey || "-"}</span></div>
                <div><span className="text-white/60">bundleRunId:</span> <span className="break-all">{bundlePatch.patch?.bundleRunId || "-"}</span></div>
                <div><span className="text-white/60">createdAt:</span> {isoShort(bundlePatch.patch?.createdAt) || "-"}</div>

                <div className="mt-3">
                  <div className="text-xs text-white/60">bundle patch script</div>
                  <textarea
                    readOnly
                    value={bundlePatch.patch?.script || ""}
                    rows={12}
                    className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 font-mono text-xs text-white outline-none"
                  />
                </div>

                <div className="mt-3">
                  <div className="text-xs text-white/60">apply locally block</div>
                  <textarea
                    readOnly
                    value={applyBlockBundle || "Run the bundle first to generate an apply block."}
                    rows={10}
                    className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 font-mono text-xs text-white outline-none"
                  />
                </div>
              </div>
            ) : (
              <div className="mt-3 space-y-2 text-sm text-white/80">
                <div className="text-red-300"><span className="text-white/60">error:</span> {bundlePatch.error || "NOT_OK"}</div>
                {bundlePatch.triedKeys && bundlePatch.triedKeys.length ? (
                  <div>
                    <div className="text-xs text-white/60">triedKeys</div>
                    <div className="mt-1 space-y-1 text-xs text-white/70">
                      {bundlePatch.triedKeys.map((k) => (
                        <div key={k} className="break-all">{k}</div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
