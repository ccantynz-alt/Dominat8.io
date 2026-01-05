import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { kv } from "@vercel/kv";

export async function GET(
  _req: Request,
  { params }: { params: { projectId: string } }
) {
  // ✅ FIX: Clerk auth() must be awaited in this setup
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const projectId = params.projectId;
  const key = `project:${projectId}:seo:state`;

  try {
    const state = (await kv.get<any>(key)) || null;

    return NextResponse.json({
      ok: true,
      projectId,
      state,
      note: "Stub SEO state endpoint. Replace with real SEO pipeline later.",
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || "Failed to load seo state" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: Request,
  { params }: { params: { projectId: string } }
) {
  // ✅ FIX: Clerk auth() must be awaited in this setup
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const projectId = params.projectId;
  const key = `project:${projectId}:seo:state`;

  let body: any = null;
  try {
    body = await req.json();
  } catch {
    body = null;
  }

  const nextState = {
    enabled: !!body?.enabled,
    updatedAt: Date.now(),
    updatedBy: userId,
  };

  try {
    await kv.set(key, nextState);
    return NextResponse.json({ ok: true, projectId, state: nextState });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || "Failed to save seo state" },
      { status: 500 }
    );
  }
}
