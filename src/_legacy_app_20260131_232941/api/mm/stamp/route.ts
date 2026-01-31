/* ===== D8_MONSTER_MM_BUNDLE_V1_20260131_232831 =====
   GET /api/mm/stamp — core stamp + KV env presence
   Proof: D8_MONSTER_MM_PROOF_20260131_232831
*/
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const hasUrl = !!process.env.KV_REST_API_URL;
  const hasTok = !!process.env.KV_REST_API_TOKEN;

  const res = NextResponse.json({
    ok: true,
    stamp: "D8_MONSTER_MM_BUNDLE_V1_20260131_232831",
    proof: "D8_MONSTER_MM_PROOF_20260131_232831",
    at: new Date().toISOString(),
    kvConfigured: hasUrl && hasTok,
    kvEnv: { hasUrl, hasTok },
  });

  res.headers.set("cache-control", "no-store, max-age=0");
  res.headers.set("x-mm-stamp", "D8_MONSTER_MM_BUNDLE_V1_20260131_232831");
  return res;
}