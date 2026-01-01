"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewProjectPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  async function create() {
    if (!name.trim()) return;

    setLoading(true);

    await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });

    router.push("/dashboard/projects");
  }

  return (
    <main style={{ padding: 32, maxWidth: 600, margin: "0 auto" }}>
      <h1 style={{ fontSize: 28, fontWeight: 800 }}>New Project</h1>

      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Project name"
        style={{
          width: "100%",
          padding: 12,
          marginTop: 16,
          borderRadius: 8,
          border: "1px solid #ccc",
          fontSize: 16,
        }}
      />

      <button
        onClick={create}
        disabled={loading}
        style={{
          marginTop: 16,
          padding: "10px 16px",
          background: "#000",
          color: "#fff",
          borderRadius: 8,
          border: "none",
          fontWeight: 600,
          cursor: "pointer",
        }}
      >
        {loading ? "Creating..." : "Create Project"}
      </button>
    </main>
  );
}
