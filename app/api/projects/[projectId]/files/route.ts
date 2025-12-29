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
  const userId = await getCurrentUserId(); // ✅ await fixes TS error
  const projectId = params.projectId;

  if (!userId) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const pKey = projectKey(userId, projectId);
  const proj = await kvJsonGet<any>(pKey);

  if (!proj) {
    return NextResponse.json({ ok: false, error: "Project not found" }, { status: 404 });
  }

  const files = Array.isArray(proj?.files) ? proj.files : [];

  return NextResponse.json({ ok: true, projectId, files });
}
