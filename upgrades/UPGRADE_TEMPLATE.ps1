# UPGRADE TEMPLATE (PowerShell-only)
# - Full file writes
# - Safe replace helpers
# - Verification checks
# - No bash, no wildcards
# - Run from repo root (must contain package.json)

$ErrorActionPreference = "Stop"

function Assert-ProjectRoot {
  if (-not (Test-Path ".\package.json")) {
    throw "Not in project root. package.json not found at: $((Get-Location).Path)"
  }
}

function Ensure-Dir([string]$Path) {
  New-Item -ItemType Directory -Force -Path $Path | Out-Null
}

function Write-FileUtf8([string]$Path, [string]$Content) {
  $dir = Split-Path -Parent $Path
  if ($dir -and -not (Test-Path $dir)) { Ensure-Dir $dir }
  $Content | Set-Content -Encoding UTF8 -LiteralPath $Path
  Write-Host "WROTE: $Path"
}

function Read-FileRaw([string]$Path) {
  if (-not (Test-Path $Path)) { throw "Missing file: $Path" }
  return Get-Content -Raw -LiteralPath $Path
}

function Replace-InFile([string]$Path, [string]$Find, [string]$Replace) {
  $txt = Read-FileRaw $Path
  $txt2 = $txt.Replace($Find, $Replace)
  if ($txt2 -ne $txt) {
    $txt2 | Set-Content -Encoding UTF8 -LiteralPath $Path
    Write-Host "PATCHED: $Path"
  } else {
    Write-Host "NO CHANGE: $Path"
  }
}

function Assert-Contains([string]$Path, [string]$Needle) {
  $txt = Read-FileRaw $Path
  if ($txt.IndexOf($Needle, [System.StringComparison]::Ordinal) -lt 0) {
    throw "ASSERT FAILED: '$Needle' not found in $Path"
  }
  Write-Host "OK CONTAINS: $Path :: $Needle"
}

function Assert-NotContains([string]$Path, [string]$Needle) {
  $txt = Read-FileRaw $Path
  if ($txt.IndexOf($Needle, [System.StringComparison]::Ordinal) -ge 0) {
    throw "ASSERT FAILED: '$Needle' unexpectedly found in $Path"
  }
  Write-Host "OK NOT CONTAINS: $Path :: $Needle"
}

function Run-Command([string]$Cmd) {
  Write-Host ""
  Write-Host "RUN: $Cmd" -ForegroundColor Cyan
  cmd.exe /c $Cmd
  if ($LASTEXITCODE -ne 0) { throw "Command failed with exit code $LASTEXITCODE: $Cmd" }
}

# ----------------------------
# UPGRADE START
# ----------------------------

Assert-ProjectRoot

Write-Host ""
Write-Host "=== UPGRADE: TEMPLATE (NO-OP) ===" -ForegroundColor Green
Write-Host "This template does nothing yet. Future upgrades will replace this body." -ForegroundColor Yellow

# Example (commented out):
# Write-FileUtf8 ".\src\lib\example.ts" "export const x = 1;"
# Assert-Contains ".\src\lib\example.ts" "export const x"

Write-Host ""
Write-Host "=== UPGRADE COMPLETE ===" -ForegroundColor Green
