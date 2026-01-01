import { NextResponse } from "next/server";
import { getCurrentUserId } from "../../lib/demoAuth";
import { storeGet, storeSet } from "../../lib/store";

export const runtime = "nodejs";

type Project = {
  id: string;
  name: string;
  createdAt: string;
};

function uid(prefix = ""): string {
  const id = Math.random().toString(16).slice(2) + Math.random().toString(16).slice(2);
  return prefix ? `${prefix}_${id}` : id;
}

export async function GET() {
  const userId = await getCurrentUserId();
  const key = `projects:index:${userId}`;

  const ids = (await storeGet<string[]>(key)) ?? [];
  const projects: Project[] = [];

  for (const id of ids) {
    const p = await storeGet<Project>(`projects:${userId}:${id}`);
    if (p) projects.push(p);
  }

  return NextResponse.json({ ok: true, projects });
}

export async function POST(req: Request) {
  const userId = await getCurrentUserId();
  const body = await req.json().catch(() => ({}));
  const name = typeof body?.name === "string" ? body.name : "Untitled Project";

  const project: Project = {
    id: uid("proj"),
    name,
    createdAt: new Date().toISOString()
  };

  const indexKey = `projects:index:${userId}`;
  const ids = (await storeGet<string[]>(indexKey)) ?? [];
  ids.unshift(project.id);

  await storeSet(indexKey, ids);
  await storeSet(`projects:${userId}:${project.id}`, project);

  return NextResponse.json({ ok: true, project });
}
