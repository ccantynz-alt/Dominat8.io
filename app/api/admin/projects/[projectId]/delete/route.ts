import { NextResponse } from "next/server";
import { kv } from "@vercel/kv";
import { auth } from "@clerk/nextjs/server";
import { isAdminUserId } from "../../../../../lib/admin";

export async function POST(
  _req: Request,
  { params }: { params: { projectId: string } }
) {
  const { userId } = auth();

  if (!isAdminUserId(userId)) {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }

  const projectKey = `project:${params.projectId}`;
  const project = await kv.hgetall<any>(projectKey);

  if (!project) {
    return NextResponse.json({ ok: false, error: "Project not found" }, { status: 404 });
  }

  // Delete runs + generated HTML
  const runIds = await kv.lrange<string[]>(`project:${params.projectId}:runs`, 0, -1);

  for (const runId of runIds) {
    await kv.del(`run:${runId}`);
    await kv.del(`generated:run:${runId}`);
  }

  // Remove project lists + runs list
  await kv.del(`project:${params.projectId}:runs`);
  await kv.lrem(`projects:user:${project.userId}`, 0, params.projectId);
  await kv.lrem(`projects:all`, 0, params.projectId);

  // Delete project hash
  await kv.del(projectKey);

  return NextResponse.json({ ok: true });
}
