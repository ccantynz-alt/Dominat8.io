#requires -Version 5.1
Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

param(
  [Parameter(Mandatory=$false)][string]$Domain = 'dominat8.io'
  [Parameter(Mandatory=$false)][string]$OutDir = 'C:\Temp\D8_EVIDENCE'
)

function Ok([string]$m){ Write-Host ('OK   ' + $m) -ForegroundColor Green }

function UnixTs { return [int][double]::Parse((Get-Date -UFormat %s)) }

New-Item -ItemType Directory -Force -Path $OutDir | Out-Null
$stamp = Get-Date -Format 'yyyyMMdd_HHmmss'
$f = Join-Path $OutDir ('D8_IO_EVIDENCE_' + $stamp + '.txt')

Ok ('Writing evidence: ' + $f)
Ok ('Domain: https://' + $Domain)
Write-Host ''

$ts = UnixTs
$tv = 'https://' + $Domain + '/api/tv/status?ts=' + $ts
$sites = 'https://' + $Domain + '/api/sites/list?ts=' + $ts

$txt = @()
$txt += '=== D8_IO EVIDENCE ' + $stamp + ' ==='
$txt += 'Domain: https://' + $Domain
$txt += ''

$txt += '--- HEADERS (tv/status) ---'
$txt += (& curl.exe -s -D - -o NUL -H 'Cache-Control: no-cache' $tv)

$txt += ''
$txt += '--- BODY (tv/status) ---'
$txt += (& curl.exe -s -H 'Cache-Control: no-cache' $tv)

$txt += ''
$txt += '--- BODY (sites/list) ---'
$txt += (& curl.exe -s -H 'Cache-Control: no-cache' $sites)

$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
[IO.File]::WriteAllLines($f, $txt, $utf8NoBom)

Ok 'EVIDENCE (tail):'
Get-Content -LiteralPath $f -Tail 80 | Out-Host

Write-Host ''
Ok 'Done.'