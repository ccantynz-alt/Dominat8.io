'use client';

import React, { useEffect, useMemo, useState } from 'react';

type Project = {
  id: string;
  name?: string | null;
  createdAt?: string | number | null;
  updatedAt?: string | number | null;
};

function formatDate(value: any) {
  if (!value) return '';
  try {
    const d = typeof value === 'number' ? new Date(value) : new Date(String(value));
    if (Number.isNaN(d.getTime())) return '';
    return d.toLocaleString();
  } catch {
    return '';
  }
}

function normalizeProjects(payload: any): Project[] {
  // Accept a few possible shapes to avoid UI breaking if the API changes slightly
  const raw =
    payload?.projects ??
    payload?.data?.projects ??
    payload?.items ??
    payload?.data ??
    payload ??
    [];

  if (!Array.isArray(raw)) return [];

  return raw
    .map((p: any) => ({
      id: String(p?.id ?? p?.projectId ?? ''),
      name: p?.name ?? p?.title ?? null,
      createdAt: p?.createdAt ?? p?.created_at ?? null,
      updatedAt: p?.updatedAt ?? p?.updated_at ?? null,
    }))
    .filter((p: Project) => !!p.id);
}

async function fetchProjectsClient(): Promise<Project[]> {
  const res = await fetch('/api/projects', { method: 'GET' });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || `Failed to load projects (HTTP ${res.status})`);
  }

  const data = await res.json().catch(() => null);
  return normalizeProjects(data);
}

async function createProjectClient(name: string): Promise<any> {
  if (!name || !name.trim()) throw new Error('Project name is required');

  const res = await fetch('/api/projects', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ name: name.trim() }),
  });

  // Free plan limit (or other forbidden)
  if (res.status === 403) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.error || 'Free plan limit reached: 1 project. Upgrade to Pro.');
  }

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || `Failed to create project (HTTP ${res.status})`);
  }

  return res.json();
}

function Card(props: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-neutral-200 bg-white shadow-sm ${props.className ?? ''}`}>
      {props.children}
    </div>
  );
}

function Button(props: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' }) {
  const variant = props.variant ?? 'primary';
  const base =
    'inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed';
  const styles =
    variant === 'primary'
      ? 'bg-black text-white hover:bg-neutral-800'
      : 'bg-white text-black border border-neutral-300 hover:bg-neutral-50';
  return (
    <button {...props} className={`${base} ${styles} ${props.className ?? ''}`}>
      {props.children}
    </button>
  );
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-neutral-500 ${
        props.className ?? ''
      }`}
    />
  );
}

function Divider() {
  return <div className="h-px w-full bg-neutral-200" />;
}

