"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Project = {
  id: string;
  name: string;
};

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/projects");
        if (res.ok) {
          const data = await res.json();
          const list = data?.projects ?? data?.items ?? [];
          setProjects(Array.isArray(list) ? list : []);
        }
      } catch {
        setProjects([]);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  return (
    <main className="p-6 space-y-6">
      <h1 className="text-xl font-semibold">Dashboard</h1>

      <div className="rounded-md border p-4 space-y-3">
        <h2 className="font-medium">Projects</h2>

        {loading ? (
          <p className="text-sm opacity-70">Loading…</p>
        ) : projects.length === 0 ? (
          <p className="text-sm opacity-70">No projects yet.</p>
        ) : (
          <ul className="space-y-2">
            {projects.map((p) => (
              <li
                key={p.id}
                className="flex items-center justify-between gap-3"
              >
                <div>
                  <div className="font-medium">{p.name}</div>
                  <div className="text-xs opacity-70">{p.id}</div>
                </div>
                <Link
                  href={`/dashboard/projects/${p.id}`}
                  className="underline text-sm"
                >
                  Open
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="text-sm opacity-80">
        <Link href="/" className="underline">
          Back to home
        </Link>
      </div>
    </main>
  );
}
