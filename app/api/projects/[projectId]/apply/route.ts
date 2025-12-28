import { NextResponse } from "next/server";
import { kvJsonSet, kvNowISO } from "../../../../lib/kv";
import { getCurrentUserId } from "../../../../lib/demoAuth";

export async function POST(
  _req: Request,
  { params }: { params: { projectId: string } }
) {
  try {
    const userId = getCurrentUserId();
    const { projectId } = params;

    if (!projectId) {
      return NextResponse.json({ ok: false, error: "Missing projectId" }, { status: 400 });
    }

    await kvJsonSet(`projects:${userId}:${projectId}`, {
      projectId,
      updatedAt: kvNowISO(),
    });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "Apply failed" },
      { status: 500 }
    );
  }
}

