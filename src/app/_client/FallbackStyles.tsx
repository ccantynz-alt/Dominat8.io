"use client";

/**
 * D8_POLISH_ALLPAGES_FALLBACK_v1_20260128
 * Global fallback CSS so the app looks premium even if Tailwind fails to apply.
 * IMPORTANT: This is designed to be neutral and not change your intended UI when Tailwind works.
 */
export default function FallbackStyles() {
  const css = 
/* ===== D8_POLISH_ALLPAGES_FALLBACK_v1_20260128 ===== */
:root{
  color-scheme: dark;
  --bg0:#070A12;
  --bg1:#0B1020;
  --panel:#0F172A;
  --panel2:#0B1224;
  --text:#E7EEF9;
  --muted:#A6B3CC;
  --line:rgba(255,255,255,.10);
  --line2:rgba(255,255,255,.14);
  --accent:#60A5FA;
  --accent2:#22D3EE;
  --good:#34D399;
  --warn:#FBBF24;
  --bad:#F87171;
  --shadow: 0 10px 30px rgba(0,0,0,.45);
  --shadow2: 0 20px 60px rgba(0,0,0,.55);
  --r12: 12px;
  --r16: 16px;
  --r24: 24px;
  --max: 1200px;
  --pad: 24px;
  --font: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji","Segoe UI Emoji";
}

html, body {
  margin: 0;
  padding: 0;
  min-height: 100%;
  background: radial-gradient(1200px 700px at 20% 0%, rgba(96,165,250,.18), transparent 60%),
              radial-gradient(900px 600px at 85% 20%, rgba(34,211,238,.12), transparent 55%),
              linear-gradient(180deg, var(--bg0), var(--bg1));
  color: var(--text);
  font-family: var(--font);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

* { box-sizing: border-box; }

a { color: var(--accent); text-decoration: none; }
a:hover { text-decoration: underline; }

img { max-width: 100%; height: auto; }

code, pre {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
}

hr { border: 0; border-top: 1px solid var(--line); margin: 24px 0; }

/* Containers */
.d8-container{
  width: 100%;
  max-width: var(--max);
  margin: 0 auto;
  padding-left: var(--pad);
  padding-right: var(--pad);
}

/* Panels / cards */
.d8-card{
  background: linear-gradient(180deg, rgba(255,255,255,.06), rgba(255,255,255,.03));
  border: 1px solid var(--line);
  border-radius: var(--r16);
  box-shadow: var(--shadow);
  backdrop-filter: blur(10px);
}
.d8-card2{
  background: linear-gradient(180deg, rgba(15,23,42,.85), rgba(11,18,36,.85));
  border: 1px solid var(--line);
  border-radius: var(--r16);
  box-shadow: var(--shadow);
}

/* Typography */
h1,h2,h3,h4 { margin: 0 0 10px 0; letter-spacing: -0.02em; }
p { margin: 0 0 12px 0; color: var(--muted); line-height: 1.6; }

/* Buttons */
button, .d8-btn, input[type="button"], input[type="submit"]{
  font-family: var(--font);
}
.d8-btn{
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  border-radius: 999px;
  padding: 12px 16px;
  border: 1px solid var(--line2);
  background: linear-gradient(180deg, rgba(96,165,250,.22), rgba(96,165,250,.10));
  color: var(--text);
  box-shadow: 0 10px 25px rgba(0,0,0,.35);
  cursor: pointer;
  user-select: none;
}
.d8-btn:hover{ filter: brightness(1.05); }
.d8-btn:active{ transform: translateY(1px); }
.d8-btn.secondary{
  background: linear-gradient(180deg, rgba(255,255,255,.08), rgba(255,255,255,.04));
}

/* Inputs */
input, select, textarea{
  width: 100%;
  background: rgba(255,255,255,.06);
  color: var(--text);
  border: 1px solid var(--line);
  border-radius: 12px;
  padding: 12px 12px;
  outline: none;
}
input:focus, select:focus, textarea:focus{
  border-color: rgba(96,165,250,.55);
  box-shadow: 0 0 0 4px rgba(96,165,250,.12);
}

/* Tables */
table{
  width: 100%;
  border-collapse: collapse;
  border: 1px solid var(--line);
  background: rgba(255,255,255,.03);
  border-radius: 12px;
  overflow: hidden;
}
th, td{
  padding: 10px 12px;
  border-bottom: 1px solid var(--line);
  color: var(--text);
}
th{ color: var(--muted); font-weight: 600; text-transform: none; }

/* Badges */
.d8-badge{
  display:inline-flex;
  align-items:center;
  gap:8px;
  padding:6px 10px;
  border-radius:999px;
  border:1px solid var(--line);
  background: rgba(255,255,255,.04);
  color: var(--muted);
}

/* Layout helpers */
.d8-shell{
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
.d8-main{
  flex: 1;
  width: 100%;
}
.d8-topbar-fallback{
  position: sticky;
  top: 0;
  z-index: 50;
  background: rgba(7,10,18,.65);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--line);
}
/* ===== end ===== */
  .trim();

  return (
    <>
      {/* D8_POLISH_ALLPAGES_FALLBACK_v1_20260128 */}
      <style dangerouslySetInnerHTML={{ __html: css }} />
    </>
  );
}