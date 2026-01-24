# ================================
# tools\deploy.ps1
# ================================
# One-command deploy trigger + deploy proof verification.
#
# Usage:
#   powershell -ExecutionPolicy Bypass -File ".\tools\deploy.ps1"
#   powershell -ExecutionPolicy Bypass -File ".\tools\deploy.ps1" -SkipDeploy
#   powershell -ExecutionPolicy Bypass -File ".\tools\deploy.ps1" -BaseUrl "https://www.dominat8.com"
#
# Default behavior:
# - runs: vercel --prod --force
# - then calls: <BASE>/api/__deploy_proof__?ts=<unix>

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

param(
  [string]$BaseUrl = "https://www.dominat8.com",
  [switch]$SkipDeploy
)

function Fail($msg) { throw "DEPLOY FAILED: $msg" }

Write-Host "== Dominat8 Deploy =="
Write-Host "BaseUrl: $BaseUrl"

if (-not $SkipDeploy) {
  Write-Host "Running: vercel --prod --force"
  & vercel --prod --force
  if ($LASTEXITCODE -ne 0) {
    Fail "vercel deploy failed (exit $LASTEXITCODE)."
  }
} else {
  Write-Host "SkipDeploy enabled (not running vercel)."
}

$ts = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()
$proofUrl = "$BaseUrl/api/__deploy_proof__?ts=$ts"

Write-Host "Checking deploy proof: $proofUrl"
try {
  $proof = Invoke-RestMethod -Method GET -Uri $proofUrl
} catch {
  Fail "Deploy proof endpoint failed: $($_.Exception.Message)"
}

# Print a compact proof payload
$proof | ConvertTo-Json -Depth 8

if ($null -eq $proof.ok -or $proof.ok -ne $true) {
  Fail "Deploy proof returned ok != true."
}

Write-Host "OK: deploy proof ok=true"