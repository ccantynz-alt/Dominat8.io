Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Ok($m){ Write-Host "OK   $m" -ForegroundColor Green }
function Info($m){ Write-Host "INFO $m" -ForegroundColor Gray }
function Warn($m){ Write-Host "WARN $m" -ForegroundColor Yellow }
function Fail($m){ Write-Host "FATAL $m" -ForegroundColor Red; throw $m }

function CurlI([string]$Url) {
  $ts = [int](Get-Date -UFormat %s)
  curl.exe -s -I --max-time 30 -H "Cache-Control: no-cache" -H "Pragma: no-cache" `
    "$Url$(if($Url -match '\?'){ '&' } else { '?' })ts=$ts"
}

# ---- repo root ----
$RepoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location -LiteralPath $RepoRoot
Info "Locked PWD: $(Get-Location)"
if (-not (Test-Path -LiteralPath ".\package.json")) { Fail "package.json missing. Wrong folder." }

try { $null = Get-Command vercel -ErrorAction Stop } catch { Fail "vercel CLI not found in PATH." }

Write-Host ""
Ok "SANITY: git HEAD (should include your MEGA_021 commit)"
git --no-pager log -1 --oneline | Out-Host

Write-Host ""
Ok "Vercel whoami"
vercel whoami | Out-Host

Write-Host ""
Ok "Vercel project link status (must point to dominat8io project)"
vercel link --yes 2>&1 | Out-Host

Write-Host ""
Ok "Deploying PROD with FORCE (capturing output)..."
$deployOut = & vercel deploy --prod --yes --force 2>&1
$deployOut | Out-Host

# Parse any vercel.app URL from output
$urls = @($deployOut | Where-Object { $_ -match 'https://.*\.vercel\.app' })
$deployUrl = $null
if ($urls.Count -gt 0) { $deployUrl = ($urls | Select-Object -Last 1).Trim() }

Write-Host ""
if (-not $deployUrl) {
  Fail "Could not capture deployment URL from vercel output. Paste the deploy output above."
}

Ok "DEPLOYMENT URL: $deployUrl"

Write-Host ""
Ok "PROOF: DEPLOYMENT /api/io/health HEADERS"
CurlI ("{0}/api/io/health" -f $deployUrl) | Out-Host

Write-Host ""
Ok "PROOF: DEPLOYMENT /io HEADERS"
CurlI ("{0}/io" -f $deployUrl) | Out-Host

Write-Host ""
Ok "PROOF: DOMAIN /api/io/health HEADERS (to see if alias updated)"
CurlI "https://dominat8.io/api/io/health" | Out-Host

Write-Host ""
Ok "DONE. Paste back ONLY:"
Write-Host "1) The line: DEPLOYMENT URL: ..." -ForegroundColor Yellow
Write-Host "2) The DEPLOYMENT /api/io/health headers block" -ForegroundColor Yellow
Write-Host "3) The DOMAIN /api/io/health headers block" -ForegroundColor Yellow
