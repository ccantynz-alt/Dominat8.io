// app/api/projects/[projectId]/files/route.ts
import { NextResponse } from "next/server";
import { kvJsonGet } from "@/app/lib/kv";
import { getCurrentUserId } from "@/app/lib/demoAuth";

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

  return NextResponse.json({
    ok: true,
    userId,
    projectId,
    pKey,
    meta: {
      updatedAt: proj?.updatedAt ?? null,
      storedProjectId: proj?.projectId ?? null,
      storedUserId: proj?.userId ?? null,
    },
    files,
    filesCount: files.length,
  });
}
