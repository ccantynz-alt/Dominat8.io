"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Project = {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/projects/list", { cache: "no-store" });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || "Failed to load projects");
      setProjects(json.projects || []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function create(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    setBusy(true);
    setError(null);

    try {
      const res = await fetch("/api/projects/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      const json = await res.json();
      if (!json.ok) throw new Error(json.error || "Failed to create project");

      setName("");
      await load();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-extrabold text-zinc-900">Projects</h1>
        <Link href="/" className="text-sm font-semibold text-zinc-600 hover:text-zinc-900">
          ← Home
        </Link>
      </div>

      <p className="mt-2 text-sm font-semibold text-zinc-600">
        Create a project, generate a preview, then publish (next).
      </p>

      <form onSubmit={create} className="mt-8 flex flex-col gap-3 sm:flex-row">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Project name"
          className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm font-semibold"
        />
        <button
          type="submit"
          disabled={busy}
          className="rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white hover:bg-zinc-900 disabled:opacity-60"
        >
          {busy ? "Creating…" : "Create project"}
        </button>
      </form>

      {error && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
          {error}
        </div>
      )}

      <div className="mt-10">
        {loading ? (
          <p className="text-sm font-semibold text-zinc-500">Loading…</p>
        ) : projects.length === 0 ? (
          <p className="text-sm font-semibold text-zinc-500">No projects yet.</p>
        ) : (
          <ul className="grid gap-4">
            {projects.map((p) => (
              <li
                key={p.id}
                className="flex items-center justify-between rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm"
              >
                <div>
                  <div className="font-extrabold text-zinc-900">{p.name}</div>
                  <div className="text-xs font-semibold text-zinc-500">
                    Updated {new Date(p.updatedAt).toLocaleString()}
                  </div>
                </div>
                <Link
                  href={`/projects/${p.id}`}
                  className="rounded-xl border border-zinc-200 px-4 py-2 text-sm font-semibold hover:bg-zinc-50"
                >
                  Open →
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
