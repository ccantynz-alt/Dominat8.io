# UPGRADE_2026-01-31_DXL_DESIGN_ARCH_PHASE_C.ps1
# Dominat8 — DXL Design Architecture Phase C
# C1: Wire DxlProvider globally (should be NO visible change)
# C2: Convert homepage hero to primitives (architecture-driven; keeps layout intent)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Ok($m){ Write-Host "[OK]  $m" -ForegroundColor Green }
function Warn($m){ Write-Host "[WARN] $m" -ForegroundColor Yellow }
function Fail($m){ Write-Host "[FAIL] $m" -ForegroundColor Red; throw $m }

function Write-Utf8NoBom {
  param([Parameter(Mandatory=$true)][string]$Path,[Parameter(Mandatory=$true)][string]$Content)
  $enc = New-Object System.Text.UTF8Encoding($false)
  $dir = Split-Path -Parent $Path
  if ($dir -and !(Test-Path -LiteralPath $dir)) { New-Item -ItemType Directory -Path $dir -Force | Out-Null }
  [System.IO.File]::WriteAllText($Path, $Content, $enc)
}

function Backup-IfExists {
  param([Parameter(Mandatory=$true)][string]$Path)
  if (Test-Path -LiteralPath $Path) {
    $stamp = Get-Date -Format "yyyyMMdd_HHmmss"
    $bak = "$Path.bak_$stamp"
    Copy-Item -LiteralPath $Path -Destination $bak -Force
    Ok "Backup: $bak"
  }
}

function Read-Text {
  param([Parameter(Mandatory=$true)][string]$Path)
  if (!(Test-Path -LiteralPath $Path)) { Fail "Missing file: $Path" }
  return [System.IO.File]::ReadAllText($Path, (New-Object System.Text.UTF8Encoding($false)))
}

$STAMP = "DXL_DESIGN_ARCH_PHASE_C_2026-01-31"

# --- Locate likely root layout (App Router) ---
$layoutCandidates = @(
  "src/app/layout.tsx",
  "src/app/layout.jsx",
  "app/layout.tsx",
  "app/layout.jsx"
)

$layoutPath = $null
foreach($c in $layoutCandidates){
  if (Test-Path -LiteralPath $c) { $layoutPath = $c; break }
}

if (-not $layoutPath) {
  Fail "Could not find app layout. Looked for: $($layoutCandidates -join ', ')"
}

Backup-IfExists $layoutPath

# --- Wire DxlProvider into layout (C1) ---
$layout = Read-Text $layoutPath

if ($layout -match "DxlProvider") {
  Warn "DxlProvider already referenced in layout. Skipping C1 import/wrap."
} else {
  # Add import near top (best-effort)
  if ($layout -match "^(import .+;\s*)+" ) {
    $layout = $layout -replace "^(import .+;\s*)+", ("$0" + "import { DxlProvider } from './_client/DxlProvider';`n")
  } else {
    $layout = "import { DxlProvider } from './_client/DxlProvider';`n" + $layout
  }

  # Wrap existing body content with DxlProvider:
  # Replace: <body ...>   ... </body>
  # With:    <body ...><DxlProvider> ... </DxlProvider></body>
  if ($layout -match "<body[^>]*>") {
    $layout = $layout -replace "<body([^>]*)>", "<body$1>`n        <DxlProvider>"
    $layout = $layout -replace "</body>", "        </DxlProvider>`n      </body>"
  } else {
    Warn "No <body> tag found in layout. Not wrapping. You may be using a custom layout structure."
  }

  Write-Utf8NoBom $layoutPath $layout
  Ok "C1: Wired DxlProvider into $layoutPath (should be no visible change)"
}

# --- Convert homepage hero to primitives (C2) ---
# We will ONLY touch src/app/page.tsx if it exists.
$pageCandidates = @(
  "src/app/page.tsx",
  "src/app/page.jsx",
  "app/page.tsx",
  "app/page.jsx"
)

$pagePath = $null
foreach($c in $pageCandidates){
  if (Test-Path -LiteralPath $c) { $pagePath = $c; break }
}

