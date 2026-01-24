Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Fail($m) { throw "ERROR: $m" }

Write-Host "== PRECHECK =="
if (-not (Test-Path ".\.git")) { Fail "Not in repo root" }

Write-Host ""
Write-Host "== REMOVE CONFLICTING pages/* FILES =="

$toDelete = @(
  ".\pages\index.tsx",
  ".\pages\index.jsx",
  ".\pages\index.js",
  ".\pages\_app.tsx",
  ".\pages\_app.jsx",
  ".\pages\_app.js"
)

foreach ($p in $toDelete) {
  if (Test-Path -LiteralPath $p) {
    Remove-Item -LiteralPath $p -Force
    Write-Host ("DELETED: " + $p)
  } else {
    Write-Host ("OK: not present: " + $p)
  }
}

if (Test-Path -LiteralPath ".\pages") {
  $remaining = Get-ChildItem -LiteralPath ".\pages" -Recurse -Force -File -ErrorAction SilentlyContinue
  if (-not $remaining -or $remaining.Count -eq 0) {
    Remove-Item -LiteralPath ".\pages" -Recurse -Force
    Write-Host "DELETED: .\pages (was empty)"
  } else {
    Write-Host "NOTE: .\pages still has other files (left as-is)."
  }
}

Write-Host ""
Write-Host "== COMMIT + PUSH + DEPLOY (PRINT FULL OUTPUT) =="

git add -A
git commit -m "fix(router): remove pages/ conflicts so App Router builds" 2>$null | Out-Null
git push origin HEAD:main

# Important: DO NOT hide output. We need the real build error if it fails.
vercel --prod --force
if ($LASTEXITCODE -ne 0) { Fail "Deploy failed (see output above)" }

Write-Host ""
Write-Host "✅ DEPLOY OK"