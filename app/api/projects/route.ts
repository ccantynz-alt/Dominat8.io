import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { kv } from '@vercel/kv';

export const runtime = 'nodejs';

type Project = {
  id: string;
  userId: string;
  name: string;
  createdAt: number;
  updatedAt: number;
};

function now() {
  return Date.now();
}

function projectListKey(userId: string) {
  // Canonical list of a user's project IDs
  return `projects:clerk:${userId}`;
}

function projectKey(projectId: string) {
  // Canonical project object storage
  return `project:${projectId}`;
}

function planKey(userId: string) {
  // Source-of-truth plan key (per your handover)
  return `plan:clerk:${userId}`;
}

async function getUserPlan(userId: string): Promise<'free' | 'pro'> {
  const plan = await kv.get(planKey(userId));
  return plan === 'pro' ? 'pro' : 'free';
}

async function getUserProjectIds(userId: string): Promise<string[]> {
  const ids = await kv.get(projectListKey(userId));
  if (Array.isArray(ids)) {
    return ids.map((x) => String(x)).filter(Boolean);
  }
  return [];
}

async function setUserProjectIds(userId: string, ids: string[]) {
  await kv.set(projectListKey(userId), ids);
}

function makeId() {
  // Works in Node runtime on Vercel
  return globalThis.crypto?.randomUUID?.() ?? `proj_${Math.random().toString(16).slice(2)}${Date.now()}`;
}

/**
 * GET /api/projects
 * Returns: { ok: true, projects: Project[] }
 */
export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ ok: false, error: 'Not signed in' }, { status: 401 });
    }

    const ids = await getUserProjectIds(userId);

    if (ids.length === 0) {
      return NextResponse.json({ ok: true, projects: [] });
    }

    // Load each project record
    const projects: Project[] = [];
    for (const id of ids) {
      const p = await kv.get(projectKey(id));
      if (p && typeof p === 'object') {
        const obj: any = p;
        if (String(obj.userId) === userId) {
          projects.push({
            id: String(obj.id ?? id),
            userId: String(obj.userId),
            name: String(obj.name ?? 'Untitled project'),
            createdAt: Number(obj.createdAt ?? obj.created_at ?? 0) || 0,
            updatedAt: Number(obj.updatedAt ?? obj.updated_at ?? 0) || 0,
          });
        }
      }
    }

    // Newest first (stable UX)
    projects.sort((a, b) => (b.updatedAt || b.createdAt || 0) - (a.updatedAt || a.createdAt || 0));

    return NextResponse.json({ ok: true, projects });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || 'Failed to load projects' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/projects
 * Body: { name: string }
 * Enforces: Free => max 1 project, Pro => unlimited
 */
export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ ok: false, error: 'Not signed in' }, { status: 401 });
    }

    const body = await req.json().catch(() => null);
    const name = String(body?.name ?? '').trim();

    if (!name) {
      return NextResponse.json({ ok: false, error: 'Project name is required' }, { status: 400 });
    }

    const plan = await getUserPlan(userId);
    const ids = await getUserProjectIds(userId);

    // ✅ Free plan enforcement (per your handover)
    if (plan === 'free' && ids.length >= 1) {
      return NextResponse.json(
        { ok: false, error: 'Free plan limit reached: 1 project. Upgrade to Pro.' },
        { status: 403 }
      );
    }

    const id = makeId();
    const t = now();

    const project: Project = {
      id,
      userId,
      name,
      createdAt: t,
      updatedAt: t,
    };

    // Save project + update list
    await kv.set(projectKey(id), project);
    await setUserProjectIds(userId, [...ids, id]);

    return NextResponse.json({ ok: true, project });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || 'Failed to create project' },
      { status: 500 }
    );
  }
}
