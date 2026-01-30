.\UPGRADE_2026-01-31_DXL_DESIGN_ARCH_PHASE_B.ps1
# UPGRADE_2026-01-31_DXL_DESIGN_ARCH_PHASE_B.ps1
# Dominat8 — DXL Design Architecture Phase B
# SAFE: adds design-system architecture only (no UI wiring, no behavior change)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Ok($m){ Write-Host "[OK]  $m" -ForegroundColor Green }
function Warn($m){ Write-Host "[WARN] $m" -ForegroundColor Yellow }

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

$STAMP = "DXL_DESIGN_ARCH_PHASE_B_2026-01-31"

# --- Paths ---
$files = @(
  "src/design/tokens.ts",
  "src/design/cssVars.ts",
  "src/design/runtime.ts",
  "src/design/index.ts",

  "src/ui/cn.ts",
  "src/ui/primitives/Container.tsx",
  "src/ui/primitives/Stack.tsx",
  "src/ui/primitives/Section.tsx",
  "src/ui/primitives/Text.tsx",
  "src/ui/primitives/Button.tsx",
  "src/ui/index.ts",

  "src/app/_client/DxlProvider.tsx",

  "docs/DESIGN_ARCHITECTURE.md"
)

foreach($p in $files){ Backup-IfExists $p }

# --- src/design/tokens.ts ---
$tokens = @"
export const DESIGN_TOKENS_STAMP = '$STAMP' as const;

/**
 * Design tokens:
 * - These are the single source of truth for spacing/type/radius/shadow/colors.
 * - Phase B installs architecture ONLY: nothing is wired into UI yet.
 * - When we "turn it on", we map these tokens to CSS variables + primitives.
 */

export type SpaceToken =
  | '0' | '1' | '2' | '3' | '4' | '6' | '8' | '10' | '12' | '16' | '20' | '24' | '32' | '40' | '48' | '64';

export type RadiusToken = '0' | '6' | '10' | '14' | '18' | '24' | '32';

export type FontSizeToken =
  | 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl';

export interface DesignTokens {
  space: Record<SpaceToken, number>;     // px
  radius: Record<RadiusToken, number>;   // px
  fontSize: Record<FontSizeToken, number>; // px
  lineHeight: Record<FontSizeToken, number>; // unitless
  maxWidth: {
    content: number; // px
  };
  shadow: {
    soft: string;
    medium: string;
  };
  color: {
    bg: string;
    fg: string;
    muted: string;
    border: string;
    brand: string;
    brand2: string;
  };
}

export const DEFAULT_TOKENS: DesignTokens = {
  space: {
    '0': 0, '1': 4, '2': 8, '3': 12, '4': 16, '6': 24, '8': 32, '10': 40, '12': 48,
    '16': 64, '20': 80, '24': 96, '32': 128, '40': 160, '48': 192, '64': 256,
  },
  radius: { '0': 0, '6': 6, '10': 10, '14': 14, '18': 18, '24': 24, '32': 32 },
  fontSize: { xs: 12, sm: 14, base: 16, lg: 18, xl: 20, '2xl': 24, '3xl': 30, '4xl': 36, '5xl': 48 },
  lineHeight: { xs: 1.4, sm: 1.5, base: 1.6, lg: 1.6, xl: 1.4, '2xl': 1.25, '3xl': 1.15, '4xl': 1.1, '5xl': 1.05 },
  maxWidth: { content: 1120 },
  shadow: {
    soft: '0 8px 30px rgba(0,0,0,0.25)',
    medium: '0 12px 40px rgba(0,0,0,0.35)',
  },
  color: {
    bg: '#000000',
    fg: '#ffffff',
    muted: 'rgba(255,255,255,0.72)',
    border: 'rgba(255,255,255,0.12)',
    brand: '#9d7bff',
    brand2: '#2de2e6',
  },
};
"@

# --- src/design/cssVars.ts ---
$cssVars = @"
import type { DesignTokens } from './tokens';
import { DEFAULT_TOKENS } from './tokens';

export const DESIGN_CSSVARS_STAMP = '$STAMP' as const;

export function tokensToCssVars(tokens: DesignTokens = DEFAULT_TOKENS): Record<string, string> {
  const out: Record<string, string> = {};

  // spacing
  (Object.keys(tokens.space) as Array<keyof DesignTokens['space']>).forEach((k) => {
    out[`--dxl-space-${k}`] = `${tokens.space[k]}px`;
  });

  // radius
  (Object.keys(tokens.radius) as Array<keyof DesignTokens['radius']>).forEach((k) => {
    out[`--dxl-radius-${k}`] = `${tokens.radius[k]}px`;
  });

  // type
  (Object.keys(tokens.fontSize) as Array<keyof DesignTokens['fontSize']>).forEach((k) => {
    out[`--dxl-font-${k}`] = `${tokens.fontSize[k]}px`;
    out[`--dxl-lh-${k}`] = `${tokens.lineHeight[k]}`;
  });

  // layout
  out['--dxl-max-content'] = `${tokens.maxWidth.content}px`;

  // shadows
  out['--dxl-shadow-soft'] = tokens.shadow.soft;
  out['--dxl-shadow-medium'] = tokens.shadow.medium;

  // colors
  out['--dxl-bg'] = tokens.color.bg;
  out['--dxl-fg'] = tokens.color.fg;
  out['--dxl-muted'] = tokens.color.muted;
  out['--dxl-border'] = tokens.color.border;
  out['--dxl-brand'] = tokens.color.brand;
  out['--dxl-brand2'] = tokens.color.brand2;

  return out;
}

