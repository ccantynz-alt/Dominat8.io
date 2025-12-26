// app/api/projects/route.ts
import { NextResponse } from "next/server";
import { kvJsonGet, kvJsonSet, kvNowISO, kv } from "../../lib/kv";
import { getCurrentUserId } from "../../lib/demoAuth";
import { z } from "zod";
import { randomUUID } from "crypto";

function uid(prefix = ""): string {
  const id = randomUUID().replace(/-/g, "");
  return prefix ? `${prefix}_${id}` : id;
}

function indexKey(userId: string) {
  return `projects:index:${userId}`;
}

function projectKey(userId: string, projectId: string) {
  return `projects:${userId}:${projectId}`;
}

const CreateProjectSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional()
});

type Project = {
  id: string;
  userId: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
};

type ProjectsIndex = { ids: string[] };

export async function GET() {
  const userId = getCurrentUserId();
  const idx = (await kvJsonGet<ProjectsIndex>(indexKey(userId))) ?? { ids: [] };

  const projects: Project[] = [];
  for (const id of idx.ids) {
    const p = await kvJsonGet<Project>(projectKey(userId, id));
    if (p) projects.push(p);
  }

  return NextResponse.json({ ok: true, projects });
}

export async function POST(req: Request) {
  const userId = getCurrentUserId();

  const body = await req.json().catch(() => null);
  const parsed = CreateProjectSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Invalid input" }, { status: 400 });
  }

  const now = await kvNowISO();
  const id = uid("proj");

  const project: Project = {
    id,
    userId,
    name: parsed.data.name,
    description: parsed.data.description,
    createdAt: now,
    updatedAt: now
  };

  await kvJsonSet(projectKey(userId, id), project);

  const idx = (await kvJsonGet<ProjectsIndex>(indexKey(userId))) ?? { ids: [] };
  if (!idx.ids.includes(id)) idx.ids.unshift(id);
  await kvJsonSet(indexKey(userId), idx);

  return NextResponse.json({ ok: true, project }, { status: 201 });
}

export async function DELETE(req: Request) {
  const userId = getCurrentUserId();
  const url = new URL(req.url);
  const projectId = url.searchParams.get("id");
  if (!projectId) {
    return NextResponse.json({ ok: false, error: "Missing ?id=" }, { status: 400 });
  }

  await kv.del(projectKey(userId, projectId));

  const idx = (await kvJsonGet<ProjectsIndex>(indexKey(userId))) ?? { ids: [] };
  idx.ids = idx.ids.filter((x) => x !== projectId);
  await kvJsonSet(indexKey(userId), idx);

  return NextResponse.json({ ok: true });
}
