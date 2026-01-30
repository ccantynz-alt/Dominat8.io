'use client';

import React from 'react';

export const SECTION_SHELL_STAMP = 'PHASE_D_LOCK_HOMEPAGE_2026-01-31' as const;

type Tone = 'dark' | 'panel';

type Props = React.PropsWithChildren<{
  id?: string;
  tone?: Tone;
  padY?: 'tight' | 'normal' | 'loose';
  maxWidth?: number; // px
  showDividerTop?: boolean;
  showDividerBottom?: boolean;
}>;

function py(padY: Props['padY']): string {
  if (padY === 'tight') return '48px';
  if (padY === 'loose') return '96px';
  return '72px';
}

function toneStyle(tone: Tone): React.CSSProperties {
  if (tone === 'panel') {
    return {
      background:
        'linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.03) 100%)',
      border: '1px solid rgba(255,255,255,0.10)',
      boxShadow: '0 18px 60px rgba(0,0,0,0.35)',
    };
  }
  return {
    background: 'transparent',
  };
}

export function SectionShell({
  id,
  tone = 'dark',
  padY = 'normal',
  maxWidth = 1120,
  showDividerTop,
  showDividerBottom,
  children,
}: Props) {
  return (
    <section id={id} style={{ position: 'relative', paddingTop: py(padY), paddingBottom: py(padY) }}>
      {showDividerTop ? (
        <div style={{ height: 1, background: 'rgba(255,255,255,0.10)', width: '100%' }} />
      ) : null}

      <div style={{ width: '100%', maxWidth, margin: '0 auto', paddingLeft: 16, paddingRight: 16 }}>
        <div
          style={{
            borderRadius: 22,
            padding: tone === 'panel' ? 22 : 0,
            ...toneStyle(tone),
          }}
        >
          {children}
        </div>
      </div>

      {showDividerBottom ? (
        <div style={{ height: 1, background: 'rgba(255,255,255,0.10)', width: '100%', marginTop: 40 }} />
      ) : null}
    </section>
  );
}