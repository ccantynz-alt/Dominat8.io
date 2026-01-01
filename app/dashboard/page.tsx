import Link from "next/link";
import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth();

  // Not signed in → go to sign-in
  if (!session.userId) {
    redirect("/sign-in");
  }

  const user = await currentUser();

  return (
    <div className="min-h-screen p-6">
      <div className="mx-auto max-w-4xl">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <Link href="/" className="text-sm text-blue-600 hover:underline">
            Home
          </Link>
        </div>

        <div className="mt-2 text-sm text-zinc-600">
          Signed in as:{" "}
          <span className="font-medium">
            {user?.emailAddresses?.[0]?.emailAddress ?? user?.id ?? "unknown"}
          </span>
        </div>

        <div className="mt-6 grid gap-4">
          <Link
            href="/dashboard/projects"
            className="rounded-xl border p-4 hover:bg-zinc-50"
          >
            <div className="font-medium">Projects</div>
            <div className="text-sm text-zinc-600 mt-1">
              View and manage your projects
            </div>
          </Link>

          <Link
            href="/admin"
            className="rounded-xl border p-4 hover:bg-zinc-50"
          >
            <div className="font-medium">Admin</div>
            <div className="text-sm text-zinc-600 mt-1">
              Owner tools (requires role = owner)
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
