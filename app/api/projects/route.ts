import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { kv } from "@vercel/kv";
import {
  ensureCanCreateProject,
  toJsonError,
  trackProjectForUser,
} from "@/app/lib/limits";

type Project = {
  id: string;
  name: string;
  ownerId: string;
  createdAt: string;
};

function nowIso() {
  return new Date().toISOString();
}

function makeId(prefix: string) {
  return `${prefix}_${Math.random().toString(16).slice(2)}${Date.now().toString(16)}`;
}

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  // Store projects per-user so you only see your own
  const listKey = `user:${userId}:projects`;

  const ids = (await kv.lrange(listKey, 0, -1)) as string[] | null;
  const projectIds = Array.isArray(ids) ? ids : [];

  const projects: Project[] = [];
  for (const id of projectIds) {
    const p = (await kv.get(`project:${id}`)) as Project | null;
    if (p) projects.push(p);
  }

  // Newest first
  projects.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

  return NextResponse.json({ ok: true, projects });
}

export async function POST(req: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  // ✅ Enforce Free vs Pro project creation limit (backend)
  try {
    await ensureCanCreateProject(userId);
  } catch (err) {
    const { status, body } = toJsonError(err);
    return NextResponse.json(body, { status });
  }

  const body = (await req.json().catch(() => ({}))) as { name?: string };
  const name = (body?.name || "Untitled Project").toString().trim() || "Untitled Project";

  const id = makeId("proj");
  const project: Project = {
    id,
    name,
    ownerId: userId,
    createdAt: nowIso(),
  };

  await kv.set(`project:${id}`, project);

  // Add to the user's project list (existing behavior)
  const listKey = `user:${userId}:projects`;
  await kv.lpush(listKey, id);

  // ✅ Track the project in the limits set (for counting)
  await trackProjectForUser(userId, id);

  return NextResponse.json({ ok: true, project });
}
