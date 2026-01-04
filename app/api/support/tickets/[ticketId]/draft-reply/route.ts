import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

/**
 * TEMP STUB:
 * This endpoint depended on missing internal lib (supportKV) and alias imports.
 * We'll implement support tickets later.
 */
export async function POST(
  _req: Request,
  { params }: { params: { ticketId: string } }
) {
  const { userId } = auth();
  if (!userId) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

  return NextResponse.json(
    {
      ok: false,
      status: "not_implemented",
      ticketId: params.ticketId,
      message: "Draft reply generation not implemented yet.",
    },
    { status: 501 }
  );
}
