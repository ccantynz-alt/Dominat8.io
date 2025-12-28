// app/api/projects/[projectId]/apply/route.ts
import { NextResponse } from "next/server";
import { kvJsonGet, kvJsonSet, kvNowISO } from "@/app/lib/kv";
import { z } from "zod";
import { getCurrentUserId } from "@/app/lib/demoAuth";

const BodySchema = z.object({
  runId: z.string().min(1),
});

function projectKey(userId: string, projectId: string) {
  return `projects:${userId}:${projectId}`;
}

function runKey(runId: string) {
  return `runs:${runId}`;
}

export async function POST(
  req: Request,
  { params }: { params: { projectId: string } }
) {
  const userId = getCurrentUserId();
  const projectId = params.projectId;

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "Missing runId", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { runId } = parsed.data;

  const rKey = runKey(runId);
  const pKey = projectKey(userId, projectId);

  // 1) Load the run (source of truth)
  const run = await kvJsonGet<any>(rKey);
  const runFiles = Array.isArray(run?.files) ? run.files : [];
  const runFilesCount = runFiles.length;

  if (!run || runFilesCount === 0) {
    return NextResponse.json(
      {
        ok: false,
        error: "Run not found or run.files empty",
        userId,
        projectId,
        runId,
        rKey,
        pKey,
        runHasFiles: runFilesCount,
      },
      { status: 404 }
    );
  }

  // 2) Write to project (draft state)
  const payload = {
    projectId,
    userId,
    updatedAt: kvNowISO(),
    files: runFiles,
  };

  await kvJsonSet(pKey, payload);

  // 3) Read-back proof (kills key mismatch instantly)
  const readBack = await kvJsonGet<any>(pKey);
  const readBackCount = Array.isArray(readBack?.files) ? readBack.files.length : 0;

  return NextResponse.json({
    ok: true,
    userId,
    projectId,
    runId,
    rKey,
    pKey,
    runFilesCount,
    writtenCount: runFilesCount,
    readBackCount,
    readBackHasProjectId: readBack?.projectId ?? null,
    readBackHasUserId: readBack?.userId ?? null,
  });
}
