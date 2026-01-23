import { NextResponse } from "next/server";
import { kv } from "@vercel/kv";

export const runtime = "nodejs";

type RouteContext = {
  params: { projectId: string };
};

function asText(v: unknown): string {
  return typeof v === "string" ? v : "";
}

export async function GET(_req: Request, ctx: RouteContext) {
  const projectId = ctx.params.projectId;

  // Finish writes to this key
  const key = `generated:project:${projectId}:latest`;

  let html = "";
  try {
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
      {
        ok: true,
        projectId,
        html: "",
        message: "No generated HTML yet. Run Finish first.",
      },
      { status: 200 }
    );
  }

  return NextResponse.json(
    {
      ok: true,
      projectId,
      html,
    },
    { status: 200 }
  );
}

