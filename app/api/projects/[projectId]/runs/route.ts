import { NextResponse } from "next/server";
import { nowISO } from "../../../../../lib/runs";
import { getCurrentUserId } from "../../../../lib/demoAuth";

export const runtime = "nodejs";

export async function GET(
  _req: Request,
  { params }: { params: { projectId: string } }
) {
  return NextResponse.json({
    ok: true,
    userId: getCurrentUserId(),
    projectId: params.projectId,
    runs: [],
    ts: nowISO()
  });
}
