// src/app/api/domains/map/route.ts

import { NextResponse } from "next/server";
import { setDomainProjectMapping } from "@/app/lib/domainRoutingStore";

export async function POST(req: Request) {
  try {
    const devBypass = process.env.DOMAIN_DEV_BYPASS === "1";
    if (!devBypass) {
      return NextResponse.json(
        { ok: false, error: "Mapping endpoint is disabled unless DOMAIN_DEV_BYPASS=1" },
        { status: 403 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const host = typeof body?.host === "string" ? body.host : "";
    const projectId = typeof body?.projectId === "string" ? body.projectId : "";

    if (!host || !projectId) {
      return NextResponse.json(
        { ok: false, error: "Missing host or projectId" },
        { status: 400 }
      );
    }

    await setDomainProjectMapping(host, projectId);

    return NextResponse.json({ ok: true, host, projectId, mapped: true });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "Failed to map domain" },
      { status: 500 }
    );
  }
}
