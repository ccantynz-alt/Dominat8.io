import { NextResponse } from "next/server";
import { kv } from "@vercel/kv";

export const runtime = "nodejs";

export async function GET(
  _req: Request,
  { params }: { params: { userId: string } }
) {
  const user = await kv.hgetall<any>(`user:${params.userId}`);
  return NextResponse.json(user || {});
}
