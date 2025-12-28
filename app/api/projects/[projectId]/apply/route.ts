// app/api/projects/[projectId]/apply/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";
import { kvJsonGet, kvJsonSet, kvNowISO } from "../../../../lib/kv";
import { getCurrentUserId } from "../../../../lib/demoAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BodySchema = z.object({
  runId: z.string().min(1),
});

function userIdOrDemo() {
  return (typeof getCurrentUserId === "function" && getCurrentUserId()) || "demo";
}

function runKey(userId: string, runId: string) {
  return "runs:" + userId + ":" + runId;
}

function projectKey(userId: string, projectId: string) {
  return "projects:" + userId + ":" + projectId;
}

function indexKey(userId: string) {
  return "projects:index:" + userId;
}

function projectFilesKey(userId: string, projectId: string) {
  return "projectfiles:" + userId + ":" + projectId;
}

export async function POST(
  req: Request,
  { params }: { params: { projectId: string } }
) {
  try {
    const projectId = params?.projectId;
    if (!projectId) {
      return NextResponse.json(
        { ok: false, error: "Missing projectId" },
        { status: 400 }
      );
    }

    const body = await req.json().catch(() => null);
    const parsed = BodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: "Invalid body", issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const userId = userIdOrDemo();

    const project: any = await kvJsonGet(projectKey(userId, projectId));
    if (!project) {
      return NextResponse.json(
        { ok: false, error: "Project not found" },
        { status: 404 }
      );
    }

    const run: any = await kvJsonGet(runKey(userId, parsed.data.runId));
    if (!run || !Array.isArray(run.files)) {
      return NextResponse.json(
        { ok: false, error: "Run not found or has no files" },
        { status: 404 }
      );
    }

    const filesMap: Record<string, string> =
      (await kvJsonGet(projectFilesKey(userId, projectId))) || {};

    let applied = 0;
    for (const f of run.files) {
      if (f && typeof f.path === "string" && typeof f.content === "string") {
        filesMap[f.path] = f.content;
        applied += 1;
      }
    }

    await kvJsonSet(projectFilesKey(userId, projectId), filesMap);

    project.filesCount = Object.keys(filesMap).length;
    project.lastRunId = parsed.data.runId;
    project.updatedAt = kvNowISO();

    await kvJsonSet(projectKey(userId, projectId), project);

    // Update index snapshot
    const idx = (await kvJsonGet<any[]>(indexKey(userId))) || [];
    for (let i = 0; i < idx.length; i++) {
      if (idx[i]?.projectId === projectId) {
        idx[i].updatedAt = project.updatedAt;
        idx[i].filesCount = project.filesCount;
        idx[i].lastRunId = project.lastRunId;
      }
    }
    await kvJsonSet(indexKey(userId), idx);

    return NextResponse.json({
      ok: true,
      projectId,
      runId: parsed.data.runId,
      appliedFiles: applied,
      totalFilesInProject: project.filesCount,
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}
