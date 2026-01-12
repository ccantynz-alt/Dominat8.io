import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export const runtime = "nodejs";

/**
 * AUTO PIPELINE
 * Finish → Conversion → Audit → Publish
 */
export async function POST(_req: Request, ctx: { params: { projectId: string } }) {
  const session = await auth();
  if (!session.userId) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const projectId = ctx.params.projectId;

  async function call(path: string, body?: any) {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/projects/${projectId}${path}`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: body ? JSON.stringify(body) : undefined,
      }
    );
    const text = await res.text();
    if (!res.ok) throw new Error(text);
    return text;
  }

  try {
    // 1) Finish for me (Level 2)
    await call("/finish", {
      businessName: "My Business",
      niche: "Professional services",
      tone: "professional",
    });

    // 2) Conversion Agent (automation-first)
    await call("/agents/conversion", {
      instruction:
        "Make it premium and conversion-focused for an automated AI website builder SaaS. No calls, no meetings. Push Start free, Create site, Publish, Upgrade.",
    });

    // 3) Publish
    const publishResult = await call("/publish");

    return NextResponse.json({
      ok: true,
      published: true,
      result: publishResult,
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || "Auto pipeline failed" },
      { status: 500 }
    );
  }
}
