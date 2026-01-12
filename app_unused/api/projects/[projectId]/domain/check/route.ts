import { NextResponse } from "next/server";
import dns from "dns/promises";
import { kv } from "@vercel/kv";

export const runtime = "nodejs";

export async function POST(
  _req: Request,
  { params }: { params: { projectId: string } }
) {
  try {
    const projectId = params.projectId;
    const project = await kv.hgetall<any>(`project:${projectId}`);

    if (!project?.domain || !project?.domainVerificationToken) {
      return NextResponse.json(
        { ok: false, error: "No domain verification in progress" },
        { status: 400 }
      );
    }

    const host = `_rovez.${project.domain}`;
    const records = await dns.resolveTxt(host);

    const flat = records.flat().map(String);

    if (!flat.includes(project.domainVerificationToken)) {
      return NextResponse.json({
        ok: false,
        verified: false,
      });
    }

    await kv.hset(`project:${projectId}`, {
      domainVerified: "true",
    });

    return NextResponse.json({
      ok: true,
      verified: true,
    });
  } catch (err: any) {
    console.error("DOMAIN VERIFY CHECK ERROR:", err);
    return NextResponse.json(
      { ok: false, verified: false },
      { status: 500 }
    );
  }
}
