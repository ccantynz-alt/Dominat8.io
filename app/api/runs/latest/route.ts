import { NextResponse } from "next/server";
import { kv } from "@vercel/kv";

export async function GET() {
  try {
    // We store a pointer when runs are created/executed
    const latestRunId = await kv.get("runs:latest");

    if (!latestRunId || typeof latestRunId !== "string") {
      return NextResponse.json(
        { ok: false, error: "No latest run yet." },
        { status: 404 }
      );
    }

    const run = await kv.get(`run:${latestRunId}`);

    if (!run) {
      return NextResponse.json(
        { ok: false, error: "Latest run record not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true, runId: latestRunId, run });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "Failed to load latest run" },
      { status: 500 }
    );
  }
}
