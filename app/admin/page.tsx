import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { isAdminUserId } from "@/lib/admin";

type Project = {
  id: string;
  name: string;
  userId: string;
  createdAt: number;
};

export default async function AdminPage() {
  const { userId } = auth();

  if (!userId) redirect("/sign-in");
  if (!isAdminUserId(userId)) redirect("/projects");

  let projects: Project[] = [];
  try {
    const res = await fetch(`/api/admin/projects`, { cache: "no-store" });
    const data = await res.json();
    projects = data?.ok ? data.projects : [];
  } catch {}

  async function deleteProject(projectId: string) {
    "use server";
    await fetch(`/api/admin/projects/${projectId}/delete`, { method: "POST" });
  }

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: 24 }}>
      <h1>Admin</h1>

      <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
        <Link href="/admin/users">Users</Link>
        <Link href="/projects">Projects</Link>
      </div>

      {projects.length === 0 ? (
        <div>No projects.</div>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {projects.map((p) => (
            <div
              key={p.id}
              style={{ border: "1px solid #eee", borderRadius: 10, padding: 12 }}
            >
              <div><b>{p.name}</b></div>
              <div style={{ fontSize: 12 }}>{p.id}</div>
              <div style={{ fontSize: 12 }}>Owner: {p.userId}</div>

              <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
                <Link href={`/projects/${p.id}`}>Open</Link>

                <form action={deleteProject.bind(null, p.id)}>
                  <button
                    type="submit"
                    style={{
                      background: "#ff4d4d",
                      color: "white",
                      border: "none",
                      padding: "6px 10px",
                      borderRadius: 6,
                      cursor: "pointer",
                    }}
                  >
                    Delete
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
