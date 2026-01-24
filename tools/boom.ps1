# ================================
# tools\boom.ps1
# ================================
# THE FASTEST LOOP:
#   - Doctor (with build)
#   - Deploy (vercel --prod --force)
#   - Smoke tests
#
# Usage:
#   powershell -ExecutionPolicy Bypass -File ".\tools\boom.ps1"
#
# Optional:
#   powershell -ExecutionPolicy Bypass -File ".\tools\boom.ps1" -BaseUrl "https://www.dominat8.com"
#   powershell -ExecutionPolicy Bypass -File ".\tools\boom.ps1" -SkipDeploy
#   powershell -ExecutionPolicy Bypass -File ".\tools\boom.ps1" -BaseUrl "https://my-saas-app-5eyw.vercel.app" -HostHeader "www.dominat8.com"

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

param(
  [string]$BaseUrl = "https://www.dominat8.com",
  [string]$HostHeader = "",
  [switch]$SkipDeploy
)

function Fail($msg) { throw "BOOM FAILED: $msg" }

Write-Host ""
Write-Host "========================="
Write-Host " DOMINAT8 GIGANTIC BOOM"
Write-Host "========================="
Write-Host ""

# 1) Doctor (includes build)
if (Test-Path -LiteralPath ".\tools\doctor.ps1") {
  Write-Host "== 1/3 Doctor (with build) =="
  & powershell -ExecutionPolicy Bypass -File ".\tools\doctor.ps1" -RunBuild
  if ($LASTEXITCODE -ne 0) { Fail "Doctor failed." }
} else {
  Write-Host "WARN: .\tools\doctor.ps1 not found. Running minimal checks only."
}

# 2) Deploy (optional)
if (-not $SkipDeploy) {
  Write-Host ""
  Write-Host "== 2/3 Deploy (clean prod) =="
  & vercel --prod --force
  if ($LASTEXITCODE -ne 0) { Fail "Vercel deploy failed." }
} else {
  Write-Host ""
  Write-Host "== 2/3 Deploy skipped =="
}

# 3) Smoke
Write-Host ""
Write-Host "== 3/3 Smoke =="
if (-not (Test-Path -LiteralPath ".\tools\smoke.ps1")) { Fail "Missing .\tools\smoke.ps1" }

if ([string]::IsNullOrWhiteSpace($HostHeader)) {
  & powershell -ExecutionPolicy Bypass -File ".\tools\smoke.ps1" -BaseUrl $BaseUrl
} else {
  & powershell -ExecutionPolicy Bypass -File ".\tools\smoke.ps1" -BaseUrl $BaseUrl -HostHeader $HostHeader
}
if ($LASTEXITCODE -ne 0) { Fail "Smoke failed." }

Write-Host ""
Write-Host "🚀 BOOM COMPLETE: Doctor + Deploy + Smoke all green"