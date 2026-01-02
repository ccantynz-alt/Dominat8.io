import { NextResponse } from "next/server";
import {
  getProjectTemplate,
  setProjectTemplate,
  clearProjectTemplate,
} from "@/app/lib/projectTemplateKV";

export async function GET(
  _: Request,
  { params }: { params: { projectId: string } }
) {
  const sel = await getProjectTemplate(params.projectId);
  return NextResponse.json({ ok: true, selection: sel });
}

export async function POST(
  req: Request,
  { params }: { params: { projectId: string } }
) {
  const body = await req.json().catch(() => ({}));
  const templateId = String(body?.templateId || "");

  if (!templateId) {
    return NextResponse.json(
      { ok: false, error: "Missing templateId" },
      { status: 400 }
    );
  }

  const sel = await setProjectTemplate(params.projectId, templateId);
  return NextResponse.json({ ok: true, selection: sel });
}

export async function DELETE(
  _: Request,
  { params }: { params: { projectId: string } }
) {
  await clearProjectTemplate(params.projectId);
  return NextResponse.json({ ok: true });
}
