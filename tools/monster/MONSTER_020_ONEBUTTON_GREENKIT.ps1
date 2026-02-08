Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

param(
  [Parameter(Mandatory=$false)][string]$RepoRoot,
  [Parameter(Mandatory=$false)][string]$Repo,
  [Parameter(Mandatory=$false)][string]$Domain,
  [Parameter(Mandatory=$false)][string]$ExpectedProjectHint,
  [Parameter(Mandatory=$false)][switch]$RunDeploy,
  [Parameter(Mandatory=$false)][int]$DeployMaxSeconds,
  [Parameter(Mandatory=$false)][switch]$RunDoctorLoop,
  [Parameter(Mandatory=$false)][int]$LoopSeconds
)

function Ok($m){ Write-Host ("OK   {0}" -f $m) -ForegroundColor Green }
function Warn($m){ Write-Host ("WARN {0}" -f $m) -ForegroundColor Yellow }
function Fail($m){ Write-Host ("FATAL {0}" -f $m) -ForegroundColor Red; throw $m }

# Defaults set in-body (avoids param default assignment parsing issues)
if ([string]::IsNullOrWhiteSpace($RepoRoot)) { $RepoRoot = (Get-Location).Path }
if ([string]::IsNullOrWhiteSpace($Repo)) { $Repo = "ccantynz-alt/Dominat8.io" }
if ([string]::IsNullOrWhiteSpace($Domain)) { $Domain = "dominat8.io" }
if ([string]::IsNullOrWhiteSpace($ExpectedProjectHint)) { $ExpectedProjectHint = "dominat8io" }
if (-not $DeployMaxSeconds) { $DeployMaxSeconds = 300 }
if (-not $LoopSeconds) { $LoopSeconds = 10 }

$RepoRoot = (Resolve-Path -LiteralPath $RepoRoot).Path
$monsterDir = Join-Path $RepoRoot "tools\monster"
$m017 = Join-Path $monsterDir "MONSTER_017_VERCEL_DOMAIN_TRIAGE_PACK.ps1"
$m013 = Join-Path $monsterDir "MONSTER_013_VERCEL_DEPLOY_STREAM_TIMEOUT.ps1"
$m018 = Join-Path $monsterDir "MONSTER_018_API_PROBE_MATRIX.ps1"
$m016 = Join-Path $monsterDir "MONSTER_016_DOCTOR_LOOP_SAFE.ps1"

Ok ("RepoRoot: {0}" -f $RepoRoot)
Ok ("Domain:  {0}" -f $Domain)

Write-Host ""
Write-Host "A) Domain triage (read-only)" -ForegroundColor Cyan
& powershell.exe -NoProfile -ExecutionPolicy Bypass -File $m017 -Domain $Domain -ExpectedProjectHint $ExpectedProjectHint | Out-Host

Write-Host ""
if ($RunDeploy) {
  Write-Host "B) Deploy" -ForegroundColor Cyan
  & powershell.exe -NoProfile -ExecutionPolicy Bypass -File $m013 -RepoRoot $RepoRoot -MaxSeconds $DeployMaxSeconds | Out-Host
} else {
  Warn "Deploy skipped (use -RunDeploy to deploy)."
}

Write-Host ""
Write-Host "C) Probe matrix" -ForegroundColor Cyan
& powershell.exe -NoProfile -ExecutionPolicy Bypass -File $m018 -Domain $Domain | Out-Host

Write-Host ""
if ($RunDoctorLoop) {
  Write-Host "D) Doctor loop" -ForegroundColor Cyan
  & powershell.exe -NoProfile -ExecutionPolicy Bypass -File $m016 -RepoRoot $RepoRoot -Repo $Repo -Domain $Domain -LoopSeconds $LoopSeconds | Out-Host
} else {
  Warn "Doctor loop skipped (use -RunDoctorLoop to start it)."
}

Ok "GreenKit complete."
