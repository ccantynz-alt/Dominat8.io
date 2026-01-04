import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

/**
 * TEMP STUB:
 * This endpoint depended on missing internal lib (supportKV) and alias imports.
 * We'll implement ticket storage later.
 */
export async function GET() {
  const { userId } = auth();
  if (!userId) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

  return NextResponse.json({
    ok: true,
    status: "stub",
    tickets: [],
  });
}

export async function POST() {
  const { userId } = auth();
  if (!userId) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

  return NextResponse.json(
    {
      ok: false,
      status: "not_implemented",
      message: "Support ticket creation not implemented yet.",
    },
    { status: 501 }
  );
}
