import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

/**
 * TEMP STUB:
 * This endpoint depended on missing internal libs (isAdmin, seo) and alias imports.
 * We keep the build green now. We'll implement real SEO read/write later.
 */
export async function GET(
  _req: Request,
  { params }: { params: { projectId: string } }
) {
  const { userId } = auth();

  if (!userId) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({
    ok: true,
    projectId: params.projectId,
    seo: null,
    status: "stub",
  });
}

export async function POST(
  _req: Request,
  { params }: { params: { projectId: string } }
) {
  const { userId } = auth();

  if (!userId) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json(
    {
      ok: false,
      status: "not_implemented",
      projectId: params.projectId,
      message: "SEO saving is not implemented yet.",
    },
    { status: 501 }
  );
}
