import { NextResponse } from "next/server";
import { recordEvent } from "../../../lib/analyticsKV";
import { createHash, randomUUID } from "crypto";

function hash(input: string) {
  return createHash("sha256").update(input).digest("hex").slice(0, 16);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { projectId, path, ref } = body || {};

    if (!projectId || !path) {
      return NextResponse.json(
        { ok: false, error: "Missing fields" },
        { status: 400 }
      );
    }

    const h = req.headers;

    const ip =
      h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      h.get("x-real-ip") ||
      "unknown";

    const ua = h.get("user-agent") || "unknown";
    const country = h.get("x-vercel-ip-country") || undefined;

    const visitorId = hash(`${ip}|${ua}`) || randomUUID();

    await recordEvent({
      ts: new Date().toISOString(),
      projectId,
      path,
      ref,
      ua,
      country,
      visitorId,
    });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || "Track failed" },
      { status: 500 }
    );
  }
}
