"use client";

import { useState } from "react";

export default function PublishButton({ projectId }: { projectId: string }) {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  return (
    <div>
      <button
        disabled={loading}
        onClick={async () => {
          setLoading(true);
          setMsg(null);

          try {
            const res = await fetch(`/api/projects/${projectId}/publish`, {
              method: "POST",
              headers: { "content-type": "application/json" },
              body: JSON.stringify({}),
            });

            const text = await res.text();
            let data: any = null;

            try {
              data = JSON.parse(text);
            } catch {
              throw new Error(`Non-JSON response (status ${res.status}). First 120 chars: ${text.slice(0, 120)}`);
            }

            if (!res.ok || !data?.ok) {
              throw new Error(data?.error || `Publish failed (status ${res.status})`);
            }

            setMsg("Published ✅");
          } catch (e: any) {
            setMsg(e?.message || "Publish failed");
          } finally {
            setLoading(false);
          }
        }}
      >
        {loading ? "Publishing..." : "Publish project"}
      </button>

      {msg ? <p style={{ marginTop: 10 }}>{msg}</p> : null}
    </div>
  );
}
