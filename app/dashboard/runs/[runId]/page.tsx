import { notFound } from "next/navigation";

type Run = {
  id: string;
  status: "pending" | "running" | "succeeded" | "failed";
};

type RunFile = {
  path: string;
  content: string;
};

async function getRun(runId: string): Promise<Run | null> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/runs/${runId}`, {
    cache: "no-store",
  });

  if (!res.ok) return null;
  const data = await res.json();
  return data.run ?? null;
}

async function getFiles(runId: string): Promise<RunFile[]> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/runs/${runId}/files_v2`,
    { cache: "no-store" }
  );

  if (!res.ok) return [];
  const data = await res.json();
  return Array.isArray(data.files) ? data.files : [];
}

export default async function RunPage({
  params,
}: {
  params: { runId: string };
}) {
  const run = await getRun(params.runId);
  if (!run) notFound();

  const files = await getFiles(params.runId);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Run {run.id}</h1>

      <p>Status: {run.status}</p>

      {run.status === "succeeded" && files.length > 0 && (
        <a
          href={`/api/runs/${params.runId}/zip`}
          className="inline-flex items-center rounded-md border px-3 py-2 text-sm"
        >
          Download ZIP
        </a>
      )}
    </div>
  );
}
