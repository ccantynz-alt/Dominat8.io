/* ============================================================================
   D8 FALLBACK STYLES
   SAFE • CLOSED • FINAL
   DO NOT EDIT
============================================================================ */

export default function FallbackStyles() {
  const css = `
:root {
  color-scheme: dark;

  --bg0: #070A12;
  --bg1: #0B1020;
  --bg2: #11162A;

  --ink0: #E9ECF1;
  --ink1: #C9CEDA;
  --ink2: #9AA3B2;

  --brand0: #6CF2C2;
  --brand1: #4FD8A8;
  --brand2: #2FBF90;

  --danger: #FF6B6B;
  --warning: #FFD166;
  --ok: #4DFFA6;

  background-color: var(--bg0);
  color: var(--ink0);
}

*,
*::before,
*::after {
  box-sizing: border-box;
}

html,
body {
  margin: 0;
  padding: 0;
  background: var(--bg0);
  color: var(--ink0);
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
    Roboto, Helvetica, Arial, sans-serif;
}
`;
  return <style dangerouslySetInnerHTML={{ __html: css }} />;
}
