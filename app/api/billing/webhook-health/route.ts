import { NextResponse } from "next/server";
import { kv } from "@vercel/kv";

export async function GET() {
  const last = await kv.get<any>("billing:webhook:last");
  const lastBilling = await kv.get<any>("billing:webhook:last_billing");

  return NextResponse.json({
    ok: true,
    last: last ?? null,
    lastBilling: lastBilling ?? null,
  });
}
