# UPGRADE_2026-01-31_PHASE_E_LOCK_NAV_FOOTER.ps1
# Dominat8 — PHASE E: Lock Nav + Footer to match homepage
# No backend, no Tailwind dependency

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Ok($m){ Write-Host "[OK]  $m" -ForegroundColor Green }
function Backup($p){
  if (Test-Path $p) {
    Copy-Item $p "$p.bak_$(Get-Date -Format yyyyMMdd_HHmmss)"
  }
}

function WriteNoBom($p,$c){
  $d = Split-Path -Parent $p
  if ($d -and !(Test-Path $d)) { New-Item -ItemType Directory -Path $d -Force | Out-Null }
  [IO.File]::WriteAllText($p,$c,(New-Object Text.UTF8Encoding $false))
}

$STAMP = "PHASE_E_LOCK_NAV_FOOTER_2026-01-31"

$navPath = "src/ui/layout/AppNav.tsx"
$footerPath = "src/ui/layout/AppFooter.tsx"
$pagePath = "src/app/page.tsx"

Backup $pagePath

# --- AppNav.tsx ---
$nav = @"
'use client';
import React from 'react';

export function AppNav() {
  return (
    <div style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      backdropFilter: 'blur(10px)',
      background: 'rgba(7,7,11,0.65)',
      borderBottom: '1px solid rgba(255,255,255,0.08)'
    }}>
      <div style={{
        maxWidth: 1180,
        margin: '0 auto',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ fontWeight: 950, letterSpacing: '-0.02em' }}>
          Dominat8
        </div>

        <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
          <a href="/pricing" style={{ color: 'rgba(255,255,255,0.75)', textDecoration: 'none', fontWeight: 600 }}>
            Pricing
          </a>
          <a href="/templates" style={{
            padding: '10px 14px',
            borderRadius: 14,
            background: 'linear-gradient(135deg, rgba(157,123,255,1), rgba(45,226,230,1))',
            color: '#0b0b0f',
            fontWeight: 900,
            textDecoration: 'none'
          }}>
            Build my site
          </a>
        </div>
      </div>
    </div>
  );
}
"@

WriteNoBom $navPath $nav
Ok "Wrote AppNav"

# --- AppFooter.tsx ---
$footer = @"
'use client';
import React from 'react';

export function AppFooter() {
  return (
    <footer style={{
      marginTop: 80,
      borderTop: '1px solid rgba(255,255,255,0.10)',
      background: 'rgba(7,7,11,0.9)'
    }}>
      <div style={{
        maxWidth: 1180,
        margin: '0 auto',
        padding: '32px 16px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 24
      }}>
        <div>
          <div style={{ fontWeight: 950, marginBottom: 8 }}>Dominat8</div>
          <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: 14 }}>
            AI website builder for fast, confident launches.
          </div>
        </div>

        <div>
          <div style={{ fontWeight: 800, marginBottom: 8 }}>Product</div>
          <div><a href="/templates" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>Templates</a></div>
          <div><a href="/pricing" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>Pricing</a></div>
        </div>

        <div>
          <div style={{ fontWeight: 800, marginBottom: 8 }}>Company</div>
          <div style={{ color: 'rgba(255,255,255,0.7)' }}>About</div>
          <div style={{ color: 'rgba(255,255,255,0.7)' }}>Contact</div>
        </div>

        <div>
          <div style={{ fontWeight: 800, marginBottom: 8 }}>Legal</div>
          <div style={{ color: 'rgba(255,255,255,0.7)' }}>Privacy</div>
          <div style={{ color: 'rgba(255,255,255,0.7)' }}>Terms</div>
        </div>
      </div>

      <div style={{
        padding: '12px 16px',
        textAlign: 'center',
        color: 'rgba(255,255,255,0.55)',
        fontSize: 13
      }}>
        © {new Date().getFullYear()} Dominat8
      </div>
    </footer>
  );
}
"@

WriteNoBom $footerPath $footer
Ok "Wrote AppFooter"

# --- Wrap homepage ---
$src = Get-Content $pagePath -Raw
$src = $src -replace '^','import { AppNav } from "../ui/layout/AppNav";`nimport { AppFooter } from "../ui/layout/AppFooter";`n'
$src = $src -replace '<HomeClient\s*/>','<AppNav />`n<HomeClient />`n<AppFooter />'

WriteNoBom $pagePath $src
Ok "Wrapped homepage with nav + footer"

Ok "DONE: $STAMP"
Write-Host ""
Write-Host "NEXT:" -ForegroundColor Yellow
Write-Host "  npm run dev" -ForegroundColor Yellow
Write-Host "  git add -A" -ForegroundColor Yellow
Write-Host "  git commit -m ""feat(layout): lock nav and footer (phase e)""" -ForegroundColor Yellow
Write-Host "  git push" -ForegroundColor Yellow
