import { NextResponse } from "next/server";

/**
 * TEMP STUB:
 * This endpoint previously depended on missing internal libs and alias imports.
 * We keep it compiling now. We will implement real DNS checking later.
 */
export async function GET() {
  return NextResponse.json({
    ok: false,
    status: "not_implemented",
    message: "DNS check is not implemented yet.",
  });
}

export async function POST() {
  return NextResponse.json(
    {
      ok: false,
      status: "not_implemented",
      message: "DNS check is not implemented yet.",
    },
    { status: 501 }
  );
}
