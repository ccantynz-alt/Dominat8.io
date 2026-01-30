# UPGRADE_2026-01-31_EXCLUDE_BUILDER_WORKSPACE_FROM_DOMINAT8_BUILD.ps1
# Ensures Dominat8.com build ignores builder-workspace-v1 entirely

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Ok($m){ Write-Host "[OK]  $m" -ForegroundColor Green }
function Fail($m){ Write-Host "[FAIL] $m" -ForegroundColor Red; throw $m }

function ReadJson($p){
  if (!(Test-Path -LiteralPath $p)) { Fail "Missing file: $p" }
  Get-Content $p -Raw | ConvertFrom-Json
}

function WriteJson($p,$o){
  $json = $o | ConvertTo-Json -Depth 50
  [IO.File]::WriteAllText($p,$json,(New-Object Text.UTF8Encoding $false))
}

# --- tsconfig.json ---
$tsconfigPath = "tsconfig.json"
$ts = ReadJson $tsconfigPath

if (-not $ts.exclude) { $ts.exclude = @() }

$exclude = @(
  "builder-workspace-v1",
  "**/builder-workspace-v1/**"
)

foreach ($e in $exclude) {
  if ($ts.exclude -notcontains $e) {
    $ts.exclude += $e
  }
}

WriteJson $tsconfigPath $ts
Ok "Updated tsconfig.json to exclude builder-workspace-v1"

# --- next.config.js ---
$nextConfigPath = "next.config.js"
if (Test-Path -LiteralPath $nextConfigPath) {
  $content = Get-Content $nextConfigPath -Raw

  if ($content -notmatch "webpack") {
    $patched = $content -replace 'module\.exports\s*=\s*\{',
@"
module.exports = {
  webpack: (config) => {
    config.watchOptions = {
      ...(config.watchOptions || {}),
      ignored: ['**/builder-workspace-v1/**'],
    };
    return config;
  },
"@
    Set-Content -LiteralPath $nextConfigPath -Value $patched -Encoding utf8
    Ok "Patched next.config.js to ignore builder-workspace-v1"
  } else {
    Ok "next.config.js already has webpack config; skipping modification"
  }
} else {
  Ok "No next.config.js found; skipping webpack ignore"
}

Ok "DONE: builder workspace excluded from Dominat8.com build"

Write-Host ""
Write-Host "NEXT:" -ForegroundColor Yellow
Write-Host "  npm run build" -ForegroundColor Yellow
Write-Host "  git add -A" -ForegroundColor Yellow
Write-Host "  git commit -m ""chore(build): exclude builder workspace from Dominat8 build""" -ForegroundColor Yellow
Write-Host "  git push" -ForegroundColor Yellow
