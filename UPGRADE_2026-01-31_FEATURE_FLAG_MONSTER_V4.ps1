# UPGRADE_2026-01-31_FEATURE_FLAG_MONSTER_V4.ps1
# Adds a feature-flag system and gates MonsterV4BuildLink behind it

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Ok($m){ Write-Host "[OK]  $m" -ForegroundColor Green }
function Fail($m){ Write-Host "[FAIL] $m" -ForegroundColor Red; throw $m }

function WriteNoBom($p,$c){
  $dir = Split-Path -Parent $p
  if ($dir -and !(Test-Path $dir)) {
    New-Item -ItemType Directory -Path $dir -Force | Out-Null
  }
  [IO.File]::WriteAllText($p,$c,(New-Object Text.UTF8Encoding $false))
}

function Backup($p){
  if (Test-Path $p) {
    $bak = "$p.bak_$(Get-Date -Format yyyyMMdd_HHmmss)"
    Copy-Item $p $bak
    Ok "Backup: $bak"
  }
}

# Paths
$flagFile = "builder-workspace-v1/workspace-ui/src/lib/featureFlags.ts"
$pageFile = "builder-workspace-v1/workspace-ui/src/app/page.tsx"

Backup $flagFile
Backup $pageFile

# --- 1) Feature flag utility ---
$flags = @"
export type FeatureFlag = 'MONSTER_V4';

/**
 * Feature flag resolver
 *
 * Priority:
 * 1) NEXT_PUBLIC_FEATURE_<FLAG>
 * 2) NODE_ENV === 'development'
 * 3) default false
 */
export function isFeatureEnabled(flag: FeatureFlag): boolean {
  const envKey = `NEXT_PUBLIC_FEATURE_${flag}`;
  const fromEnv = typeof process !== 'undefined' ? process.env[envKey] : undefined;

  if (fromEnv !== undefined) {
    return fromEnv === 'true';
  }

  if (process.env.NODE_ENV === 'development') {
    return true;
  }

  return false;
}
"@

WriteNoBom $flagFile $flags
Ok "Created feature flag utility: $flagFile"

# --- 2) Patch page.tsx to use flag ---
$src = Get-Content $pageFile -Raw

# Ensure import
if ($src -notmatch 'isFeatureEnabled') {
  $src = $src -replace '(?m)^import React.*?;',
'$0
import { isFeatureEnabled } from ''../lib/featureFlags'';
'
}

# Wrap MonsterV4BuildLink usage
$src = $src -replace '<MonsterV4BuildLink\s*/>',
'{isFeatureEnabled(''MONSTER_V4'') && <MonsterV4BuildLink />}'

WriteNoBom $pageFile $src
Ok "Wrapped <MonsterV4BuildLink /> behind MONSTER_V4 feature flag"

Write-Host ""
Write-Host "NEXT:" -ForegroundColor Yellow
Write-Host "  npm run build" -ForegroundColor Yellow
Write-Host "  git add -A" -ForegroundColor Yellow
Write-Host "  git commit -m ""feat(flags): gate MonsterV4 behind feature flag""" -ForegroundColor Yellow
Write-Host "  git push" -ForegroundColor Yellow
