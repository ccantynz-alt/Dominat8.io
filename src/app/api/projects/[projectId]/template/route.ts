// src/app/api/projects/[projectId]/template/route.ts

import { NextResponse } from "next/server";
import { getProjectTemplateId, setProjectTemplateId } from "@/app/lib/projectTemplateStore";

export async function GET(
  _req: Request,
  { params }: { params: { projectId: string } }
) {
  try {
    const templateId = await getProjectTemplateId(params.projectId);
    return NextResponse.json({ ok: true, projectId: params.projectId, templateId });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "Failed to read templateId" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: Request,
  { params }: { params: { projectId: string } }
) {
  try {
    const body = await req.json().catch(() => ({}));
    const templateIdRaw = body?.templateId;

    const templateId =
      typeof templateIdRaw === "string" && templateIdRaw.trim().length > 0
        ? templateIdRaw.trim()
        : null;

    await setProjectTemplateId(params.projectId, templateId);

    return NextResponse.json({ ok: true, projectId: params.projectId, templateId });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "Failed to save templateId" },
      { status: 500 }
    );
  }
}
