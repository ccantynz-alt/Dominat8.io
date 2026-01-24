"use client";

import React from "react";
import { usePathname } from "next/navigation";

/**
 * HeaderRevealOnScroll
 * - On home ("/"): header is hidden until user scrolls past threshold, then appears fixed (overlay).
 * - On other routes: header is visible immediately.
 * - On other routes: a spacer is added so content isn't covered by the fixed header.
 */
export default function HeaderRevealOnScroll({
  children,
  thresholdPx = 24,
  spacerHeightPx = 72,
}: {
  children: React.ReactNode;
  thresholdPx?: number;
  spacerHeightPx?: number;
}) {
  const pathname = usePathname();
  const isHome = pathname === "/";

  const [visible, setVisible] = React.useState(!isHome);

  React.useEffect(() => {
    if (!isHome) {
      setVisible(true);
      return;
    }

    const onScroll = () => {
      const y = window.scrollY || 0;
      setVisible(y > thresholdPx);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isHome, thresholdPx]);

  return (
    <>
      {/* Fixed overlay header (does NOT take document flow space) */}
      <div
        className={[
          "fixed inset-x-0 top-0 z-[90] transition-all duration-500 ease-out",
          visible ? "translate-y-0 opacity-100 pointer-events-auto" : "-translate-y-6 opacity-0 pointer-events-none",
        ].join(" ")}
      >
        {/* Keep your existing header styles intact; just add an overlay surface */}
        <div className="border-b border-black/10 bg-white/80 backdrop-blur-md">
          {children}
        </div>
      </div>

      {/* Spacer only on non-home routes so content isn't hidden under the fixed header */}
      {!isHome && <div style={{ height: spacerHeightPx }} />}
    </>
  );
}
