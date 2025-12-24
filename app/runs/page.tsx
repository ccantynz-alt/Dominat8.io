export const dynamic = "force-dynamic";

export default async function RunDetailPage({
  params,
}: {
  params: { runId: string };
}) {
  return (
    <div className="mx-auto max-w-5xl p-6">
      <h1 className="text-2xl font-bold">Run</h1>
      <p className="mt-2 text-sm text-neutral-600">
        Run ID: <span className="font-mono">{params.runId}</span>
      </p>

      <div className="mt-6 rounded-2xl border p-4">
        <div className="font-semibold">Logs</div>
        <div className="mt-2 text-sm text-neutral-600">
          (Next step: fetch logs from <span className="font-mono">/api/runs/{params.runId}/logs</span>)
        </div>
      </div>

      <div className="mt-6">
        <a className="rounded-xl border px-3 py-2 text-sm" href="/runs">
          ← Back to runs
        </a>
      </div>
    </div>
  );
}
