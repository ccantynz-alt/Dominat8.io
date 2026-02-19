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

function Get-ArgValue([string]$Name,[string]$Default){
  # Accepts -Name Value pairs from $args (case-insensitive)
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

$Repo = Get-ArgValue "Repo" "ccantynz-alt/Dominat8.io"
$WorkflowName = Get-ArgValue "WorkflowName" "047B Self-Heal PR Loop"
$Limit = [int](Get-ArgValue "Limit" "15")
$DoKick = Has-Switch "Kick"

Ok ("Repo: {0}" -f $Repo)
Ok ("WorkflowName: {0}" -f $WorkflowName)

try {
  $runsJson = gh run list -R $Repo --limit $Limit --json databaseId,status,conclusion,workflowName,headBranch,updatedAt,url
  $runs = $runsJson | ConvertFrom-Json
  Write-Host ""
  Write-Host "Latest runs:" -ForegroundColor Cyan
  $runs | Sort-Object updatedAt -Descending | ForEach-Object {
    $c = $_.conclusion; if (-not $c) { $c = $_.status }
    Write-Host (" - {0} | {1} | {2} | {3}" -f $c, $_.workflowName, $_.headBranch, $_.url)
  }
} catch {
  Warn ("gh run list failed: " + $_.Exception.Message)
}

if ($DoKick) {
  try {
    $wfJson = gh workflow list -R $Repo --limit 200 --json name,id
    $wf = ($wfJson | ConvertFrom-Json) | Where-Object { $_.name -eq $WorkflowName } | Select-Object -First 1
    if (-not $wf) { Fail ("Workflow not found: {0}" -f $WorkflowName) }
    Ok ("Trigger workflow: {0} (id={1})" -f $wf.name, $wf.id)
    gh workflow run $wf.id -R $Repo | Out-Host
  } catch {
    Fail ("Kick failed: " + $_.Exception.Message)
  }
} else {
  Warn "Kick skipped (use -Kick to trigger workflow)."
}
