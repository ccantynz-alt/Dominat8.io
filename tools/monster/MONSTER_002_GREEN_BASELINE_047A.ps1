param(
  [Parameter(Mandatory=$false)][string]$RepoRoot = (Get-Location).Path
)
Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"
function Ok($m){ Write-Host ("OK   " + $m) -ForegroundColor Green }
function Fail($m){ Write-Host ("FATAL " + $m) -ForegroundColor Red; throw $m }
if (-not (Test-Path -LiteralPath (Join-Path $RepoRoot ".git"))) { Fail "Not a repo: $RepoRoot" }

Push-Location -LiteralPath $RepoRoot
try {
  Ok "npm ci && npm run build (local proof)"
  cmd /c "npm ci && npm run build" | Out-Host
  Ok "Local build proof complete."
}
finally { Pop-Location }