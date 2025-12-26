// app/dashboard/page.tsx
import Link from "next/link";

async function getProjects() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/api/projects`, {
    cache: "no-store",
  }).catch(() => null);

  if (!res || !res.ok) return { projects: [] as any[] };
  return res.json();
}

export default async function DashboardPage() {
  const data = await getProjects();
  const projects = data?.projects ?? [];

  return (
    <main style={{ padding: 40, fontFamily: "system-ui" }}>
      <h1>Dashboard</h1>
      <p>Create a project, then run the agent to generate files.</p>

      <section style={{ marginTop: 24 }}>
        <h2>Projects</h2>

        <form
          action="/api/projects"
          method="post"
          onSubmit={(e) => {
            // Let the browser submit normally in dev; in prod you can replace with fetch.
            // This keeps things super simple for MVP.
          }}
        >
          <p>
            <input name="name" placeholder="Project name" required />
          </p>
          <p>
            <input name="description" placeholder="Description (optional)" />
          </p>
          <button type="submit">Create Project</button>
        </form>

        <ul style={{ marginTop: 16 }}>
          {projects.map((p: any) => (
            <li key={p.id}>
              <Link href={`/dashboard/projects/${p.id}`}>{p.name}</Link>
            </li>
          ))}
        </ul>

        <p style={{ marginTop: 16 }}>
          If the form above doesn’t work in your browser, create via API using JSON:
          <code style={{ display: "block", marginTop: 8 }}>
            POST /api/projects {"{ name: \"My Project\" }"}
          </code>
        </p>
      </section>
    </main>
  );
}
