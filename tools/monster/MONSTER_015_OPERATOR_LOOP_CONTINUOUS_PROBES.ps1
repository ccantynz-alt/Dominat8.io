Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

param(
  [Parameter(Mandatory=$false)][string]$RepoRoot = "",
  [Parameter(Mandatory=$false)][string]$Domain = "dominat8.io",
  [Parameter(Mandatory=$false)][int]$LoopSeconds = 10,
  [Parameter(Mandatory=$false)][string]$OutDir = ""
)

function Ok($m){ Write-Host ("OK   {0}" -f $m) -ForegroundColor Green }
function Warn($m){ Write-Host ("WARN {0}" -f $m) -ForegroundColor Yellow }
function Ensure-Dir([string]$p){ if (-not (Test-Path -LiteralPath $p)) { New-Item -ItemType Directory -Path $p | Out-Null } }

if ([string]::IsNullOrWhiteSpace($RepoRoot)) { $RepoRoot = (Get-Location).Path }
$RepoRoot = (Resolve-Path -LiteralPath $RepoRoot).Path
if ([string]::IsNullOrWhiteSpace($OutDir)) { $OutDir = Join-Path $env:TEMP "D8_EVIDENCE" }
Ensure-Dir $OutDir

Ok ("RepoRoot: {0}" -f $RepoRoot)
Ok ("Domain:   {0}" -f $Domain)
Ok ("Loop:     {0}s" -f $LoopSeconds)
Write-Host "Keys: [E] write evidence snapshot  |  [Q] quit" -ForegroundColor Cyan

function Take-Evidence {
  $stamp = (Get-Date).ToString("yyyyMMdd_HHmmss")
  $dir = Join-Path $OutDir ("OP_EVIDENCE_{0}" -f $stamp)
  Ensure-Dir $dir
  $ts = [int][double]::Parse((Get-Date -UFormat %s))
  $u = ("https://{0}/api/tv/status?ts={1}" -f $Domain, $ts)
  $txt = @()
  $txt += ("WHEN=" + (Get-Date).ToString("o"))
  $txt += ("URL=" + $u)
  $txt += ""
  try { $txt += (curl.exe -s -D - --max-time 25 $u) } catch { $txt += ("ERR " + $_.Exception.Message) }
  $p = Join-Path $dir "tv_status.txt"
  [System.IO.File]::WriteAllText($p, ($txt -join "`r`n"), (New-Object System.Text.UTF8Encoding($false)))
  Ok ("Evidence: {0}" -f $dir)
}

while ($true) {
  $ts = [int][double]::Parse((Get-Date -UFormat %s))
  $u = ("https://{0}/api/tv/status?ts={1}" -f $Domain, $ts)

  $line = ""
  try {
    $r = curl.exe -s --max-time 20 $u
    if ($r -match '"ok"\s*:\s*true') {
      $line = ("{0}  GREEN  {1}" -f (Get-Date).ToString("HH:mm:ss"), $u)
    } else {
      $line = ("{0}  RED    {1}  BODY={2}" -f (Get-Date).ToString("HH:mm:ss"), $u, ($r -replace "\s+"," " ))
    }
  } catch {
    $line = ("{0}  ERR    {1}  {2}" -f (Get-Date).ToString("HH:mm:ss"), $u, $_.Exception.Message)
  }
  Write-Host $line

  $ms = [Math]::Max(200, $LoopSeconds * 1000)
  $end = [DateTime]::UtcNow.AddMilliseconds($ms)
  while ([DateTime]::UtcNow -lt $end) {
    if ([Console]::KeyAvailable) {
      $k = [Console]::ReadKey($true)
      if ($k.Key -eq "E") { Take-Evidence }
      if ($k.Key -eq "Q") { Ok "Quit"; return }
    }
    Start-Sleep -Milliseconds 100
  }
}
