# UPGRADE_2026-01-31_FIX_D8CARD_AT_PRIVACY_IMPORT_SOURCE.ps1
# Finds the D8Card import used by src/app/(marketing)/privacy/page.tsx
# Resolves it to the actual .ts/.tsx file, then upgrades D8Card to support:
#   - <D8Card>{children}</D8Card>
#   - <D8Card title=".." body=".." kicker=".." />

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Ok($m){ Write-Host "[OK]  $m" -ForegroundColor Green }
function Warn($m){ Write-Host "[WARN] $m" -ForegroundColor Yellow }
function Fail($m){ Write-Host "[FAIL] $m" -ForegroundColor Red; throw $m }

function Backup($p){
  if (!(Test-Path -LiteralPath $p)) { Fail "Missing file: $p" }
  $bak = "$p.bak_$(Get-Date -Format yyyyMMdd_HHmmss)"
  Copy-Item -LiteralPath $p -Destination $bak -Force
  Ok "Backup: $bak"
}

function WriteNoBom($p,$c){
  [IO.File]::WriteAllText($p,$c,(New-Object Text.UTF8Encoding $false))
}

function Resolve-ImportToFile {
  param(
    [Parameter(Mandatory=$true)][string]$ImportPath,
    [Parameter(Mandatory=$true)][string]$FromDir
  )

  # Handle common aliases
  $p = $ImportPath
  if ($p.StartsWith("@/")) { $p = "src/" + $p.Substring(2) }
  if ($p.StartsWith("~/")) { $p = "src/" + $p.Substring(2) }

  # Relative import
  if ($p.StartsWith(".")) {
    $p = Join-Path -Path $FromDir -ChildPath $p
  } else {
    # repo-root relative
    $p = Join-Path -Path (Get-Location) -ChildPath $p
  }

  # Normalize slashes
  $p = $p -replace '/', '\'

  $candidates = @(
    $p,
    "$p.ts",
    "$p.tsx",
    (Join-Path $p "index.ts"),
    (Join-Path $p "index.tsx")
  )

  foreach ($c in $candidates) {
    if (Test-Path -LiteralPath $c) { return (Resolve-Path -LiteralPath $c).Path }
  }

  return $null
}

# --- locate privacy page and parse D8Card import ---
$privacy = "src/app/(marketing)/privacy/page.tsx"
if (!(Test-Path -LiteralPath $privacy)) { Fail "Missing: $privacy" }

$privacyDir = (Resolve-Path -LiteralPath (Split-Path -Parent $privacy)).Path
$txt = Get-Content -LiteralPath $privacy -Raw

# Match: import { ... D8Card ... } from "X";
$importMatch = [regex]::Match($txt, 'import\s+\{[^}]*\bD8Card\b[^}]*\}\s+from\s+["'']([^"'']+)["''];')
if (-not $importMatch.Success) {
  Fail "Could not find an import that includes D8Card in privacy/page.tsx. (Maybe default import or re-export?)"
}

$importPath = $importMatch.Groups[1].Value
Ok "Privacy imports D8Card from: $importPath"

$target = Resolve-ImportToFile -ImportPath $importPath -FromDir $privacyDir
if (-not $target) {
  Fail "Could not resolve D8Card import to a real file. Import was: $importPath"
}

Ok "Resolved D8Card file: $target"
Backup $target

$src = Get-Content -LiteralPath $target -Raw

# Ensure React import exists (we'll use React types)
if ($src -notmatch 'import\s+React') {
  $src = "import React from 'react';`n" + $src
}

# If D8Card already supports title/body/kicker props, stop (no-op)
if ($src -match 'export\s+type\s+D8CardProps' -and $src -match 'kicker\?\s*:' -and $src -match 'title\?\s*:' -and $src -match 'body\?\s*:') {
  Warn "D8CardProps already includes kicker/title/body in this file. No changes made."
  Write-Host ""
  Write-Host "NEXT: npm run build" -ForegroundColor Yellow
  exit 0
}

# Replace an exported function D8Card(...) { ... } OR export const D8Card = (...) => ...
$replacement = @"
export type D8CardProps = React.PropsWithChildren<{
  kicker?: string;
  title?: string;
  body?: string;
}>;

export function D8Card({ kicker, title, body, children }: D8CardProps) {
  const hasProps = Boolean(kicker || title || body);

  return (
    <div
      style={{
        padding: 18,
        borderRadius: 20,
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.10)',
        boxShadow: '0 14px 48px rgba(0,0,0,0.30)',
      }}
    >
      {hasProps ? (
        <>
          {kicker ? (
            <div style={{ fontSize: 12, fontWeight: 900, letterSpacing: '.12em', opacity: 0.75, textTransform: 'uppercase' }}>
              {kicker}
            </div>
          ) : null}

          {title ? (
            <div style={{ marginTop: kicker ? 6 : 0, fontSize: 16, fontWeight: 950, letterSpacing: '-0.02em' }}>
              {title}
            </div>
          ) : null}

          {body ? (
            <div style={{ marginTop: 8, fontSize: 14, lineHeight: 1.6, opacity: 0.78 }}>
              {body}
            </div>
          ) : null}
        </>
      ) : (
        children
      )}
    </div>
  );
}
"@

$src2 = $src

# Try replace export function D8Card
$src2 = [regex]::Replace($src2, '(?s)export\s+function\s+D8Card\s*\([^)]*\)\s*\{.*?\n\}', $replacement, 1)

# If unchanged, try replace export const D8Card = ...
if ($src2 -eq $src) {
  $src2 = [regex]::Replace($src2, '(?s)export\s+const\s+D8Card\s*=\s*\([^)]*\)\s*=>\s*\{.*?\n\};', $replacement, 1)
}

if ($src2 -eq $src) {
  Fail "Could not auto-replace D8Card in the resolved file. Paste the D8Card definition from that file and I’ll generate an exact replacement."
}

WriteNoBom $target $src2
Ok "Upgraded the actual imported D8Card to support title/body/kicker props."

Write-Host ""
Write-Host "NEXT:" -ForegroundColor Yellow
Write-Host "  npm run build" -ForegroundColor Yellow
Write-Host "  git add -A" -ForegroundColor Yellow
Write-Host "  git commit -m ""feat(ui): upgrade D8Card to support title/body/kicker props (real import source)""" -ForegroundColor Yellow
Write-Host "  git push" -ForegroundColor Yellow
