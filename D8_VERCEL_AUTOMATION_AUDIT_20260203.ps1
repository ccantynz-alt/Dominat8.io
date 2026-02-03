Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

# ============================================================
# D8_VERCEL_AUTOMATION_AUDIT_20260203.ps1
# Read-only Vercel automation audit
# ============================================================

$ProjectName = "dominat8-io"   # change ONLY if project slug differs

$RequiredVars = @(
  "VERCEL_WEBHOOK_SECRET",
  "GITHUB_REPO_DISPATCH_TOKEN",
  "GITHUB_OWNER",
  "GITHUB_REPO",
  "NEXT_PUBLIC_D8_TV"
)

function Section($t) { Write-Host "`n=== $t ===" -ForegroundColor Cyan }

if (-not (Get-Command vercel -ErrorAction SilentlyContinue)) {
  throw "Vercel CLI not found. Install from https://vercel.com/cli"
}

Section "1) Vercel whoami"
vercel whoami

Section "2) Project list (confirm slug)"
vercel project ls

Section "3) Pull env vars (all environments)"
$envJson = vercel env ls $ProjectName --json | ConvertFrom-Json

if (-not $envJson) {
  throw "No env vars returned — check project name or permissions."
}

Section "4) Environment variable matrix"
$envJson |
  Select-Object key, target |
  Sort-Object key |
  Format-Table -AutoSize

Section "5) Required automation vars — presence check"
foreach ($v in $RequiredVars) {
  $hits = $envJson | Where-Object { $_.key -eq $v }
  if ($hits) {
    $targets = ($hits.target | Sort-Object -Unique) -join ", "
    Write-Host "✓ $v present in: $targets" -ForegroundColor Green
  } else {
    Write-Host "✗ $v MISSING" -ForegroundColor Red
  }
}

Section "DONE"
Write-Host "NOTE: NEXT_PUBLIC_* vars require a REDEPLOY to take effect." -ForegroundColor Yellow
