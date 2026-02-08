param(
  [Parameter(Mandatory=$false)][string]$RepoRoot = (Get-Location).Path,
  [Parameter(Mandatory=$false)][string]$Domain = "dominat8.io"
)
Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"
function Ok($m){ Write-Host ("OK   " + $m) -ForegroundColor Green }
function Warn($m){ Write-Host ("WARN " + $m) -ForegroundColor Yellow }
function Fail($m){ Write-Host ("FATAL " + $m) -ForegroundColor Red; throw $m }

if (-not (Test-Path -LiteralPath (Join-Path $RepoRoot ".git"))) { Fail "Not a repo: $RepoRoot" }
Push-Location -LiteralPath $RepoRoot
try {
  Ok "RepoRoot = $RepoRoot"
  Ok "Attempt: attach domain to current Vercel project (interactive steps may appear)"

  $vercel = Get-Command vercel -ErrorAction SilentlyContinue
  if (-not $vercel) { Fail "Vercel CLI not found in PATH" }

  # Ensure linked
  Ok "vercel link (may prompt once)"
  cmd /c "vercel link" | Out-Host

  Ok "vercel domains add $Domain (may prompt)"
  cmd /c ("vercel domains add " + $Domain) | Out-Host

  Ok "Deploy prod and look for Aliased: https://$Domain"
  cmd /c "vercel --prod --force" | Out-Host

  Ok "PROOF: curl https://$Domain/api/tv/status"
  $ts = [int][double]::Parse((Get-Date -UFormat %s))
  curl.exe -s -H "Cache-Control: no-cache" "https://$Domain/api/tv/status?ts=$ts" | Out-Host
}
finally { Pop-Location }