export function cssVarsToStyle(vars: Record<string, string>): Record<string, string> {
  // React style object compatible
  return vars;
}

export function buildCssVarStyle(tokens?: DesignTokens): Record<string, string> {
  return cssVarsToStyle(tokensToCssVars(tokens ?? DEFAULT_TOKENS));
}
"@

# --- src/design/runtime.ts ---
$runtime = @"
import type { DesignTokens } from './tokens';
import { DEFAULT_TOKENS } from './tokens';
import { buildCssVarStyle } from './cssVars';

export const DESIGN_RUNTIME_STAMP = '$STAMP' as const;

export interface DesignRuntime {
  tokens: DesignTokens;
  style: Record<string, string>;
}

export function createDesignRuntime(tokens: DesignTokens = DEFAULT_TOKENS): DesignRuntime {
  return {
    tokens,
    style: buildCssVarStyle(tokens),
  };
}
"@

# --- src/design/index.ts ---
$designIndex = @"
export * from './tokens';
export * from './cssVars';
export * from './runtime';
"@

# --- src/ui/cn.ts (minimal class joiner; safe even if you don’t use it) ---
$cn = @"
export const UI_CN_STAMP = '$STAMP' as const;

export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}
"@

# --- UI primitives: architecture only (do not change existing pages until you opt-in) ---
$container = @"
import React from 'react';

export const DXL_CONTAINER_STAMP = '$STAMP' as const;

type Props = React.HTMLAttributes<HTMLDivElement> & {
  max?: 'content' | 'wide' | 'full';
};

export function Container({ max = 'content', style, ...rest }: Props) {
  const maxWidth =
    max === 'full' ? '100%' :
    max === 'wide' ? '1280px' :
    'var(--dxl-max-content, 1120px)';

  return (
    <div
      {...rest}
      style={{
        width: '100%',
        maxWidth,
        marginLeft: 'auto',
        marginRight: 'auto',
        paddingLeft: 'var(--dxl-space-4, 16px)',
        paddingRight: 'var(--dxl-space-4, 16px)',
        ...style,
      }}
    />
  );
}
"@

$stack = @"
import React from 'react';

export const DXL_STACK_STAMP = '$STAMP' as const;

type Props = React.HTMLAttributes<HTMLDivElement> & {
  gap?: string; // css value (ex: 'var(--dxl-space-6)')
  align?: React.CSSProperties['alignItems'];
  justify?: React.CSSProperties['justifyContent'];
};

export function Stack({ gap = 'var(--dxl-space-4, 16px)', align, justify, style, ...rest }: Props) {
  return (
    <div
      {...rest}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap,
        alignItems: align,
        justifyContent: justify,
        ...style,
      }}
    />
  );
}
"@

$section = @"
import React from 'react';

export const DXL_SECTION_STAMP = '$STAMP' as const;

type Props = React.HTMLAttributes<HTMLElement> & {
  padY?: 'tight' | 'normal' | 'loose';
};

export function Section({ padY = 'normal', style, ...rest }: Props) {
  const py =
    padY === 'tight' ? 'var(--dxl-space-10, 40px)' :
    padY === 'loose' ? 'var(--dxl-space-20, 80px)' :
    'var(--dxl-space-16, 64px)';

  return (
    <section
      {...rest}
      style={{
        paddingTop: py,
        paddingBottom: py,
        ...style,
      }}
    />
  );
}
"@

$text = @"
import React from 'react';

export const DXL_TEXT_STAMP = '$STAMP' as const;

type Props = React.HTMLAttributes<HTMLElement> & {
  as?: 'p' | 'span' | 'div';
  size?: 'sm' | 'base' | 'lg';
  tone?: 'fg' | 'muted';
};

export function Text({ as = 'p', size = 'base', tone = 'fg', style, ...rest }: Props) {
  const Comp: any = as;
  const fontSize =
    size === 'sm' ? 'var(--dxl-font-sm, 14px)' :
    size === 'lg' ? 'var(--dxl-font-lg, 18px)' :
    'var(--dxl-font-base, 16px)';

  const color =
    tone === 'muted' ? 'var(--dxl-muted, rgba(255,255,255,0.72))' :
    'var(--dxl-fg, #fff)';

  return (
    <Comp
      {...rest}
      style={{
        fontSize,
        lineHeight: 'var(--dxl-lh-base, 1.6)',
        color,
        margin: 0,
        ...style,
      }}
    />
  );
}
"@

