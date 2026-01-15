// src/app/api/projects/[projectId]/content/route.ts

import { NextResponse } from "next/server";
import { getProjectTemplateId } from "@/app/lib/projectTemplateStore";
import { clearProjectContent, getProjectContent, setProjectContent } from "@/app/lib/projectContentStore";

export async function GET(
  _req: Request,
  { params }: { params: { projectId: string } }
) {
  try {
    const projectId = params.projectId;
    const templateId = await getProjectTemplateId(projectId);
    const content = await getProjectContent(projectId);

    return NextResponse.json({ ok: true, projectId, templateId, content });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "Failed to read content" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: Request,
  { params }: { params: { projectId: string } }
) {
  try {
    const projectId = params.projectId;
    const body = await req.json().catch(() => ({}));

    const content = body?.content;
    if (!content || typeof content !== "object") {
      return NextResponse.json({ ok: false, error: "Missing content" }, { status: 400 });
    }

    if (content.version !== 1 || !Array.isArray(content.sections)) {
      return NextResponse.json({ ok: false, error: "Invalid content format" }, { status: 400 });
    }

    await setProjectContent(projectId, content);
    return NextResponse.json({ ok: true, projectId });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "Failed to save content" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: { projectId: string } }
) {
  try {
    const projectId = params.projectId;
    await clearProjectContent(projectId);
    return NextResponse.json({ ok: true, projectId, cleared: true });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "Failed to clear content" },
      { status: 500 }
    );
  }
}
