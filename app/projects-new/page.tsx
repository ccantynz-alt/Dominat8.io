// app/projects-new/page.tsx

"use client";

import React, { useMemo, useState } from "react";
import UpgradeToProDialog from "@/app/components/UpgradeToProDialog";
import { createProjectClient } from "@/app/lib/projects-client";

export default function ProjectsNewPage() {
  const [name, setName] = useState("My Project");
  const [creating, setCreating] = useState(false);
  const [lastResult, setLastResult] = useState<string>("");
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [upgradeMessage, setUpgradeMessage] = useState("");

  const canCreate = useMemo(() => name.trim().length > 0 && !creating, [name, creating]);

  async function onCreate() {
    setLastResult("");
    setCreating(true);

    try {
      const result = await createProjectClient(name.trim());

      if (result.ok) {
        setLastResult(`✅ Created: ${result.project.id}`);
        setName("My Project");
        return;
      }

      // 401 = not signed in
      if (result.status === 401) {
        setLastResult("❌ You must be signed in to create a project.");
        return;
      }

      // 403 = plan limit
      if (result.status === 403) {
        setUpgradeMessage(result.error || "Free plan limit reached. Upgrade to Pro.");
        setUpgradeOpen(true);
        return;
      }

      // Everything else
      setLastResult(`❌ Error (${result.status}): ${result.error}`);
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
        <p className="text-gray-600">
          Create and manage your AI-generated websites. Free accounts can create 1 project.
        </p>
      </div>

      <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">Create a new project</h2>
        <p className="mt-1 text-sm text-gray-600">
          If you hit the Free limit, you’ll see an upgrade prompt.
        </p>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Project name"
            className="w-full rounded-xl border border-gray-300 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-black"
          />

          <button
            onClick={onCreate}
            disabled={!canCreate}
            className="rounded-xl bg-black px-5 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            {creating ? "Creating..." : "Create Project"}
          </button>
        </div>

        {lastResult ? (
          <div className="mt-4 rounded-xl bg-gray-50 p-3 text-sm text-gray-800">
            {lastResult}
          </div>
        ) : null}

        <div className="mt-6 rounded-xl border border-dashed border-gray-300 p-4">
          <p className="text-sm text-gray-700">
            Want to test the limit quickly?
          </p>
          <ol className="mt-2 list-decimal pl-5 text-sm text-gray-600">
            <li>Force Free (admin-only): <code className="bg-gray-100 px-1 py-0.5 rounded">/api/debug/force-free</code></li>
            <li>Then try creating a project again → you should get an upgrade prompt.</li>
          </ol>
        </div>
      </div>

      <UpgradeToProDialog
        open={upgradeOpen}
        message={upgradeMessage || "Free plan limit reached. Upgrade to Pro."}
        onClose={() => setUpgradeOpen(false)}
      />
    </div>
  );
}
