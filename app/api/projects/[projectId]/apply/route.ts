// app/api/projects/[projectId]/apply/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";
import { kvJsonGet, kvJsonSet, kvNowISO } from "../../../../lib/kv";
import { getCurrentUserId } from "../../../../lib/demoAuth";

const VERSION = "apply-v10-get-and-post";

const BodySchema = z.object({
  runId: z.string().min(1),
});

function projectKey(userId: string, projectId: string) {
  return `projects:${userId}:${projectId}`;
}

function runKeyUser(userId: string, runId: string) {
  return `runs:${userId}:${runId}`;
}

function runKeyLegacy(runId: string) {
  return `runs:${runId}`;
}

async function applyRunToProject(userId: string, projectId: string, runId: string) {
  const rKey1 = runKeyUser(userId, runId);
  const rKey2 = runKeyLegacy(runId);

  const run = (await kvJsonGet<any>(rKey1)) ?? (await kvJsonGet<any>(rKey2));
  const files = Array.isArray(run?.files) ? run.files : [];

  if (files.length === 0) {
    return NextResponse.json(
      {
        ok: false,
        version: VERSION,
        error: "Run not found or run.files empty",
        userId,
        projectId,
        runId,
        triedRunKeys: [rKey1, rKey2],
      },
      { status: 404 }
    );
  }

  const pKey = projectKey(userId, projectId);

  // FORCE overwrite with files + userId
  const payload = {
    projectId,
    userId,
    files,
    updatedAt: kvNowISO(),
  };

  await kvJsonSet(pKey, payload);

  // Read-back proof
  const readBack = await kvJsonGet<any>(pKey);
  const readBackCount = Array.isArray(readBack?.files) ? readBack.files.length : 0;

  return NextResponse.json({
    ok: true,
    version: VERSION,
    userId,
    projectId,
    runId,
    usedRunKey: (await kvJsonGet<any>(rKey1)) ? rKey1 : rKey2,
    pKey,
    writtenFiles: files.length,
    readBackCount,
    readBackUserId: readBack?.userId ?? null,
    readBackUpdatedAt: readBack?.updatedAt ?? null,
  });
}

/**
 * ✅ NEW: GET /apply?runId=run_xxx
 * This lets you apply via a normal browser link (no Console).
 */
export async function GET(
  req: Request,
  { params }: { params: { projectId: string } }
) {
  const userId = getCurrentUserId();
  const projectId = params.projectId;

  const url = new URL(req.url);
  const runId = url.searchParams.get("runId") || "";

  if (!runId) {
    return NextResponse.json(
      {
        ok: false,
        version: VERSION,
        error: "Missing runId query param. Use /apply?runId=run_xxx",
        userId,
        projectId,
      },
      { status: 400 }
    );
  }

  return applyRunToProject(userId, projectId, runId);
}

/**
 * POST still supported: { runId }
 */
export async function POST(
  req: Request,
  { params }: { params: { projectId: string } }
) {
  const userId = getCurrentUserId();
  const projectId = params.projectId;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, version: VERSION, error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, version: VERSION, error: "Missing runId" },
      { status: 400 }
    );
  }

  return applyRunToProject(userId, projectId, parsed.data.runId);
}
