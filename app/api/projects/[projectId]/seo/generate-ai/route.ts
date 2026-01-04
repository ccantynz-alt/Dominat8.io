import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

/**
 * TEMP STUB:
 * Original depended on rateLimitKV and other SEO AI libs.
 */
export async function POST(
  _req: Request,
  { params }: { params: { projectId: string } }
) {
  const { userId } = auth();
  if (!userId) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

  return NextResponse.json(
    {
      ok: false,
      status: "not_implemented",
      projectId: params.projectId,
      message: "AI SEO generation not implemented yet.",
    },
    { status: 501 }
  );
}
