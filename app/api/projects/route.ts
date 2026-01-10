import { NextResponse } from "next/server";
import { kv } from "@vercel/kv";
import { auth } from "@clerk/nextjs/server";
import crypto from "crypto";

export const runtime = "nodejs";

type Project = {
  id: string;
  ownerId: string;
  name: string;
  createdAt: string;
  updatedAt: string;
};

function nowIso() {
  return new Date().toISOString();
}

function newProjectId() {
  return `proj_${crypto.randomUUID().replace(/-/g, "")}`;
}

function projectKey(projectId: string) {
  return `project:${projectId}`;
}

function userProjectsKey(userId: string) {
  return `projects:user:${userId}`;
}

// ✅ GET /api/projects  -> list projects for signed-in user
export async function GET() {
  const session = await auth();
  const userId = session.userId;

  if (!userId) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const ids = (await kv.lrange<string>(userProjectsKey(userId), 0, 50)) ?? [];

  const projects: Project[] = [];
  for (const id of ids) {
    const p = await kv.get<Project>(projectKey(id));
    if (p && p.ownerId === userId) {
      projects.push(p);
    }
  }

  return NextResponse.json({ ok: true, projects }, { status: 200 });
}

// ✅ POST /api/projects -> create project (simple)
export async function POST(req: Request) {
  const session = await auth();
  const userId = session.userId;

  if (!userId) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  let body: any = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  const name =
    typeof body?.name === "string" && body.name.trim().length > 0
      ? body.name.trim()
      : "Untitled Project";

  const id = newProjectId();
  const createdAt = nowIso();

  const project: Project = {
    id,
    ownerId: userId,
    name,
    createdAt,
    updatedAt: createdAt,
  };

  await kv.set(projectKey(id), project);
  await kv.lpush(userProjectsKey(userId), id);

  return NextResponse.json({ ok: true, project }, { status: 200 });
}
