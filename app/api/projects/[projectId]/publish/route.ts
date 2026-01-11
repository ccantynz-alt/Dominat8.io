import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(
  req: Request,
  { params }: { params: { projectId: string } }
) {
  try {
    const projectId = params.projectId;

    // Helpful debug signals
    const nodeEnv = process.env.NODE_ENV || "unknown";
    const hasKvUrl = Boolean(process.env.KV_REST_API_URL);
    const hasKvToken = Boolean(process.env.KV_REST_API_TOKEN);

    // Echo request headers that matter (safe)
    const devUser = req.headers.get("x-dev-user");

    return NextResponse.json({
      ok: true,
      route: "publish",
      post: true,
      projectId,
      nodeEnv,
      kvEnvPresent: { KV_REST_API_URL: hasKvUrl, KV_REST_API_TOKEN: hasKvToken },
      devUserHeader: devUser,
      note:
        "Publish stub is live. If this returns 200 on Vercel, the previous 500 was caused by store/KV imports crashing before the handler ran.",
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        ok: false,
        route: "publish",
        error: err?.message || "Publish failed",
      },
      { status: 500 }
    );
  }
}
