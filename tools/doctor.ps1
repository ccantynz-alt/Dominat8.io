# ================================
# tools\doctor.ps1
# ================================
# Fast pre-flight checks to catch known deployment killers BEFORE pushing.
#
# Usage:
#   powershell -ExecutionPolicy Bypass -File ".\tools\doctor.ps1"
#   powershell -ExecutionPolicy Bypass -File ".\tools\doctor.ps1" -RunBuild
#
# Checks:
# - UTF-8 BOM in package.json / package-lock.json
# - package.json parses as JSON
# - engines.node exists and equals "20.x"
# - Optional: runs "npm run vercel-build" (if defined) or "npm run build" fallback

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

param(
  [switch]$RunBuild
)

function Fail($msg) { throw "DOCTOR FAILED: $msg" }

function Read-Bytes([string]$Path) {
  if (-not (Test-Path -LiteralPath $Path)) { return $null }
  return [System.IO.File]::ReadAllBytes($Path)
}

function Has-Utf8Bom([byte[]]$bytes) {
  if ($null -eq $bytes) { return $false }
  return ($bytes.Length -ge 3 -and $bytes[0] -eq 0xEF -and $bytes[1] -eq 0xBB -and $bytes[2] -eq 0xBF)
}

function Strip-Utf8Bom([byte[]]$bytes) {
  if (-not (Has-Utf8Bom $bytes)) { return $bytes }
  $newLen = $bytes.Length - 3
  $out = New-Object byte[] $newLen
  [System.Array]::Copy($bytes, 3, $out, 0, $newLen)
  return $out
}

function Read-Utf8Text-NoBomSafe([string]$Path) {
  $bytes = Read-Bytes $Path
  if ($null -eq $bytes) { return $null }
  $bytes2 = Strip-Utf8Bom $bytes
  $enc = New-Object System.Text.UTF8Encoding($false)
  return $enc.GetString($bytes2)
}

Write-Host "== Dominat8 Doctor =="

# --- package.json ---
if (-not (Test-Path -LiteralPath ".\package.json")) {
  Fail "package.json not found in repo root."
}

$pkgBytes = Read-Bytes ".\package.json"
if (Has-Utf8Bom $pkgBytes) {
  Fail "package.json has a UTF-8 BOM (Vercel can hard-fail on BOM-prefixed JSON)."
}

$pkgText = Read-Utf8Text-NoBomSafe ".\package.json"

try {
  $pkg = $pkgText | ConvertFrom-Json -ErrorAction Stop
} catch {
  Fail "package.json is not valid JSON: $($_.Exception.Message)"
}

if ($null -eq $pkg.engines -or $null -eq $pkg.engines.node) {
  Fail 'package.json missing engines.node. Required: "engines": { "node": "20.x" }'
}
if ($pkg.engines.node -ne "20.x") {
  Fail "package.json engines.node is '$($pkg.engines.node)'. Required: '20.x'."
}

Write-Host "OK: package.json is UTF-8 (no BOM), valid JSON, engines.node=20.x"

# --- package-lock.json (optional) ---
if (Test-Path -LiteralPath ".\package-lock.json") {
  $lockBytes = Read-Bytes ".\package-lock.json"
  if (Has-Utf8Bom $lockBytes) {
    Fail "package-lock.json has a UTF-8 BOM (can break tooling)."
  }
  Write-Host "OK: package-lock.json exists and has no BOM"
} else {
  Write-Host "WARN: package-lock.json not found (ok if you use pnpm/yarn; otherwise consider npm install)."
}

# --- optional build ---
if ($RunBuild) {
  Write-Host "== Optional build check =="
  if (-not (Test-Path -LiteralPath ".\node_modules")) {
    Write-Host "node_modules missing -> running: npm ci --legacy-peer-deps"
    & npm.cmd ci --legacy-peer-deps
    if ($LASTEXITCODE -ne 0) { Fail "npm ci failed." }
  }

  $pkgScripts = $pkg.scripts
  if ($null -ne $pkgScripts -and $null -ne $pkgScripts."vercel-build") {
    Write-Host "Running: npm run vercel-build"
    & npm.cmd run vercel-build
    if ($LASTEXITCODE -ne 0) { Fail "npm run vercel-build failed." }
  } elseif ($null -ne $pkgScripts -and $null -ne $pkgScripts.build) {
    Write-Host "Running: npm run build"
    & npm.cmd run build
    if ($LASTEXITCODE -ne 0) { Fail "npm run build failed." }
  } else {
    Write-Host "WARN: No vercel-build or build script found in package.json. Skipping build."
  }

  Write-Host "OK: build check completed"
}

Write-Host "== Doctor passed =="