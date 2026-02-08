# ============================================================
# D8_IO_AGENT_CONSOLE_047A.ps1
# Local live dashboard for Dominat8.io
# PowerShell 5.1
# ============================================================

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

param(
  [string]$RepoRoot = "C:\Temp\FARMS\Dominat8.io-clone",
  [string]$OwnerRepo = "ccantynz-alt/Dominat8.io",
  [string]$ProdBaseUrl = "https://dominat8.io",
  [int]$RefreshSeconds = 10
)

function Ok($m){ Write-Host ("OK   " + $m) -ForegroundColor Green }
function Warn($m){ Write-Host ("WARN " + $m) -ForegroundColor Yellow }

function CurlHead([string]$u){
  $ts = [int][double]::Parse((Get-Date -UFormat %s))
  $url = $u
  if ($u -notmatch "\?") { $url = "$u?ts=$ts" } else { $url = "$u&ts=$ts" }
  try {
    $h = (curl.exe -s -D - -o NUL -H "Cache-Control: no-cache" $url) 2>$null
    return ($h -split "`r?`n" | Select-Object -First 12) -join "`n"
  } catch {
    return "ERROR: " + $_.Exception.Message
  }
}

function Print-Section([string]$title){
  Write-Host ""
  Write-Host ("=== " + $title + " ===") -ForegroundColor Cyan
}

if (-not (Test-Path -LiteralPath $RepoRoot)) { throw "RepoRoot not found: $RepoRoot" }
Set-Location -LiteralPath $RepoRoot
Ok "RepoRoot: $RepoRoot"

# If Windows Terminal is available, open a richer view
$wt = Get-Command wt.exe -ErrorAction SilentlyContinue
if ($wt) {
  Write-Host ""
  Write-Host "Launching Windows Terminal dashboard (tabs/panes)..." -ForegroundColor Cyan

  $cmd1 = "powershell -NoProfile -ExecutionPolicy Bypass -Command `"while($true){ Clear-Host; Write-Host 'GH RUNS' -ForegroundColor Cyan; gh run list -R $OwnerRepo --limit 12; Start-Sleep $RefreshSeconds }`""
  $cmd2 = "powershell -NoProfile -ExecutionPolicy Bypass -Command `"while($true){ Clear-Host; Write-Host 'OPEN PRS' -ForegroundColor Cyan; gh pr list -R $OwnerRepo --state open --limit 12; Start-Sleep $RefreshSeconds }`""
  $cmd3 = "powershell -NoProfile -ExecutionPolicy Bypass -Command `"while($true){ Clear-Host; Write-Host 'PROD PROBES' -ForegroundColor Cyan; Write-Host ''; Write-Host 'TV STATUS:' -ForegroundColor Yellow; curl.exe -s -H 'Cache-Control: no-cache' '$ProdBaseUrl/api/tv/status?ts=' + [int][double]::Parse((Get-Date -UFormat %s)) | Out-Host; Write-Host ''; Write-Host 'HEAD /' -ForegroundColor Yellow; curl.exe -s -D - -o NUL -H 'Cache-Control: no-cache' '$ProdBaseUrl/?ts=' + [int][double]::Parse((Get-Date -UFormat %s)) | Select-Object -First 12 | Out-Host; Start-Sleep $RefreshSeconds }`""

  # New window with 3 tabs
  & wt.exe new-tab --title "GH Runs"   -- $cmd1 `; `
        new-tab --title "Open PRs"    -- $cmd2 `; `
        new-tab --title "Prod Probes" -- $cmd3 | Out-Null

  Ok "Windows Terminal launched."
  exit 0
}

# Fallback: single-pane loop
Warn "Windows Terminal (wt.exe) not found. Running single-pane loop in this console."

while ($true) {
  Clear-Host
  Write-Host ("D8 IO AGENT CONSOLE 047A  |  " + (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")) -ForegroundColor Cyan
  Write-Host ("Repo: " + $OwnerRepo) -ForegroundColor Gray
  Write-Host ("Prod: " + $ProdBaseUrl) -ForegroundColor Gray

  Print-Section "GitHub Runs"
  try { gh run list -R $OwnerRepo --limit 10 | Out-Host } catch { Write-Host $_.Exception.Message -ForegroundColor Red }

  Print-Section "Open PRs"
  try { gh pr list -R $OwnerRepo --state open --limit 10 | Out-Host } catch { Write-Host $_.Exception.Message -ForegroundColor Red }

  Print-Section "Prod Probes"
  Write-Host "HEAD /" -ForegroundColor Yellow
  Write-Host (CurlHead "$ProdBaseUrl/") -ForegroundColor Gray
  Write-Host ""
  Write-Host "GET /api/tv/status" -ForegroundColor Yellow
  try { curl.exe -s -H "Cache-Control: no-cache" "$ProdBaseUrl/api/tv/status?ts=$([int][double]::Parse((Get-Date -UFormat %s)))" | Out-Host } catch { Write-Host $_.Exception.Message -ForegroundColor Red }

  Start-Sleep -Seconds $RefreshSeconds
}