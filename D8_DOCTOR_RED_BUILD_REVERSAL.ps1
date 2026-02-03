Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

param(
  [string] $RepoRoot = (Get-Location).Path,
  [string] $ExpectedRemoteHint = "Dominat8.io",
  [switch] $RunBuild,
  [switch] $Fix,
  [int] $RevertCount = 1,
  [switch] $Push
)

function Ok($m){ Write-Host "✅ $m" -ForegroundColor Green }
function Warn($m){ Write-Host "⚠️  $m" -ForegroundColor Yellow }
function Info($m){ Write-Host "ℹ️  $m" -ForegroundColor Cyan }
function Bad($m){ throw "❌ $m" }

function Exec($cmd){ Info $cmd; cmd /c $cmd | Out-Host }

function Ensure-Repo($path){
  if (-not (Test-Path -LiteralPath $path)) { Bad "RepoRoot not found: $path" }
  Set-Location -LiteralPath $path
  if (-not (Test-Path -LiteralPath ".\.git")) { Bad "Not a git repo (missing .git): $path" }

  $remote = (git remote -v | Out-String)
  if ($remote -notmatch [regex]::Escape($ExpectedRemoteHint)) {
    Write-Host "`n--- git remote -v ---" -ForegroundColor Yellow
    Write-Host $remote
    Bad "Safety stop: remotes do not contain '$ExpectedRemoteHint'."
  }
  Ok "Repo identity OK (remote contains '$ExpectedRemoteHint')."
}

function Is-CleanWorkingTree(){
  $porc = (git status --porcelain).Trim()
  return [string]::IsNullOrWhiteSpace($porc)
}

function Create-BackupBranch(){
  $ts = Get-Date -Format "yyyyMMdd_HHmmss"
  $cur = (git rev-parse --short HEAD).Trim()
  $b = "backup/redbuild_$ts" + "_$cur"
  Exec "git branch $b"
  Ok "Created backup branch: $b"
  return $b
}

function Diagnose(){
  Write-Host ""
  Write-Host "==============================" -ForegroundColor Magenta
  Write-Host " D8 DOCTOR — DIAGNOSE" -ForegroundColor Magenta
  Write-Host "==============================" -ForegroundColor Magenta

  Info ("PWD: " + (Get-Location).Path)

  try { Ok ("Branch: " + (git rev-parse --abbrev-ref HEAD).Trim()) } catch {}
  try { Ok ("HEAD: " + (git rev-parse --short HEAD).Trim()) } catch {}

  Write-Host "`n--- git remote -v ---" -ForegroundColor Cyan
  git remote -v | Out-Host

  Write-Host "`n--- last 10 commits ---" -ForegroundColor Cyan
  git log -10 --oneline | Out-Host

  Write-Host "`n--- git status ---" -ForegroundColor Cyan
  git status | Out-Host

  if (-not (Is-CleanWorkingTree)) {
    Warn "Working tree is NOT clean (includes untracked files). Use: git clean -fd (careful) to clean."
  } else {
    Ok "Working tree is clean."
  }

  if ($RunBuild) {
    Write-Host "`n--- npm run build ---" -ForegroundColor Cyan
    npm run build | Out-Host
  }
}

function Fix-Revert(){
  if (-not $Fix) { return }

  if (-not (Is-CleanWorkingTree)) {
    Bad "Refusing -Fix: working tree not clean. Clean first (git clean -fd) or commit/stash."
  }
  if ($RevertCount -lt 1) { Bad "-RevertCount must be >= 1" }

  $backup = Create-BackupBranch

  $commits = @()
  $logLines = git log -$RevertCount --pretty=format:%H
  foreach ($line in $logLines) {
    $c = $line.Trim()
    if ($c) { $commits += $c }
  }

  Info "Will revert $($commits.Count) commit(s):"
  foreach ($c in $commits) { Write-Host (" - " + $c) -ForegroundColor Cyan }

  foreach ($c in $commits) { Exec "git revert --no-edit $c" }

  if ($Push) { Exec "git push origin HEAD" }

  Ok "Fix complete. Backup branch: $backup"
}

Ensure-Repo $RepoRoot
Diagnose
Fix-Revert
Ok "DONE"