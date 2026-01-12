import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(
    {
      ok: true,
      DEV_BYPASS_AUTH: process.env.DEV_BYPASS_AUTH || null,
      DEV_MEMORY_STORE: process.env.DEV_MEMORY_STORE || null,
      hasKV: !!process.env.KV_REST_API_URL && !!process.env.KV_REST_API_TOKEN,
      nodeEnv: process.env.NODE_ENV || null,
    },
    { status: 200 }
  );
}
