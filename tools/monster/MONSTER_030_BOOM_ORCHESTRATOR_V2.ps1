Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Ok($m){ Write-Host ("OK   {0}" -f $m) -ForegroundColor Green }
function Warn($m){ Write-Host ("WARN {0}" -f $m) -ForegroundColor Yellow }
function Fail($m){ Write-Host ("FATAL {0}" -f $m) -ForegroundColor Red; throw $m }

function Ensure-Dir([string]$p){ if (-not (Test-Path -LiteralPath $p)) { New-Item -ItemType Directory -Path $p | Out-Null } }
function Write-Text([string]$Path,[string]$Text){
  $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
  [System.IO.File]::WriteAllText($Path, $Text, $utf8NoBom)
}
function Read-Text([string]$Path){ return [System.IO.File]::ReadAllText($Path) }

function Get-ArgValue([string]$Name,[string]$Default){
  for ($i=0; $i -lt $args.Count; $i++) {
    $a = $args[$i]
    if ($a -is [string] -and $a.Trim().ToLowerInvariant() -eq ("-" + $Name.ToLowerInvariant())) {
      if (($i + 1) -lt $args.Count) { return [string]$args[$i+1] }
      return $Default
    }
  }
  return $Default
}
function Has-Switch([string]$Name){
  for ($i=0; $i -lt $args.Count; $i++) {
    $a = $args[$i]
    if ($a -is [string] -and $a.Trim().ToLowerInvariant() -eq ("-" + $Name.ToLowerInvariant())) { return $true }
  }
  return $false
}

function NowUnix { return [int][double]::Parse((Get-Date -UFormat %s)) }
$RepoRoot = Get-ArgValue "RepoRoot" (Get-Location).Path
$Domain   = Get-ArgValue "Domain" "dominat8.io"
$Hint     = Get-ArgValue "ExpectedProjectHint" "dominat8io"
$OutDir   = Get-ArgValue "OutDir" "C:\Temp\D8_EVIDENCE"
$DoLock   = Has-Switch "LockMonsters"
$DoDeploy = Has-Switch "Deploy"
$MaxSec   = [int](Get-ArgValue "DeployMaxSeconds" "300")

$RepoRoot = (Resolve-Path -LiteralPath $RepoRoot).Path
Ensure-Dir $OutDir

$monsterDir = Join-Path $RepoRoot "tools\monster"
$m021 = Join-Path $monsterDir "MONSTER_021_DOMAIN_MOVE_CHECKLIST.ps1"
$m022 = Join-Path $monsterDir "MONSTER_022_PROJECT_DOMAIN_SNAPSHOT_PACK.ps1"
$m023 = Join-Path $monsterDir "MONSTER_023_DEPLOY_AND_TAIL_TIMEOUT.ps1"
$m024 = Join-Path $monsterDir "MONSTER_024_PROBE_MATRIX_PLUS_SUMMARY.ps1"
$m026 = Join-Path $monsterDir "MONSTER_026_MONSTER_FOLDER_HARDENER.ps1"
$m027 = Join-Path $monsterDir "MONSTER_027_MONSTER_INTEGRITY_SNAPSHOT_AND_DRIFT.ps1"
$m028 = Join-Path $monsterDir "MONSTER_028_ENV_SANITY_PACK.ps1"

Write-Host ""
Write-Host "=== BOOM ORCHESTRATOR V2 ===" -ForegroundColor Cyan
Write-Host ("RepoRoot: " + $RepoRoot)
Write-Host ("Domain:   " + $Domain)
Write-Host ("OutDir:   " + $OutDir)
Write-Host ("LockMonsters: " + $DoLock + "  Deploy: " + $DoDeploy)

if ($DoLock) {
  Write-Host ""
  Write-Host "0) Lock monsters" -ForegroundColor Cyan
  & powershell.exe -NoProfile -ExecutionPolicy Bypass -File $m026 -RepoRoot $RepoRoot -Mode "Lock" | Out-Host
}

Write-Host ""
Write-Host "1) Env sanity pack" -ForegroundColor Cyan
& powershell.exe -NoProfile -ExecutionPolicy Bypass -File $m028 -RepoRoot $RepoRoot -OutDir $OutDir | Out-Host

Write-Host ""
Write-Host "2) Integrity snapshot (one-shot)" -ForegroundColor Cyan
& powershell.exe -NoProfile -ExecutionPolicy Bypass -File $m027 -RepoRoot $RepoRoot -OutDir $OutDir -Seconds 0 | Out-Host

Write-Host ""
Write-Host "3) Domain checklist + inspect" -ForegroundColor Cyan
& powershell.exe -NoProfile -ExecutionPolicy Bypass -File $m021 -Domain $Domain -ExpectedProjectHint $Hint | Out-Host

Write-Host ""
Write-Host "4) Snapshot pack" -ForegroundColor Cyan
& powershell.exe -NoProfile -ExecutionPolicy Bypass -File $m022 -RepoRoot $RepoRoot -Domain $Domain -OutDir $OutDir | Out-Host

if ($DoDeploy) {
  Write-Host ""
  Write-Host "5) Deploy (timeout)" -ForegroundColor Cyan
  & powershell.exe -NoProfile -ExecutionPolicy Bypass -File $m023 -RepoRoot $RepoRoot -MaxSeconds $MaxSec | Out-Host
} else {
  Warn "Deploy skipped (add -Deploy to run deploy)."
}

Write-Host ""
Write-Host "6) Probe matrix" -ForegroundColor Cyan
& powershell.exe -NoProfile -ExecutionPolicy Bypass -File $m024 -Domain $Domain -OutDir $OutDir -TimeoutSeconds 25 | Out-Host

Ok "BOOM V2 done."
