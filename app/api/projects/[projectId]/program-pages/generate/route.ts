import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { kv } from "@vercel/kv";

export async function POST(
  req: Request,
  { params }: { params: { projectId: string } }
) {
  // ✅ FIX: auth() must be awaited in your current Clerk typings/build
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const projectId = params.projectId;

  // Optional request body (stub-friendly)
  let body: any = null;
  try {
    body = await req.json();
  } catch {
    body = null;
  }

  const prompt =
    typeof body?.prompt === "string"
      ? body.prompt.trim()
      : "Generate program pages (stub).";

  // Stub output: store a placeholder "program pages" record
  const key = `project:${projectId}:program-pages`;

  const record = {
    generatedAt: Date.now(),
    generatedBy: userId,
    prompt,
    pages: [
      {
        slug: "program-1",
        title: "Program Page 1 (Stub)",
        description: "Placeholder program page content. Wire AI later.",
      },
      {
        slug: "program-2",
        title: "Program Page 2 (Stub)",
        description: "Placeholder program page content. Wire AI later.",
      },
    ],
  };

  try {
    await kv.set(key, record);
    return NextResponse.json({ ok: true, projectId, record });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || "Failed to generate program pages" },
      { status: 500 }
    );
  }
}
