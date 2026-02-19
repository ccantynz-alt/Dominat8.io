[CmdletBinding()]
param(
  [Parameter(Mandatory=$true)][string] $RepoRoot,
  [Parameter(Mandatory=$true)][string] $EvidenceDir,
  [Parameter(Mandatory=$true)][string] $BaseUrl,
  [string] $RenderHealthUrl = "",
  [int] $Iterations = 5,
  [int] $SleepSeconds = 5
)
Set-StrictMode -Version Latest
$ErrorActionPreference="Stop"

function Ok([string]$m){Write-Host ("OK   " + $m) -ForegroundColor Green}
function Info([string]$m){Write-Host ("INFO " + $m) -ForegroundColor Gray}
function Warn([string]$m){Write-Host ("WARN " + $m) -ForegroundColor Yellow}
function Fail([string]$m){Write-Host ("FATAL " + $m) -ForegroundColor Red; throw $m}
function Ensure-Dir([string]$p){ if(-not (Test-Path -LiteralPath $p)){ New-Item -ItemType Directory -Path $p | Out-Null } }

function Curl-Status([string]$url){
  $ts = [int]([DateTimeOffset]::UtcNow.ToUnixTimeSeconds())
  $u = if($url -match "\?"){ "$url&ts=$ts" } else { "$url?ts=$ts" }
  $h = & curl.exe -s -D - -o NUL --max-time 25 -H "Cache-Control: no-cache" -H "Pragma: no-cache" $u 2>$null
  $first = ($h | Select-Object -First 1)
  return $first
}

Ensure-Dir $EvidenceDir

$summary = @()
for($i=1;$i -le $Iterations;$i++){
  Info "Loop $i/$Iterations"
  $ioHealth = Curl-Status "$BaseUrl/api/io/health"
  $tv       = Curl-Status "$BaseUrl/tv"

  $row = [PSCustomObject]@{
    Iteration = $i
    TimeUtc   = (Get-Date).ToUniversalTime().ToString("s") + "Z"
    IOHealth  = $ioHealth
    TV        = $tv
    Render    = ""
  }

  if(-not [string]::IsNullOrWhiteSpace($RenderHealthUrl)){
    $row.Render = Curl-Status $RenderHealthUrl
  }

  $summary += $row
  Start-Sleep -Seconds $SleepSeconds
}

$csv = Join-Path $EvidenceDir "bounded_probe_loop_summary.csv"
$summary | Export-Csv -LiteralPath $csv -NoTypeInformation -Encoding UTF8
Ok "Saved: $csv"
Ok "MONSTER_024 done"