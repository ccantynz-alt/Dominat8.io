import Link from "next/link";

type Project = { id: string; name: string; createdAt: string };

export default async function DashboardPage() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/api/projects`, {
    cache: "no-store",
  });

  const data = (await res.json()) as { ok: boolean; projects: Project[] };
  const projects = data?.projects ?? [];

  return (
    <main style={{ padding: "2rem", fontFamily: "system-ui" }}>
      <h1 style={{ fontSize: "2rem", marginBottom: "1rem" }}>Dashboard</h1>

      <section style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.25rem", marginBottom: "0.5rem" }}>Create Project</h2>

        <form action="/api/projects" method="POST" style={{ display: "flex", gap: "0.75rem" }}>
          <input
            name="name"
            placeholder="Project name"
            required
            style={{
              padding: "0.75rem",
              minWidth: "280px",
              border: "1px solid #ddd",
              borderRadius: "8px",
            }}
          />
          <button
            type="submit"
            style={{
              padding: "0.75rem 1.25rem",
              background: "#000",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            Create
          </button>
        </form>
      </section>

      <section>
        <h2 style={{ fontSize: "1.25rem", marginBottom: "0.5rem" }}>Your Projects</h2>

        {projects.length === 0 ? (
          <p>No projects yet.</p>
        ) : (
          <ul style={{ paddingLeft: "1.25rem" }}>
            {projects.map((p) => (
              <li key={p.id} style={{ marginBottom: "0.5rem" }}>
                <Link href={`/dashboard/projects/${p.id}`} style={{ textDecoration: "underline" }}>
                  {p.name}
                </Link>{" "}
                <span style={{ color: "#777" }}>({new Date(p.createdAt).toLocaleString()})</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
