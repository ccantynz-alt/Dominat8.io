import Link from "next/link";

export const runtime = "nodejs";

export default async function ProjectsPage() {
  return (
    <div className="min-h-screen p-6">
      <div className="mx-auto max-w-4xl">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Projects</h1>
          <Link
            href="/dashboard"
            className="text-sm text-blue-600 hover:underline"
          >
            Back to dashboard
          </Link>
        </div>

        <div className="mt-6 rounded-xl border p-4">
          <div className="text-sm text-zinc-600">
            This page is compiling cleanly. Next step: wire it to your Projects API.
          </div>
        </div>
      </div>
    </div>
  );
}
