Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Fail([string]$m){ Write-Host "[GUARD FAIL] $m" -ForegroundColor Red; throw $m }
function Ok([string]$m){ Write-Host "[GUARD OK]  $m" -ForegroundColor Green }
function Warn([string]$m){ Write-Host "[GUARD WARN] $m" -ForegroundColor Yellow }

$repoRoot = (Get-Location).Path

# 1) Block obvious junk getting committed
$blocked = @(
  "builder-workspace-v1/",
  ".venv/",
  "node_modules/"
)

foreach ($p in $blocked) {
  if (Test-Path -LiteralPath (Join-Path $repoRoot $p)) {
    # It's okay to exist locally, but CI should never include it in the checkout normally.
    # Still useful to warn (not fail) in case someone vendor-committed.
    Warn "Local path exists (should be ignored / not committed): $p"
  }
}

# 2) Prevent the classic "root route disappears" trap:
# If app/page.tsx exists, app/layout.tsx MUST exist.
$appPage = Join-Path $repoRoot "app\page.tsx"
$appLayout = Join-Path $repoRoot "app\layout.tsx"
if (Test-Path -LiteralPath $appPage) {
  if (!(Test-Path -LiteralPath $appLayout)) {
    Fail "Next.js App Router requires app/layout.tsx when app/page.tsx exists. Missing: app/layout.tsx"
  } else {
    Ok "app/page.tsx has required app/layout.tsx"
  }
}

# 3) Prevent duplicate root route file reappearing (page.jsx vs page.tsx)
$dup1 = Join-Path $repoRoot "src\app\page.jsx"
$dup2 = Join-Path $repoRoot "app\page.jsx"
if (Test-Path -LiteralPath $dup1) { Fail "Duplicate root route detected: src/app/page.jsx (should not exist). Remove it." }
if (Test-Path -LiteralPath $dup2) { Fail "Duplicate root route detected: app/page.jsx (should not exist). Remove it." }
Ok "No duplicate root route page.jsx detected"

# 4) Ensure at least one valid root route exists
$srcPageTsx = Join-Path $repoRoot "src\app\page.tsx"
$appPageTsx = Join-Path $repoRoot "app\page.tsx"
if (!(Test-Path -LiteralPath $srcPageTsx) -and !(Test-Path -LiteralPath $appPageTsx)) {
  Fail "No root route found. Expected src/app/page.tsx and/or app/page.tsx."
}
Ok "Root route exists"

# 5) Ensure layout exists if using src/app
$srcLayout = Join-Path $repoRoot "src\app\layout.tsx"
if (Test-Path -LiteralPath $srcPageTsx) {
  if (!(Test-Path -LiteralPath $srcLayout)) {
    Warn "src/app/page.tsx exists but src/app/layout.tsx missing. Consider adding it for stability."
  } else {
    Ok "src/app/layout.tsx exists"
  }
}

Ok "Protected-paths guardrails PASSED"