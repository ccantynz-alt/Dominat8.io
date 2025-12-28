import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({
    ok: true,
    project: null,
    runs: [],
  });
}

export async function PATCH() {
  return NextResponse.json({
    ok: false,
    error: "Project updates temporarily disabled",
  });
}
