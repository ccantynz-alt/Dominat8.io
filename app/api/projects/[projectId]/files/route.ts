// app/api/projects/[projectId]/files/route.ts
import { NextResponse } from "next/server";
import { kvJsonGet } from "../../../../lib/kv";
import { getCurrentUserId } from "../../../../lib/demoAuth";

const VERSION = "files-v3-debug";

function projectKey(userId: string, projectId: string) {
  return `projects:${userId}:${projectId}`;
}

export async function GET(
  _req: Request,
  { params }: { params: { projectId: string } }
) {
  const userId = getCurrentUserId();
  const projectId = params.projectId;

  const pKey = projectKey(userId, projectId);
  const proj = await kvJsonGet<any>(pKey);

  const files = Array.isArray(proj?.files) ? proj.files : [];
  const filesCount = files.length;

  return NextResponse.json({
    ok: true,
    version: VERSION,
    userId,
    projectId,
    pKey,
    meta: {
      updatedAt: proj?.updatedAt ?? null,
      storedProjectId: proj?.projectId ?? null,
      storedUserId: proj?.userId ?? null,
    },
    filesCount,
    files,
  });
}
