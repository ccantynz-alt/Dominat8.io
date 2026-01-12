import { kv } from "@vercel/kv";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function RunsPage({
  params,
}: {
  params: { projectId: string };
}) {
  const session = await auth();
  const userId = session.userId;
  if (!userId) return notFound();

  const projectId = params.projectId;

  const project = await kv.get<any>(`project:${projectId}`);
  if (!project || project.ownerId !== userId) return notFound();

  const runsKey = `project:${projectId}:runs`;
  const runIds = (await kv.lrange<string>(runsKey, 0, -1)) || [];

  const runs = await Promise.all(
    runIds.map(async (id) => ({
      id,
      data: await kv.get<any>(`run:${id}`),
    }))
  );

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="rounded border bg-white p-6">
          <Link href={`/projects/${projectId}`} className="text-sm text-blue-600">
            ← Back to Project
          </Link>

          <h1 className="mt-2 text-2xl font-semibold">Runs</h1>
          <p className="text-sm text-gray-500">Project: {projectId}</p>
        </div>

        <div className="rounded border bg-white p-6">
          <h2 className="mb-2 text-lg font-medium">Run history</h2>

          {runs.length === 0 ? (
            <p className="text-sm text-gray-600">
              No runs yet — generate a site to create one.
            </p>
          ) : (
            <ul className="space-y-2">
              {runs.map((r) => (
                <li key={r.id} className="rounded border p-3 text-sm">
                  <div className="font-medium">Run ID: {r.id}</div>
                  <div className="text-gray-500">
                    Status: {r.data?.status ?? "unknown"}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
