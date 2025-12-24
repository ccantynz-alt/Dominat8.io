// app/projects/[projectId]/page.tsx
import Link from "next/link";

async function getProject(projectId: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/api/projects/${projectId}`,
    { cache: "no-store" }
  ).catch(() => null);

  if (!res) return null;
  const data = await res.json();
  return data.project ?? null;
}

async function getRuns(projectId: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/api/runs?projectId=${encodeURIComponent(projectId)}`,
    { cache: "no-store" }
  ).catch(() => null);

  if (!res) return [];
  const data = await res.json();
  return data.runs ?? [];
}

export default async function ProjectDetailPage({
  params,
}: {
  params: { projectId: string };
}) {
  const project = await getProject(params.projectId);
  const runs = await getRuns(params.projectId);

  if (!project) {
    return (
      <div className="mx-auto max-w-5xl p-6">
        <div className="rounded-2xl border p-6">
          <div className="text-lg font-semibold">Project not found</div>
          <Link className="mt-3 inline-block rounded-xl border px-3 py-2 text-sm" href="/projects">
            ← Back
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link className="text-sm text-neutral-600 hover:underline" href="/projects">
            ← Projects
          </Link>
          <h1 className="mt-2 text-2xl font-bold">{project.name}</h1>
          {project.description ? (
            <p className="mt-1 text-sm text-neutral-600">{project.description}</p>
          ) : null}
          <div className="mt-2 text-xs text-neutral-500">{project.id}</div>
        </div>

        <form
          action={async () => {
            "use server";
            // server action kept minimal; you can switch to a client button later
          }}
        >
          <Link className="rounded-xl border px-3 py-2 text-sm" href="/runs">
            All runs →
          </Link>
        </form>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border p-4 shadow-sm">
          <div className="text-lg font-semibold">Quick actions</div>

          <div className="mt-3 grid gap-2">
            <CreateRunButton projectId={project.id} />
            <div className="text-xs text-neutral-500">
              Next phase adds: GitHub import, Vercel deploy triggers, agent tools.
            </div>
          </div>
        </div>

        <div className="rounded-2xl border p-4 shadow-sm">
          <div className="text-lg font-semibold">Recent runs</div>
          <div className="mt-3 grid gap-2">
            {runs.length === 0 ? (
              <div className="text-sm text-neutral-600">No runs yet.</div>
            ) : (
              runs.map((r: any) => (
                <div key={r.id} className="rounded-xl border px-3 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="font-medium">{r.title}</div>
                    <div className="text-xs text-neutral-600">{r.status}</div>
                  </div>
                  <div className="mt-1 text-xs text-neutral-500">{r.id}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function CreateRunButton({ projectId }: { projectId: string }) {
  return (
    <form
      action={async () => {
        "use server";
      }}
    >
      {/* Use client fetch for simplicity */}
      <button
        type="button"
        className="w-full rounded-xl border px-3 py-2 text-sm font-medium hover:bg-neutral-50"
        onClick={async () => {
          const res = await fetch("/api/runs", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              projectId,
              title: "Demo run: create agent task",
              input: { note: "Phase 1 demo run payload" },
            }),
          });
          const data = await res.json();
          if (data?.ok) window.location.reload();
          else alert(data?.error ?? "Failed to create run");
        }}
      >
        + Create demo run
      </button>
    </form>
  );
}
