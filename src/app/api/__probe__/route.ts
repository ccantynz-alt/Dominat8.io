import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  return NextResponse.json({ ok: true, marker: "DEPLOY_PROBE_OK" });
}
