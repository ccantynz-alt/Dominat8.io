Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

param(
  [int] $RevertCount = 2,
  [switch] $Push,
  [string] $ExpectedRemoteHint = "Dominat8.io"
)

function Ok($m){ Write-Host "✅ $m" -ForegroundColor Green }
function Warn($m){ Write-Host "⚠️  $m" -ForegroundColor Yellow }
function Info($m){ Write-Host "ℹ️  $m" -ForegroundColor Cyan }
function Bad($m){ throw "❌ $m" }

if (-not (Test-Path -LiteralPath ".\.git")) { Bad "Not a git repo. CD into Dominat8.io repo root." }

$remote = (git remote -v | Out-String)
if ($remote -notmatch [regex]::Escape($ExpectedRemoteHint)) {
  Write-Host $remote
  Bad "Safety stop: remotes do not contain '$ExpectedRemoteHint'."
}

# must be clean (including untracked) for reliable revert workflow
$porc = (git status --porcelain).Trim()
if (-not [string]::IsNullOrWhiteSpace($porc)) {
  Write-Host "`n--- git status --porcelain ---" -ForegroundColor Yellow
  git status --porcelain | Out-Host
  Bad "Working tree not clean. Clean first (use Doctor script with -CleanUntracked or run git clean -fd carefully)."
}

if ($RevertCount -lt 1) { Bad "-RevertCount must be >= 1" }

$branch = (git rev-parse --abbrev-ref HEAD).Trim()
Ok "Branch: $branch"

$ts = Get-Date -Format "yyyyMMdd_HHmmss"
$head = (git rev-parse --short HEAD).Trim()
$backup = "backup/revert_$ts" + "_$head"
git branch $backup | Out-Host
Ok "Backup branch created: $backup"

$commits = @(git log -$RevertCount --pretty=format:%H)
Info "Reverting $($commits.Count) commit(s):"
$commits | ForEach-Object { Write-Host (" - " + $_) -ForegroundColor Cyan }

foreach ($c in $commits) { git revert --no-edit $c | Out-Host }

Ok "Revert commits created."

if ($Push) {
  git push origin HEAD | Out-Host
  Ok "Pushed to origin."
} else {
  Warn "Not pushed. Re-run with -Push when ready."
}

Ok "DONE"