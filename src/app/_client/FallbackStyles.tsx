'use client';
import React from 'react';

export const FALLBACK_STYLES_STAMP = 'D8_FALLBACKSTYLES_SAFE_REPLACE_20260131';

export default function FallbackStyles() {
  const css = 
/* ===== D8_POLISH_ALLPAGES_FALLBACK_v1_20260128 ===== */
:root{
  color-scheme: dark;
  --bg0:#070A12;
  --bg1:#0B1020;
  --ink:#EAF0FF;
  --muted:rgba(234,240,255,0.70);
  --line:rgba(255,255,255,0.10);
  --glass:rgba(255,255,255,0.06);
  --glass2:rgba(255,255,255,0.03);
  --accentA:#9D7BFF;
  --accentB:#2DE2E6;
}

html,body{
  background: radial-gradient(1200px 600px at 20% 10%, rgba(157,123,255,0.14), transparent 60%),
              radial-gradient(900px 500px at 85% 35%, rgba(45,226,230,0.12), transparent 55%),
              linear-gradient(180deg, var(--bg0), var(--bg1));
  color: var(--ink);
}

a{ color: inherit; }
*{ box-sizing: border-box; }

.d8-glass{
  background: linear-gradient(180deg, var(--glass), var(--glass2));
  border: 1px solid var(--line);
  box-shadow: 0 18px 60px rgba(0,0,0,0.40);
  border-radius: 22px;
}

.d8-muted{ color: var(--muted); }
.d8-line{ border-color: var(--line); }
;
  return <style dangerouslySetInnerHTML={{ __html: css }} />;
}