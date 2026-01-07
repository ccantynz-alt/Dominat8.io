// app/api/billing/start-pro/route.ts
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST() {
  // This route just calls your existing checkout route from the browser with a simple POST.
  // We keep it simple so you can trigger it easily.
  return NextResponse.json({
    ok: true,
    howTo: "In your browser console, POST to /api/billing/start-pro-client (see next step).",
  });
}
