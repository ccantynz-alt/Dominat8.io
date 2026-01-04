import { NextResponse } from "next/server";
import { kv } from "@vercel/kv";

export async function GET() {
  try {
    const data = await kv.get("generated:latest");

    if (!data) {
      return NextResponse.json(
        { ok: false, error: "No latest generated page yet." },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true, data });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "Failed to load latest generated" },
      { status: 500 }
    );
  }
}
