// app/api/projects/[projectId]/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";
import { kvJsonGet, kvJsonSet, kvNowISO } from "../../../lib/kv";
import { getCurrentUserId } from "../../../lib/demoAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PatchSchema = z.object({
  name: z.string().min(1).optional(),
});

function userIdOrDemo() {
  return (typeof getCurrentUserId === "function" && getCurrentUserId()) || "demo";
}

function indexKey(userId: string) {
  return "projects:index:" + userId;
}

function projectKey(userId: string, projectId: string) {
  return "projects:" + userId + ":" + projectId;
}

export async function GET(_req: Request, { params }: { params: { projectId: string } }) {
  try {
    const projectId = params?.projectId;
    if (!projectId) {
      return NextResponse.json({ ok: false, error: "Missing projectId" }, { status: 400 });
    }

    const userId = userIdOrDemo();
    const project = await kvJsonGet(projectKey(userId, projectId));
    if (!project) {
      return NextResponse.json({ ok: false, error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, project });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message ?? "Unknown error" }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: { projectId: string } }) {
  try {
    const projectId = params?.projectId;
    if (!projectId) {
      return NextResponse.json({ ok: false, error: "Missing projectId" }, { status: 400 });
    }

    const body = await req.json().catch(() => null);
    const parsed = PatchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: "Invalid body", issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const userId = userIdOrDemo();
    const key = projectKey(userId, projectId);
    const project: any = await kvJsonGet(key);
    if (!project) {
      return NextResponse.json({ ok: false, error: "Project not found" }, { status: 404 });
    }

    if (parsed.data.name) project.name = parsed.data.name;
    project.updatedAt = kvNowISO();

    await kvJsonSet(key, project);

    // Update index
    const idxKey = indexKey(userId);
    const idx = (await kvJsonGet<any[]>(idxKey)) || [];
    for (let i = 0; i < idx.length; i++) {
      if (idx[i]?.projectId === projectId) {
        idx[i].name = project.name;
        idx[i].updatedAt = project.updatedAt;
        idx[i].filesCount = project.filesCount || 0;
        idx[i].lastRunId = project.lastRunId || "";
      }
    }
    await kvJsonSet(idxKey, idx);

    return NextResponse.json({ ok: true, project });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message ?? "Unknown error" }, { status: 500 });
  }
}
