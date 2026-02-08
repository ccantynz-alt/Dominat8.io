Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Ok($m){ Write-Host "OK   $m" -ForegroundColor Green }
function Info($m){ Write-Host "INFO $m" -ForegroundColor Gray }
function Warn($m){ Write-Host "WARN $m" -ForegroundColor Yellow }
function Fail($m){ Write-Host "FATAL $m" -ForegroundColor Red; throw $m }

function Run-Native([string]$Label, [scriptblock]$Sb) {
  $old = $ErrorActionPreference
  $ErrorActionPreference = "Continue"
  try {
    Write-Host ""
    Info $Label
    $out = & $Sb 2>&1
    $code = $LASTEXITCODE
    if ($out) { $out | Out-Host }
    if ($code -ne 0) {
      Warn "$Label (exit=$code)"
    } else {
      Ok "$Label (exit=$code)"
    }
    return [pscustomobject]@{ Output = @($out); ExitCode = $code }
  }
  finally {
    $ErrorActionPreference = $old
  }
}

function CurlI([string]$Url) {
  $ts = [int](Get-Date -UFormat %s)
  curl.exe -s -I --max-time 30 -H "Cache-Control: no-cache" -H "Pragma: no-cache" `
    "$Url$(if($Url -match '\?'){ '&' } else { '?' })ts=$ts"
}

# ---- repo root = current directory ----
$RepoRoot = (Get-Location).Path
Info "RepoRoot (PWD): $RepoRoot"
if (-not (Test-Path -LiteralPath (Join-Path $RepoRoot "package.json"))) { Fail "package.json missing in PWD." }

try { $null = Get-Command vercel -ErrorAction Stop } catch { Fail "vercel CLI not found in PATH." }

# ---- ensure main + pull latest ----
Run-Native "git checkout main" { git checkout main } | Out-Null
Run-Native "git pull origin main" { git pull origin main } | Out-Null

Write-Host ""
Ok "SANITY: git HEAD"
git --no-pager log -1 --oneline | Out-Host

# ---- vercel identity + link ----
Run-Native "vercel whoami" { vercel whoami } | Out-Null
Run-Native "vercel link --yes --project dominat8io --scope craig-cantys-projects" {
  vercel link --yes --project dominat8io --scope craig-cantys-projects
} | Out-Null

# ---- deploy prod + capture URL ----
$deploy = Run-Native "vercel deploy --prod --yes --force" {
  vercel deploy --prod --yes --force
}
if ($deploy.ExitCode -ne 0) { Fail "vercel deploy failed." }

$urls = @($deploy.Output | Where-Object { $_ -match 'https://.*\.vercel\.app' })
$deployUrl = $null
if ($urls.Count -gt 0) { $deployUrl = ($urls | Select-Object -Last 1).Trim() }
if (-not $deployUrl) { Fail "Could not capture deployment URL from vercel output." }

Write-Host ""
Ok "DEPLOYMENT URL: $deployUrl"

# ---- PROOF: deployment + domain ----
Write-Host ""
Ok "PROOF: DEPLOYMENT /api/io/health HEADERS"
CurlI ("{0}/api/io/health" -f $deployUrl) | Out-Host

Write-Host ""
Ok "PROOF: DOMAIN /api/io/health HEADERS"
CurlI "https://dominat8.io/api/io/health" | Out-Host

Write-Host ""
Ok "DONE. Paste back ONLY:"
Write-Host "1) DEPLOYMENT URL line" -ForegroundColor Yellow
Write-Host "2) DEPLOYMENT /api/io/health headers block" -ForegroundColor Yellow
Write-Host "3) DOMAIN /api/io/health headers block" -ForegroundColor Yellow
