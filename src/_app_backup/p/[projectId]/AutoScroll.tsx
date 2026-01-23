"use client";

import * as React from "react";

type Props = {
  /** Page slug like "pricing", "faq", etc. If undefined, do nothing. */
  slug?: string;
};

/**
 * AutoScroll
 * - Scrolls to an element with id={slug} if it exists
 * - Safe no-op if not found
 */
export default function AutoScroll({ slug }: Props) {
  React.useEffect(() => {
    if (!slug) return;

    // Wait a tick for the DOM to paint
    const t = window.setTimeout(() => {
      const el = document.getElementById(slug);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 50);

    return () => window.clearTimeout(t);
  }, [slug]);

  return null;
}
