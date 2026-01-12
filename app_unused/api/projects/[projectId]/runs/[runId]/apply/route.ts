import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { kv } from "@vercel/kv";

export async function POST(
  _req: Request,
  {
    params,
  }: { params: { projectId: string; runId: string } }
) {
  // ✅ FIX: auth() must be awaited in your current Clerk typings/build
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const { projectId, runId } = params;

  // Stub-friendly "apply":
  // Mark this run as the latest applied for the project.
  const key = `project:${projectId}:appliedRunId`;

  try {
    await kv.set(key, { runId, appliedBy: userId, appliedAt: Date.now() });

    return NextResponse.json({
      ok: true,
      projectId,
      runId,
      note: "Stubbed apply endpoint. Later this can copy generated HTML into a publish location.",
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || "Failed to apply run" },
      { status: 500 }
    );
  }
}
