Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

param(
  [string] $RepoRoot = (Get-Location).Path,
  [string] $ExpectedRemoteHint = "Dominat8.io",
  [switch] $CleanUntracked,
  [switch] $Install,
  [switch] $RunBuild
)

function Ok($m){ Write-Host "✅ $m" -ForegroundColor Green }
function Warn($m){ Write-Host "⚠️  $m" -ForegroundColor Yellow }
function Info($m){ Write-Host "ℹ️  $m" -ForegroundColor Cyan }
function Bad($m){ throw "❌ $m" }

function Ensure-Repo {
  param([string]$p)
  if (-not (Test-Path -LiteralPath $p)) { Bad "RepoRoot not found: $p" }
  Set-Location -LiteralPath $p
  if (-not (Test-Path -LiteralPath ".\.git")) { Bad "Not a git repo (missing .git): $p" }
  $remote = (git remote -v | Out-String)
  if ($remote -notmatch [regex]::Escape($ExpectedRemoteHint)) {
    Write-Host "`n--- git remote -v ---" -ForegroundColor Yellow
    Write-Host $remote
    Bad "Safety stop: remotes do not contain '$ExpectedRemoteHint'. Wrong repo?"
  }
  Ok "Repo identity OK (remote contains '$ExpectedRemoteHint')."
}

function Show-State {
  Write-Host ""
  Write-Host "==============================" -ForegroundColor Magenta
  Write-Host " D8 DOCTOR — STATE" -ForegroundColor Magenta
  Write-Host "==============================" -ForegroundColor Magenta

  Info ("PWD: " + (Get-Location).Path)
  Ok ("Branch: " + (git rev-parse --abbrev-ref HEAD).Trim())
  Ok ("HEAD: " + (git rev-parse --short HEAD).Trim())

  Write-Host "`n--- git remote -v ---" -ForegroundColor Cyan
  git remote -v | Out-Host

  Write-Host "`n--- last 12 commits ---" -ForegroundColor Cyan
  git log -12 --oneline | Out-Host

  Write-Host "`n--- git status ---" -ForegroundColor Cyan
  git status | Out-Host

  Write-Host "`n--- untracked preview (git clean -nd) ---" -ForegroundColor Cyan
  git clean -nd | Out-Host
}

function Clean-Untracked {
  Write-Host ""
  Write-Host "==============================" -ForegroundColor Magenta
  Write-Host " D8 DOCTOR — CLEAN UNTRACKED" -ForegroundColor Magenta
  Write-Host "==============================" -ForegroundColor Magenta

  Warn "About to run: git clean -fd (removes ALL untracked files/dirs)"
  git clean -nd | Out-Host
  git clean -fd | Out-Host
  Ok "Untracked files removed."
}

function Run-NpmInstall {
  Write-Host ""
  Write-Host "==============================" -ForegroundColor Magenta
  Write-Host " D8 DOCTOR — NPM INSTALL" -ForegroundColor Magenta
  Write-Host "==============================" -ForegroundColor Magenta

  npm install | Out-Host
  Ok "npm install complete."
}

function Extract-ErrorBlock {
  param([string[]]$Lines)
  $start = -1
  for ($i=0; $i -lt $Lines.Count; $i++){
    if ($Lines[$i] -match "Failed to compile\." -or $Lines[$i] -match "Type error:" -or $Lines[$i] -match "Module not found" -or $Lines[$i] -match "Cannot find module") {
      $start = $i; break
    }
  }
  if ($start -lt 0) { return @() }
  $end = [Math]::Min($Lines.Count - 1, $start + 50)
  return $Lines[$start..$end]
}

function Run-Build {
  Write-Host ""
  Write-Host "==============================" -ForegroundColor Magenta
  Write-Host " D8 DOCTOR — BUILD CAPTURE" -ForegroundColor Magenta
  Write-Host "==============================" -ForegroundColor Magenta

  $ts = Get-Date -Format "yyyyMMdd_HHmmss"
  $logPath = Join-Path (Get-Location) ("doctor_build_" + $ts + ".log")

  Info "Logging build to: $logPath"
  $out = New-Object System.Collections.Generic.List[string]

  $pinfo = New-Object System.Diagnostics.ProcessStartInfo
  $pinfo.FileName = "cmd.exe"
  $pinfo.Arguments = "/c npm run build"
  $pinfo.RedirectStandardOutput = $true
  $pinfo.RedirectStandardError  = $true
  $pinfo.UseShellExecute = $false
  $pinfo.CreateNoWindow = $true

  $p = New-Object System.Diagnostics.Process
  $p.StartInfo = $pinfo
  [void]$p.Start()

  while (-not $p.StandardOutput.EndOfStream) {
    $line = $p.StandardOutput.ReadLine()
    $out.Add($line)
    Write-Host $line
  }
  while (-not $p.StandardError.EndOfStream) {
    $line = $p.StandardError.ReadLine()
    $out.Add($line)
    Write-Host $line
  }

  $p.WaitForExit()

  $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
  [System.IO.File]::WriteAllLines($logPath, $out.ToArray(), $utf8NoBom)

  if ($p.ExitCode -eq 0) { Ok "BUILD OK (exit 0)" } else { Warn "BUILD FAILED (exit $($p.ExitCode))" }

  $lines = $out.ToArray()
  $block = Extract-ErrorBlock -Lines $lines

  Write-Host ""
  Write-Host "==============================" -ForegroundColor Magenta
  Write-Host " FIRST ERROR BLOCK (EXTRACTED)" -ForegroundColor Magenta
  Write-Host "==============================" -ForegroundColor Magenta

  if ($block.Count -gt 0) { $block | ForEach-Object { Write-Host $_ } }
  else { Warn "No obvious error block found." }

  Write-Host ""
  Ok "Build log saved: $logPath"
  exit $p.ExitCode
}

Ensure-Repo $RepoRoot
Show-State
if ($CleanUntracked) { Clean-Untracked }
if ($Install) { Run-NpmInstall }
if ($RunBuild) { Run-Build } else { Ok "Run complete (no build requested)." }