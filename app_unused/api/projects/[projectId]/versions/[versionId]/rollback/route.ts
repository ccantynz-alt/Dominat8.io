import { NextResponse } from "next/server";
import { kv } from "@vercel/kv";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function json(data: any, status = 200) {
  return NextResponse.json(data, { status });
}

export async function POST(
  _req: Request,
  ctx: { params: { projectId: string; versionId: string } }
) {
  try {
    const { projectId, versionId } = ctx.params;

    const versionKey = `generated:project:${projectId}:v:${versionId}`;
    const html = await kv.get<string>(versionKey);

    if (!html) {
      return json({ ok: false, error: "Version not found" }, 404);
    }

    const latestKey = `generated:project:${projectId}:latest`;
    await kv.set(latestKey, html);

    return json({
      ok: true,
      projectId,
      versionId,
      rolledBack: true,
    });
  } catch (err) {
    console.error("Rollback error:", err);
    return json({ ok: false, error: "Rollback failed" }, 500);
  }
}
