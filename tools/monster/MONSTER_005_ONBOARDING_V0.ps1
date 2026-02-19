#requires -Version 5.1
Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

param(
  [Parameter(Mandatory=$false)][string]$Domain = 'dominat8.io'
)

function Ok([string]$m){ Write-Host ('OK   ' + $m) -ForegroundColor Green }
function Warn([string]$m){ Write-Host ('WARN ' + $m) -ForegroundColor Yellow }

function UnixTs { return [int][double]::Parse((Get-Date -UFormat %s)) }

function CurlRaw([string]$Url) {
  return (& curl.exe -s -H 'Cache-Control: no-cache' -H 'Pragma: no-cache' $Url)
}

function TryParseJson([string]$s) {
  if ([string]::IsNullOrWhiteSpace($s)) { return $null }
  try { return ($s | ConvertFrom-Json) } catch { return $s }
}

function Show([object]$o) {
  if ($null -eq $o) { Write-Host '<null>' -ForegroundColor DarkGray; return }
  if ($o -is [string]) { Write-Host $o; return }
  ($o | ConvertTo-Json -Depth 20) | Out-Host
}

Ok 'MONSTER_005 — Proof: /api/tv/status + /api/sites/list'
Ok ('Domain = https://{0}' -f $Domain)

$ts = UnixTs
$u1 = 'https://{0}/api/tv/status?ts={1}' -f $Domain, $ts
Ok ('GET ' + $u1)
$r1 = CurlRaw $u1
Show (TryParseJson $r1)

Write-Host ''

$ts = UnixTs
$u2 = 'https://{0}/api/sites/list?ts={1}' -f $Domain, $ts
Ok ('GET ' + $u2)
$r2 = CurlRaw $u2
Show (TryParseJson $r2)

Write-Host ''
Ok 'Done.'