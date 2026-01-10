import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { kv } from "@vercel/kv";

export const runtime = "nodejs";

type RouteContext = {
  params: { projectId: string };
};

function asText(v: unknown): string {
  return typeof v === "string" ? v : "";
}

export async function GET(_req: Request, ctx: RouteContext) {
  const { userId } = auth();

  if (!userId) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const projectId = ctx.params.projectId;

  // Finish stores generated HTML here:
  // generated:project:<id>:latest
  let html = "";
  try {
    const key = `generated:project:${projectId}:latest`;
    const v = await kv.get(key);
    html = asText(v);
  } catch (e: any) {
    return NextResponse.json(
      {
        ok: false,
        error: "Preview storage unavailable",
        details: e?.message ? String(e.message) : "KV error",
      },
      { status: 500 }
    );
  }

  if (!html) {
    return NextResponse.json(
      { ok: false, error: "No generated HTML found yet" },
      { status: 404 }
    );
  }

  // Return JSON so the client can reliably parse it
  return NextResponse.json({ ok: true, projectId, html }, { status: 200 });
}
