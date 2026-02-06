Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Ok($m){ Write-Host "OK   $m" -ForegroundColor Green }
function Info($m){ Write-Host "INFO $m" -ForegroundColor Gray }
function Warn($m){ Write-Host "WARN $m" -ForegroundColor Yellow }
function Fail($m){ Write-Host "FATAL $m" -ForegroundColor Red; throw $m }

# ---- repo root ----
$RepoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location -LiteralPath $RepoRoot
Info "Locked PWD: $(Get-Location)"

if (-not (Test-Path -LiteralPath ".\package.json")) { Fail "package.json missing. Wrong folder." }
try { $null = git rev-parse --is-inside-work-tree 2>$null } catch { Fail "Not a git repo." }
try { $null = Get-Command vercel -ErrorAction Stop } catch { Fail "vercel CLI not found in PATH. Install/restart terminal." }

# ---- ensure main + api files exist ----
git checkout main | Out-Null
git pull origin main | Out-Null

$mustExist = @(
  ".\src\app\api\io\health\route.ts",
  ".\src\app\api\io\ping\route.ts",
  ".\src\app\api\io\state\route.ts"
)

$missing = @()
foreach ($p in $mustExist) { if (-not (Test-Path -LiteralPath $p)) { $missing += $p } }
if ($missing.Count -gt 0) {
  Warn "Repo is missing required API files. Aborting deploy."
  $missing | ForEach-Object { Write-Host "MISSING: $_" -ForegroundColor Red }
  Fail "Create API route files first (src/app/api/io/*)."
}
Ok "Repo contains src/app/api/io/* routes."

Write-Host ""
Info "Vercel whoami:"
vercel whoami

Write-Host ""
Info "Attempt vercel link --yes (may no-op if already linked):"
try { vercel link --yes | Out-Host } catch { Warn "vercel link may require interactive auth/link. Continuing." }

Write-Host ""
Info "Forcing PRODUCTION deploy from current repo state (bypasses prod branch mismatch):"
vercel deploy --prod --yes | Out-Host

Write-Host ""
Ok "Now PROVE from public domain (no-cache):"
$ts=[int](Get-Date -UFormat %s)
curl.exe -s -D - -H "Cache-Control: no-cache" -H "Pragma: no-cache" "https://dominat8.io/api/io/health?ts=$ts" | Select-Object -First 30

Write-Host ""
Ok "If still 404, run domain inspect:"
Write-Host "  vercel domains inspect dominat8.io" -ForegroundColor Yellow
Write-Host "  vercel domains inspect www.dominat8.io" -ForegroundColor Yellow