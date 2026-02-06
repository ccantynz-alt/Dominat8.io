# =================================================================================================
# D8_COM_NUCLEAR_COCKPIT_AUTOREPAIR_002.ps1
# Dominat8.com — Cockpit Ops page + Health API + Repair API + Local Doctor Loop (NO middleware edits)
# PowerShell-only. Copy/paste safe. Backups. Avoids JS/TS here-string expansion issues.
#
# Why 002 exists:
# - 001 became structurally broken due to here-string expansion / patching.
# - 002 uses SINGLE-QUOTED here-strings for generated code, so NOTHING expands accidentally.
#
# RUN:
#   powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\D8_COM_NUCLEAR_COCKPIT_AUTOREPAIR_002.ps1 -RepoRoot "C:\Temp\FARMS\Dominat8.com"
#
# Notes:
# - We DO NOT modify middleware.ts (to avoid collisions).
# - /admin/ops page is an internal ops panel. Actions require X-Admin-Key.
# - APIs are namespaced to avoid collisions: /api/d8/health and /api/d8/repair
# =================================================================================================

[CmdletBinding()]
param(
  [Parameter(Mandatory=$true)]
  [string]$RepoRoot,

  [Parameter(Mandatory=$false)]
  [switch]$AllowDirty
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Fail([string]$m) { Write-Host "FATAL $m" -ForegroundColor Red; exit 1 }
function Ok([string]$m)   { Write-Host "OK   $m" -ForegroundColor Green }
function Info([string]$m) { Write-Host "INFO $m" -ForegroundColor Gray }
function Warn([string]$m) { Write-Host "WARN $m" -ForegroundColor Yellow }

function Ensure-Dir([string]$p) {
  if (-not (Test-Path -LiteralPath $p)) { New-Item -ItemType Directory -Path $p | Out-Null }
}

function Write-Utf8NoBom([string]$Path, [string]$Content) {
  $dir = Split-Path -Parent $Path
  if ($dir) { Ensure-Dir $dir }
  $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
  [System.IO.File]::WriteAllText($Path, $Content, $utf8NoBom)
}

function Backup-File([string]$Path) {
  if (Test-Path -LiteralPath $Path) {
    $ts = Get-Date -Format "yyyyMMdd_HHmmss"
    $bak = "$Path.bak_$ts"
    Copy-Item -LiteralPath $Path -Destination $bak -Force
    Info "Backup: $bak"
  }
}

function Git-Exists() {
  try { git --version | Out-Null; return $true } catch { return $false }
}

function Assert-GitClean([string]$root) {
  if ($AllowDirty) { Warn "AllowDirty set: skipping clean check."; return }
  if (-not (Git-Exists)) { Warn "git not found; skipping clean check."; return }
  Push-Location -LiteralPath $root
  try {
    $porc = git status --porcelain
    if ($porc -and $porc.Trim().Length -gt 0) {
      $porc | Out-Host
      Fail "Working tree not clean. Commit/stash first (or re-run with -AllowDirty)."
    }
  } finally { Pop-Location }
}

function Find-AppRoot([string]$root) {
  $a = Join-Path $root "src\app"
  if (Test-Path -LiteralPath $a) { return $a }
  $b = Join-Path $root "app"
  if (Test-Path -LiteralPath $b) { return $b }
  Ensure-Dir $a
  return $a
}

# ------------------ Preflight ------------------
if (-not (Test-Path -LiteralPath $RepoRoot)) { Fail "RepoRoot not found: $RepoRoot" }
$RepoRoot = (Resolve-Path -LiteralPath $RepoRoot).Path
Set-Location -LiteralPath $RepoRoot

if (-not (Test-Path -LiteralPath (Join-Path $RepoRoot "package.json"))) { Fail "package.json missing in: $RepoRoot" }

Assert-GitClean $RepoRoot
Ok "LOCKED PWD: $(Get-Location)"

$appRoot = Find-AppRoot $RepoRoot
Info "App router root: $appRoot"

$stamp = "D8_COM_COCKPIT_AUTOREPAIR_002_" + (Get-Date -Format "yyyyMMdd_HHmmss")

# ------------------ Paths (namespaced to avoid collisions) ------------------
$pathApiHealth = Join-Path $appRoot "api\d8\health\route.ts"
$pathApiRepair = Join-Path $appRoot "api\d8\repair\route.ts"
$pathOpsPage   = Join-Path $appRoot "admin\ops\page.tsx"
$pathOpsLayout = Join-Path $appRoot "admin\ops\layout.tsx"

$toolsDir      = Join-Path $RepoRoot "tools"
$pathDoctorLoop = Join-Path $toolsDir "D8_COM_DOCTOR_LOOP_001.ps1"

# ------------------ API: /api/d8/health ------------------
# (single-quoted here-string; we inject stamp using placeholder replacement)
$apiHealthTemplate = @'
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function nowIso() {
  try { return new Date().toISOString(); } catch { return "unknown"; }
}

export async function GET() {
  const adminKeyPresent = !!process.env.D8_ADMIN_KEY && process.env.D8_ADMIN_KEY.length >= 12;
  const deployHookPresent = !!process.env.D8_VERCEL_DEPLOY_HOOK_URL && process.env.D8_VERCEL_DEPLOY_HOOK_URL.startsWith("https://");

  const body = {
    ok: true,
    service: "dominat8.com",
    stamp: "__STAMP__",
    time: nowIso(),
    checks: {
      D8_ADMIN_KEY_present: adminKeyPresent,
      D8_VERCEL_DEPLOY_HOOK_URL_present: deployHookPresent
    },
    meta: {
      node_env: process.env.NODE_ENV ?? null,
      vercel: {
        VERCEL: process.env.VERCEL ?? null,
        VERCEL_ENV: process.env.VERCEL_ENV ?? null,
        VERCEL_URL: process.env.VERCEL_URL ?? null,
        VERCEL_REGION: process.env.VERCEL_REGION ?? null,
        VERCEL_GIT_COMMIT_SHA: process.env.VERCEL_GIT_COMMIT_SHA ?? null
      }
    }
  };

  return NextResponse.json(body, { status: 200 });
}
'@
$apiHealth = $apiHealthTemplate.Replace("__STAMP__", $stamp)

# ------------------ API: /api/d8/repair ------------------
$apiRepairTemplate = @'
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

function unauthorized(msg: string) {
  return NextResponse.json({ ok: false, error: "unauthorized", message: msg }, { status: 401 });
}
function badRequest(msg: string) {
  return NextResponse.json({ ok: false, error: "bad_request", message: msg }, { status: 400 });
}
function nowIso() {
  try { return new Date().toISOString(); } catch { return "unknown"; }
}

async function readJson(req: Request): Promise<any> {
  try { return await req.json(); } catch { return null; }
}

function requireAdmin(req: Request) {
  const expected = process.env.D8_ADMIN_KEY || "";
  if (!expected || expected.length < 12) return { ok: false, reason: "D8_ADMIN_KEY not configured" };

  const got = req.headers.get("x-admin-key") || "";
  if (!got) return { ok: false, reason: "Missing X-Admin-Key header" };
  if (got !== expected) return { ok: false, reason: "Invalid admin key" };

  return { ok: true };
}

async function triggerRedeploy() {
  const hook = process.env.D8_VERCEL_DEPLOY_HOOK_URL || "";
  if (!hook || !hook.startsWith("https://")) {
    return { ok: false, message: "D8_VERCEL_DEPLOY_HOOK_URL not set" };
  }
  const res = await fetch(hook, { method: "POST" });
  const text = await res.text().catch(() => "");
  return { ok: res.ok, status: res.status, statusText: res.statusText, responseText: (text || "").slice(0, 4000) };
}

export async function POST(req: Request) {
  const gate = requireAdmin(req);
  if (!gate.ok) return unauthorized(gate.reason);

  const payload = await readJson(req);
  if (!payload) return badRequest("Expected JSON body");

  const action = (payload.action || "").toString().toLowerCase().trim();
  if (!action) return badRequest("Missing 'action'");

  const out: any = {
    ok: true,
    stamp: "__STAMP__",
    time: nowIso(),
    action,
    notes: [],
    result: null
  };

  if (action === "redeploy") {
    out.notes.push("Redeploy hook invoked (if configured).");
    out.result = await triggerRedeploy();
    out.ok = !!out.result?.ok;
    return NextResponse.json(out, { status: out.ok ? 200 : 502 });
  }

  if (action === "revalidate") {
    const path = (payload.path || "/").toString();
    out.notes.push("Revalidating path.");
    out.result = { path };
    try {
      revalidatePath(path);
      out.ok = true;
      return NextResponse.json(out, { status: 200 });
    } catch (e: any) {
      out.ok = false;
      out.result = { path, error: e?.message || "revalidate failed" };
      return NextResponse.json(out, { status: 500 });
    }
  }

  return badRequest("Unknown action. Supported: redeploy, revalidate");
}
'@
$apiRepair = $apiRepairTemplate.Replace("__STAMP__", $stamp)

# ------------------ /admin/ops (safe UI; actions require key) ------------------
$opsLayout = @'
export const metadata = {
  title: "Dominat8.com Ops",
  robots: { index: false, follow: false },
};

export default function OpsLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial" }}>
        {children}
      </body>
    </html>
  );
}
'@

