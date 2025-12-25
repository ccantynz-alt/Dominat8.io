// app/api/runs/[runId]/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { KV } from "../../../lib/kv";
import { keys } from "../../../lib/keys";

export async function GET(
  _req: Request,
  { params }: { params: { runId: string } }
) {
  try {
    const run = await KV.get(keys.run(params.runId));

    if (!run) {
      return NextResponse.json(
        { ok: false, message: "Run not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true, run });
  } catch (err: any) {
    return NextResponse.json(
      {
        ok: false,
        where: "/api/runs/[runId] GET",
        message: err?.message ?? "Unknown error",
      },
      { status: 500 }
    );
  }
}
