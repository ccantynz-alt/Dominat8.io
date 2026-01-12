import { NextResponse } from "next/server";
import crypto from "crypto";
import dns from "dns/promises";
import { kv } from "@vercel/kv";

export const runtime = "nodejs";

export async function POST(
  req: Request,
  { params }: { params: { projectId: string } }
) {
  try {
    const { domain } = await req.json();

    if (!domain || typeof domain !== "string") {
      return NextResponse.json(
        { ok: false, error: "Invalid domain" },
        { status: 400 }
      );
    }

    const projectId = params.projectId;
    const token = crypto.randomBytes(16).toString("hex");

    await kv.hset(`project:${projectId}`, {
      domain,
      domainVerificationToken: token,
      domainVerified: "false",
    });

    return NextResponse.json({
      ok: true,
      domain,
      token,
      record: {
        type: "TXT",
        host: `_rovez.${domain}`,
        value: token,
      },
    });
  } catch (err: any) {
    console.error("DOMAIN VERIFY INIT ERROR:", err);
    return NextResponse.json(
      { ok: false, error: "Failed to start verification" },
      { status: 500 }
    );
  }
}
