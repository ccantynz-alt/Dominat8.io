// app/projects/page.tsx
import Link from "next/link";
import NewProjectForm from "./NewProjectForm";

async function getProjects() {
  const res = await fetch("/api/projects", { cache: "no-store" });
  const data = await res.json();
  return data.projects ?? [];
}

export default async function ProjectsPage() {
  const projects = await getProjects();

  return (
    <div className="mx-auto max-w-5xl p-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Projects</h1>
          <p className="text-sm text-neutral-600">
            Each imported website/repo becomes a Project.
          </p>
        </div>
        <Link className="rounded-xl border px-3 py-2 text-sm" href="/runs">
          View runs →
        </Link>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <NewProjectForm
          onCreated={() => {
            window.location.reload();
          }}
        />

        <div className="rounded-2xl border p-4 shadow-sm">
          <div className="text-lg font-semibold">Your projects</div>
          <div className="mt-3 grid gap-2">
            {projects.length === 0 ? (
              <div className="text-sm text-neutral-600">No projects yet.</div>
            ) : (
              projects.map((p: any) => (
                <Link
                  key={p.id}
                  href={`/projects/${p.id}`}
                  className="rounded-xl border px-3 py-3 hover:bg-neutral-50"
                >
                  <div className="font-medium">{p.name}</div>
                  {p.description ? (
                    <div className="text-sm text-neutral-600 line-clamp-2">
                      {p.description}
                    </div>
                  ) : null}
                  <div className="mt-1 text-xs text-neutral-500">{p.id}</div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
