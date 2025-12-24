import { NextResponse } from "next/server";
import { KV } from "../../lib/kv";
import { keys } from "../../lib/keys";
import { makeId } from "../../lib/ids";
import { getCurrentUserId } from "../../lib/demoAuth";
import { CreateProjectInputSchema, ProjectSchema } from "../../lib/models/project";

export const runtime = "nodejs";

export async function GET() {
  const ownerId = getCurrentUserId();

  const ids = (await KV.zrange(keys.projectsIndexByOwner(ownerId), 0, 49, {
    rev: true,
  })) as string[];

  const projects = [];
  for (const id of ids) {
    const p = await KV.get(keys.project(id));
    if (!p) continue;
    const parsed = ProjectSchema.safeParse(p);
    if (parsed.success) projects.push(parsed.data);
  }

  return NextResponse.json({ ok: true, projects });
}

export async function POST(req: Request) {
  const ownerId = getCurrentUserId();
  const body = await req.json().catch(() => ({}));
  const parsedInput = CreateProjectInputSchema.safeParse(body);

  if (!parsedInput.success) {
    return NextResponse.json(
      { ok: false, error: "Invalid input", issues: parsedInput.error.issues },
      { status: 400 }
    );
  }

  const now = new Date().toISOString();
  const projectId = makeId("proj");

  const project = {
    id: projectId,
    ownerId,
    name: parsedInput.data.name,
    description: parsedInput.data.description ?? "",
    createdAt: now,
    updatedAt: now,
  };

  await KV.set(keys.project(projectId), project);
  await KV.sadd(keys.projectIdsByOwner(ownerId), projectId);
  await KV.zadd(keys.projectsIndexByOwner(ownerId), {
    score: Date.now(),
    member: projectId,
  });

  const validated = ProjectSchema.parse(project);
  return NextResponse.json({ ok: true, project: validated });
}
