import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    ok: true,
    hasKVUrl: !!process.env.KV_REST_API_URL,
    hasKVToken: !!process.env.KV_REST_API_TOKEN,
  });
}
