import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function POST(
  req: Request,
  { params }: { params: { ticketId: string } }
) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  // Keep behavior simple + safe for now (build fix).
  // If you already had real draft-reply logic here, paste it back in,
  // but keep the ONE critical change: `await auth()` above.

  return NextResponse.json({
    ok: true,
    ticketId: params.ticketId,
    draft: "Thanks for reaching out — we’re looking into this and will get back to you shortly.",
  });
}
