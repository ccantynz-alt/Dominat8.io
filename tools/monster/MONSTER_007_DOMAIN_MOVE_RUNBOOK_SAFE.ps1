#requires -Version 5.1
Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

param(
  [Parameter(Mandatory=$false)][string]$Domain         = 'dominat8.io'
  [Parameter(Mandatory=$false)][string]$CorrectProject = 'dominat8io'
)

function Ok([string]$m){ Write-Host ('OK   ' + $m) -ForegroundColor Green }
function Warn([string]$m){ Write-Host ('WARN ' + $m) -ForegroundColor Yellow }

Ok 'MONSTER_007 — Domain move runbook (SAFE: no deletes performed)'
Ok ('Domain          = ' + $Domain)
Ok ('Correct project = ' + $CorrectProject)
Write-Host ''

Warn 'If Vercel CLI hangs on prompts, do the move in Vercel Dashboard.'
Write-Host ''

Ok '1) Identify current owner project (read-only)'
Write-Host ('   cmd /c "vercel domains inspect ' + $Domain + '"') -ForegroundColor Gray
Write-Host ''

Ok '2) Dashboard move (recommended)'
Write-Host '   Vercel Dashboard -> Projects -> (current owner) -> Settings -> Domains' -ForegroundColor Gray
Write-Host ('   Remove: ' + $Domain) -ForegroundColor Gray
Write-Host ('   Add to correct project: ' + $CorrectProject) -ForegroundColor Gray
Write-Host ''

Ok '3) After move: redeploy correct project'
Write-Host '   cmd /c "vercel --prod --force" | Out-Host' -ForegroundColor Gray
Write-Host ''

Ok '4) Proof probes'
Write-Host ('   curl.exe -s -H "Cache-Control: no-cache" "https://' + $Domain + '/api/tv/status?ts=1770458505"') -ForegroundColor Gray
Write-Host ('   curl.exe -s -H "Cache-Control: no-cache" "https://' + $Domain + '/api/sites/list?ts=1770458505"') -ForegroundColor Gray

Write-Host ''
Ok 'Done.'