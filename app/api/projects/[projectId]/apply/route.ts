// app/api/projects/[projectId]/apply/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";
import { kvJsonGet, kvJsonSet, kvNowISO } from "../../../../lib/kv";
import { getCurrentUserId } from "../../../../lib/demoAuth";

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
    return NextResponse.json({ ok: false, error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "Missing runId" },
      { status: 400 }
    );
  }

  const { runId } = parsed.data;

  // 1️⃣ Load run (user-scoped first, legacy fallback)
  const run =
    (await kvJsonGet<any>(runKeyUser(userId, runId))) ??
    (await kvJsonGet<any>(runKeyLegacy(runId)));

  const files = Array.isArray(run?.files) ? run.files : [];

  if (files.length === 0) {
    return NextResponse.json(
      {
        ok: false,
        error: "Run has no files",
        userId,
        projectId,
        runId,
      },
      { status: 404 }
    );
  }

  // 2️⃣ FORCE overwrite project draft (THIS IS THE KEY FIX)
  const payload = {
    projectId,
    userId,
    files, // 👈 ALWAYS WRITE FILES
    updatedAt: kvNowISO(),
  };

  const pKey = projectKey(userId, projectId);
  await kvJsonSet(pKey, payload);

  // 3️⃣ Read-back proof
  const readBack = await kvJsonGet<any>(pKey);
  const readBackCount = Array.isArray(readBack?.files)
    ? readBack.files.length
    : 0;

  return NextResponse.json({
    ok: true,
    userId,
    projectId,
    runId,
    pKey,
    writtenFiles: files.length,
    readBackCount,
  });
}
