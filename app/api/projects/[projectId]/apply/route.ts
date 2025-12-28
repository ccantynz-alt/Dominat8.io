// app/api/projects/[projectId]/apply/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";
import { kvJsonGet, kvJsonSet, kvNowISO } from "../../../../lib/kv";
import { getCurrentUserId } from "../../../../lib/demoAuth";

const VERSION = "apply-v11-path-guardrails";

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

// ✅ Only allow site UI files under app/generated/**
// ❌ Block anything with /api/, .., or weird absolute paths
function isAllowedGeneratedPath(p: string): boolean {
  if (typeof p !== "string") return false;

  // normalize slashes
  const path = p.replace(/\\/g, "/");

  // must live under app/generated/
  if (!path.startsWith("app/generated/")) return false;

  // block traversal + absolute-ish
  if (path.includes("..") || path.startsWith("/") || path.includes("://")) return false;

  // never allow api routes inside generated area
  if (path.includes("/api/")) return false;

  // allow common web build file types
  const okExt = [".tsx", ".ts", ".css", ".md", ".json", ".txt", ".svg"];
  if (!okExt.some((ext) => path.endsWith(ext))) return false;

  return true;
}

async function applyRunToProject(userId: string, projectId: string, runId: string) {
  const rKey1 = runKeyUser(userId, runId);
  const rKey2 = runKeyLegacy(runId);

  const run = (await kvJsonGet<any>(rKey1)) ?? (await kvJsonGet<any>(rKey2));
  const rawFiles = Array.isArray(run?.files) ? run.files : [];

  // sanitize
  const kept = [];
  const dropped: Array<{ path: string; reason: string }> = [];

  for (const f of rawFiles) {
    const path = String(f?.path ?? "");
    const content = String(f?.content ?? "");

    if (!path) {
      dropped.push({ path, reason: "missing path" });
      continue;
    }
    if (!isAllowedGeneratedPath(path)) {
      dropped.push({ path, reason: "disallowed path" });
      continue;
    }
    kept.push({ path, content });
  }

  if (kept.length === 0) {
    return NextResponse.json(
      {
        ok: false,
        version: VERSION,
        error: "Run contained no allowed generated UI files",
        userId,
        projectId,
        runId,
        triedRunKeys: [rKey1, rKey2],
        rawFilesCount: rawFiles.length,
        keptCount: kept.length,
        dropped,
      },
      { status: 400 }
    );
  }

  const pKey = projectKey(userId, projectId);

  const payload = {
    projectId,
    userId,
    files: kept,
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
    rawFilesCount: rawFiles.length,
    writtenFiles: kept.length,
    readBackCount,
    droppedCount: dropped.length,
    dropped,
  });
}

/** GET /apply?runId=run_xxx */
export async function GET(req: Request, { params }: { params: { projectId: string } }) {
  const userId = getCurrentUserId();
  const projectId = params.projectId;
  const url = new URL(req.url);
  const runId = url.searchParams.get("runId") || "";

  if (!runId) {
    return NextResponse.json(
      { ok: false, version: VERSION, error: "Missing runId query param. Use /apply?runId=run_xxx" },
      { status: 400 }
    );
  }

  return applyRunToProject(userId, projectId, runId);
}

/** POST { runId } */
export async function POST(req: Request, { params }: { params: { projectId: string } }) {
  const userId = getCurrentUserId();
  const projectId = params.projectId;

  const body = await req.json().catch(() => null);
  const parsed = BodySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ ok: false, version: VERSION, error: "Missing runId" }, { status: 400 });
  }

  return applyRunToProject(userId, projectId, parsed.data.runId);
}
