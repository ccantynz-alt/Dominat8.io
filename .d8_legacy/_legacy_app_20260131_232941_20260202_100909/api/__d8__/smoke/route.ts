/* ===== D8_MONSTER_MM_BUNDLE_V1_20260131_232831 =====
   GET /api/__d8__/smoke — always-fresh proof endpoint.
   Proof: D8_MONSTER_MM_PROOF_20260131_232831
*/
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const at = new Date().toISOString();
  const url = new URL(req.url);

  const res = NextResponse.json({
    ok: true,
    stamp: "D8_MONSTER_MM_BUNDLE_V1_20260131_232831",
    proof: "D8_MONSTER_MM_PROOF_20260131_232831",
    at,
    path: "/api/__d8__/smoke",
    qs: Object.fromEntries(url.searchParams.entries()),
  });

  res.headers.set("cache-control", "no-store, max-age=0");
  res.headers.set("x-d8-smoke", "D8_MONSTER_MM_BUNDLE_V1_20260131_232831");
  res.headers.set("x-d8-proof", "D8_MONSTER_MM_PROOF_20260131_232831");
  return res;
}