$opsPage = @'
"use client";

import React from "react";

type Health = any;

function now() {
  try { return new Date().toLocaleString(); } catch { return "now"; }
}

export default function OpsPage() {
  const [adminKey, setAdminKey] = React.useState<string>("");
  const [health, setHealth] = React.useState<Health>(null);
  const [log, setLog] = React.useState<string[]>([]);
  const [busy, setBusy] = React.useState<boolean>(false);

  function pushLog(m: string) {
    setLog((x) => [`[${now()}] ${m}`, ...x].slice(0, 200));
  }

  async function fetchHealth() {
    setBusy(true);
    try {
      pushLog("Fetching /api/d8/health ...");
      const res = await fetch("/api/d8/health", { cache: "no-store" });
      const json = await res.json();
      setHealth(json);
      pushLog(`Health ok=${json?.ok} stamp=${json?.stamp || "n/a"}`);
    } catch (e: any) {
      pushLog(`Health fetch failed: ${e?.message || e}`);
    } finally {
      setBusy(false);
    }
  }

  async function repair(action: "redeploy" | "revalidate", path?: string) {
    if (!adminKey || adminKey.length < 12) {
      pushLog("Admin key missing/too short (set it in the box).");
      return;
    }
    setBusy(true);
    try {
      pushLog(`Calling /api/d8/repair action=${action} ...`);
      const res = await fetch("/api/d8/repair", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-admin-key": adminKey
        },
        body: JSON.stringify({ action, path })
      });
      const json = await res.json();
      pushLog(`Repair response status=${res.status} ok=${json?.ok}`);
      pushLog(JSON.stringify(json).slice(0, 4000));
    } catch (e: any) {
      pushLog(`Repair failed: ${e?.message || e}`);
    } finally {
      setBusy(false);
    }
  }

  React.useEffect(() => { fetchHealth(); }, []);

  return (
    <div style={{ padding: 16, maxWidth: 980, margin: "0 auto" }}>
      <h1 style={{ margin: "8px 0 4px 0" }}>Dominat8.com Ops</h1>
      <div style={{ color: "#555", marginBottom: 12 }}>
        Ops-only page. Public UI untouched. Actions require X-Admin-Key (D8_ADMIN_KEY).
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr",
        gap: 12,
        border: "1px solid #eee",
        borderRadius: 12,
        padding: 12
      }}>
        <div>
          <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>Admin Key (D8_ADMIN_KEY)</label>
          <input
            value={adminKey}
            onChange={(e) => setAdminKey(e.target.value)}
            placeholder="paste D8_ADMIN_KEY here"
            style={{ width: "100%", padding: 10, borderRadius: 10, border: "1px solid #ddd" }}
          />
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button disabled={busy} onClick={fetchHealth} style={btn()}>
            Refresh Health
          </button>
          <button disabled={busy} onClick={() => repair("revalidate", "/")} style={btn()}>
            Revalidate /
          </button>
          <button disabled={busy} onClick={() => repair("redeploy")} style={btnDanger()}>
            Redeploy (Deploy Hook)
          </button>
        </div>

        <div style={{ borderTop: "1px solid #eee", paddingTop: 12 }}>
          <div style={{ fontWeight: 700, marginBottom: 6 }}>Health Snapshot</div>
          <pre style={pre()}>{health ? JSON.stringify(health, null, 2) : "Loading..."}</pre>
        </div>

        <div style={{ borderTop: "1px solid #eee", paddingTop: 12 }}>
          <div style={{ fontWeight: 700, marginBottom: 6 }}>Event Log</div>
          <pre style={pre()}>{log.length ? log.join("\n") : "No events yet."}</pre>
        </div>
      </div>
    </div>
  );
}

