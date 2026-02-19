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
$Domain = Get-ArgValue "Domain" "dominat8.io"
$OutDir = Get-ArgValue "OutDir" "C:\Temp\D8_EVIDENCE"
$TimeoutSeconds = [int](Get-ArgValue "TimeoutSeconds" "25")
Ensure-Dir $OutDir
$stamp = (Get-Date).ToString("yyyyMMdd_HHmmss")
$dir = Join-Path $OutDir ("TRIAGE_033_{0}" -f $stamp)
Ensure-Dir $dir
Ok ("Out: {0}" -f $dir)

$targets = @("/", "/tv", "/api/tv/status", "/api/io/health", "/api/tv/health", "/api/tv/ping")
$ts = NowUnix

foreach ($p in $targets) {
  $u = ("https://{0}{1}?ts={2}" -f $Domain, $p, $ts)
  $safe = ($p.Trim("/") -replace "[^\w\-]+","_")
  if ([string]::IsNullOrWhiteSpace($safe)) { $safe = "root" }
  $rawPath = Join-Path $dir ("raw_{0}.txt" -f $safe)
  Write-Host ""
  Write-Host ("=== {0}" -f $u) -ForegroundColor Cyan
  try {
    $raw = (curl.exe -s -D - --max-time $TimeoutSeconds -H "Cache-Control: no-cache" -H "Pragma: no-cache" $u) -join "`r`n"
  } catch {
    $raw = "ERR " + $_.Exception.Message
  }
  Write-Text $rawPath $raw
  if ($raw -match "HTTP/\d\.\d\s+(\d{3})") {
    $code = $Matches[1]
    Write-Host ("HTTP {0}" -f $code) -ForegroundColor Yellow
  }
  # Print key Vercel routing headers if present
  $keys = @("x-matched-path","x-nextjs-cache","x-vercel-cache","x-vercel-id","location")
  foreach ($k in $keys) {
    if ($raw.ToLowerInvariant() -match ("^" + [regex]::Escape($k) + ":\s*(.+)$")) {
      $m = [regex]::Match($raw, ("(?im)^" + [regex]::Escape($k) + ":\s*(.+)$"))
      if ($m.Success) { Write-Host ("{0}: {1}" -f $k, $m.Groups[1].Value.Trim()) -ForegroundColor Gray }
    }
  }
}

Write-Host ""
Ok "Triage complete."
Write-Host $dir
