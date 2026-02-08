[CmdletBinding()]
param(
  [Parameter(Mandatory=$true)][string] $RepoRoot,
  [string] $BaseUrl = "https://dominat8.io",
  [string] $RenderHealthUrl = "",
  [int] $LoopIterations = 5,
  [int] $LoopSleepSeconds = 5
)
Set-StrictMode -Version Latest
$ErrorActionPreference="Stop"

function Ok([string]$m){Write-Host ("OK   " + $m) -ForegroundColor Green}
function Info([string]$m){Write-Host ("INFO " + $m) -ForegroundColor Gray}
function Warn([string]$m){Write-Host ("WARN " + $m) -ForegroundColor Yellow}
function Fail([string]$m){Write-Host ("FATAL " + $m) -ForegroundColor Red; throw $m}

function Ensure-Dir([string]$p){ if(-not (Test-Path -LiteralPath $p)){ New-Item -ItemType Directory -Path $p | Out-Null } }
function NowStamp(){ (Get-Date).ToString("yyyyMMdd_HHmmss") }

$RepoRoot = (Resolve-Path -LiteralPath $RepoRoot).Path
$monsterDir = Join-Path $RepoRoot "D8_MONSTERS"
$evidenceRoot = Join-Path $RepoRoot "D8_EVIDENCE"
Ensure-Dir $evidenceRoot

$stamp = "RUN_021_025_" + (NowStamp)
$evidenceDir = Join-Path $evidenceRoot $stamp
Ensure-Dir $evidenceDir

Ok "RepoRoot: $RepoRoot"
Ok "EvidenceDir: $evidenceDir"
Ok "BaseUrl: $BaseUrl"
if([string]::IsNullOrWhiteSpace($RenderHealthUrl)){ Warn "RenderHealthUrl: (blank)" } else { Ok "RenderHealthUrl: $RenderHealthUrl" }

$M021 = Join-Path $monsterDir "MONSTER_021_HEALTH_PROBE.ps1"
$M022 = Join-Path $monsterDir "MONSTER_022_GH_TRIGGER_AND_LIST.ps1"
$M023 = Join-Path $monsterDir "MONSTER_023_VERCEL_INSPECT.ps1"
$M024 = Join-Path $monsterDir "MONSTER_024_BOUNDED_PROBE_LOOP.ps1"
$M025 = Join-Path $monsterDir "MONSTER_025_EVIDENCE_ZIP.ps1"

foreach($p in @($M021,$M022,$M023,$M024,$M025)){
  if(-not (Test-Path -LiteralPath $p)){ Fail "Missing monster script: $p" }
}

# 021: probes
powershell.exe -NoProfile -ExecutionPolicy Bypass -File $M021 -RepoRoot $RepoRoot -EvidenceDir $evidenceDir -BaseUrl $BaseUrl -RenderHealthUrl $RenderHealthUrl

# 022: trigger/list GH (quality gates default file name)
powershell.exe -NoProfile -ExecutionPolicy Bypass -File $M022 -RepoRoot $RepoRoot -EvidenceDir $evidenceDir -QualityGatesWorkflow "d8-quality-gates.yml"

# 023: vercel evidence
powershell.exe -NoProfile -ExecutionPolicy Bypass -File $M023 -RepoRoot $RepoRoot -EvidenceDir $evidenceDir -DomainToInspect "dominat8.io"

# 024: bounded probe loop
powershell.exe -NoProfile -ExecutionPolicy Bypass -File $M024 -RepoRoot $RepoRoot -EvidenceDir $evidenceDir -BaseUrl $BaseUrl -RenderHealthUrl $RenderHealthUrl -Iterations $LoopIterations -SleepSeconds $LoopSleepSeconds

# 025: zip it
powershell.exe -NoProfile -ExecutionPolicy Bypass -File $M025 -RepoRoot $RepoRoot -EvidenceDir $evidenceDir

Ok "RUN_MONSTER_PACK_021_025 done"