import { NextResponse } from "next/server";

/**
 * TEMP STUB:
 * This endpoint depended on missing internal lib (templatesKV) and alias imports.
 * We'll implement real template lookup later.
 */
export async function GET(
  _req: Request,
  { params }: { params: { templateId: string } }
) {
  return NextResponse.json({
    ok: true,
    status: "stub",
    templateId: params.templateId,
    template: null,
  });
}
