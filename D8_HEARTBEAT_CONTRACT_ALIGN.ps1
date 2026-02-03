Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

param(
  [string] $ExpectedRemoteHint = "Dominat8.io",
  [switch] $RunBuild
)

function Ok($m){ Write-Host "✅ $m" -ForegroundColor Green }
function Warn($m){ Write-Host "⚠️  $m" -ForegroundColor Yellow }
function Info($m){ Write-Host "ℹ️  $m" -ForegroundColor Cyan }
function Bad($m){ throw "❌ $m" }

function Backup-File($p){
  if (Test-Path -LiteralPath $p) {
    $ts = Get-Date -Format "yyyyMMdd_HHmmss"
    Copy-Item -LiteralPath $p -Destination ($p + ".bak_" + $ts) -Force
  }
}

function Write-Utf8NoBom($path, $content){
  $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
  [System.IO.File]::WriteAllText($path, $content, $utf8NoBom)
}

if (-not (Test-Path -LiteralPath ".\.git")) { Bad "Not a git repo. CD into Dominat8.io repo root." }
$remote = (git remote -v | Out-String)
if ($remote -notmatch [regex]::Escape($ExpectedRemoteHint)) {
  Write-Host $remote
  Bad "Safety stop: remotes do not contain '$ExpectedRemoteHint'."
}

$route = "src\app\api\machine\heartbeat\route.ts"
$state = "src\app\api\machine\heartbeat\_state.ts"
$feed  = "src\app\api\machine\heartbeat\_feed.ts"

if (-not (Test-Path -LiteralPath $route)) { Bad "Missing: $route" }

$txt = Get-Content -LiteralPath $route -Raw

# Parse import names from './_state'
# Example: import { initialSnapshot, MachineSnapshot, LMM1_STAMP } from './_state';
$stateImports = @()
if ($txt -match "import\s*\{\s*([^}]+)\s*\}\s*from\s*['""]\.\/_state['""]") {
  $raw = $Matches[1]
  $stateImports = $raw -split "," | ForEach-Object { $_.Trim() } | Where-Object { $_ -ne "" } | ForEach-Object {
    ($_ -split "\s+as\s+")[0].Trim()
  }
}
if ($stateImports.Count -eq 0) { Warn "Could not parse _state imports. Will still write a safe default contract." }
else { Ok ("_state imports detected: " + ($stateImports -join ", ")) }

# Detect emit call arity: emit( ... )
$emitArgCount = 0
if ($txt -match "emit\s*\(([^)]*)\)") {
  $inside = $Matches[1].Trim()
  if ($inside -eq "") { $emitArgCount = 0 }
  else {
    # naive split by comma, good enough for current usage
    $emitArgCount = ($inside -split ",").Count
  }
}
Ok "emit(...) arg count detected: $emitArgCount"

# Write _state.ts to satisfy imports
Backup-File $state
$needMachineSnapshot = $stateImports -contains "MachineSnapshot"
$needInitialSnapshot = $stateImports -contains "initialSnapshot"
$needStamp = $stateImports -contains "LMM1_STAMP"

# We include all three by default if parsing failed
if ($stateImports.Count -eq 0) {
  $needMachineSnapshot = $true
  $needInitialSnapshot = $true
  $needStamp = $true
}

$stateContent = @"
/**
 * Heartbeat state contract (aligned to route.ts imports).
 * Minimal + stable: exports only what's required for compilation.
 */

export type MachineSnapshot = {
  lastEventAt?: string;
  state?: unknown;
  stamp: string;
};

export const LMM1_STAMP = "LMM1_STAMP_PLACEHOLDER";

export const initialSnapshot: MachineSnapshot = {
  stamp: LMM1_STAMP,
  lastEventAt: new Date(0).toISOString(),
  state: {}
};
"@
Write-Utf8NoBom $state $stateContent
Ok "Wrote: $state"

# Write _feed.ts with overloads to support detected arity (0..3 safe)
Backup-File $feed
$feedContent = @"
/**
 * Heartbeat feed shim (aligned to route.ts emit(...) usage).
 * Provides overloads for 0/1/3 args safely.
 */

export type FeedEvent = {
  at: number;
  type: string;
  message?: string;
  payload?: unknown;
};

export function emit(): FeedEvent;
export function emit(message: string): FeedEvent;
export function emit(type: string, message: string, payload: unknown): FeedEvent;
export function emit(a?: string, b?: string, c?: unknown): FeedEvent {
  const at = Date.now();

  if (typeof a === "string" && typeof b === "string") {
    return { at, type: a, message: b, payload: c };
  }
  if (typeof a === "string") {
    return { at, type: "log", message: a };
  }
  return { at, type: "log" };
}
"@
Write-Utf8NoBom $feed $feedContent
Ok "Wrote: $feed"

if ($RunBuild) {
  Ok "Running: npm run build"
  npm run build | Out-Host
}

Ok "DONE"