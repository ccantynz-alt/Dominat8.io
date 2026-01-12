import { NextResponse } from "next/server";

let lastBilling: any = null;

export async function POST(req: Request) {
  lastBilling = await req.json();
  return NextResponse.json({ ok: true });
}

export async function GET() {
  return NextResponse.json({ ok: true, lastBilling });
}
