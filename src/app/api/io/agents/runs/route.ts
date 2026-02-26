import { NextResponse } from "next/server";
import { getRuns } from "../_store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PATCH = "IO_ROCKET_COCKPIT_v2_20260220";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const ts = url.searchParams.get("ts") || "";
  const limit = Math.min(50, Math.max(1, parseInt(url.searchParams.get("limit") ?? "20", 10) || 20));
  const runs = getRuns(limit);

  return NextResponse.json(
    { ok: true, patch: PATCH, at: new Date().toISOString(), ts, runs },
    {
      headers: {
        "cache-control": "no-store",
        "x-d8io-patch": PATCH,
        "x-d8io-surface": "rocket-cockpit",
        "x-d8io-count": String(runs.length),
      },
    }
  );
}
