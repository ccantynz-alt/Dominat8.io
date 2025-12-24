export const dynamic = "force-dynamic";

async function getRun(runId: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/api/runs/${runId}`, {
    cache: "no-store",
  });
  return res.json();
}

async function getLogs(runId: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/api/runs/${runId}/logs?limit=200`,
    { cache: "no-store" }
  );
  return res.json();
}

export default async function RunDetailPage({ params }: { params: { runId: string } }) {
  const runResp = await getRun(params.runId);
  const logsResp = await getLogs(params.runId);

  const run = runResp.run;
  const logs = logsResp.logs ?? [];

  return (
    <div className="mx-auto max-w-5xl p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Run</h1>
          <div className="mt-1 text-sm text-neutral-600">{params.runId}</div>
        </div>
        <a className="rounded-xl border px-3 py-2 text-sm" href="/runs">
          ← Back to runs
        </a>
      </div>

      {run ? (
        <div className="mt-6 rounded-2xl border p-4">
          <div className="font-semibold">{run.title}</div>
          <div className="mt-2 text-sm text-neutral-700">
            <div><span className="font-medium">Status:</span> {run.status}</div>
            <div><span className="font-medium">Project:</span> {run.projectId}</div>
            <div><span className="font-medium">Created:</span> {run.createdAt}</div>
          </div>
        </div>
      ) : (
        <div className="mt-6 rounded-2xl border p-4 text-sm text-red-600">
          Run not found.
        </div>
      )}

      <div className="mt-6 rounded-2xl border p-4">
        <div className="font-semibold">Logs</div>
        <div className="mt-3 grid gap-2">
          {logs.length === 0 ? (
            <div className="text-sm text-neutral-600">No logs yet.</div>
          ) : (
            logs.map((l: any, idx: number) => (
              <div key={idx} className="rounded-xl border px-3 py-2">
                <div className="text-xs text-neutral-500">{l.ts} · {l.level}</div>
                <div className="text-sm">{l.message}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
