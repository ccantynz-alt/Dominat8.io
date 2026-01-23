import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

type RunMeta = {
  runId: string;
  projectId: string;
  createdAtIso: string;
  status: "running" | "ok" | "fail";
  marker?: string;
  jobId?: string;
};

export default function RunsIndexPage() {
  const router = useRouter();
  const projectId = (router.query.projectId as string) || "";

  const [loading, setLoading] = useState(false);
  const [runs, setRuns] = useState<RunMeta[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    if (!projectId) return;
    setLoading(true);
    setError(null);

    try {
      const r = await fetch(`/api/projects/${projectId}/runs?ts=` + Date.now(), {
        cache: "no-store",
      });
      const j = await r.json();
      if (!r.ok || !j?.ok) throw new Error(j?.error || "Failed to load runs");
      setRuns(j.runs || []);
    } catch (e: any) {
      setError(e?.message || "Failed to load runs");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [projectId]);

  return (
    <>
      <Head>
        <title>Runs — {projectId || "Project"}</title>
      </Head>

      <main className="mx-auto max-w-5xl px-6 py-12">
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-semibold tracking-tight">Runs</h1>
          <span className="rounded-full border px-3 py-1 text-sm text-gray-700">
            {projectId || "(loading...)"}
          </span>
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          <Link
            href={projectId ? `/projects/${projectId}/terminal` : "/projects"}
            className="rounded-md border px-4 py-2 text-sm hover:bg-gray-50"
          >
            Terminal
          </Link>

          <Link
            href={projectId ? `/projects/${projectId}/publish` : "/projects"}
            className="rounded-md border px-4 py-2 text-sm hover:bg-gray-50"
          >
            Publish
          </Link>

          <button
            onClick={load}
            className="rounded-md bg-black px-4 py-2 text-sm text-white hover:bg-gray-800"
          >
            Refresh
          </button>
        </div>

        {error ? (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            {error}
          </div>
        ) : null}

        {loading ? (
          <div className="text-sm text-gray-600">Loading...</div>
        ) : runs.length === 0 ? (
          <div className="rounded-lg border p-6 text-sm text-gray-700">
            No runs yet. Use the Publish page to create one.
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-700">
                <tr>
                  <th className="px-4 py-3">Created</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">runId</th>
                  <th className="px-4 py-3">Open</th>
                </tr>
              </thead>
              <tbody>
                {runs.map((r) => (
                  <tr key={r.runId} className="border-t">
                    <td className="px-4 py-3 text-gray-700">{r.createdAtIso}</td>
                    <td className="px-4 py-3">
                      <span
                        className={[
                          "rounded-full border px-2 py-1 text-xs",
                          r.status === "ok"
                            ? "border-green-200 bg-green-50 text-green-700"
                            : r.status === "fail"
                            ? "border-red-200 bg-red-50 text-red-700"
                            : "border-gray-200 bg-gray-50 text-gray-700",
                        ].join(" ")}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-700">
                      {r.runId}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        className="text-blue-600 hover:underline"
                        href={`/projects/${projectId}/runs/${r.runId}`}
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </>
  );
}
