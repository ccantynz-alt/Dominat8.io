import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { kv } from "@vercel/kv";

export async function GET(
  _req: Request,
  { params }: { params: { projectId: string } }
) {
  // ✅ FIX: auth() must be awaited in your current Clerk typings/build
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const projectId = params.projectId;

  // Stub-friendly: read the domain we stored in attach route (if any)
  const key = `project:${projectId}:domain`;

  try {
    const record = (await kv.get<any>(key)) || null;

    // Very simple status model:
    // - "none" if no domain attached
    // - "attached" if a domain exists (real DNS verification comes later)
    if (!record?.domain) {
      return NextResponse.json({
        ok: true,
        projectId,
        status: "none",
        domain: null,
      });
    }

    return NextResponse.json({
      ok: true,
      projectId,
      status: "attached",
      domain: record.domain,
      attachedAt: record.attachedAt || null,
      attachedBy: record.attachedBy || null,
      note: "Stubbed domain status. Add DNS verification later.",
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || "Failed to load domain status" },
      { status: 500 }
    );
  }
}
