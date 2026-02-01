"use client";

import React from "react";
import Link from "next/link";

type Project = {
  id: string;
  name: string;
  description?: string | null;
  createdAt?: string | Date;
};

async function fetchProjects(): Promise<Project[]> {
  // NOTE: This is a placeholder. Keep existing data-loading logic if present in your project.
  // If your app uses a hook or server action, you can integrate it here.
  // For now, return an empty array to demonstrate empty state handling.
  return [];
}

export default async function AdminProjectsPage() {
  const projects = await fetchProjects();

  const hasProjects = Array.isArray(projects) && projects.length > 0;

  if (!hasProjects) {
    return (
      <div className="p-6">
        <div className="mx-auto max-w-3xl rounded-lg border border-gray-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
            <svg className="h-6 w-6 text-gray-500" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M7 7h10M7 12h10M7 17h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h1 className="text-lg font-semibold text-gray-900">No projects yet</h1>
          <p className="mt-2 text-sm text-gray-600">
            Get started by creating your first project. You can add details and manage everything from here.
          </p>
          <div className="mt-6">
            <Link
              href="/admin/projects/new"
              className="inline-flex items-center rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
            >
              Create project
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Existing list/table UI remains unchanged below.
  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">Projects</h1>
        <Link
          href="/admin/projects/new"
          className="inline-flex items-center rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
        >
          New project
        </Link>
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Name
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Description
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Created
              </th>
              <th scope="col" className="px-6 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {projects.map((p) => (
              <tr key={p.id}>
                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">{p.name}</td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {p.description ?? <span className="text-gray-400">â€”</span>}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {p.createdAt
                    ? new Date(p.createdAt).toLocaleDateString()
                    : <span className="text-gray-400">â€”</span>}
                </td>
                <td className="px-6 py-4 text-right">
                  <Link
                    href={`/admin/projects/${p.id}`}
                    className="text-sm font-medium text-black hover:underline"
                  >
                    Manage
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
