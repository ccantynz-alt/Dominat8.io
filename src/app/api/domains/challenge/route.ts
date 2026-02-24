import { kv } from "@vercel/kv";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

function normalizeDomain(domain: string): string {
  return domain.toLowerCase().replace(/^https?:\/\//, "").replace(/\/.*$/, "").trim();
}

export async function POST(req: NextRequest) {
  try {
    const { domain, siteId } = (await req.json()) as { domain?: string; siteId?: string };

    const d = normalizeDomain(domain || "");
    if (!d || !siteId?.trim()) {
      return NextResponse.json({ error: "domain and siteId required" }, { status: 400 });
    }

    // Site must exist (basic check - KV key)
    const meta = await kv.get(`site:${siteId}`);
    if (!meta) {
      return NextResponse.json({ error: "Site not found" }, { status: 404 });
    }

    const token = crypto.randomUUID().replace(/-/g, "").slice(0, 16);
    const txt = `dominat8-verify=${token}`;

    await kv.set(`domain:challenge:${d}`, { txt, siteId }, { ex: 60 * 60 }); // 1 hour

    return NextResponse.json({
      ok: true,
      domain: d,
      record: {
        type: "TXT",
        name: `_dominat8-verify.${d}`,
        value: txt,
      },
      instructions: `Add a TXT record: Name _dominat8-verify.${d} with value ${txt}`,
    });
  } catch (err) {
    return NextResponse.json({ error: "Failed to create challenge" }, { status: 500 });
  }
}
