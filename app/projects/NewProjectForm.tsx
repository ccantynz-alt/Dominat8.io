// app/projects/NewProjectForm.tsx
"use client";

import { useState } from "react";

export default function NewProjectForm({ onCreated }: { onCreated?: () => void }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setError(null);
    if (!name.trim()) {
      setError("Project name is required.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description }),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data?.error ?? "Failed to create project.");
        return;
      }

      setName("");
      setDescription("");
      onCreated?.();
    } catch {
      setError("Network error.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border p-4 shadow-sm">
      <div className="text-lg font-semibold">Create project</div>
      <div className="mt-2 grid gap-2">
        <input
          className="w-full rounded-xl border px-3 py-2"
          placeholder="Project name (e.g., MyPA Platform)"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <textarea
          className="w-full rounded-xl border px-3 py-2"
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
        />
        {error ? <div className="text-sm text-red-600">{error}</div> : null}
        <button
          className="rounded-xl border px-3 py-2 font-medium disabled:opacity-60"
          onClick={submit}
          disabled={loading}
        >
          {loading ? "Creating..." : "Create"}
        </button>
      </div>
    </div>
  );
}
