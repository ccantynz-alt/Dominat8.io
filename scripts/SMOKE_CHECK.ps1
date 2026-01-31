Set-StrictMode -Version Latest
$ErrorActionPreference="Stop"

param(
  [string]$Base = "http://localhost:3000"
)

$ts=[int](Get-Date -UFormat %s)

Write-Host "=== SMOKE CHECK: $Base ===" -ForegroundColor Cyan

$urls = @(
  "$Base/api/__health__?ts=$ts",
  "$Base/api/__build_stamp__?ts=$ts",
  "$Base/api/__env_presence__?ts=$ts"
)

foreach ($u in $urls) {
  Write-Host "`n--- $u ---" -ForegroundColor Yellow
  try {
    curl.exe -s -D - --max-time 15 $u | Select-Object -First 40
  } catch {
    Write-Host "FAILED: $($_.Exception.Message)" -ForegroundColor Red
  }
}