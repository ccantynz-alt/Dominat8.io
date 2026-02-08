#requires -Version 5.1
Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

param(
  [Parameter(Mandatory=$false)][string]$Repo = 'ccantynz-alt/Dominat8.io'
)

function Ok([string]$m){ Write-Host ('OK   ' + $m) -ForegroundColor Green }
function Warn([string]$m){ Write-Host ('WARN ' + $m) -ForegroundColor Yellow }
function Fail([string]$m){ Write-Host ('FATAL ' + $m) -ForegroundColor Red; throw $m }

$gh = Get-Command gh -ErrorAction SilentlyContinue
if (-not $gh) { Fail 'gh CLI not found in PATH' }

Ok ('Repo = ' + $Repo)
Write-Host ''

Ok 'A) gh auth status'
gh auth status | Out-Host
Write-Host ''

Ok 'B) secrets list (look for GH_TOKEN)'
gh secret list -R $Repo | Out-Host
Write-Host ''

Ok 'C) workflows list'
gh workflow list -R $Repo | Out-Host
Write-Host ''

Ok 'D) recent runs'
gh run list -R $Repo --limit 10 | Out-Host

Write-Host ''
Warn 'If GH_TOKEN is missing: gh secret set -R ccantynz-alt/Dominat8.io GH_TOKEN'
Ok 'Done.'