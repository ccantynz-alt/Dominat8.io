// app/dashboard/page.tsx
import Link from "next/link";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

type Project = {
  id: string;
  name: string;
  createdAt?: string;
};

function getBaseUrl() {
  const h = headers();
  const host = h.get("host") || "localhost:3000";
  const proto = h.get("x-forwarded-proto") || "https";
  return `${proto}://${host}`;
}

async function getProjects(): Promise<Project[]> {
  const baseUrl = getBaseUrl();
  const res = await fetch(`${baseUrl}/api/projects`, { cache: "no-store" });
  const data = await res.json().catch(() => ({ ok: false, projects: [] }));
  return Array.isArray(data?.projects) ? data.projects : [];
}

export default async function DashboardPage() {
  const projects = await getProjects();

  async function createProjectAction(formData: FormData) {
    "use server";
    const name = String(formData.get("name") ?? "").trim();
    if (!name) redirect("/dashboard");

    const baseUrl = getBaseUrl();
    const res = await fetch(`${baseUrl}/api/projects`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ name }),
      cache: "no-store",
    });

    const data = await res.json().catch(() => null);

    const projectId =
      data?.project?.id || data?.id || data?.projectId || data?.project?.projectId;

    if (projectId) redirect(`/dashboard/projects/${projectId}`);
    redirect("/dashboard");
  }

  return (
    <main style={{ padding: 24 }}>
      <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 12 }}>
        Dashboard
      </h1>

      <section style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>
          Create a Project
        </h2>

        <form action={createProjectAction} style={{ display: "flex", gap: 8 }}>
          <input
            name="name"
            placeholder="Project name"
            style={{
              padding: "10px 12px",
              border: "1px solid #ccc",
              borderRadius: 8,
              minWidth: 260,
            }}
            autoComplete="off"
          />
          <button
            type="submit"
            style={{
              padding: "10px 12px",
              border: "1px solid #000",
              borderRadius: 8,
              cursor: "pointer",
              background: "#fff",
              fontWeight: 600,
            }}
          >
            Create Project
          </button>
        </form>
      </section>

      <section>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>
          Projects
        </h2>

        {projects.length === 0 ? (
          <p>No projects yet.</p>
        ) : (
          <ul style={{ display: "grid", gap: 8, paddingLeft: 18 }}>
            {projects.map((p) => (
              <li key={p.id}>
                <Link href={`/dashboard/projects/${p.id}`}>{p.name}</Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
