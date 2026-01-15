// src/app/api/projects/[projectId]/domain/route.ts

import { NextResponse } from "next/server";
import { clearProjectDomain, getProjectDomain, setProjectDomain } from "@/app/lib/projectDomainStore";

export async function GET(
  _req: Request,
  { params }: { params: { projectId: string } }
) {
  try {
    const record = await getProjectDomain(params.projectId);
    return NextResponse.json({ ok: true, projectId: params.projectId, record });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "Failed" }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: { projectId: string } }
) {
  try {
    const body = await req.json().catch(() => ({}));
    const domain = typeof body?.domain === "string" ? body.domain : "";
    const record = await setProjectDomain(params.projectId, domain);
    return NextResponse.json({ ok: true, projectId: params.projectId, record });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "Failed" }, { status: 400 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: { projectId: string } }
) {
  try {
    await clearProjectDomain(params.projectId);
    return NextResponse.json({ ok: true, projectId: params.projectId, cleared: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "Failed" }, { status: 500 });
  }
}
