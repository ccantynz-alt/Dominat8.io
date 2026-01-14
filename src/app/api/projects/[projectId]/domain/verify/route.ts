// src/app/api/projects/[projectId]/domain/verify/route.ts

import { NextResponse } from "next/server";
import { getProjectDomain, markDomainVerified } from "@/app/lib/projectDomainStore";

type DnsJsonAnswer = { data?: string };
type DnsJsonResponse = { Answer?: DnsJsonAnswer[] };

function verificationHost(domain: string) {
  return `_rovez-verification.${domain}`;
}

function expectedValue(token: string) {
  return `rovez=${token}`;
}

async function lookupTxt(hostname: string): Promise<string[]> {
  // Cloudflare DNS-over-HTTPS JSON endpoint
  const url = `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(hostname)}&type=TXT`;
  const res = await fetch(url, {
    headers: { accept: "application/dns-json" },
    // avoid caching weirdness
    cache: "no-store",
  });

  if (!res.ok) return [];
  const json = (await res.json()) as DnsJsonResponse;

  const answers = Array.isArray(json.Answer) ? json.Answer : [];
  return answers
    .map((a) => (typeof a.data === "string" ? a.data : ""))
    .filter(Boolean)
    // TXT values often come quoted
    .map((s) => s.replace(/^"+|"+$/g, ""));
}

export async function POST(
  _req: Request,
  { params }: { params: { projectId: string } }
) {
  try {
    const record = await getProjectDomain(params.projectId);
    if (!record) {
      return NextResponse.json({ ok: false, error: "No domain saved for this project." }, { status: 400 });
    }

    const host = verificationHost(record.domain);
    const expected = expectedValue(record.token);

    const txts = await lookupTxt(host);
    const matched = txts.some((t) => t.includes(expected));

    if (!matched) {
      return NextResponse.json({
        ok: true,
        verified: false,
        domain: record.domain,
        host,
        expected,
        seen: txts,
        message: "TXT record not found yet. DNS can take time to propagate.",
      });
    }

    const updated = await markDomainVerified(params.projectId);

    return NextResponse.json({
      ok: true,
      verified: true,
      record: updated,
      message: "Domain verified ✅",
    });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "Verify failed" },
      { status: 500 }
    );
  }
}
