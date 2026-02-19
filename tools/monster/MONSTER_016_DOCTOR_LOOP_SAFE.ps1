Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

param(
  [Parameter(Mandatory=$false)][string]$RepoRoot = "",
  [Parameter(Mandatory=$false)][string]$Repo = "ccantynz-alt/Dominat8.io",
  [Parameter(Mandatory=$false)][string]$Domain = "dominat8.io",
  [Parameter(Mandatory=$false)][int]$LoopSeconds = 10,
  [Parameter(Mandatory=$false)][int]$MaxEvidencePerHour = 6,
  [Parameter(Mandatory=$false)][switch]$AutoKickWorkflow,
  [Parameter(Mandatory=$false)][string]$WorkflowName = "047B Self-Heal PR Loop",
  [Parameter(Mandatory=$false)][switch]$AutoKickDeploy,
  [Parameter(Mandatory=$false)][int]$DeployMaxSeconds = 300,
  [Parameter(Mandatory=$false)][string]$OutDir = ""
)

function Ok($m){ Write-Host ("OK   {0}" -f $m) -ForegroundColor Green }
function Warn($m){ Write-Host ("WARN {0}" -f $m) -ForegroundColor Yellow }
function Fail($m){ Write-Host ("FATAL {0}" -f $m) -ForegroundColor Red; throw $m }
function Ensure-Dir([string]$p){ if (-not (Test-Path -LiteralPath $p)) { New-Item -ItemType Directory -Path $p | Out-Null } }

function NowUnix {
  return [int][double]::Parse((Get-Date -UFormat %s))
}
function CurlText([string]$Url){
  return (curl.exe -s -D - --max-time 25 $Url) -join "`r`n"
}
function CurlBody([string]$Url){
  return (curl.exe -s --max-time 20 $Url)
}

function Write-Text([string]$Path, [string]$Text){
  $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
  [System.IO.File]::WriteAllText($Path, $Text, $utf8NoBom)
}

function Take-Evidence([string]$Reason){
  $stamp = (Get-Date).ToString("yyyyMMdd_HHmmss")
  $dir = Join-Path $OutDir ("EVIDENCE_{0}" -f $stamp)
  Ensure-Dir $dir
  $ts = NowUnix
  $uTv = ("https://{0}/api/tv/status?ts={1}" -f $Domain, $ts)
  $uIo = ("https://{0}/api/io/health?ts={1}" -f $Domain, $ts)
  Write-Text (Join-Path $dir "00_reason.txt") ($Reason + "`r`n" + (Get-Date).ToString("o"))
  try { Write-Text (Join-Path $dir "01_tv_status_headers.txt") (CurlText $uTv) } catch { Write-Text (Join-Path $dir "01_tv_status_headers.txt") ("ERR " + $_.Exception.Message) }
  try { Write-Text (Join-Path $dir "02_io_health_headers.txt") (CurlText $uIo) } catch { Write-Text (Join-Path $dir "02_io_health_headers.txt") ("ERR " + $_.Exception.Message) }
  try {
    $cmd = "vercel domains inspect " + $Domain
    $out = cmd /c $cmd 2^>^&1
    Write-Text (Join-Path $dir "03_vercel_domains_inspect.txt") (($out | Out-String))
  } catch {
    Write-Text (Join-Path $dir "03_vercel_domains_inspect.txt") ("ERR " + $_.Exception.Message)
  }
  try {
    if ($RepoRoot -and (Test-Path -LiteralPath $RepoRoot)) {
      Push-Location -LiteralPath $RepoRoot
      try { Write-Text (Join-Path $dir "04_git_status.txt") ((git status --porcelain | Out-String)) } finally { Pop-Location }
    }
  } catch {}
  Ok ("Evidence: {0}" -f $dir)
}

function Kick-Workflow {
  try {
    $json = gh workflow list -R $Repo --limit 200 --json name,id 2>$null
    if (-not $json) { Warn "gh workflow list returned nothing."; return }
    $wf = ($json | ConvertFrom-Json) | Where-Object { $_.name -eq $WorkflowName } | Select-Object -First 1
    if (-not $wf) { Warn ("Workflow not found: {0}" -f $WorkflowName); return }
    Ok ("Kicking workflow: {0} (id={1})" -f $wf.name, $wf.id)
    gh workflow run $wf.id -R $Repo | Out-Host
  } catch { Warn ("Kick-Workflow failed: " + $_.Exception.Message) }
}

