import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

/**
 * TEMP STUB:
 * This endpoint depended on missing internal libs and alias imports.
 * We keep it compiling now. We'll implement program pages later.
 */
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
      message: "Program pages generation is not implemented yet.",
    },
    { status: 501 }
  );
}
