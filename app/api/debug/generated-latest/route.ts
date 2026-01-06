import { NextResponse } from "next/server";
import { kv } from "@vercel/kv";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const html = await kv.get<string>("generated:latest");

    return NextResponse.json({
      ok: true,
      exists: !!html,
      length: typeof html === "string" ? html.length : 0,
      preview: typeof html === "string" ? html.slice(0, 1000) : null,
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || "Failed to read generated:latest" },
      { status: 500 }
    );
  }
}
