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

function projectKey(projectId: string) {
  // Must match the create route storage
  return `project:${projectId}`;
}

// OPTIONAL: fallback keys in case older code used different patterns
const FALLBACK_KEYS = (projectId: string) => [
  `project:${projectId}`,
  `projects:${projectId}`,
  `projects:project:${projectId}`,
];

export async function GET(
  req: Request,
  ctx: { params: { projectId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ ok: false, error: 'Not signed in' }, { status: 401 });
    }

    const projectId = String(ctx?.params?.projectId || '').trim();
    if (!projectId) {
      return NextResponse.json({ ok: false, error: 'Missing projectId' }, { status: 400 });
    }

    // Try canonical key first
    let raw = await kv.get(projectKey(projectId));

    // Fallback: try a few other common keys (helps if older data exists)
    if (!raw) {
      for (const key of FALLBACK_KEYS(projectId)) {
        raw = await kv.get(key);
        if (raw) break;
      }
    }

    if (!raw || typeof raw !== 'object') {
      return NextResponse.json(
        { ok: false, error: 'Project not found' },
        { status: 404 }
      );
    }

    const obj: any = raw;

    // Security check: project must belong to signed-in user
    if (String(obj.userId) !== userId) {
      return NextResponse.json(
        { ok: false, error: 'Project not found or you do not have access.' },
        { status: 404 }
      );
    }

    const project: Project = {
      id: String(obj.id ?? projectId),
      userId: String(obj.userId),
      name: String(obj.name ?? 'Untitled project'),
      createdAt: Number(obj.createdAt ?? obj.created_at ?? 0) || 0,
      updatedAt: Number(obj.updatedAt ?? obj.updated_at ?? 0) || 0,
    };

    return NextResponse.json({ ok: true, project });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || 'Failed to load project' },
      { status: 500 }
    );
  }
}