function UpgradeModal(props: { open: boolean; onClose: () => void; message?: string }) {
  if (!props.open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">
        <div className="p-5">
          <div className="text-lg font-semibold text-neutral-900">Upgrade to Pro</div>
          <div className="mt-2 text-sm text-neutral-600">
            {props.message || 'You’ve hit the Free plan limit. Upgrade to Pro to create unlimited projects.'}
          </div>

          <div className="mt-4 rounded-xl border border-neutral-200 bg-neutral-50 p-4">
            <ul className="space-y-2 text-sm text-neutral-700">
              <li>• Unlimited projects</li>
              <li>• Faster workflows</li>
              <li>• Priority features as they roll out</li>
            </ul>
          </div>

          <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
            <Button variant="secondary" onClick={props.onClose}>
              Not now
            </Button>

            {/* If you already have a dedicated upgrade page/flow, this link will work.
                If not, we’ll wire it next. */}
            <a
              href="/pricing"
              className="inline-flex items-center justify-center rounded-xl bg-black px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
            >
              Go to Upgrade
            </a>
          </div>

          <div className="mt-3 text-xs text-neutral-500">
            If “/pricing” doesn’t exist yet, tell me — I’ll create it and wire Stripe checkout properly.
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [name, setName] = useState('');
  const [creating, setCreating] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [upgradeMessage, setUpgradeMessage] = useState<string | undefined>(undefined);

  const sortedProjects = useMemo(() => {
    // Stable sorting: newest first if we have timestamps
    const copy = [...projects];
    copy.sort((a, b) => {
      const at = a.updatedAt ?? a.createdAt ?? 0;
      const bt = b.updatedAt ?? b.createdAt ?? 0;
      const an = typeof at === 'number' ? at : new Date(String(at)).getTime();
      const bn = typeof bt === 'number' ? bt : new Date(String(bt)).getTime();
      return (bn || 0) - (an || 0);
    });
    return copy;
  }, [projects]);

  async function loadProjects(initial = false) {
    try {
      if (initial) setLoading(true);
      else setRefreshing(true);

      setError(null);
      const items = await fetchProjectsClient();
      setProjects(items);
    } catch (e: any) {
      setError(e?.message || 'Failed to load projects');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadProjects(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    setError(null);

    try {
      await createProjectClient(name);

      // Reset input and refresh list
      setName('');
      await loadProjects(false);
    } catch (err: any) {
      const msg = err?.message || 'Failed to create project';

      // If it looks like the known Free plan limit error, open upgrade modal
      if (String(msg).toLowerCase().includes('free plan limit')) {
        setUpgradeMessage(msg);
        setUpgradeOpen(true);
      } else {
        setError(msg);
      }
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <UpgradeModal open={upgradeOpen} onClose={() => setUpgradeOpen(false)} message={upgradeMessage} />

      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-neutral-900">Projects</h1>
            <p className="mt-1 text-sm text-neutral-600">
              Create and manage your websites here. Free users can create 1 project.
            </p>
          </div>

          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => loadProjects(false)} disabled={loading || refreshing}>
              {refreshing ? 'Refreshing…' : 'Refresh'}
            </Button>
            <a
              href="/dashboard"
              className="inline-flex items-center justify-center rounded-xl border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-black hover:bg-neutral-50"
            >
              Back to Dashboard
            </a>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
          {/* Left: Create */}
          <Card className="lg:col-span-1">
            <div className="p-5">
              <div className="text-base font-semibold text-neutral-900">Create a project</div>
              <p className="mt-1 text-sm text-neutral-600">Give it a name — you can change it later.</p>

              <form onSubmit={onCreate} className="mt-4 space-y-3">
                <div>
                  <label className="mb-1 block text-sm font-medium text-neutral-800">Project name</label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., My Plumbing Website"
                    maxLength={80}
                    disabled={creating}
                  />
                </div>

                <Button type="submit" disabled={creating || !name.trim()}>
                  {creating ? 'Creating…' : 'Create Project'}
                </Button>

                <div className="text-xs text-neutral-500">
                  Tip: If you hit the Free limit, you’ll see an Upgrade button instead of a silent failure.
                </div>
              </form>
            </div>
          </Card>

          {/* Right: List */}
          <Card className="lg:col-span-2">
            <div className="p-5">
              <div className="flex items-center justify-between">
                <div className="text-base font-semibold text-neutral-900">Your projects</div>
                <div className="text-sm text-neutral-600">{sortedProjects.length} total</div>
              </div>

              <div className="mt-4">
                {loading ? (
                  <div className="space-y-3">
                    <div className="h-16 w-full animate-pulse rounded-xl bg-neutral-200" />
                    <div className="h-16 w-full animate-pulse rounded-xl bg-neutral-200" />
                    <div className="h-16 w-full animate-pulse rounded-xl bg-neutral-200" />
                  </div>
                ) : error ? (
                  <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                    <div className="text-sm font-medium text-red-900">Something went wrong</div>
                    <div className="mt-1 whitespace-pre-wrap text-sm text-red-800">{error}</div>
                    <div className="mt-3">
                      <Button variant="secondary" onClick={() => loadProjects(false)}>
                        Try again
                      </Button>
                    </div>
                  </div>
                ) : sortedProjects.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-neutral-300 bg-white p-8 text-center">
                    <div className="mx-auto max-w-md">
                      <div className="text-lg font-semibold text-neutral-900">No projects yet</div>
                      <p className="mt-2 text-sm text-neutral-600">
                        Create your first project on the left. Once you do, it will show up here.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="divide-y divide-neutral-200 overflow-hidden rounded-2xl border border-neutral-200 bg-white">
                    {sortedProjects.map((p) => (
                      <a
                        key={p.id}
                        href={`/projects/${encodeURIComponent(p.id)}`}
                        className="block p-4 hover:bg-neutral-50"
                      >
                        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <div className="text-sm font-semibold text-neutral-900">{p.name || 'Untitled project'}</div>
                            <div className="mt-1 text-xs text-neutral-600">
                              {formatDate(p.updatedAt) ? (
                                <>Updated: {formatDate(p.updatedAt)}</>
                              ) : formatDate(p.createdAt) ? (
                                <>Created: {formatDate(p.createdAt)}</>
                              ) : (
                                <>Project ID: {p.id}</>
                              )}
                            </div>
                          </div>

                          <div className="mt-2 inline-flex w-fit items-center rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-xs text-neutral-700 sm:mt-0">
                            Open →
                          </div>
                        </div>
                      </a>
                    ))}
                  </div>
                )}
              </div>

              <Divider />

              <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-xs text-neutral-500">
                  If you want a “grid view” or “search”, say so — easy add.
                </div>

                <div className="flex gap-2">
                  <a
                    href="/api/debug/plan"
                    className="inline-flex items-center justify-center rounded-xl border border-neutral-300 bg-white px-3 py-2 text-xs font-medium text-black hover:bg-neutral-50"
                  >
                    Debug: Plan
                  </a>
                  <a
                    href="/admin"
                    className="inline-flex items-center justify-center rounded-xl border border-neutral-300 bg-white px-3 py-2 text-xs font-medium text-black hover:bg-neutral-50"
                  >
                    Admin
                  </a>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div className="mt-8 text-center text-xs text-neutral-500">
          Next up after this is stable: wire the Upgrade button to Stripe Checkout cleanly (no guessing).
        </div>
      </div>
    </div>
  );
}
