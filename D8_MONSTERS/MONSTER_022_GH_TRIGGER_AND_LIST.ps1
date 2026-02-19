[CmdletBinding()]
param(
  [Parameter(Mandatory=$true)][string] $RepoRoot,
  [Parameter(Mandatory=$true)][string] $EvidenceDir,

  # Workflow file names (in .github/workflows)
  [string] $QualityGatesWorkflow = "d8-quality-gates.yml",
  [string] $CIWorkflow = ""
)
Set-StrictMode -Version Latest
$ErrorActionPreference="Stop"

function Ok([string]$m){Write-Host ("OK   " + $m) -ForegroundColor Green}
function Info([string]$m){Write-Host ("INFO " + $m) -ForegroundColor Gray}
function Warn([string]$m){Write-Host ("WARN " + $m) -ForegroundColor Yellow}
function Fail([string]$m){Write-Host ("FATAL " + $m) -ForegroundColor Red; throw $m}
function Ensure-Dir([string]$p){ if(-not (Test-Path -LiteralPath $p)){ New-Item -ItemType Directory -Path $p | Out-Null } }

Ensure-Dir $EvidenceDir
Set-Location -LiteralPath $RepoRoot

Info "gh workflow list"
$wf = & gh workflow list 2>&1
$wfPath = Join-Path $EvidenceDir "gh_workflow_list.txt"
$wf | Out-File -LiteralPath $wfPath -Encoding UTF8
Ok "Saved: $wfPath"

if(-not [string]::IsNullOrWhiteSpace($QualityGatesWorkflow)){
  Info "Running: gh workflow run $QualityGatesWorkflow"
  $r = & gh workflow run $QualityGatesWorkflow 2>&1
  $rp = Join-Path $EvidenceDir "gh_workflow_run_quality_gates.txt"
  $r | Out-File -LiteralPath $rp -Encoding UTF8
  Ok "Saved: $rp"
} else {
  Warn "QualityGatesWorkflow blank -> skipping trigger"
}

if(-not [string]::IsNullOrWhiteSpace($CIWorkflow)){
  Info "Running: gh workflow run $CIWorkflow"
  $r2 = & gh workflow run $CIWorkflow 2>&1
  $rp2 = Join-Path $EvidenceDir "gh_workflow_run_ci.txt"
  $r2 | Out-File -LiteralPath $rp2 -Encoding UTF8
  Ok "Saved: $rp2"
}

Info "gh run list (latest 20)"
$rl = & gh run list --limit 20 2>&1
$rlPath = Join-Path $EvidenceDir "gh_run_list.txt"
$rl | Out-File -LiteralPath $rlPath -Encoding UTF8
Ok "Saved: $rlPath"

Ok "MONSTER_022 done"