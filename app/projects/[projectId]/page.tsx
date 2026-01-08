// app/projects/[projectId]/page.tsx

"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { fetchProject, Project } from "../../../lib/project-client";

export default function ProjectDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const projectId = params?.projectId as string;

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!projectId) return;

    (async () => {
      setLoading(true);
      const p = await fetchProject(projectId);

      if (!p) {
        setError("Project not found or you do not have access.");
        setLoading(false);
        return;
      }

      setProject(p);
      setLoading(false);
    })();
  }, [projectId]);

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-10">
        <p className="text-sm text-gray-500">Loading project…</p>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-10">
        <h1 className="text-xl font-semibold text-gray-900">Error</h1>
        <p className="mt-2 text-gray-600">{error}</p>

        <button
          onClick={() => router.push("/projects")}
          className="mt-6 rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white"
        >
          Back to Projects
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {project.name}
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Project ID: <span className="font-mono">{project.id}</span>
          </p>
        </div>

        <div className="mt-4 flex gap-3 sm:mt-0">
          <button
            onClick={() => router.push("/projects")}
            className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-50"
          >
            ← Back
          </button>

          <button
            onClick={() => alert("Next step: Generate website UI")}
            className="rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
          >
            Generate website
          </button>
        </div>
      </div>

      {/* Project overview */}
      <div className="mt-8 grid gap-6 sm:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:col-span-2">
          <h2 className="text-lg font-semibold text-gray-900">
            Project overview
          </h2>

          <dl className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-sm text-gray-500">Name</dt>
              <dd className="text-sm font-medium text-gray-900">
                {project.name}
              </dd>
            </div>

            <div>
              <dt className="text-sm text-gray-500">Created</dt>
              <dd className="text-sm font-medium text-gray-900">
                {new Date(project.createdAt).toLocaleString()}
              </dd>
            </div>
          </dl>
        </div>

        {/* Next steps */}
        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6">
          <h3 className="text-sm font-semibold text-gray-900">
            Next steps
          </h3>

          <ol className="mt-3 list-decimal pl-5 text-sm text-gray-700">
            <li>Generate a website using AI</li>
            <li>Review and edit the content</li>
            <li>Publish and connect a domain</li>
          </ol>

          <button
            onClick={() => alert("Next step: Generate website UI")}
            className="mt-4 w-full rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
          >
            Generate website
          </button>
        </div>
      </div>

      {/* Placeholder */}
      <div className="mt-10 rounded-2xl border border-dashed border-gray-300 p-8 text-center">
        <p className="text-sm text-gray-600">
          Website versions, generation history, and publishing controls will appear here.
        </p>
      </div>
    </div>
  );
}
