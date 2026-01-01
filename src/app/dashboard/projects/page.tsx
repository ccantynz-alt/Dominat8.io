import Link from "next/link";

export default function ProjectsPage() {
  return (
    <main style={{ padding: 32, maxWidth: 1000, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h1 style={{ fontSize: 28, fontWeight: 800 }}>
          Projects
        </h1>

        <Link
          href="/dashboard/projects/new"
          style={{
            padding: "8px 14px",
            background: "#000",
            color: "#fff",
            borderRadius: 8,
            textDecoration: "none",
            fontWeight: 600,
          }}
        >
          + New Project
        </Link>
      </div>

      <p style={{ marginTop: 8, color: "#666" }}>
        Your AI-generated websites will appear here
      </p>

      <div
        style={{
          marginTop: 24,
          padding: 24,
          border: "1px dashed #ccc",
          borderRadius: 12,
          color: "#777",
        }}
      >
        No projects yet.
      </div>
    </main>
  );
}
