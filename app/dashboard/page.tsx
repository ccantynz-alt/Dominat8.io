// app/dashboard/page.tsx
import { redirect } from "next/navigation";

type Project = {
  id: string;
  projectId: string;
  name: string;
  createdAt: string;
};

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...init,
    // ensure this runs dynamically and never caches redirect decisions
    cache: "no-store",
    headers: {
      "content-type": "application/json",
      ...(init?.headers || {}),
    },
  });

  const text = await res.text();
  let json: any = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = { ok: false, error: "Non-JSON response from API", raw: text };
  }

  if (!res.ok) {
    const msg = json?.error || `Request failed (${res.status})`;
    throw new Error(msg);
  }

  return json as T;
}

export default async function DashboardPage() {
  try {
    // 1) list projects
    const list = await api<{ ok: true; projects: Project[] } | { ok: false; error: string }>(
      `${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/projects`
    );

    if (!("ok" in list) || list.ok !== true) {
      throw new Error((list as any)?.error || "Failed to load projects");
    }

    const projects = list.projects || [];

    // 2) if none, create one
    let project = projects[0];
    if (!project) {
      const created = await api<
        { ok: true; project: Project; id: string; projectId: string } | { ok: false; error: string }
      >(`${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/projects`, {
        method: "POST",
        body: JSON.stringify({ name: "Untitled Project" }),
      });

      if (!("ok" in created) || created.ok !== true) {
        throw new Error((created as any)?.error || "Failed to create project");
      }

      project = created.project;
    }

    // 3) normalize and redirect
    const pid = project.projectId || project.id;
    if (!pid) {
      throw new Error("Project missing projectId/id after normalization");
    }

    redirect(`/dashboard/projects/${pid}`);
  } catch (err: any) {
    // Never crash into a digest page: show a readable error.
    return (
      <main style={{ padding: 24, fontFamily: "ui-sans-serif, system-ui" }}>
        <h1 style={{ fontSize: 20, fontWeight: 700 }}>Dashboard error</h1>
        <p style={{ marginTop: 12 }}>
          Something failed while loading your dashboard.
        </p>
        <pre
          style={{
            marginTop: 12,
            padding: 12,
            background: "#111",
            color: "#fff",
            borderRadius: 8,
            overflowX: "auto",
            fontSize: 12,
          }}
        >
          {String(err?.message || err)}
        </pre>
        <p style={{ marginTop: 12 }}>
          Next step: open <code>/api/projects</code> and <code>/api/kv-test</code> and paste the JSON here.
        </p>
      </main>
    );
  }
}
