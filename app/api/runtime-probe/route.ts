// app/api/runtime-probe/route.ts
import { NextResponse } from "next/server";
import { kv } from "../../lib/kv";
import { getCurrentUserId } from "../../lib/demoAuth";

export async function GET() {
  try {
    const userId = getCurrentUserId();

    // Probe KV without requiring any existing keys
    // If KV is not configured, kv.get will throw with your readable error.
    await kv.get("__probe__");

    return NextResponse.json({
      ok: true,
      userId: userId || null,
      kv: "ok",
      note: "If /dashboard still errors, the crash is in a page/component, not KV connectivity.",
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        ok: false,
        error: String(err?.message || err),
      },
      { status: 500 }
    );
  }
}
