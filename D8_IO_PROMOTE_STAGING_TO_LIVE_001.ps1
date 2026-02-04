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

# Detect whether prod branch is main or master
$hasMain = $false
$hasMaster = $false
try { git show-ref --verify --quiet "refs/remotes/origin/main"; $hasMain=$true } catch {}
try { git show-ref --verify --quiet "refs/remotes/origin/master"; $hasMaster=$true } catch {}

if (-not (git show-ref --verify --quiet "refs/remotes/origin/staging" 2>$null)) {
  Die "origin/staging not found. Push staging branch first."
}

if ($hasMain) { $prod="main" }
elseif ($hasMaster) { $prod="master" }
else { Die "Neither origin/main nor origin/master exists. Paste git branch -a output." }

Ok "Using production branch: $prod"

git checkout $prod | Out-Host
git pull --ff-only origin $prod | Out-Host

Ok "Promoting origin/staging -> $prod..."
try {
  git merge --ff-only origin/staging | Out-Host
  Ok "Fast-forwarded $prod to origin/staging."
} catch {
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
