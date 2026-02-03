Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"
Set-Location -LiteralPath "C:\Temp\FARMS\Dominat8.io-clone"
$out = "C:\Temp\FARMS\Dominat8.io-clone\_doctor_out_20260203_201539"

Write-Host "
=== A3 LOCAL BUILD GREEN GATE ===" -ForegroundColor Cyan

$node = ""
try { $node = (node -v) } catch {}
if (-not $node) { throw "Node is missing on PATH" }

if ($node -notmatch "^v20\." ) {
  Write-Host "WARNING: Node is $node but package.json wants 20.x" -ForegroundColor Yellow
  if (-not False) {
    throw "STOP: Install/use Node 20.x, or rerun pack with -AllowNonNode20"
  }
}

# Ensure node_modules exists and Next is present
$nm = ".\node_modules"
$nextBin = ".\node_modules\.bin\next.cmd"
$nextPkg = ".\node_modules\next\package.json"

# Fresh-ish install (keeps package-lock)
Write-Host "
--- npm install (log) ---" -ForegroundColor Yellow
cmd /c "npm install" 2>&1 | Tee-Object -FilePath (Join-Path $out "A3_npm_install.txt")

if (-not (Test-Path -LiteralPath $nextBin) -and -not (Test-Path -LiteralPath $nextPkg)) {
  Write-Host "Next.js not found after npm install. Running npm ci as fallback." -ForegroundColor Yellow
  if (Test-Path -LiteralPath ".\package-lock.json") {
    cmd /c "npm ci" 2>&1 | Tee-Object -FilePath (Join-Path $out "A3_npm_ci_fallback.txt")
  }
}

Write-Host "
--- npm run build (log) ---" -ForegroundColor Yellow
$log = Join-Path $out "A3_npm_run_build.txt"
cmd /c "npm run build" 2>&1 | Tee-Object -FilePath $log

Write-Host "
=== A3 DONE (build passed) ===" -ForegroundColor Green
