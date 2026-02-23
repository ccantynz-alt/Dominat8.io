import { kv } from "@vercel/kv";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

function normalizeDomain(domain: string): string {
  return domain.toLowerCase().replace(/^https?:\/\//, "").replace(/\/.*$/, "").trim();
}

async function lookupTXT(hostname: string): Promise<string> {
  try {
    const { Resolver } = await import("dns").then((m) => m.promises);
    const resolver = new Resolver();
    const records: string[][] = await resolver.resolveTxt(hostname);
    return records.flat().join("");
  } catch {
    return "";
  }
}

export async function POST(req: NextRequest) {
  try {
    const { domain, siteId } = (await req.json()) as { domain?: string; siteId?: string };

    const d = normalizeDomain(domain || "");
    if (!d || !siteId?.trim()) {
      return NextResponse.json({ error: "domain and siteId required" }, { status: 400 });
    }

    const stored = await kv.get<{ txt: string; siteId: string }>(`domain:challenge:${d}`);
    if (!stored || stored.siteId !== siteId) {
      return NextResponse.json({ error: "Challenge not found or expired. Request a new one." }, { status: 400 });
    }

    const hostname = `_dominat8-verify.${d}`;
    const flat = await lookupTXT(hostname);
    const expected = stored.txt;

    if (!flat.includes(expected)) {
      return NextResponse.json({
        ok: false,
        verified: false,
        error: "TXT record not found or value does not match. DNS may take a few minutes to propagate.",
      });
    }

    // Store verified mapping: domain -> siteId
    await kv.set(`domain:verified:${d}`, siteId); // No TTL - persistent
    await kv.del(`domain:challenge:${d}`); // Clean up challenge

    return NextResponse.json({
      ok: true,
      verified: true,
      domain: d,
      siteId,
      message: "Domain verified. Add a CNAME record pointing to dominat8.io to serve your site.",
    });
  } catch (err) {
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
