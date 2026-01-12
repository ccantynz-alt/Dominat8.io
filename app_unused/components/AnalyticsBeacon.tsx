"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export default function AnalyticsBeacon({ projectId }: { projectId: string }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const path = searchParams?.toString()
      ? `${pathname}?${searchParams.toString()}`
      : pathname;

    const ref = document.referrer || "";

    // fire-and-forget
    fetch("/api/analytics/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId, path, ref }),
      keepalive: true,
    }).catch(() => {});
  }, [projectId, pathname, searchParams]);

  return null;
}
