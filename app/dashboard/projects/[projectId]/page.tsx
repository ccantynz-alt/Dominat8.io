export const dynamic = "force-dynamic";

import Link from "next/link";

type Run = {
  id: string;
  status?: string;
  createdAt?: string;
};

async function getRuns(projectId: string): Promise<Run[]> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/api/projects/${projectId}/runs`,
      { cache: "no-store" }
    );
    if (!res.ok) return [];
    const data = await res.json();
    const runs = data?.runs ?? data?.items ?? [];
    return Array.isArray(runs) ? runs : [];
  } catch {
    return [];
  }
}

export default async function ProjectRunsPage({
  params,
}: {
  params: { projectId: string };
}) {
  const projectId = params.projectId;
  const runs = await getRuns(projectId);

  return (
    <main className="p-6 space-y-6">
      <div className="space-y-1">
        <h1 className="text-xl font-semibold">Project</h1>
        <div className="text-sm opacity-80">{projectId}</div>
      </div>

      <div className="flex gap-3">
        <Link
          href={`/dashboard/projects/${projectId}/new-run`}
          className="inline-flex items-center rounded-md border px-3 py-2 text-sm"
        >
          New Run
        </Link>

        <Link href="/dashboard" className="underline text-sm self-center">
          Back
        </Link>
      </div>

      <div className="rounded-md border p-4 space-y-3">
        <h2 className="font-medium">Runs</h2>

        {runs.length === 0 ? (
          <p className="text-sm opacity-80">No runs yet.</p>
        ) : (
          <ul className="space-y-2">
            {runs.map((r) => (
              <li key={r.id} className="flex items-center justify-between gap-3">
                <div>
                  <div className="font-medium">{r.id}</div>
                  <div className="text-xs opacity-70">{r.status ?? "unknown"}</div>
                </div>
                <Link className="underline text-sm" href={`/dashboard/runs/${r.id}`}>
                  Open
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
