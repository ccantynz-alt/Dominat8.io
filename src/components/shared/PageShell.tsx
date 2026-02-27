"use client";

import { SiteNav } from "./SiteNav";
import { SiteFooter } from "./SiteFooter";

interface PageShellProps {
  children: React.ReactNode;
  /** Extra top padding to clear the fixed nav (default: 72px) */
  padTop?: number;
}

export function PageShell({ children, padTop = 72 }: PageShellProps) {
  return (
    <div style={{ minHeight: "100vh", background: "#08070B", color: "#F5F0EB" }}>
      <SiteNav />
      <div style={{ paddingTop: padTop }}>{children}</div>
      <SiteFooter />
    </div>
  );
}
