"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Project = {
  id: string;
  name: string;
  createdAt?: string;
};

export default function ProjectsPage() {
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

      if (data.project?.id) {
        setProjects((prev) => [data.project as Project, ...prev]);
      } else {
        await load();
      }
      setName("");
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
    <div className="space-y-6">
      <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-semibold tracking-tight">Projects</h1>
          <p className="text-sm text-zinc-400">
            Create a project, then run the agent inside it.
          </p>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_auto_auto]">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Project name (e.g. Airport Shuttle Landing Page)"
            className="w-full rounded-2xl border border-white/10 bg-zinc-950/60 px-4 py-3 text-sm outline-none placeholder:text-zinc-600 focus:border-white/20"
          />

          <button
            onClick={create}
            disabled={creating || !name.trim()}
            className="rounded-2xl border border-white/10 bg-white px-5 py-3 text-sm font-medium text-zinc-950 hover:bg-zinc-200 disabled:opacity-50"
          >
            {creating ? "Creating…" : "Create"}
          </button>

          <button
            onClick={load}
            disabled={loading}
            className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm hover:bg-white/10 disabled:opacity-50"
          >
            Refresh
          </button>
        </div>

        {error ? (
          <div className="mt-4 rounded-2xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-200">
            {error}
          </div>
        ) : null}
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">Your projects</h2>
          <span className="text-sm text-zinc-400">{sorted.length} total</span>
        </div>

        {loading ? (
          <p className="mt-4 text-sm text-zinc-400">Loading…</p>
        ) : sorted.length === 0 ? (
          <p className="mt-4 text-sm text-zinc-400">No projects yet — create one above.</p>
        ) : (
          <ul className="mt-4 grid gap-3">
            {sorted.map((p) => (
              <li
                key={p.id}
                className="rounded-2xl border border-white/10 bg-zinc-950/40 p-4 hover:bg-zinc-950/60"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="text-base font-semibold">{p.name}</div>
                    <div className="mt-1 text-xs text-zinc-500">
                      {p.id}
                      {p.createdAt ? (
                        <>
                          {" "}
                          • {new Date(p.createdAt).toLocaleString()}
                        </>
                      ) : null}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Link
                      href={`/projects/${p.id}`}
                      className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm hover:bg-white/10"
                    >
                      Open →
                    </Link>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
