import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/serverAuth";

export async function GET(
  req: Request,
  { params }: { params: { projectId: string } }
) {
  const userId = await getCurrentUserId();

  if (!userId) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  return NextResponse.json({
    ok: true,
    projectId: params.projectId,
    settings: {
      enabled: false,
      defaultTitleTemplate: "%page% | %brand%",
      defaultMetaDescription: "",
    },
  });
}

export async function POST(
  req: Request,
  { params }: { params: { projectId: string } }
) {
  const userId = await getCurrentUserId();

  if (!userId) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const body = await req.json().catch(() => ({}));

  return NextResponse.json({
    ok: true,
    projectId: params.projectId,
    saved: true,
    received: body,
  });
}
