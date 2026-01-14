// src/app/api/domains/resolve/route.ts

import { NextResponse } from "next/server";
import { getProjectIdForHost } from "@/app/lib/domainRoutingStore";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const host = url.searchParams.get("host") || "";
    const projectId = await getProjectIdForHost(host);
    return NextResponse.json({ ok: true, host, projectId });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "Failed to resolve host" },
      { status: 500 }
    );
  }
}
