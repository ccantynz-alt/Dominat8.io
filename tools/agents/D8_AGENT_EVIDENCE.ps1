[CmdletBinding()]
param(
  [Parameter(Mandatory=$true)][string] $RepoRoot
)
Set-StrictMode -Version Latest
$ErrorActionPreference="Stop"

function NowStamp(){ (Get-Date).ToString("yyyyMMdd_HHmmss") }
function Ok($m){Write-Host "OK   $m" -ForegroundColor Green}
function Ensure-Dir([string]$p){ if(-not (Test-Path -LiteralPath $p)){ New-Item -ItemType Directory -Force -Path $p | Out-Null } }

$RepoRoot = (Resolve-Path -LiteralPath $RepoRoot).Path
$evRoot = Join-Path $RepoRoot "D8_EVIDENCE"
Ensure-Dir $evRoot
$evDir = Join-Path $evRoot ("LOCAL_EVIDENCE_" + (NowStamp))
Ensure-Dir $evDir

Set-Location -LiteralPath $RepoRoot
git status --porcelain | Out-File -LiteralPath (Join-Path $evDir "git_status.txt") -Encoding UTF8
git rev-parse HEAD      | Out-File -LiteralPath (Join-Path $evDir "git_head.txt") -Encoding UTF8
gh workflow list        | Out-File -LiteralPath (Join-Path $evDir "gh_workflows.txt") -Encoding UTF8
gh run list --limit 25  | Out-File -LiteralPath (Join-Path $evDir "gh_runs.txt") -Encoding UTF8

$zip = "$evDir.zip"
if(Test-Path -LiteralPath $zip){ Remove-Item -LiteralPath $zip -Force }
Compress-Archive -LiteralPath (Join-Path $evDir "*") -DestinationPath $zip -Force
Ok "Evidence: $zip"