import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { kv } from "@vercel/kv";

export async function POST(
  req: Request,
  { params }: { params: { projectId: string } }
) {
  const session = await auth();
  const userId = session.userId;

  if (!userId) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const { html } = await req.json();

  if (!html || typeof html !== "string") {
    return NextResponse.json(
      { ok: false, error: "Missing HTML" },
      { status: 400 }
    );
  }

  const key = `generated:project:${params.projectId}:latest`;
  await kv.set(key, html);

  return NextResponse.json({ ok: true });
}

