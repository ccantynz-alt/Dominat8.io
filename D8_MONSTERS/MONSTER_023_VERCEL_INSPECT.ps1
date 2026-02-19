[CmdletBinding()]
param(
  [Parameter(Mandatory=$true)][string] $RepoRoot,
  [Parameter(Mandatory=$true)][string] $EvidenceDir,
  [string] $DomainToInspect = "dominat8.io"
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

Info "vercel --version"
$v1 = & vercel --version 2>&1
$p1 = Join-Path $EvidenceDir "vercel_version.txt"
$v1 | Out-File -LiteralPath $p1 -Encoding UTF8
Ok "Saved: $p1"

Info "vercel domains ls"
$dl = & vercel domains ls 2>&1
$p2 = Join-Path $EvidenceDir "vercel_domains_ls.txt"
$dl | Out-File -LiteralPath $p2 -Encoding UTF8
Ok "Saved: $p2"

if(-not [string]::IsNullOrWhiteSpace($DomainToInspect)){
  Info "vercel domains inspect $DomainToInspect"
  $di = & vercel domains inspect $DomainToInspect 2>&1
  $p3 = Join-Path $EvidenceDir "vercel_domains_inspect.txt"
  $di | Out-File -LiteralPath $p3 -Encoding UTF8
  Ok "Saved: $p3"
} else {
  Warn "DomainToInspect blank -> skipping inspect"
}

Ok "MONSTER_023 done"