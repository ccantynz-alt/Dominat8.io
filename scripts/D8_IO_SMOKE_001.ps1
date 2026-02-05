Set-StrictMode -Version Latest
$ErrorActionPreference="Stop"

function Head([string]$u){
  $ts=[int](Get-Date -UFormat %s)
  if($u -match "\?"){ $u="$u&ts=$ts" } else { $u="$u?ts=$ts" }
  Write-Host ""
  Write-Host "=== HEAD: $u ===" -ForegroundColor Cyan
  curl.exe -s -D - -o NUL "$u" | Select-Object -First 25
}

$Base = "https://www.dominat8.io"
Head "$Base/"
Head "$Base/healthz"
Head "$Base/stamp"
Head "$Base/api/__d8__/stamp"

Write-Host ""
Write-Host "Guardrail check (should be 401 unless you provide admin header):" -ForegroundColor Yellow
Head "$Base/api/engine/patch"
