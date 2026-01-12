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

  // Stub response to unblock build.
  // Keep await auth() pattern. Replace with real logic later.
  return NextResponse.json({
    ok: true,
    used: true,
    templateId: params.templateId,
    userId,
  });
}
