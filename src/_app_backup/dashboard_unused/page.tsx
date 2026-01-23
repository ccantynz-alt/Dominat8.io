"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Project = {
  id: string;
  name: string;
  createdAt?: string;
};

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [name, setName] = useState("My first project");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sorted = useMemo(() => {
    return [...projects].sort((a, b) => {
      const ad = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bd = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return bd - ad;
    });
  }, [projects]);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/projects", { cache: "no-store" });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.ok) throw new Error(data?.error || "Failed to load projects");
      setProjects(Array.isArray(data.projects) ? data.projects : []);
    } catch (e: any) {
      setError(e?.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  async function create() {
    const trimmed = name.trim();
    if (!trimmed) return;

    setCreating(true);
    setError(null);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: trimmed }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.ok) throw new Error(data?.error || "Failed to create project");

      // If API returns { project }, add it; otherwise reload.
      if (data.project?.id) {
        setProjects((prev) => [data.project as Project, ...prev]);
      } else {
        await load();
      }
    } catch (e: any) {
      setError(e?.message || "Unknown error");
    } finally {
      setCreating(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <main className="mx-auto max-w-4xl p-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold">Dashboard</h1>
        <p className="text-sm opacity-80">
          Create projects and launch runs. This is the “it’s alive” screen.
        </p>
      </header>

      <section className="mt-6 rounded-2xl border p-4">
        <h2 className="text-lg font-medium">Create a project</h2>

        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Project name"
            className="w-full rounded-xl border bg-transparent px-3 py-2 outline-none"
          />
          <button
            onClick={create}
            disabled={creating || !name.trim()}
            className="rounded-xl border px-4 py-2 disabled:opacity-50"
          >
            {creating ? "Creating…" : "Create"}
          </button>
          <button
            onClick={load}
            disabled={loading}
            className="rounded-xl border px-4 py-2 disabled:opacity-50"
          >
            Refresh
          </button>
        </div>

        {error ? (
          <p className="mt-3 text-sm text-red-400">Error: {error}</p>
        ) : null}
      </section>

      <section className="mt-6 rounded-2xl border p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">Projects</h2>
          <span className="text-sm opacity-70">{sorted.length} total</span>
        </div>

        {loading ? (
          <p className="mt-3 text-sm opacity-70">Loading…</p>
        ) : sorted.length === 0 ? (
          <p className="mt-3 text-sm opacity-70">
            No projects yet — create one above.
          </p>
        ) : (
          <ul className="mt-3 grid gap-2">
            {sorted.map((p) => (
              <li key={p.id} className="rounded-xl border p-3">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="font-medium">{p.name}</div>
                    <div className="text-xs opacity-70">
                      <span className="opacity-70">id:</span> {p.id}
                      {p.createdAt ? (
                        <>
                          {" "}
                          • <span className="opacity-70">created:</span>{" "}
                          {new Date(p.createdAt).toLocaleString()}
                        </>
                      ) : null}
                    </div>
                  </div>

                  <div className="mt-2 flex gap-2 sm:mt-0">
                    <Link
                      className="rounded-xl border px-3 py-2 text-sm"
                      href={`/dashboard/projects/${p.id}`}
                    >
                      Open
                    </Link>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
