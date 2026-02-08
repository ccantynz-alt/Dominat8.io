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

$Domain = Get-ArgValue "Domain" "dominat8.io"
$OutDir = Get-ArgValue "OutDir" (Join-Path $env:TEMP "D8_EVIDENCE")
$TimeoutSeconds = [int](Get-ArgValue "TimeoutSeconds" "25")
Ensure-Dir $OutDir
$stamp = (Get-Date).ToString("yyyyMMdd_HHmmss")
$dir = Join-Path $OutDir ("PROBE_024_{0}" -f $stamp)
Ensure-Dir $dir
Ok ("Out: {0}" -f $dir)

$paths = @("/api/tv/status","/api/io/health","/api/tv/health","/api/tv/ping")
$ts = [int][double]::Parse((Get-Date -UFormat %s))
$rows = @()

foreach ($p in $paths) {
  $url = ("https://{0}{1}?ts={2}" -f $Domain, $p, $ts)
  $safe = ($p.Trim("/") -replace "[^\w\-]+","_")
  $rawPath = Join-Path $dir ("raw_{0}.txt" -f $safe)
  $status = "UNKNOWN"
  $ok = $false
  $raw = ""
  try {
    $raw = (curl.exe -s -D - --max-time $TimeoutSeconds $url) -join "`r`n"
    if ($raw -match "HTTP/\d\.\d\s+(\d{3})") { $status = $Matches[1] }
    if ($raw -match '"ok"\s*:\s*true') { $ok = $true }
  } catch {
    $status = "ERR"
    $raw = "ERR " + $_.Exception.Message
  }
  Write-Text $rawPath $raw
  $rows += [pscustomobject]@{ path=$p; url=$url; status=$status; ok=$ok; rawFile=("raw_{0}.txt" -f $safe) }
  Write-Host ("{0}  ok={1}  {2}" -f $status, $ok, $url)
}

$summary = [pscustomobject]@{ when=(Get-Date).ToString("o"); domain=$Domain; ts=$ts; results=$rows }
$json = $summary | ConvertTo-Json -Depth 8
Write-Text (Join-Path $dir "summary.json") $json
Ok "Wrote summary.json"
Write-Host $dir
