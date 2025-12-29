// app/dashboard/projects/create-project-form.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateProjectForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);

    const trimmed = name.trim();
    if (!trimmed) {
      setErr("Please enter a project name.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: trimmed }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.ok) {
        throw new Error(data?.error || "Failed to create project");
      }

      setName("");
      router.refresh();
      router.push(`/dashboard/projects/${data.project.id}`);
    } catch (e: any) {
      setErr(e?.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onCreate} style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="New project name"
        style={{
          padding: "10px 12px",
          borderRadius: 10,
          border: "1px solid #ddd",
          minWidth: 260,
        }}
      />
      <button
        type="submit"
        disabled={loading}
        style={{
          padding: "10px 14px",
          borderRadius: 10,
          border: "1px solid #ccc",
          cursor: loading ? "not-allowed" : "pointer",
          background: "white",
        }}
      >
        {loading ? "Creating..." : "Create"}
      </button>
      {err ? <span style={{ color: "crimson" }}>{err}</span> : null}
    </form>
  );
}
