// app/api/runs/[runId]/files/route.ts
import { NextResponse } from "next/server";
import { getRun } from "@/lib/runs";

/**
 * This endpoint is optional scaffolding.
 * It returns an empty files array unless you later attach generated files to a run.
 * Purpose: keep builds unblocked while you stabilize Runs.
 */
export async function GET(
  _req: Request,
  { params }: { params: { runId: string } }
) {
  const run = await getRun(params.runId);

  if (!run) {
    return NextResponse.json(
      { ok: false, error: "Run not found" },
      { status: 404 }
    );
  }

  // Placeholder: if/when you add run file outputs, return them here.
  return NextResponse.json({
    ok: true,
    runId: run.id,
    files: [],
  });
}
