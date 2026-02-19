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
function Read-Text([string]$Path){ return [System.IO.File]::ReadAllText($Path) }

function Get-ArgValue([string]$Name,[string]$Default){
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

function NowUnix { return [int][double]::Parse((Get-Date -UFormat %s)) }
$RepoRoot = Get-ArgValue "RepoRoot" (Get-Location).Path
$Seconds  = [int](Get-ArgValue "Seconds" "60")
$Interval = [int](Get-ArgValue "IntervalMs" "500")

$RepoRoot = (Resolve-Path -LiteralPath $RepoRoot).Path
$MonsterDir = Join-Path $RepoRoot "tools\monster"
if (-not (Test-Path -LiteralPath $MonsterDir)) { Fail ("Missing: {0}" -f $MonsterDir) }

Write-Host ("Watching: " + $MonsterDir) -ForegroundColor Cyan
Write-Host ("Seconds:  " + $Seconds + "  IntervalMs: " + $Interval)

$baseline = @{}
Get-ChildItem -LiteralPath $MonsterDir -File | ForEach-Object { $baseline[$_.FullName] = $_.LastWriteTimeUtc }

$end = [DateTime]::UtcNow.AddSeconds($Seconds)
while ([DateTime]::UtcNow -lt $end) {
  Start-Sleep -Milliseconds $Interval
  $changed = @()
  Get-ChildItem -LiteralPath $MonsterDir -File | ForEach-Object {
    $p = $_.FullName
    $t = $_.LastWriteTimeUtc
    if ($baseline.ContainsKey($p)) {
      if ($t -ne $baseline[$p]) {
        $baseline[$p] = $t
        $changed += $_
      }
    } else {
      $baseline[$p] = $t
      $changed += $_
    }
  }

  if ($changed.Count -gt 0) {
    Warn ("CHANGE DETECTED: " + $changed.Count + " file(s)")
    $changed | Select-Object Name,LastWriteTime,Length | Format-Table -AutoSize | Out-Host

    Write-Host "Candidate processes:" -ForegroundColor Cyan
    Get-CimInstance Win32_Process |
      Where-Object { $_.Name -in @("powershell.exe","pwsh.exe","node.exe") } |
      Where-Object { $_.CommandLine } |
      Select-Object ProcessId,Name,CommandLine |
      Format-Table -AutoSize | Out-Host
  }
}

Ok "Watch complete."
