import { NextResponse } from "next/server";
import { z } from "zod";
import { createTicket, listTickets } from "@/app/lib/supportKV";

const CreateSchema = z.object({
  projectId: z.string().optional(),
  email: z.string().optional(),
  subject: z.string().min(1),
  message: z.string().min(1),
});

export async function GET() {
  try {
    const tickets = await listTickets();
    return NextResponse.json({ ok: true, tickets, count: tickets.length });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "Failed" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = CreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: "Invalid payload" }, { status: 400 });
    }

    const ticket = await createTicket(parsed.data);
    return NextResponse.json({ ok: true, ticket });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "Failed" }, { status: 500 });
  }
}
