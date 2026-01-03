import { NextResponse } from "next/server";
import { kv } from "@vercel/kv";

export async function GET(
  _req: Request,
  { params }: { params: { runId: string } }
) {
  try {
    const runId = params.runId;

    const data = await kv.get(`generated:run:${runId}`);

    if (!data) {
      return NextResponse.json(
        { ok: false, error: "No generated page found for this run yet." },
        { status: 404 }
      );
    }

    // data should look like: { html, projectId, runId, createdAt }
    return NextResponse.json({ ok: true, data });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "Failed to load generated run" },
      { status: 500 }
    );
  }
}

