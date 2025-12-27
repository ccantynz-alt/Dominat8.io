import Link from "next/link";

type Run = {
  id: string;
  status?: string;
};

type RunFile = {
  path: string;
  content: string;
};

export default async function RunPage({
  params,
}: {
  params: { runId: string };
}) {
  const runId = params.runId;

  let run: Run | null = null;
  let files: RunFile[] = [];

  // Fetch run
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/api/runs/${runId}`, {
      cache: "no-store",
    });
    if (res.ok) {
      const data = await res.json();
      run = data?.run ?? null;
    }
  } catch {}

  // Fetch files (use files_v2 to avoid the old route)
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/api/runs/${runId}/files_v2`, {
      cache: "no-store",
    });
    if (res.ok) {
      const data = await res.json();
      files = Array.isArray(data?.files) ? data.files : [];
    }
  } catch {}

  return (
    <main className="p-6 space-y-6">
      <h1 className="text-xl font-semibold">Run</h1>

      <div className="rounded-md border p-4 space-y-2">
        <div><strong>Run ID:</strong> {runId}</div>
        <div><strong>Status:</strong> {run?.status ?? "unknown"}</div>
        <div><strong>Files:</strong> {files.length}</div>
      </div>

      {run?.status === "succeeded" && files.length > 0 && (
        <Link
          href={`/api/runs/${runId}/zip`}
          className="inline-flex items-center rounded-md border px-3 py-2 text-sm"
        >
          Download ZIP
        </Link>
      )}

      <div className="text-sm opacity-80">
        <Link href="/dashboard" className="underline">
          Back to Dashboard
        </Link>
      </div>
    </main>
  );
}
