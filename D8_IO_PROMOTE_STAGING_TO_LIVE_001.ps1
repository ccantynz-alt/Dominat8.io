param(
  [Parameter(Mandatory=$true)]
  [string]$RepoRoot
)

Set-StrictMode -Version Latest
$ErrorActionPreference="Stop"

function Ok($m){Write-Host "OK   $m" -ForegroundColor Green}
function Warn($m){Write-Host "WARN $m" -ForegroundColor Yellow}
function Die($m){Write-Host "FATAL $m" -ForegroundColor Red; exit 1}

if (-not (Test-Path -LiteralPath $RepoRoot)) { Die "RepoRoot not found: $RepoRoot" }
Set-Location -LiteralPath $RepoRoot
if (-not (Test-Path -LiteralPath ".git")) { Die "Not a git repo: $RepoRoot" }

$dirty = git status --porcelain
if ($dirty) { Die "Working tree not clean. Commit/stash first.`n$dirty" }

Ok "Fetching origin..."
git fetch --all --prune | Out-Host

# Robust check: parse refs instead of relying on try/catch
$refs = git for-each-ref --format="%(refname)" refs/remotes/origin | Out-String
if ($refs -notmatch "refs/remotes/origin/staging") {
  Die "origin/staging not found (after fetch). Existing origin refs:`n$refs"
}

# Detect prod branch main vs master
$hasMain = ($refs -match "refs/remotes/origin/main")
$hasMaster = ($refs -match "refs/remotes/origin/master")

if ($hasMain) { $prod="main" }
elseif ($hasMaster) { $prod="master" }
else { Die "Neither origin/main nor origin/master exists. Existing origin refs:`n$refs" }

Ok "Using production branch: $prod"

git checkout $prod | Out-Host
git pull --ff-only origin $prod | Out-Host

Ok "Promoting origin/staging -> $prod..."
# Prefer fast-forward (clean)
$ffOk = $true
cmd /c "git merge --ff-only origin/staging" | Out-Host
if ($LASTEXITCODE -ne 0) { $ffOk = $false }

if ($ffOk) {
  Ok "Fast-forwarded $prod to origin/staging."
} else {
  Warn "FF-only not possible; doing normal merge commit..."
  git merge --no-ff origin/staging -m "Promote staging -> live" | Out-Host
  Ok "Merged origin/staging into $prod."
}

Ok "Pushing $prod..."
git push origin $prod | Out-Host
Ok "Promotion pushed."

Write-Host ""
Write-Host "VERIFY PROD:" -ForegroundColor Cyan
Write-Host '$t=[int](Get-Date -UFormat %s)' -ForegroundColor Cyan
Write-Host 'curl.exe -sS --max-time 20 "https://dominat8.io/api/debug/stamp?ts=$t"' -ForegroundColor Cyan
Write-Host 'curl.exe -sS --max-time 20 "https://dominat8.io/healthz?ts=$t"' -ForegroundColor Cyan
