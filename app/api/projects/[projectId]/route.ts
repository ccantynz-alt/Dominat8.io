// app/api/projects/[projectId]/route.ts
import { NextResponse } from "next/server";
import { kv, kvJsonGet, kvJsonSet, kvNowISO } from "../../../lib/kv";
import { getCurrentUserId } from "../../../lib/demoAuth";
import { z } from "zod";

function projectKey(userId: string, projectId: string) {
  return `projects:${userId}:${projectId}`;
}

const UpdateProjectSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
});

type Project = {
  id: string;
  userId: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
};

export async function GET(_req: Request, ctx: { params: { projectId: string } }) {
  const userId = getCurrentUserId();
  const projectId = ctx.params.projectId;

  const project = await kvJsonGet<Project>(projectKey(userId, projectId));
  if (!project) {
    return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true, project });
}

export async function PATCH(req: Request, ctx: { params: { projectId: string } }) {
  const userId = getCurrentUserId();
  const projectId = ctx.params.projectId;

  const existing = await kvJsonGet<Project>(projectKey(userId, projectId));
  if (!existing) {
    return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = UpdateProjectSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const now = await kvNowISO();
  const updated: Project = {
    ...existing,
    ...parsed.data,
    updatedAt: now,
  };

  await kvJsonSet(projectKey(userId, projectId), updated);
  return NextResponse.json({ ok: true, project: updated });
}

export async function DELETE(_req: Request, ctx: { params: { projectId: string } }) {
  const userId = getCurrentUserId();
  const projectId = ctx.params.projectId;

  const existing = await kvJsonGet<Project>(projectKey(userId, projectId));
  if (!existing) {
    return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  }

  await kv.del(projectKey(userId, projectId));
  return NextResponse.json({ ok: true });
}
