[CmdletBinding()]
param(
  [Parameter(Mandatory=$true)][string] $RepoRoot,
  [Parameter(Mandatory=$true)][string] $EvidenceDir,
  [Parameter(Mandatory=$true)][string] $BaseUrl,
  [string] $RenderHealthUrl = ""
)
Set-StrictMode -Version Latest
$ErrorActionPreference="Stop"

function Ok([string]$m){Write-Host ("OK   " + $m) -ForegroundColor Green}
function Info([string]$m){Write-Host ("INFO " + $m) -ForegroundColor Gray}
function Warn([string]$m){Write-Host ("WARN " + $m) -ForegroundColor Yellow}
function Fail([string]$m){Write-Host ("FATAL " + $m) -ForegroundColor Red; throw $m}

function Ensure-Dir([string]$p){ if(-not (Test-Path -LiteralPath $p)){ New-Item -ItemType Directory -Path $p | Out-Null } }

function Curl-Headers([string]$url){
  $ts = [int]([DateTimeOffset]::UtcNow.ToUnixTimeSeconds())
  $u = if($url -match "\?"){ "$url&ts=$ts" } else { "$url?ts=$ts" }
  $out = & curl.exe -s -D - -o NUL --max-time 25 -H "Cache-Control: no-cache" -H "Pragma: no-cache" $u 2>$null
  return $out
}
function Curl-Body([string]$url){
  $ts = [int]([DateTimeOffset]::UtcNow.ToUnixTimeSeconds())
  $u = if($url -match "\?"){ "$url&ts=$ts" } else { "$url?ts=$ts" }
  $out = & curl.exe -s --max-time 25 -H "Cache-Control: no-cache" -H "Pragma: no-cache" $u 2>$null
  return $out
}

Ensure-Dir $EvidenceDir

$targets = @(
  @{ Name="io_health"; Url=("$BaseUrl/api/io/health") },
  @{ Name="io_root";   Url=("$BaseUrl/io") },
  @{ Name="tv";        Url=("$BaseUrl/tv") }
)

Info "Probe BaseUrl = $BaseUrl"
foreach($t in $targets){
  $name = $t.Name
  $url  = $t.Url
  Info "GET (headers) $name -> $url"
  $h = Curl-Headers $url
  $p = Join-Path $EvidenceDir ("probe_" + $name + "_headers.txt")
  $h | Out-File -LiteralPath $p -Encoding UTF8
  Ok "Saved: $p"
}

if([string]::IsNullOrWhiteSpace($RenderHealthUrl)){
  Warn "RenderHealthUrl not provided -> skipping Render probe"
} else {
  Info "GET (headers) render_health -> $RenderHealthUrl"
  $rh = Curl-Headers $RenderHealthUrl
  $rp = Join-Path $EvidenceDir "probe_render_health_headers.txt"
  $rh | Out-File -LiteralPath $rp -Encoding UTF8
  Ok "Saved: $rp"
}

Ok "MONSTER_021 done"