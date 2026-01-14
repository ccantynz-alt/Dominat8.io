cat > src/app/p/[projectId]/AutoScroll.tsx <<'EOF'
// src/app/p/[projectId]/AutoScroll.tsx
"use client";

import * as React from "react";

export default function AutoScroll({ targetId }: { targetId: string | null }) {
  React.useEffect(() => {
    if (!targetId) return;

    // Give the page a moment to render
    const t = setTimeout(() => {
      const el = document.getElementById(targetId);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 50);

    return () => clearTimeout(t);
  }, [targetId]);

  return null;
}
EOF
