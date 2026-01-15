// src/app/api/projects/[projectId]/scaffold/route.ts

import { NextResponse } from "next/server";
import { getProjectTemplateId } from "@/app/lib/projectTemplateStore";
import { getProjectScaffold, hasScaffoldApplied, setProjectScaffold } from "@/app/lib/projectScaffoldStore";
import { buildScaffoldForTemplate } from "@/app/lib/templateScaffolds";

export async function GET(
  _req: Request,
  { params }: { params: { projectId: string } }
) {
  try {
    const projectId = params.projectId;
    const templateId = await getProjectTemplateId(projectId);
    const applied = await hasScaffoldApplied(projectId);
    const scaffold = await getProjectScaffold(projectId);

    return NextResponse.json({ ok: true, projectId, templateId, applied, scaffold });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "Failed to read scaffold" },
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
    const force = body?.force === true;

    const templateId = await getProjectTemplateId(projectId);

    if (!templateId) {
      return NextResponse.json(
        { ok: false, error: "No templateId saved for this projectId." },
        { status: 400 }
      );
    }

    const alreadyApplied = await hasScaffoldApplied(projectId);
    if (alreadyApplied && !force) {
      const scaffold = await getProjectScaffold(projectId);
      return NextResponse.json({ ok: true, projectId, templateId, applied: true, scaffold });
    }

    const scaffold = buildScaffoldForTemplate(templateId);
    await setProjectScaffold(projectId, scaffold);

    return NextResponse.json({ ok: true, projectId, templateId, applied: true, scaffold });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "Failed to apply scaffold" },
      { status: 500 }
    );
  }
}
