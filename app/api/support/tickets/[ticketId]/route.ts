import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function GET(
  req: Request,
  { params }: { params: { ticketId: string } }
) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({
    ok: true,
    ticketId: params.ticketId,
  });
}

export async function PATCH(
  req: Request,
  { params }: { params: { ticketId: string } }
) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));

  return NextResponse.json({
    ok: true,
    ticketId: params.ticketId,
    updated: true,
    body,
  });
}

export async function DELETE(
  req: Request,
  { params }: { params: { ticketId: string } }
) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({
    ok: true,
    ticketId: params.ticketId,
    deleted: true,
  });
}

