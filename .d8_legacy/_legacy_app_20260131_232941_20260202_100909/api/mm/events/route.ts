/* ===== D8_MONSTER_MM_BUNDLE_V1_20260131_232831 =====
   /api/mm/events — GET list / POST append
   Proof: D8_MONSTER_MM_PROOF_20260131_232831
*/
import { NextResponse } from "next/server";
import { mmAppend, mmList } from "@/lib/d8/mm/events";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const limit = Number(url.searchParams.get("limit") || "50");
  const r = await mmList(limit);

  const res = NextResponse.json({
    ok: r.ok,
    stamp: "D8_MONSTER_MM_BUNDLE_V1_20260131_232831",
    proof: "D8_MONSTER_MM_PROOF_20260131_232831",
    at: new Date().toISOString(),
    limit,
    events: r.ok ? r.value : [],
    error: r.ok ? null : (r as any).error,
  });

  res.headers.set("cache-control", "no-store, max-age=0");
  return res;
}

export async function POST(req: Request) {
  let body: any = {};
  try { body = await req.json(); } catch {}

  const level = (body?.level || "info") as any;
  const type  = String(body?.type || "manual.event");
  const msg   = String(body?.msg  || "manual append");
  const meta  = (body?.meta && typeof body.meta === "object") ? body.meta : {};

  const r = await mmAppend({ level, type, msg, meta });

  const res = NextResponse.json({
    ok: r.ok,
    stamp: "D8_MONSTER_MM_BUNDLE_V1_20260131_232831",
    proof: "D8_MONSTER_MM_PROOF_20260131_232831",
    at: new Date().toISOString(),
    event: r.event,
    kv: r.kv,
  });

  res.headers.set("cache-control", "no-store, max-age=0");
  return res;
}