export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { getProjectIdForHost } from "@/app/lib/domainRoutingStore";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const host = (searchParams.get("host") || "").trim().toLowerCase();
    if (!host) return NextResponse.json({ ok: false, projectId: null }, { status: 400 });

    const projectId = await getProjectIdForHost(host);
    return NextResponse.json({ ok: true, projectId: projectId || null });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "Unknown error", projectId: null },
      { status: 500 }
    );
  }
}
