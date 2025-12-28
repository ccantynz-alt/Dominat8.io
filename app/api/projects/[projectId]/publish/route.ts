import { NextResponse } from "next/server";
import { kvJsonGet } from "../../../../lib/kv";
import { getCurrentUserId } from "../../../../lib/demoAuth";

export async function POST(
  _req: Request,
  { params }: { params: { projectId: string } }
) {
  try {
    const userId = getCurrentUserId();
    const { projectId } = params;

    if (!projectId) {
      return NextResponse.json(
        { ok: false, error: "Missing projectId" },
        { status: 400 }
      );
    }

    const project = await kvJsonGet(`projects:${userId}:${projectId}`);

    return NextResponse.json({
      ok: true,
      commitUrl: "https://github.com/example/commit/demo",
      project,
    });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "Publish failed" },
      { status: 500 }
    );
  }
}
