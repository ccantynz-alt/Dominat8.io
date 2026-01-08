"use client";

import { useRouter } from "next/navigation";
import { apiCreateProject } from "@/lib/customerFlowApi";
import { useState } from "react";

export default function AppDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onCreate() {
    setErr(null);
    setLoading(true);
    try {
      const data = await apiCreateProject();
      if (!data.ok || !data.projectId) throw new Error(data.error || "Failed to create project");
      router.push(`/app/create?projectId=${encodeURIComponent(data.projectId)}`);
    } catch (e: any) {
      setErr(e?.message || "Something went wrong");
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 820, margin: "40px auto", padding: 24 }}>
      <h1 style={{ fontSize: 40, margin: 0 }}>Create your website with AI</h1>
      <p style={{ fontSize: 18, opacity: 0.75, marginTop: 12 }}>
        Describe your business and we’ll build a complete website for you in under a minute.
      </p>

      <button
        onClick={onCreate}
        disabled={loading}
        style={{
          marginTop: 24,
          padding: "14px 18px",
          fontSize: 18,
          borderRadius: 12,
          border: "1px solid rgba(0,0,0,0.15)",
          cursor: loading ? "not-allowed" : "pointer",
        }}
      >
        {loading ? "Creating…" : "Create Website"}
      </button>

      <p style={{ marginTop: 12, opacity: 0.7 }}>No design or technical skills required.</p>

      {err && (
        <div style={{ marginTop: 16, padding: 12, border: "1px solid #f99", borderRadius: 10 }}>
          {err}
        </div>
      )}
    </div>
  );
}
