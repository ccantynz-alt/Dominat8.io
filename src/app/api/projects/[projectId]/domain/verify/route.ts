// src/app/api/projects/[projectId]/domain/verify/route.ts

import { NextResponse } from "next/server";
import { getProjectDomain, markDomainVerified } from "@/app/lib/projectDomainStore";
import { claimDomain } from "@/app/lib/domainRoutingStore";

type DnsJsonAnswer = { data?: string };
type DnsJsonResponse = { Answer?: DnsJsonAnswer[] };

function verificationHost(domain: string) {
  return `_rovez-verification.${domain}`;
}

function expectedValue(token: string) {
  return `rovez=${token}`;
}

function isProduction() {
  // Vercel sets VERCEL_ENV=production on prod deploys
  return process.env.VERCEL_ENV === "production" || process.env.NODE_ENV === "production";
}

async function lookupTxt(hostname: string): Promise<string[]> {
  const url = `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(hostname)}&type=TXT`;
  const res = await fetch(url, {
    headers: { accept: "application/dns-json" },
    cache: "no-store",
  });

  if (!res.ok) return [];
  const json = (await res.json()) as DnsJsonResponse;

  const answers = Array.isArray(json.Answer) ? json.Answer : [];
  return answers
    .map((a) => (typeof a.data === "string" ? a.data : ""))
    .filter(Boolean)
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

    // ✅ DEV BYPASS is NEVER allowed in production
    const devBypass = process.env.DOMAIN_DEV_BYPASS === "1" && !isProduction();

    if (devBypass) {
      const updated = await markDomainVerified(params.projectId);
      await claimDomain(updated.domain, updated.projectId);
      return NextResponse.json({
        ok: true,
        verified: true,
        record: updated,
        message: "Domain verified ✅ (DEV BYPASS). Routing activated.",
      });
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

    // ✅ Mark verified
    const updated = await markDomainVerified(params.projectId);

    // ✅ Claim domain (conflict-safe)
    await claimDomain(updated.domain, updated.projectId);

    return NextResponse.json({
      ok: true,
      verified: true,
      record: updated,
      message: "Domain verified ✅ Routing activated.",
    });
  } catch (e: any) {
    // Conflict errors should be clear to user
    return NextResponse.json(
      { ok: false, error: e?.message || "Verify failed" },
      { status: 500 }
    );
  }
}

