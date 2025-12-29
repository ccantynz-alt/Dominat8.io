// app/api/projects/[projectId]/route.ts
import { NextResponse } from "next/server";
import { kvJsonGet, kvJsonSet } from "@/app/lib/kv";
import { getCurrentUserId } from "@/app/lib/demoAuth";

function projectKey(userId: string, projectId: string) {
  return `projects:${userId}:${projectId}`;
}

// Always return a string user id (demo-friendly)
async function userIdOrDemo(): Promise<string> {
  const uid = await getCurrentUserId();
  return uid || "demo-user";
}

export async function GET(
  _req: Request,
  { params }: { params: { projectId: string } }
) {
  const projectId = params.projectId;
  const userId = await userIdOrDemo();

  const project = await kvJsonGet<any>(projectKey(userId, projectId));
  if (!project) {
    return NextResponse.json({ ok: false, error: "Project not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true, project });
}

export async function PATCH(
  req: Request,
  { params }: { params: { projectId: string } }
) {
  const projectId = params.projectId;
  const userId = await userIdOrDemo();

  const body = await req.json().catch(() => ({}));

  const existing = await kvJsonGet<any>(projectKey(userId, projectId));
  if (!existing) {
    return NextResponse.json({ ok: false, error: "Project not found" }, { status: 404 });
  }

  // Allow updating a limited set of fields
  const next = {
    ...existing,
    ...(typeof body?.name === "string" ? { name: body.name } : {}),
    ...(Array.isArray(body?.files) ? { files: body.files } : {}),
    ...(typeof body?.updatedAt === "string" ? { updatedAt: body.updatedAt } : {}),
  };

  await kvJsonSet(projectKey(userId, projectId), next);

  return NextResponse.json({ ok: true, project: next });
}