function Kick-Deploy {
  try {
    if (-not $RepoRoot) { Warn "RepoRoot missing; cannot deploy."; return }
    $psi = New-Object System.Diagnostics.ProcessStartInfo
    $psi.FileName = "cmd.exe"
    $psi.Arguments = "/c vercel --prod --force"
    $psi.WorkingDirectory = $RepoRoot
    $psi.UseShellExecute = $false
    $psi.RedirectStandardOutput = $true
    $psi.RedirectStandardError  = $true
    $psi.CreateNoWindow = $true
    $p = New-Object System.Diagnostics.Process
    $p.StartInfo = $psi
    $p.add_OutputDataReceived([System.Diagnostics.DataReceivedEventHandler]{ param($s,$e) if ($e.Data) { Write-Host $e.Data } })
    $p.add_ErrorDataReceived([System.Diagnostics.DataReceivedEventHandler]{ param($s,$e) if ($e.Data) { Write-Host $e.Data } })
    Ok "Starting deploy: vercel --prod --force"
    [void]$p.Start()
    $p.BeginOutputReadLine(); $p.BeginErrorReadLine()
    $sw = [System.Diagnostics.Stopwatch]::StartNew()
    while (-not $p.HasExited) {
      Start-Sleep -Milliseconds 200
      if ($sw.Elapsed.TotalSeconds -ge $DeployMaxSeconds) {
        Warn ("Deploy timeout {0}s. Killing." -f $DeployMaxSeconds)
        try { $p.Kill() } catch {}
        return
      }
    }
    if ($p.ExitCode -eq 0) { Ok "Deploy exit 0" } else { Warn ("Deploy exit " + $p.ExitCode) }
  } catch { Warn ("Kick-Deploy failed: " + $_.Exception.Message) }
}

if ([string]::IsNullOrWhiteSpace($RepoRoot)) { $RepoRoot = (Get-Location).Path }
if (-not [string]::IsNullOrWhiteSpace($RepoRoot)) { $RepoRoot = (Resolve-Path -LiteralPath $RepoRoot).Path }
if ([string]::IsNullOrWhiteSpace($OutDir)) { $OutDir = Join-Path $env:TEMP "D8_EVIDENCE" }
Ensure-Dir $OutDir

Ok ("RepoRoot: {0}" -f $RepoRoot)
Ok ("Repo:    {0}" -f $Repo)
Ok ("Domain:  {0}" -f $Domain)
Ok ("Loop:    {0}s" -f $LoopSeconds)
Write-Host "Keys: [E] evidence  [K] kick workflow  [D] kick deploy  [Q] quit" -ForegroundColor Cyan

$evidenceBudget = @{}  # hourKey -> count

function CanTakeEvidence {
  $hourKey = (Get-Date).ToString("yyyyMMdd_HH")
  if (-not $evidenceBudget.ContainsKey($hourKey)) { $evidenceBudget[$hourKey] = 0 }
  if ($evidenceBudget[$hourKey] -ge $MaxEvidencePerHour) { return $false }
  $evidenceBudget[$hourKey] = $evidenceBudget[$hourKey] + 1
  return $true
}

while ($true) {
  $ts = NowUnix
  $u = ("https://{0}/api/tv/status?ts={1}" -f $Domain, $ts)
  $line = ""
  $isGreen = $false
  $body = ""
  try {
    $body = CurlBody $u
    if ($body -match '"ok"\s*:\s*true') { $isGreen = $true }
  } catch {
    $body = "ERR " + $_.Exception.Message
  }

  if ($isGreen) {
    $line = ("{0}  GREEN  {1}" -f (Get-Date).ToString("HH:mm:ss"), $u)
  } else {
    $line = ("{0}  RED    {1}  BODY={2}" -f (Get-Date).ToString("HH:mm:ss"), $u, ($body -replace "\s+"," " ))
  }
  Write-Host $line

  if (-not $isGreen) {
    if (CanTakeEvidence) { Take-Evidence "AUTO_RED" } else { Warn "Evidence budget reached this hour." }
    if ($AutoKickWorkflow) { Kick-Workflow }
    if ($AutoKickDeploy) { Kick-Deploy }
  }

  $ms = [Math]::Max(200, $LoopSeconds * 1000)
  $end = [DateTime]::UtcNow.AddMilliseconds($ms)
  while ([DateTime]::UtcNow -lt $end) {
    if ([Console]::KeyAvailable) {
      $k = [Console]::ReadKey($true)
      if ($k.Key -eq "E") { if (CanTakeEvidence) { Take-Evidence "MANUAL_E" } else { Warn "Evidence budget reached this hour." } }
      if ($k.Key -eq "K") { Kick-Workflow }
      if ($k.Key -eq "D") { Kick-Deploy }
      if ($k.Key -eq "Q") { Ok "Quit"; return }
    }
    Start-Sleep -Milliseconds 100
  }
}
