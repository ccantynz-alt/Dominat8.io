#requires -Version 5.1
Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

param(
  [Parameter(Mandatory=$false)][string]$Domain   = 'dominat8.io'
  [Parameter(Mandatory=$false)][string]$RepoRoot = 'C:\Temp\FARMS\Dominat8.io-clone'
)

function Ok([string]$m){ Write-Host ('OK   ' + $m) -ForegroundColor Green }
function Warn([string]$m){ Write-Host ('WARN ' + $m) -ForegroundColor Yellow }
function Fail([string]$m){ Write-Host ('FATAL ' + $m) -ForegroundColor Red; throw $m }

if (-not (Test-Path -LiteralPath (Join-Path $RepoRoot '.git'))) { Fail ('Not a git repo: ' + $RepoRoot) }

$vercel = Get-Command vercel -ErrorAction SilentlyContinue
if (-not $vercel) { Fail 'Vercel CLI not found in PATH' }

Ok ('RepoRoot = ' + (git -C $RepoRoot rev-parse --show-toplevel))
Ok ('Domain  = ' + $Domain)
Write-Host ''

Ok 'A) vercel whoami'
cmd /c 'vercel whoami' | Out-Host
Write-Host ''

Ok 'B) vercel domains inspect (SAFE)'
cmd /c ('vercel domains inspect ' + $Domain) | Out-Host
Write-Host ''

Ok 'C) HTTP probe (no-cache): /api/tv/status'
$ts = [int][double]::Parse((Get-Date -UFormat %s))
cmd /c ('curl -s -H "Cache-Control: no-cache" "https://' + $Domain + '/api/tv/status?ts=' + $ts + '"') | Out-Host

Write-Host ''
Ok 'Done.'