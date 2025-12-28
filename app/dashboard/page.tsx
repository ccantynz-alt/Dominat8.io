"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DashboardRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    async function go() {
      try {
        const res = await fetch("/api/projects", { cache: "no-store" });
        const json = await res.json();

        if (json?.ok && Array.isArray(json.projects) && json.projects.length > 0) {
          // Go to most recent project
          const last = json.projects[0];
          router.replace(`/dashboard/projects/${last.id}`);
          return;
        }
      } catch {
        // ignore
      }

      // No projects yet → show create screen
      router.replace("/dashboard?empty=1");
    }

    go();
  }, [router]);

  return (
    <div style={{ padding: 32 }}>
      Redirecting to your project…
    </div>
  );
}
