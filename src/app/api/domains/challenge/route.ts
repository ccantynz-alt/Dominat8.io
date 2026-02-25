import { kv } from "@vercel/kv";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

type SavedSiteMeta = { id: string; prompt: string; blobUrl: string; createdAt: string; userId?: string };

function normalizeDomain(domain: string): string {
  return domain.toLowerCase().replace(/^https?:\/\//, "").replace(/\/.*$/, "").trim();
}

export async function POST(req: NextRequest) {
  let userId: string | null = null;
  try {
    const authResult = await auth();
    userId = authResult?.userId ?? null;
  } catch {
    /* Clerk auth() can throw in Next 16 */
  }
  if (!userId) {
    return NextResponse.json({ error: "Sign in to request a domain challenge" }, { status: 401 });
  }

  try {
    const { domain, siteId } = (await req.json()) as { domain?: string; siteId?: string };

    const d = normalizeDomain(domain || "");
    if (!d || !siteId?.trim()) {
      return NextResponse.json({ error: "domain and siteId required" }, { status: 400 });
    }

    // Site must exist and user must own it
    const meta = await kv.get<SavedSiteMeta>(`site:${siteId}`);
    if (!meta) {
      return NextResponse.json({ error: "Site not found" }, { status: 404 });
    }

    // Verify ownership: either no userId set (backwards compat) or userId matches
    if (meta.userId && meta.userId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const token = crypto.randomUUID().replace(/-/g, "").slice(0, 16);
    const txt = `dominat8-verify=${token}`;

    await kv.set(`domain:challenge:${d}`, { txt, siteId }, { ex: 60 * 60 }); // 1 hour

    return NextResponse.json({
      ok: true,
      domain: d,
      record: {
        type: "TXT",
        name: `_dominat8-verify.${d}`,
        value: txt,
      },
      instructions: `Add a TXT record: Name _dominat8-verify.${d} with value ${txt}`,
    });
  } catch (err) {
    return NextResponse.json({ error: "Failed to create challenge" }, { status: 500 });
  }
}
