import { NextResponse } from "next/server";
import { BUILD_STAMP, BUILD_SHA, BUILD_TIME_ISO } from "@/lib/buildStamp";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    ok: true,
    BUILD_STAMP,
    BUILD_SHA,
    BUILD_TIME_ISO,
  });
}