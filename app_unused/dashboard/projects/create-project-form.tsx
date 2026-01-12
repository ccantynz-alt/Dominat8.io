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

      // Read raw text first (so we can show HTML/empty bodies too)
      const rawText = await res.text();

      // Try JSON parse, but don't require it
      let data: any = null;
      try {
        data = rawText ? JSON.parse(rawText) : null;
      } catch {
        data = null;
      }

      if (!res.ok || !data?.ok) {
        const msg =
          data?.error ||
          data?.message ||
          (rawText ? rawText.slice(0, 500) : "") ||
          `HTTP ${res.status}`;

        throw new Error(
          [
            "Create project failed.",
            `HTTP ${res.status}`,
            "",
            "Response:",
            msg,
          ].join("\n")
        );
      }

      setName("");
      router.refresh();
      router.push(`/dashboard/projects/${data.project.id}`);
    } catch (e: any) {
      setErr(e?.message || "Create project failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={onCreate}
      style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}
    >
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

      {err ? (
        <pre
          style={{
            marginTop: 12,
            width: "100%",
            color: "crimson",
            background: "#fff5f5",
            border: "1px solid #ffd6d6",
            borderRadius: 10,
            padding: 12,
            whiteSpace: "pre-wrap",
            overflowWrap: "anywhere",
          }}
        >
          {err}
        </pre>
      ) : null}
    </form>
  );
}
