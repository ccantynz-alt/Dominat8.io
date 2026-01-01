"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewProjectPage() {
  const router = useRouter();
  const [name, setName] = useState("");

  async function createProject() {
    if (!name.trim()) return;

    // TEMP: redirect to projects list
    router.push("/dashboard/projects");
  }

  return (
    <main style={{ padding: 32, maxWidth: 600, margin: "0 auto" }}>
      <h1 style={{ fontSize: 28, fontWeight: 800 }}>
        New Project
      </h1>

      <p style={{ marginTop: 8, color: "#666" }}>
        Create a new AI website project
      </p>

      <div style={{ marginTop: 24 }}>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Project name"
          style={{
            width: "100%",
            padding: 12,
            borderRadius: 8,
            border: "1px solid #ccc",
            fontSize: 16,
          }}
        />

        <button
          onClick={createProject}
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
          Create Project
        </button>
      </div>
    </main>
  );
}