if (-not $pagePath) {
  Warn "No app page found (homepage). Skipping C2 hero conversion."
} else {
  Backup-IfExists $pagePath

  # We will replace the page with a safe wrapper that uses your existing HomeClient if present.
  # If HomeClient exists, we keep it to avoid UI drift.
  # If not, we render a minimal hero using primitives (still safe).
  $homeClientCandidates = @(
    "src/app/_client/HomeClient.tsx",
    "src/app/_client/HomeClient.jsx"
  )
  $homeClientPath = $null
  foreach($hc in $homeClientCandidates){
    if (Test-Path -LiteralPath $hc) { $homeClientPath = $hc; break }
  }

  if ($homeClientPath) {
    # Minimal change: keep existing UI, but introduce primitives wrapper above it
    $pageNew = @"
import React from 'react';
import HomeClient from './_client/HomeClient';
import { Section, Container } from '../ui';

export const PAGE_STAMP = '$STAMP';

export default function Page() {
  return (
    <Section padY="normal">
      <Container max="full" style={{ paddingLeft: 0, paddingRight: 0 }}>
        <HomeClient />
      </Container>
    </Section>
  );
}
"@
    # Ensure correct relative import for ui/index.ts
    # page.tsx lives at src/app/page.tsx, so ui is at src/ui => import {..} from '../ui'
    Write-Utf8NoBom $pagePath $pageNew
    Ok "C2: Wrapped existing HomeClient with primitives (no intent to change look)"
  } else {
    # No HomeClient; create a basic hero that proves primitives work
    $pageNew = @"
import React from 'react';
import { Section, Container, Stack, Text, Button } from '../ui';

export const PAGE_STAMP = '$STAMP';

export default function Page() {
  return (
    <div style={{ background: 'var(--dxl-bg, #000)', color: 'var(--dxl-fg, #fff)' }}>
      <Section padY="loose">
        <Container>
          <Stack gap="var(--dxl-space-6, 24px)">
            <div>
              <div style={{ fontSize: 'var(--dxl-font-sm, 14px)', color: 'var(--dxl-muted, rgba(255,255,255,0.72))', marginBottom: '8px' }}>
                DOMINAT8 • SHOWPIECE
              </div>
              <div style={{ fontSize: 'var(--dxl-font-5xl, 48px)', lineHeight: 'var(--dxl-lh-5xl, 1.05)', fontWeight: 800, letterSpacing: '-0.02em' }}>
                This is how websites are made now.
              </div>
            </div>

            <Text tone="muted" style={{ maxWidth: '720px' }}>
              Describe your business. Dominat8 assembles a real, publishable website — structure, pages, SEO, and clean URLs — without the tech headache.
            </Text>

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <Button>Build my site</Button>
              <Button variant="ghost">View pricing</Button>
            </div>

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', paddingTop: '10px' }}>
              <div style={{ padding: '8px 10px', border: '1px solid var(--dxl-border, rgba(255,255,255,0.12))', borderRadius: 'var(--dxl-radius-14, 14px)' }}>No templates</div>
              <div style={{ padding: '8px 10px', border: '1px solid var(--dxl-border, rgba(255,255,255,0.12))', borderRadius: 'var(--dxl-radius-14, 14px)' }}>No setup</div>
              <div style={{ padding: '8px 10px', border: '1px solid var(--dxl-border, rgba(255,255,255,0.12))', borderRadius: 'var(--dxl-radius-14, 14px)' }}>Publish-ready</div>
              <div style={{ padding: '8px 10px', border: '1px solid var(--dxl-border, rgba(255,255,255,0.12))', borderRadius: 'var(--dxl-radius-14, 14px)' }}>SEO fundamentals</div>
            </div>
          </Stack>
        </Container>
      </Section>
    </div>
  );
}
"@
    Write-Utf8NoBom $pagePath $pageNew
    Ok "C2: Installed minimal primitives-based hero (since HomeClient not found)"
  }
}

Ok "DONE: $STAMP"
Write-Host ""
Write-Host "VERIFY (copy/paste):" -ForegroundColor Yellow
Write-Host "  Test-Path -LiteralPath `"$layoutPath`"" -ForegroundColor Yellow
if ($pagePath) { Write-Host "  Test-Path -LiteralPath `"$pagePath`"" -ForegroundColor Yellow }

Write-Host ""
Write-Host "NEXT (copy/paste):" -ForegroundColor Yellow
Write-Host "  git add -A" -ForegroundColor Yellow
Write-Host "  git commit -m ""chore(design): wire DXL provider + begin primitives rollout (phase c)""" -ForegroundColor Yellow
Write-Host "  git push" -ForegroundColor Yellow
