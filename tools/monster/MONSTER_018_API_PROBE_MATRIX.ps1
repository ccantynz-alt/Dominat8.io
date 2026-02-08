Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

param(
  [Parameter(Mandatory=$false)][string]$Domain = "dominat8.io",
  [Parameter(Mandatory=$false)][string[]]$Paths = @("/api/tv/status","/api/io/health","/api/tv/health","/api/tv/ping"),
  [Parameter(Mandatory=$false)][int]$TimeoutSeconds = 25,
  [Parameter(Mandatory=$false)][string]$OutDir = ""
)

function Ok($m){ Write-Host ("OK   {0}" -f $m) -ForegroundColor Green }
function Warn($m){ Write-Host ("WARN {0}" -f $m) -ForegroundColor Yellow }
function Ensure-Dir([string]$p){ if (-not (Test-Path -LiteralPath $p)) { New-Item -ItemType Directory -Path $p | Out-Null } }
function Write-Text([string]$Path,[string]$Text){
  $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
  [System.IO.File]::WriteAllText($Path, $Text, $utf8NoBom)
}

if ([string]::IsNullOrWhiteSpace($OutDir)) { $OutDir = Join-Path $env:TEMP "D8_EVIDENCE" }
Ensure-Dir $OutDir
$stamp = (Get-Date).ToString("yyyyMMdd_HHmmss")
$dir = Join-Path $OutDir ("PROBE_MATRIX_{0}" -f $stamp)
Ensure-Dir $dir
Ok ("Out: {0}" -f $dir)

$ts = [int][double]::Parse((Get-Date -UFormat %s))
$rows = @()

foreach ($p in $Paths) {
  $url = ("https://{0}{1}?ts={2}" -f $Domain, $p, $ts)
  $safe = ($p.Trim("/") -replace "[^\w\-]+","_")
  $rawPath = Join-Path $dir ("raw_{0}.txt" -f $safe)
  $status = "UNKNOWN"
  $body = ""
  try {
    $body = (curl.exe -s -D - --max-time $TimeoutSeconds $url) -join "`r`n"
    if ($body -match "HTTP/\d\.\d\s+(\d{3})") { $code = $Matches[1] } else { $code = "" }
    if ($code) { $status = $code }
  } catch {
    $status = "ERR"
    $body = "ERR " + $_.Exception.Message
  }
  Write-Text $rawPath $body
  $ok = $false
  if ($body -match '"ok"\s*:\s*true') { $ok = $true }
  $rows += [pscustomobject]@{ path=$p; url=$url; status=$status; ok=$ok; rawFile=("raw_{0}.txt" -f $safe) }
  Write-Host ("{0}  {1}  ok={2}  {3}" -f $status, $p, $ok, $url)
}

$summary = [pscustomobject]@{
  when = (Get-Date).ToString("o");
  domain = $Domain;
  ts = $ts;
  results = $rows
}
$json = $summary | ConvertTo-Json -Depth 8
Write-Text (Join-Path $dir "summary.json") $json
Ok "Wrote summary.json"
Write-Host $dir
