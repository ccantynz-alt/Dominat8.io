import { NextResponse } from "next/server";
import { kv } from "@vercel/kv";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: { runId: string } }
) {
  const data = await kv.get(`generated:run:${params.runId}`);

  return NextResponse.json(
    { ok: true, data: data || null },
    {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    }
  );
}

