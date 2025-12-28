// app/api/projects/[projectId]/apply/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";
import { kvJsonGet, kvJsonSet, kvNowISO } from "../../../../lib/kv";
import { getCurrentUserId } from "../../../../lib/demoAuth";

const VERSION = "apply-v9-overwrite-proof";

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

  const { runId } = parsed.data;

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

  // FORCE overwrite with files + userId every time
  const payload = {
    projectId,
    userId,
    files,
    updatedAt: kvNowISO(),
  };

  await kvJsonSet(pKey, payload);

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
  });
}
