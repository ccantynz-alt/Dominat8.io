import { NextResponse } from "next/server";
import { kvNowISO } from "@/app/lib/kv";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({
    ok: true,
    fingerprint: "deploy-fingerprint-v1",
    ts: kvNowISO()
  });
}
