import { NextResponse } from "next/server";
import { listRuns } from "../../../../lib/store";

export async function GET() {
  const runs = await listRuns(25);
  return NextResponse.json({ ok: true, runs });
}
