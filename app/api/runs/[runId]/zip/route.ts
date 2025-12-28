// app/api/runs/[runId]/zip/route.ts
import { NextResponse } from "next/server";
import JSZip from "jszip";
import { kvJsonGet } from "../../../../lib/kv";
import { getCurrentUserId } from "../../../../lib/demoAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function runKey(userId: string, runId: string) {
  return "runs:" + userId + ":" + runId;
}

export async function GET(
  _req: Request,
  { params }: { params: { runId: string } }
) {
  try {
    const runId = params?.runId;
    if (!runId) {
      return NextResponse.json(
        { ok: false, error: "Missing runId" },
        { status: 400 }
      );
    }

    const userId =
      (typeof getCurrentUserId === "function" && getCurrentUserId()) || "demo";

    const run = await kvJsonGet(runKey(userId, runId));

    if (!run || !Array.isArray(run.files)) {
      return NextResponse.json(
        { ok: false, error: "Run not found or has no files", runId },
        { status: 404 }
      );
    }

    const zip = new JSZip();

    for (const file of run.files) {
      if (file && file.path && typeof file.content === "string") {
        zip.file(file.path, file.content);
      }
    }

    // Generate a Node Buffer then convert to Uint8Array (BodyInit-compatible)
    const nodeBuffer: Buffer = await zip.generateAsync({ type: "nodebuffer" });
    const body = new Uint8Array(nodeBuffer);

    return new NextResponse(body, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": 'attachment; filename="run_' + runId + '.zip"',
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}
