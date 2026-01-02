import { NextResponse } from "next/server";
import { z } from "zod";
import { addMessage, getTicket, setStatus } from "@/app/lib/supportKV";

const AddMessageSchema = z.object({
  from: z.enum(["customer", "admin"]),
  text: z.string().min(1),
});

const StatusSchema = z.object({
  status: z.enum(["open", "pending", "resolved", "closed"]),
});

export async function GET(_: Request, { params }: { params: { ticketId: string } }) {
  try {
    const t = await getTicket(params.ticketId);
    if (!t) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
    return NextResponse.json({ ok: true, ticket: t });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "Failed" }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: { ticketId: string } }) {
  try {
    const body = await req.json();
    const parsed = AddMessageSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: "Invalid payload" }, { status: 400 });
    }

    const t = await addMessage(params.ticketId, parsed.data.from, parsed.data.text);
    return NextResponse.json({ ok: true, ticket: t });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "Failed" }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: { ticketId: string } }) {
  try {
    const body = await req.json();
    const parsed = StatusSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: "Invalid payload" }, { status: 400 });
    }

    const t = await setStatus(params.ticketId, parsed.data.status);
    return NextResponse.json({ ok: true, ticket: t });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "Failed" }, { status: 500 });
  }
}
