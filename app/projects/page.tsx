"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ProjectsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function onboard() {
      try {
        const res = await fetch("/api/onboarding", { method: "POST" });
        const text = await res.text();

        if (res.ok) {
          try {
            const data = JSON.parse(text);
            if (data?.projectId) {
              router.replace(`/projects/${data.projectId}`);
              return;
            }
          } catch {}
        }

        // Fallback: go to normal list if already onboarded
        router.replace("/projects/list");
      } catch {
        router.replace("/projects/list");
      }
    }

    onboard();
  }, [router]);

  return (
    <div style={{ fontFamily: "system-ui", padding: 32 }}>
      <h1>Preparing your website…</h1>
      <p style={{ opacity: 0.8 }}>
        We’re setting everything up automatically. This takes just a moment.
      </p>
    </div>
  );
}
