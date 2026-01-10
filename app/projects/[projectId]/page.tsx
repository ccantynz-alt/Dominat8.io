"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type Status = "loading" | "ready" | "error";

export default function ProjectBuilderPage() {
  const router = useRouter();
  const params = useParams();

  const projectId = useMemo(() => {
    const raw = params?.projectId;
    if (typeof raw === "string") return raw;
    if (Array.isArray(raw)) return raw[0];
    return null;
  }, [params]);

  const [status, setStatus] = useState<Status>("loading");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!projectId) {
      setStatus("error");
      return;
    }
    setStatus("ready");
  }, [projectId]);

  if (status === "loading") {
    return (
      <div style={{ padding: 24, fontFamily: "system-ui" }}>
        Loading project…
      </div>
    );
  }

  if (status === "error") {
    return (
      <div style={{ padding: 24, fontFamily: "system-ui" }}>
        <h1 style={{ margin: 0, fontSize: 20 }}>Invalid project</h1>
        <p style={{ marginTop: 12 }}>
          We couldn’t read the project id from the URL.
        </p>
        <button
          onClick={() => router.push("/projects")}
          style={{
            padding: "10px 14px",
            borderRadius: 10,
            border: "1px solid #ccc",
            background: "white",
            cursor: "pointer",
          }}
        >
          Back to projects
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: 24, fontFamily: "system-ui" }}>
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <h1 style={{ margin: 0, fontSize: 20 }}>Project Builder</h1>
        <span
          style={{
            padding: "4px 10px",
            borderRadius: 999,
            border: "1px solid #ddd",
            fontSize: 12,
          }}
        >
          {projectId}
        </span>
      </div>

      <p style={{ marginTop: 12 }}>
        Builder UI will render here. (Status: {status})
      </p>

      <button
        disabled={busy}
        onClick={() => setBusy(true)}
        style={{
          padding: "10px 14px",
          borderRadius: 10,
          border: "1px solid #ccc",
          background: busy ? "#f3f3f3" : "white",
          cursor: busy ? "not-allowed" : "pointer",
        }}
      >
        {busy ? "Working…" : "Test Button"}
      </button>
    </div>
  );
}