function btn(): React.CSSProperties {
  return {
    padding: "10px 14px",
    borderRadius: 10,
    border: "1px solid #ddd",
    background: "white",
    cursor: "pointer",
    fontWeight: 600
  };
}
function btnDanger(): React.CSSProperties {
  return {
    padding: "10px 14px",
    borderRadius: 10,
    border: "1px solid #f1c0c0",
    background: "#fff5f5",
    cursor: "pointer",
    fontWeight: 700
  };
}
function pre(): React.CSSProperties {
  return {
    margin: 0,
    padding: 12,
    background: "#0b0f19",
    color: "white",
    borderRadius: 12,
    overflowX: "auto",
    fontSize: 12,
    lineHeight: 1.35
  };
}
'@

# ------------------ Local Doctor Loop script content (NO expansion) ------------------
$doctorLoop = @'
# D8_COM_DOCTOR_LOOP_001.ps1
[CmdletBinding()]
param(
  [Parameter(Mandatory=$true)]
  [string]$BaseUrl,

  [Parameter(Mandatory=$false)]
  [string]$AdminKey = "",

  [int]$LoopSeconds = 30,

  [int]$TimeoutSeconds = 20
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Ok([string]$m){ Write-Host "OK   $m" -ForegroundColor Green }
function Info([string]$m){ Write-Host "INFO $m" -ForegroundColor Gray }
function Warn([string]$m){ Write-Host "WARN $m" -ForegroundColor Yellow }
function Fail([string]$m){ Write-Host "FAIL $m" -ForegroundColor Red }

function Get-Json([string]$url) {
  $res = Invoke-WebRequest -UseBasicParsing -Uri $url -Method GET -TimeoutSec $TimeoutSeconds
  return ($res.Content | ConvertFrom-Json)
}

function Post-Json([string]$url, [hashtable]$body, [hashtable]$headers) {
  $json = ($body | ConvertTo-Json -Depth 20)
  $res = Invoke-WebRequest -UseBasicParsing -Uri $url -Method POST -TimeoutSec $TimeoutSeconds -Headers $headers -ContentType "application/json" -Body $json
  return ($res.Content | ConvertFrom-Json)
}

$BaseUrl = $BaseUrl.TrimEnd("/")
$healthUrl = "$BaseUrl/api/d8/health"
$repairUrl = "$BaseUrl/api/d8/repair"

Info "Target: $BaseUrl"
Info "Health:  $healthUrl"
Info "Repair:  $repairUrl"
Info "LoopSeconds=$LoopSeconds TimeoutSeconds=$TimeoutSeconds"
if ($AdminKey) { Info "AdminKey: (set)" } else { Warn "AdminKey not provided; repair actions disabled." }

while ($true) {
  try {
    $ts = [int](Get-Date -UFormat %s)
    $u = "$healthUrl?ts=$ts"
    $h = Get-Json $u

    if ($h.ok -ne $true) { Fail "Health ok != true"; throw "health_not_ok" }

    $k1 = $h.checks.D8_ADMIN_KEY_present
    $k2 = $h.checks.D8_VERCEL_DEPLOY_HOOK_URL_present
    Ok ("Health ok stamp={0} adminKeyPresent={1} deployHookPresent={2}" -f ($h.stamp), $k1, $k2)
  }
  catch {
    Fail "Health check failed: $($_.Exception.Message)"
    if ($AdminKey -and $AdminKey.Length -ge 12) {
      try {
        Warn "Attempting repair: redeploy"
        $headers = @{ "X-Admin-Key" = $AdminKey }
        $r = Post-Json $repairUrl @{ action="redeploy" } $headers
        if ($r.ok -eq $true) { Ok "Repair redeploy triggered." }
        else { Fail ("Repair redeploy failed: {0}" -f ($r | ConvertTo-Json -Depth 10)) }
      } catch {
        Fail "Repair call failed: $($_.Exception.Message)"
      }
    }
  }
  Start-Sleep -Seconds $LoopSeconds
}
'@

# ------------------ Apply writes (with backups) ------------------
$writes = @(
  @{ Path = $pathApiHealth; Content = $apiHealth },
  @{ Path = $pathApiRepair; Content = $apiRepair },
  @{ Path = $pathOpsLayout; Content = $opsLayout },
  @{ Path = $pathOpsPage;   Content = $opsPage },
  @{ Path = $pathDoctorLoop; Content = $doctorLoop }
)

Write-Host ""
Info "=== WRITING FILES (with backups) ==="
foreach ($w in $writes) {
  Backup-File $w.Path
  Write-Utf8NoBom $w.Path $w.Content
  Ok "Wrote: $($w.Path)"
}

Write-Host ""
Ok "DONE: /api/d8/health + /api/d8/repair + /admin/ops + tools doctor loop installed."

Write-Host ""
Write-Host "NEXT ACTIONS (PROD):" -ForegroundColor Yellow
Write-Host "1) In Vercel env for Dominat8.com set:" -ForegroundColor Yellow
Write-Host "   - D8_ADMIN_KEY = (long random string, >= 12 chars)" -ForegroundColor Yellow
Write-Host "   - (optional) D8_VERCEL_DEPLOY_HOOK_URL = Vercel Deploy Hook URL" -ForegroundColor Yellow
Write-Host "2) Deploy." -ForegroundColor Yellow
Write-Host "3) Test:" -ForegroundColor Yellow
Write-Host "   curl.exe -s https://www.dominat8.com/api/d8/health | more" -ForegroundColor Yellow
Write-Host "4) Ops UI:" -ForegroundColor Yellow
Write-Host "   https://www.dominat8.com/admin/ops" -ForegroundColor Yellow
Write-Host ""
Write-Host "LOCAL LOOP:" -ForegroundColor Yellow
Write-Host "  powershell.exe -NoProfile -ExecutionPolicy Bypass -File `"$pathDoctorLoop`" -BaseUrl `"https://www.dominat8.com`" -AdminKey `"<D8_ADMIN_KEY>`" -LoopSeconds 30" -ForegroundColor Yellow
Write-Host ""
