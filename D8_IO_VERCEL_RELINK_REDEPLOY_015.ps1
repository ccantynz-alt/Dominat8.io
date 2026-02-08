Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Ok($m){ Write-Host ("OK   " + $m) -ForegroundColor Green }
function Info($m){ Write-Host ("INFO " + $m) -ForegroundColor Gray }
function Warn($m){ Write-Host ("WARN " + $m) -ForegroundColor Yellow }
function Fail($m){ Write-Host ("FATAL " + $m) -ForegroundColor Red; throw $m }

$RepoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location -LiteralPath $RepoRoot
Info ("Locked PWD: " + (Get-Location))

try { $null = git rev-parse --is-inside-work-tree 2>$null } catch { Fail "Not a git repo." }
try { $null = Get-Command vercel -ErrorAction Stop } catch { Fail "vercel CLI not found in PATH." }

git checkout main | Out-Null
git pull origin main | Out-Null

# --- must-exist API files in ACTIVE tree ---
$mustExist = @(
  ".\src\app\api\io\health\route.ts",
  ".\src\app\api\io\ping\route.ts",
  ".\src\app\api\io\state\route.ts"
)

$missing = @()
foreach ($p in $mustExist) { if (-not (Test-Path -LiteralPath $p)) { $missing += $p } }
if ($missing.Count -gt 0) {
  $missing | ForEach-Object { Write-Host ("MISSING: " + $_) -ForegroundColor Red }
  Fail "Repo missing required API route files. (They must exist before deploy.)"
}
Ok "Repo has src/app/api/io/* routes."

# --- show current .vercel link (if any) ---
$vercelProj = Join-Path $RepoRoot ".vercel\project.json"
if (Test-Path -LiteralPath $vercelProj) {
  Info "Existing .vercel\project.json:"
  Get-Content -LiteralPath $vercelProj | ForEach-Object { "  " + $_ } | Out-Host
} else {
  Warn "No .vercel/project.json found yet (not linked in this folder)."
}

Write-Host ""
Info "Vercel whoami:"
vercel whoami

Write-Host ""
Info "Projects list (so we can confirm 'dominat8io' exists):"
try { vercel projects ls | Out-Host } catch { Warn "Could not list projects (auth/scope). Continuing." }

# --- force link to the correct project name ---
# IMPORTANT: your domain inspect shows the project name is 'dominat8io'
Write-Host ""
Info "Force-linking this folder to Vercel project: dominat8io"
try {
  vercel link --yes --project dominat8io | Out-Host
  Ok "vercel link completed (project dominat8io)."
} catch {
  Warn "vercel link (non-interactive) failed. Run interactive link NOW:"
  Write-Host "  vercel link" -ForegroundColor Yellow
  Write-Host "Then pick Team: craig-cantys-projects  Project: dominat8io" -ForegroundColor Yellow
  Fail "Link required."
}

# --- deploy production from THIS linked project ---
Write-Host ""
Info "Deploying production (linked project should now be dominat8io):"
vercel deploy --prod --yes | Out-Host
Ok "Prod deploy issued."

# --- proof (headers) ---
Write-Host ""
$ts = [int](Get-Date -UFormat %s)

Ok "PROOF: /api/io/health headers (first 50 lines)"
curl.exe -s -D - -H "Cache-Control: no-cache" -H "Pragma: no-cache" ("https://dominat8.io/api/io/health?ts=" + $ts) | Select-Object -First 50

Write-Host ""
Ok "PROOF: /api/io/ping (first 5 lines)"
curl.exe -s -H "Cache-Control: no-cache" -H "Pragma: no-cache" ("https://dominat8.io/api/io/ping?ts=" + $ts) | Select-Object -First 5

Write-Host ""
Ok "If /api/io/health is HTTP 200, start loop:"
Write-Host "  powershell -NoProfile -ExecutionPolicy Bypass -File .\D8_IO_AUTO_LOOP_DOCTOR_011.ps1" -ForegroundColor Yellow