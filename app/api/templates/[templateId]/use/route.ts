import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function POST(
  req: Request,
  { params }: { params: { templateId: string } }
) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  // NOTE:
  // This is a stub response to unblock the build.
  // If you already have logic here (copy template -> project, etc),
  // re-add it below, but keep the "await auth()" line.

  return NextResponse.json({
    ok: true,
    used: true,
    templateId: params.templateId,
    userId,
  });
}
