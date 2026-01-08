// app/projects/page.tsx

"use client";

import React, { useMemo, useState } from "react";
import UpgradeToProDialog from "@/app/components/UpgradeToProDialog";
import { createProjectClient } from "@/app/lib/projects-client";

export default function ProjectsPage() {
  const [name, setName] = useState("My Project");
  const [creating, setCreating] = useState(false);

  const [banner, setBanner] = useState<string>("");
  const [lastResult, setLastResult] = useState<string>("");

  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [upgradeMessage, setUpgradeMessage] = useState("");

  const canCreate = useMemo(
    () => name.trim().length > 0 && !creating,
    [name, creating]
  );

  async function onCreate() {
    setBanner("");
    setLastResult("");
    setCreating(true);

    try {
      const result = await createProjectClient(name.trim());

      if (result.ok) {
        setLastResult(`✅ Project created`);
        setName("My Project");
        return;
      }

      if (result.status === 401) {
        setBanner("You must be signed in to create a project.");
        return;
      }

      if (result.status === 403) {
        const msg =
          result.error ||
          "Free plan limit reached. Upgrade to Pro to create more projects.";

        // Show BOTH a visible banner and the modal
        setBanner(msg);
        setUpgradeMessage(msg);
        setUpgradeOpen(true);
        return;
      }

      setBanner(`Error (${result.status}): ${result.error}`);
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
        <p className="text-gray-600">
          Create and manage your AI-generated websites.
        </p>
      </div>

      {/* UPGRADE / ERROR BANNER */}
      {banner ? (
        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4">
          <div className="text-sm font-semibold text-red-900">
            Action required
          </div>
          <div className="mt-1 text-sm text-red-800">{banner}</div>

          <div className="mt-4">
            <a
              href="/billing"
              className="inline-flex items-center justify-center rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
            >
              Upgrade to Pro
            </a>
          </div>
        </div>
      ) : null}

      {/* CREATE PROJECT CARD */}
      <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">
          Create a new project
        </h2>

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
            {creating ? "Creating…" : "Create Project"}
          </button>
        </div>

        {lastResult ? (
          <div className="mt-4 rounded-xl bg-gray-50 p-3 text-sm text-gray-800">
            {lastResult}
          </div>
        ) : null}
      </div>

      {/* UPGRADE MODAL */}
      <UpgradeToProDialog
        open={upgradeOpen}
        message={
          upgradeMessage ||
          "Free plan limit reached. Upgrade to Pro to continue."
        }
        onClose={() => setUpgradeOpen(false)}
      />
    </div>
  );
}
