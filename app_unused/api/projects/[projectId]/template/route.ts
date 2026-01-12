import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function GET(
  req: Request,
  { params }: { params: { projectId: string } }
) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  // Placeholder response (safe for now)
  return NextResponse.json({
    ok: true,
    projectId: params.projectId,
    template: {
      id: "default",
      name: "Default Template",
      createdAt: new Date().toISOString(),
    },
  });
}

export async function POST(
  req: Request,
  { params }: { params: { projectId: string } }
) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const body = await req.json().catch(() => ({}));

  // Placeholder “save”
  return NextResponse.json({
    ok: true,
    projectId: params.projectId,
    saved: true,
    received: body,
  });
}

