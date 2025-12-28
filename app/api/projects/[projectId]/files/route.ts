// app/api/projects/[projectId]/files/route.ts
import { NextResponse } from "next/server";
import { kvJsonGet } from "../../../../lib/kv";
import { getCurrentUserId } from "../../../../lib/demoAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function userIdOrDemo() {
  return (typeof getCurrentUserId === "function" && getCurrentUserId()) || "demo";
}

function projectFilesKey(userId: string, projectId: string) {
  return "projectfiles:" + userId + ":" + projectId;
}

export async function GET(_req: Request, { params }: { params: { projectId: string } }) {
  try {
    const projectId = params?.projectId;
    if (!projectId) {
      return NextResponse.json({ ok: false, error: "Missing projectId" }, { status: 400 });
    }

    const userId = userIdOrDemo();
    const filesMap: Record<string, string> = (await kvJsonGet(projectFilesKey(userId, projectId))) || {};

    const files = Object.keys(filesMap).map((path) => ({
      path,
      content: filesMap[path],
    }));

    return NextResponse.json({ ok: true, projectId, files });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message ?? "Unknown error" }, { status: 500 });
  }
}
