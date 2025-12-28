import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({
    ok: true,
    runs: [],
    message: "Runs temporarily disabled during stabilization",
  });
}

export async function POST() {
  return NextResponse.json({
    ok: false,
    error: "Creating runs temporarily disabled during stabilization",
  });
}
