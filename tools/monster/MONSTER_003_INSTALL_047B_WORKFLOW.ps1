param(
  [Parameter(Mandatory=$false)][string]$Repo = "ccantynz-alt/Dominat8.io"
)
Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"
function Ok($m){ Write-Host ("OK   " + $m) -ForegroundColor Green }
function Fail($m){ Write-Host ("FATAL " + $m) -ForegroundColor Red; throw $m }

$gh = Get-Command gh -ErrorAction SilentlyContinue
if (-not $gh) { Fail "gh not found in PATH" }

Ok "Workflows:"
gh workflow list -R $Repo | Out-Host

Ok "Kick: 047B Self-Heal PR Loop"
gh workflow run -R $Repo "047B Self-Heal PR Loop" | Out-Host

Ok "Recent runs:"
gh run list -R $Repo --limit 10 | Out-Host