import { NextResponse } from "next/server";
import { deleteTemplate, getTemplate, upsertTemplate } from "@/app/lib/templatesKV";

export async function GET(
  _: Request,
  { params }: { params: { templateId: string } }
) {
  const t = await getTemplate(params.templateId);
  return NextResponse.json({ ok: true, template: t });
}

export async function POST(
  req: Request,
  { params }: { params: { templateId: string } }
) {
  const body = await req.json().catch(() => ({}));
  const tpl = await upsertTemplate({ ...body, id: params.templateId });
  return NextResponse.json({ ok: true, template: tpl });
}

export async function DELETE(
  _: Request,
  { params }: { params: { templateId: string } }
) {
  const r = await deleteTemplate(params.templateId);
  return NextResponse.json({ ok: true, ...r });
}
