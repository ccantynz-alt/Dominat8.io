Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

param(
  [Parameter(Mandatory=$false)][string]$Repo = "ccantynz-alt/Dominat8.io",
  [Parameter(Mandatory=$false)][string]$WorkflowName = "047B Self-Heal PR Loop",
  [Parameter(Mandatory=$false)][int]$WaitSeconds = 10
)

function Ok($m){ Write-Host ("OK   {0}" -f $m) -ForegroundColor Green }
function Warn($m){ Write-Host ("WARN {0}" -f $m) -ForegroundColor Yellow }
function Fail($m){ Write-Host ("FATAL {0}" -f $m) -ForegroundColor Red; throw $m }

Ok ("Repo: {0}" -f $Repo)
Ok ("WorkflowName: {0}" -f $WorkflowName)

# Resolve workflow id by name (no jq)
$json = gh workflow list -R $Repo --limit 200 --json name,id 2>$null
if (-not $json) { Fail "gh workflow list returned nothing. Is gh authenticated?" }
$wf = ($json | ConvertFrom-Json) | Where-Object { $_.name -eq $WorkflowName } | Select-Object -First 1
if (-not $wf) {
  Warn "Exact match not found. Listing available workflow names:"
  (($json | ConvertFrom-Json) | Select-Object -ExpandProperty name) | ForEach-Object { Write-Host (" - " + $_) }
  Fail "Workflow not found by exact name."
}

Ok ("Workflow id: {0}" -f $wf.id)
gh workflow run $wf.id -R $Repo | Out-Host
Ok ("Triggered. Waiting {0}s then showing latest runs..." -f $WaitSeconds)
Start-Sleep -Seconds $WaitSeconds
gh run list -R $Repo --limit 10 | Out-Host
