Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

param(
  [Parameter(Mandatory=$false)][string]$Repo = "ccantynz-alt/Dominat8.io",
  [Parameter(Mandatory=$false)][int]$Limit = 20,
  [Parameter(Mandatory=$false)][switch]$RerunFailed,
  [Parameter(Mandatory=$false)][switch]$TriggerWorkflow,
  [Parameter(Mandatory=$false)][string]$WorkflowName = "047B Self-Heal PR Loop"
)

function Ok($m){ Write-Host ("OK   {0}" -f $m) -ForegroundColor Green }
function Warn($m){ Write-Host ("WARN {0}" -f $m) -ForegroundColor Yellow }
function Fail($m){ Write-Host ("FATAL {0}" -f $m) -ForegroundColor Red; throw $m }

Ok ("Repo: {0}" -f $Repo)

try {
  $runsJson = gh run list -R $Repo --limit $Limit --json databaseId,status,conclusion,name,workflowName,headBranch,event,updatedAt,url
} catch { Fail ("gh run list failed: " + $_.Exception.Message) }

$runs = $runsJson | ConvertFrom-Json
if (-not $runs) { Warn "No runs returned."; return }

Write-Host ""
Write-Host "Latest runs:" -ForegroundColor Cyan
$runs | Sort-Object updatedAt -Descending | ForEach-Object {
  $c = $_.conclusion
  if (-not $c) { $c = $_.status }
  Write-Host (" - {0} | {1} | {2} | {3}" -f $c, $_.workflowName, $_.headBranch, $_.url)
}

if ($RerunFailed) {
  $failed = $runs | Where-Object { $_.conclusion -eq "failure" -or $_.conclusion -eq "cancelled" } | Select-Object -First 5
  if (-not $failed) { Ok "No failed/cancelled runs found." }
  foreach ($r in $failed) {
    try {
      Ok ("Rerun: {0}" -f $r.url)
      gh run rerun $r.databaseId -R $Repo | Out-Host
    } catch { Warn ("Rerun failed: " + $_.Exception.Message) }
  }
}

if ($TriggerWorkflow) {
  try {
    $wfJson = gh workflow list -R $Repo --limit 200 --json name,id
    $wf = ($wfJson | ConvertFrom-Json) | Where-Object { $_.name -eq $WorkflowName } | Select-Object -First 1
    if (-not $wf) { Fail ("Workflow not found: {0}" -f $WorkflowName) }
    Ok ("Trigger workflow: {0} (id={1})" -f $wf.name, $wf.id)
    gh workflow run $wf.id -R $Repo | Out-Host
  } catch { Fail ("Trigger failed: " + $_.Exception.Message) }
}
