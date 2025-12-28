import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({
    ok: true,
    projects: [],
    message: "Projects temporarily disabled during stabilization",
  });
}

export async function POST() {
  return NextResponse.json(
    { ok: false, error: "Creating projects temporarily disabled during stabilization" },
    { status: 503 }
  );
}
