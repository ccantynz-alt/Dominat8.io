param(
  [Parameter(Mandatory=$true)]
  [string]$RepoRoot
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Stamp() { Get-Date -Format "yyyyMMdd_HHmmss" }
function Ok($m) { Write-Host "OK   $m" -ForegroundColor Green }
function Warn($m) { Write-Host "WARN $m" -ForegroundColor Yellow }
function Die($m) { Write-Host "FATAL: $m" -ForegroundColor Red; exit 1 }

if (-not (Test-Path -LiteralPath $RepoRoot)) { Die "RepoRoot not found: $RepoRoot" }
Set-Location -LiteralPath $RepoRoot

if (-not (Test-Path -LiteralPath ".\.git")) { Die "Not a git repo: $RepoRoot" }
if (-not (Test-Path -LiteralPath ".\package.json")) { Die "package.json missing in: $RepoRoot" }

$ts = Stamp

function Backup-IfExists([string]$p) {
  if (Test-Path -LiteralPath $p) {
    $bak = "$p.bak_$ts"
    Copy-Item -LiteralPath $p -Destination $bak -Force
    Ok "Backup: $bak"
  }
}

function Ensure-Dir([string]$dir) {
  if (-not (Test-Path -LiteralPath $dir)) {
    New-Item -ItemType Directory -Path $dir -Force | Out-Null
    Ok "Created dir: $dir"
  }
}

function Write-FileUtf8([string]$p, [string]$content) {
  $dir = Split-Path -Parent $p
  if ($dir) { Ensure-Dir $dir }
  $content | Set-Content -LiteralPath $p -Encoding UTF8
  Ok "Wrote: $p"
}

$branch = (git rev-parse --abbrev-ref HEAD).Trim()
$head = (git rev-parse HEAD).Trim()
Ok "Repo OK. Branch=$branch HEAD=$head"

# -----------------------------
# /api/debug/stamp
# -----------------------------
$stampRoutePath = Join-Path $RepoRoot "src\app\api\debug\stamp\route.ts"
Backup-IfExists $stampRoutePath

$stampRoute = @"
export const dynamic = "force-dynamic";

function pickCommit(): string {
  const v = process.env.VERCEL_GIT_COMMIT_SHA;
  const r = process.env.RENDER_GIT_COMMIT;
  const g = process.env.GITHUB_SHA;
  return (v || r || g || "UNKNOWN_COMMIT").slice(0, 40);
}

function pickEnv(): string {
  return (process.env.VERCEL_ENV || process.env.NODE_ENV || "unknown");
}

export async function GET() {
  const now = new Date().toISOString();
  const commit = pickCommit();
  const env = pickEnv();

  const payload = {
    ok: true,
    stamp: "D8_IO_STAMP_$ts",
    now,
    env,
    commit,
    render: {
      service_id: process.env.RENDER_SERVICE_ID || null,
      instance_id: process.env.RENDER_INSTANCE_ID || null,
      git_commit: process.env.RENDER_GIT_COMMIT || null
    },
    vercel: {
      env: process.env.VERCEL_ENV || null,
      git_commit: process.env.VERCEL_GIT_COMMIT_SHA || null,
      deployment_id: process.env.VERCEL_DEPLOYMENT_ID || null
    }
  };

  return new Response(JSON.stringify(payload, null, 2), {
    status: 200,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store, no-cache, must-revalidate, max-age=0",
      "pragma": "no-cache"
    }
  });
}
"@
Write-FileUtf8 $stampRoutePath $stampRoute

# -----------------------------
# /healthz
# -----------------------------
$healthzRoutePath = Join-Path $RepoRoot "src\app\healthz\route.ts"
Backup-IfExists $healthzRoutePath

$healthzRoute = @"
export const dynamic = "force-dynamic";

export async function GET() {
  const payload = {
    ok: true,
    service: "dominat8.io",
    now: new Date().toISOString(),
    stamp: "D8_IO_HEALTHZ_$ts"
  };

  return new Response(JSON.stringify(payload), {
    status: 200,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store, no-cache, must-revalidate, max-age=0",
      "pragma": "no-cache"
    }
  });
}
"@
Write-FileUtf8 $healthzRoutePath $healthzRoute

# -----------------------------
# staging branch
# -----------------------------
$hasStagingLocal = $false
$hasStagingRemote = $false
try { git show-ref --verify --quiet "refs/heads/staging"; $hasStagingLocal = $true } catch {}
try { git ls-remote --exit-code --heads origin staging | Out-Null; $hasStagingRemote = $true } catch {}

if (-not $hasStagingLocal) {
  Ok "Local staging branch not found. Creating staging from current HEAD..."
  git checkout -b staging | Out-Host
} else {
  Ok "Local staging branch exists. Checking out staging..."
  git checkout staging | Out-Host
}

Ok "On branch: $((git rev-parse --abbrev-ref HEAD).Trim())"

git add -A | Out-Host

$status = (git status --porcelain)
if (-not $status) {
  Warn "No changes to commit."
} else {
  $msg = "D8 IO: add /healthz + /api/debug/stamp ($ts)"
  git commit -m $msg | Out-Host
  Ok "Committed: $msg"
}

if ($hasStagingRemote) {
  Ok "Remote staging exists. Pushing..."
  git push origin staging | Out-Host
} else {
  Ok "Remote staging missing. Pushing with upstream..."
  git push -u origin staging | Out-Host
}

Ok "DONE."
Write-Host ""
Write-Host "VERIFY PROD:" -ForegroundColor Cyan
Write-Host "  `$t=[int](Get-Date -UFormat %s)" -ForegroundColor Cyan
Write-Host "  curl.exe -sS --max-time 20 ""https://dominat8.io/healthz?ts=`$t""" -ForegroundColor Cyan
Write-Host "  curl.exe -sS --max-time 20 ""https://dominat8.io/api/debug/stamp?ts=`$t""" -ForegroundColor Cyan
