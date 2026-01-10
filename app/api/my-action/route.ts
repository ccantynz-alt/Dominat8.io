import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();

  // do server-side work here
  // e.g. write DB, call Stripe, etc.

  return NextResponse.json({ ok: true });
}
