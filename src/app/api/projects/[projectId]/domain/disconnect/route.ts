// src/app/api/projects/[projectId]/domain/disconnect/route.ts

import { NextResponse } from "next/server";
import { getProjectDomain, clearProjectDomain } from "@/app/lib/projectDomainStore";
import { releaseDomain } from "@/app/lib/domainRoutingStore";

export async function POST(
  _req: Request,
  { params }: { params: { projectId: string } }
) {
  try {
    const projectId = params.projectId;
    const rec = await getProjectDomain(projectId);
    if (!rec) {
      return NextResponse.json({ ok: true, projectId, disconnected: true, message: "No domain to disconnect." });
    }

    // Release routing (only if this project owns it)
    await releaseDomain(rec.domain, projectId);

    // Clear domain record for this project
    await clearProjectDomain(projectId);

    return NextResponse.json({ ok: true, projectId, disconnected: true });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "Disconnect failed" },
      { status: 500 }
    );
  }
}