$button = @"
import React from 'react';

export const DXL_BUTTON_STAMP = '$STAMP' as const;

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'ghost';
};

export function Button({ variant = 'primary', style, ...rest }: Props) {
  const base: React.CSSProperties = {
    borderRadius: 'var(--dxl-radius-14, 14px)',
    padding: '12px 16px',
    fontSize: 'var(--dxl-font-base, 16px)',
    lineHeight: 'var(--dxl-lh-base, 1.6)',
    border: '1px solid var(--dxl-border, rgba(255,255,255,0.12))',
    cursor: 'pointer',
    background: 'transparent',
    color: 'var(--dxl-fg, #fff)',
  };

  const v: React.CSSProperties =
    variant === 'primary'
      ? {
          background: 'linear-gradient(135deg, var(--dxl-brand, #9d7bff), var(--dxl-brand2, #2de2e6))',
          border: '1px solid rgba(255,255,255,0.18)',
          boxShadow: 'var(--dxl-shadow-soft, 0 8px 30px rgba(0,0,0,0.25))',
          color: '#0b0b0f',
          fontWeight: 700,
        }
      : {
          background: 'transparent',
          color: 'var(--dxl-fg, #fff)',
        };

  return <button {...rest} style={{ ...base, ...v, ...style }} />;
}
"@

$uiIndex = @"
export * from './cn';
export * from './primitives/Container';
export * from './primitives/Stack';
export * from './primitives/Section';
export * from './primitives/Text';
export * from './primitives/Button';
"@

# --- DxlProvider (NOT wired in yet; optional future step) ---
$provider = @"
'use client';

import React from 'react';
import { createDesignRuntime } from '../../design/runtime';

export const DXL_PROVIDER_STAMP = '$STAMP' as const;

/**
 * Phase B: installed but NOT used anywhere by default.
 * Turning it on later is a single import + wrapper in your root layout.
 */
export function DxlProvider({ children }: { children: React.ReactNode }) {
  const rt = React.useMemo(() => createDesignRuntime(), []);
  return (
    <div style={rt.style as any}>
      {children}
    </div>
  );
}
"@

$docs = @"
# Design Architecture (DXL) — Phase B

STAMP: $STAMP

## Goal

Install a **design-system spine** (tokens → css vars → primitives) without changing what users see today.

Phase B is **architecture-only**:
- No UI wiring
- No page rewrites
- No behavioral changes
- Safe to deploy immediately

## What was added

### Design system
- `src/design/tokens.ts` — single source of truth
- `src/design/cssVars.ts` — token → CSS variable mapping
- `src/design/runtime.ts` — runtime bundle (tokens + style)

### UI primitives
- `src/ui/primitives/*` — Container, Stack, Section, Text, Button
- Uses **inline style** defaults so it does not depend on Tailwind to render.

### Provider (optional)
- `src/app/_client/DxlProvider.tsx`
- Not wired. When enabled, it injects CSS variables via inline style on a wrapper.

## Next

Phase C (opt-in rollout):
- Wrap root layout with `<DxlProvider>`
- Convert ONE section at a time (hero first)
- Confirm "no visible change" baseline, then apply deliberate improvements
"@

# --- Write files ---
Write-Utf8NoBom "src/design/tokens.ts" $tokens
Write-Utf8NoBom "src/design/cssVars.ts" $cssVars
Write-Utf8NoBom "src/design/runtime.ts" $runtime
Write-Utf8NoBom "src/design/index.ts" $designIndex

Write-Utf8NoBom "src/ui/cn.ts" $cn
Write-Utf8NoBom "src/ui/primitives/Container.tsx" $container
Write-Utf8NoBom "src/ui/primitives/Stack.tsx" $stack
Write-Utf8NoBom "src/ui/primitives/Section.tsx" $section
Write-Utf8NoBom "src/ui/primitives/Text.tsx" $text
Write-Utf8NoBom "src/ui/primitives/Button.tsx" $button
Write-Utf8NoBom "src/ui/index.ts" $uiIndex

Write-Utf8NoBom "src/app/_client/DxlProvider.tsx" $provider

Write-Utf8NoBom "docs/DESIGN_ARCHITECTURE.md" $docs

Ok "DONE: $STAMP"
Ok "Installed: design tokens + css vars + UI primitives + optional provider (not wired)"
Warn "No visible UI changes expected (Phase B is architecture-only)."

Write-Host ""
Write-Host "NEXT (copy/paste):" -ForegroundColor Yellow
Write-Host "  git add -A" -ForegroundColor Yellow
Write-Host "  git commit -m ""chore(design): install DXL design architecture spine (phase b)""" -ForegroundColor Yellow
Write-Host "  git push" -ForegroundColor Yellow
