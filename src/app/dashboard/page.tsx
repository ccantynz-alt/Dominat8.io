import Link from "next/link";

export default function DashboardPage() {
  return (
    <main style={{ padding: 32, maxWidth: 1000, margin: "0 auto" }}>
      <h1 style={{ fontSize: 32, fontWeight: 800 }}>
        Dashboard
      </h1>

      <p style={{ marginTop: 8, color: "#666" }}>
        Manage projects, runs, and agents
      </p>

      <div
        style={{
          marginTop: 32,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
          gap: 16,
        }}
      >
        <Link
          href="/dashboard/projects"
          style={{
            padding: 20,
            border: "1px solid #e5e5e5",
            borderRadius: 12,
            textDecoration: "none",
            color: "#000",
          }}
        >
          <h2 style={{ fontSize: 18, fontWeight: 700 }}>
            Projects
          </h2>
          <p style={{ marginTop: 6, color: "#666" }}>
            Create and manage websites
          </p>
        </Link>

        <Link
          href="/dashboard/threads"
          style={{
            padding: 20,
            border: "1px solid #e5e5e5",
            borderRadius: 12,
            textDecoration: "none",
            color: "#000",
          }}
        >
          <h2 style={{ fontSize: 18, fontWeight: 700 }}>
            Threads
          </h2>
          <p style={{ marginTop: 6, color: "#666" }}>
            View conversations and logs
          </p>
        </Link>

        <Link
          href="/builder"
          style={{
            padding: 20,
            border: "1px solid #e5e5e5",
            borderRadius: 12,
            textDecoration: "none",
            color: "#000",
          }}
        >
          <h2 style={{ fontSize: 18, fontWeight: 700 }}>
            Builder
          </h2>
          <p style={{ marginTop: 6, color: "#666" }}>
            Run AI agents
          </p>
        </Link>
      </div>
    </main>
  );
}
