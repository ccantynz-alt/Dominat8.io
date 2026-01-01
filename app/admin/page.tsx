import { auth, currentUser } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";

export default async function AdminPage() {
  const session = await auth();

  // Not signed in → send to sign-in
  if (!session.userId) {
    redirect("/sign-in");
  }

  const user = await currentUser();
  if (!user) notFound();

  const role = (user.publicMetadata?.role as string | undefined) ?? "user";
  if (role !== "owner") notFound();

  return (
    <div className="min-h-screen p-6">
      <div className="mx-auto max-w-4xl">
        <div className="text-2xl font-semibold">Admin</div>
        <div className="text-sm text-zinc-500 mt-1">
          Owner tools will live here (usage, plans, model routing).
        </div>

        <div className="mt-6 border rounded-xl p-4">
          <div className="font-medium">Next admin features</div>
          <ul className="list-disc pl-5 text-sm text-zinc-700 mt-2 space-y-1">
            <li>Set user plans (starter / pro / elite)</li>
            <li>View usage + costs</li>
            <li>Model routing rules (Auto → Mini/Pro/Best)</li>
            <li>Run queue inspector</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
