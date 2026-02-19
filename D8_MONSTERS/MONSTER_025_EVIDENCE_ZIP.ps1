[CmdletBinding()]
param(
  [Parameter(Mandatory=$true)][string] $RepoRoot,
  [Parameter(Mandatory=$true)][string] $EvidenceDir
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

Info "Collect git status"
$gs = & git status --porcelain 2>&1
$gsPath = Join-Path $EvidenceDir "git_status_porcelain.txt"
$gs | Out-File -LiteralPath $gsPath -Encoding UTF8
Ok "Saved: $gsPath"

Info "Collect git rev-parse"
$sha = & git rev-parse HEAD 2>&1
$shaPath = Join-Path $EvidenceDir "git_head_sha.txt"
$sha | Out-File -LiteralPath $shaPath -Encoding UTF8
Ok "Saved: $shaPath"

Info "Collect gh run list (latest 20)"
$rl = & gh run list --limit 20 2>&1
$rlPath = Join-Path $EvidenceDir "gh_run_list_final.txt"
$rl | Out-File -LiteralPath $rlPath -Encoding UTF8
Ok "Saved: $rlPath"

# ZIP evidence
$zipPath = Join-Path (Split-Path -Parent $EvidenceDir) ((Split-Path -Leaf $EvidenceDir) + ".zip")
if(Test-Path -LiteralPath $zipPath){ Remove-Item -LiteralPath $zipPath -Force }
Compress-Archive -LiteralPath (Join-Path $EvidenceDir "*") -DestinationPath $zipPath -Force
Ok "Evidence ZIP: $zipPath"

Ok "MONSTER_025 done"