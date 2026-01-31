/* ===== D8_MAJOR_INFRA_POLISH_20260131_193407 =====
   GET /api/__d8__/proof
   Deploy integrity + stamp endpoint for Dominat8.
*/
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: Request) {
  const at = new Date().toISOString();

  const res = NextResponse.json({
    ok: true,
    stamp: "D8_MAJOR_INFRA_POLISH_20260131_193407",
    proof: "D8_PROOF_20260131_193407",
    at,
    path: "/api/__d8__/proof",
    note: "If you see this JSON, the __d8__ proof endpoint exists on this deploy.",
  });

  res.headers.set("x-dominat8-proof", "D8_PROOF_20260131_193407");
  res.headers.set("x-dominat8-stamp", "D8_MAJOR_INFRA_POLISH_20260131_193407");
  res.headers.set("cache-control", "no-store, max-age=0");
  return res;
}