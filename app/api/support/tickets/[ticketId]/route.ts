import { NextResponse } from "next/server";
import { getTicket, addMessage } from "@/app/lib/supportKV";
import { randomUUID } from "crypto";

export async function GET(
  _: Request,
  { params }: { params: { ticketId: string } }
) {
  const ticket = await getTicket(params.ticketId);

  if (!ticket) {
    return NextResponse.json({ ok: false }, { status: 404 });
  }

  return NextResponse.json({ ok: true, ticket });
}

export async function POST(
  req: Request,
  { params }: { params: { ticketId: string } }
) {
  const body = await req.json();
  const { author, message } = body;

  if (!author || !message) {
    return NextResponse.json(
      { ok: false, error: "Missing fields" },
      { status: 400 }
    );
  }

  const newStatus =
    author === "user" ? "open" : "waiting_on_customer";

  await addMessage(
    params.ticketId,
    {
      id: randomUUID(),
      author,
      body: message,
      createdAt: new Date().toISOString(),
    },
    newStatus
  );

  return NextResponse.json({ ok: true });
}
