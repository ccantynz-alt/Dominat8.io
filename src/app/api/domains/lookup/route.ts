import { kv } from "@vercel/kv";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

function normalizeDomain(domain: string): string {
  return domain.toLowerCase().replace(/^https?:\/\//, "").replace(/\/.*$/, "").trim();
}

export async function GET(req: NextRequest) {
  const domain = req.nextUrl.searchParams.get("domain");
  const d = normalizeDomain(domain || "");
  if (!d) {
    return NextResponse.json({ error: "domain required" }, { status: 400 });
  }

  try {
    const siteId = await kv.get<string>(`domain:verified:${d}`);
    return NextResponse.json({ ok: true, domain: d, siteId: siteId ?? null });
  } catch {
    return NextResponse.json({ error: "Lookup failed" }, { status: 500 });
  }
}
